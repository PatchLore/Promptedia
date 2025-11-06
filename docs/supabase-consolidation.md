# 🗄️ Supabase Consolidation Guide — Moving Multiple Projects Into One

This doc explains how to migrate (and eventually consolidate) multiple Supabase projects into a single project/account — ideal for unifying On Point Prompt, Soundswoop, Dreamify, etc.

---

## ✅ Why Consolidate

- One billing + simpler environment management

- Shared Auth (optional) and cross-app features

- Easier analytics + recommendations across apps

- Cleaner infra: one Supabase project, multiple schemas

---

## 🧠 Key Concepts

- **Each Supabase project** is its own Postgres + Auth + Storage instance.

- You **can** move data & schemas between projects.

- You **cannot** seamlessly merge `auth.users` across projects without work.

- Storage files must be re-uploaded or copied to the new project's buckets.

---

## 🧭 Migration Options

### Option A — Full SQL Dump/Restore (simplest)

Best when data size is small/medium and downtime is acceptable.

**Steps:**

1. **Old project → download SQL dump**
   - Dashboard: **Database → Backups → Download**
   - Or CLI:
     ```bash
     npx supabase db dump --project-ref OLD_REF --file backup.sql
     ```

2. **New project → create schema namespace**
   - In target project, create a schema for each app:
     ```sql
     CREATE SCHEMA IF NOT EXISTS promptopedia;
     CREATE SCHEMA IF NOT EXISTS soundswoop;
     CREATE SCHEMA IF NOT EXISTS dreamify;
     ```

3. **Modify dump SQL to use new schema**
   - Replace `public.` with `promptopedia.` (or appropriate schema)
   - Update `auth.users` references if needed
   - Remove conflicting extensions/enums

4. **Import into new project**
   - Dashboard: **SQL Editor → Paste & Run**
   - Or CLI:
     ```bash
     npx supabase db reset --project-ref NEW_REF
     psql -h NEW_REF.supabase.co -U postgres -d postgres -f backup.sql
     ```

**Gotchas:**
- ⚠️ `auth.users` UUIDs will conflict if merging multiple projects
- ⚠️ RLS policies need schema prefix updates
- ⚠️ Storage buckets must be recreated manually

---

### Option B — Schema-by-Schema Migration (recommended)

Best for gradual migration with minimal downtime.

**Steps:**

1. **Create target schemas in new project**
   ```sql
   CREATE SCHEMA promptopedia;
   CREATE SCHEMA soundswoop;
   CREATE SCHEMA dreamify;
   ```

2. **Export individual schema from old project**
   ```bash
   pg_dump -h OLD_REF.supabase.co -U postgres -d postgres \
     --schema=public --schema-only > promptopedia_schema.sql
   ```

3. **Export data separately**
   ```bash
   pg_dump -h OLD_REF.supabase.co -U postgres -d postgres \
     --schema=public --data-only > promptopedia_data.sql
   ```

4. **Modify exports to use new schema**
   - Replace `SET search_path = public` → `SET search_path = promptopedia`
   - Update table references: `CREATE TABLE prompts` → `CREATE TABLE promptopedia.prompts`
   - Update RLS policies to reference new schema

5. **Import in order: schema → data**
   ```sql
   -- Run schema first
   \i promptopedia_schema.sql
   
   -- Then data
   \i promptopedia_data.sql
   ```

**Gotchas:**
- ⚠️ Foreign keys to `auth.users` need UUID mapping
- ⚠️ Functions/triggers may reference `public` schema
- ⚠️ Extensions must exist in target project first

---

### Option C — API-Based Migration (for live apps)

Best when you need zero downtime and data is actively changing.

**Steps:**

1. **Create migration script** (`scripts/migrate-to-consolidated.js`)
   ```javascript
   import { createClient } from '@supabase/supabase-js';
   
   const oldClient = createClient(OLD_URL, OLD_KEY);
   const newClient = createClient(NEW_URL, NEW_KEY);
   
   // Read from old, write to new with schema prefix
   const { data } = await oldClient.from('prompts').select('*');
   await newClient.from('promptopedia.prompts').insert(data);
   ```

2. **Run in batches with error handling**
   - Handle conflicts gracefully
   - Log failed rows for retry
   - Use transactions for data integrity

3. **Sync incrementally**
   - Only migrate new/changed rows
   - Use `created_at` or `updated_at` timestamps
   - Run during low-traffic periods

**Gotchas:**
- ⚠️ Requires careful conflict resolution
- ⚠️ Slower than SQL dump method
- ⚠️ Must handle auth user ID mapping

---

## 🔐 Auth Users Consolidation

**The Challenge:** Each Supabase project has its own `auth.users` table. Merging requires UUID mapping.

**Solution Options:**

### Option 1 — Fresh Start (simplest)
- Users re-register in consolidated app
- Old user data mapped by email match
- Reset passwords via email link

### Option 2 — UUID Mapping Table
```sql
CREATE TABLE promptopedia.user_migration (
  old_user_id UUID,
  new_user_id UUID,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- During migration, map old → new
INSERT INTO promptopedia.user_migration (old_user_id, new_user_id, email)
SELECT old_auth.users.id, new_auth.users.id, old_auth.users.email
FROM old_auth.users
JOIN new_auth.users ON old_auth.users.email = new_auth.users.email;

-- Update foreign keys
UPDATE promptopedia.prompts
SET user_id = (
  SELECT new_user_id 
  FROM promptopedia.user_migration 
  WHERE old_user_id = prompts.user_id
);
```

### Option 3 — Email-Based Linking
- Use email as primary identifier
- Link accounts by email match
- Show "Connect Account" prompt on first login

---

## 📦 Storage Migration

**Steps:**

1. **List all buckets in old project**
   ```sql
   SELECT name FROM storage.buckets;
   ```

2. **Create buckets in new project**
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES 
     ('promptopedia-images', 'promptopedia-images', true),
     ('soundswoop-audio', 'soundswoop-audio', true);
   ```

3. **Copy files via API or CLI**
   ```bash
   # Using Supabase CLI
   supabase storage cp old-project/path/to/file new-project/path/to/file
   
   # Or download & re-upload via dashboard
   ```

4. **Update file URLs in database**
   ```sql
   UPDATE promptopedia.prompts
   SET example_url = REPLACE(
     example_url, 
     'old-project.supabase.co',
     'new-project.supabase.co'
   );
   ```

**Gotchas:**
- ⚠️ Public URLs will change (update in database)
- ⚠️ Signed URLs expire (regenerate if needed)
- ⚠️ Large buckets take time to migrate

---

## 🔄 RLS Policy Updates

After migration, update RLS policies to use new schemas:

```sql
-- Old policy (won't work)
CREATE POLICY "Public prompts viewable"
ON prompts FOR SELECT
USING (is_public = true);

-- New policy (with schema)
CREATE POLICY "Public prompts viewable"
ON promptopedia.prompts FOR SELECT
USING (is_public = true);
```

**Bulk Update Script:**
```sql
-- Find all policies referencing old schema
SELECT schemaname, tablename, policyname, definition
FROM pg_policies
WHERE schemaname = 'promptopedia';

-- Update each policy definition
ALTER POLICY "policy_name" ON promptopedia.table_name
USING (...updated conditions...);
```

---

## ✅ Migration Checklist

### Pre-Migration
- [ ] Backup all source projects (SQL + Storage)
- [ ] Document current schema structure
- [ ] List all RLS policies and functions
- [ ] Identify auth user count per project
- [ ] Check storage bucket sizes
- [ ] Test migration on staging project first

### Migration
- [ ] Create target schemas in new project
- [ ] Export source data (SQL dump or API)
- [ ] Modify SQL to use new schemas
- [ ] Import schema (tables, functions, triggers)
- [ ] Import data (with conflict resolution)
- [ ] Update RLS policies for new schemas
- [ ] Migrate storage buckets
- [ ] Update file URLs in database
- [ ] Map auth users (if merging)

### Post-Migration
- [ ] Verify data integrity (row counts match)
- [ ] Test RLS policies
- [ ] Update environment variables in apps
- [ ] Test API endpoints
- [ ] Monitor error logs
- [ ] Update documentation
- [ ] Decommission old projects (after verification period)

---

## 🚨 Common Gotchas

1. **UUID Conflicts**
   - `auth.users` IDs won't match between projects
   - Solution: Use email-based mapping or fresh start

2. **Schema References**
   - Functions/triggers may hardcode `public` schema
   - Solution: Search & replace in SQL dumps

3. **Foreign Key Violations**
   - References to `auth.users` will break
   - Solution: Temporarily disable FK checks, then remap

4. **Storage URL Changes**
   - Public URLs include project ref
   - Solution: Batch update URLs in database

5. **RLS Policy Breaking**
   - Policies reference old schema paths
   - Solution: Recreate policies with new schema names

6. **Extension Mismatches**
   - Old project may have extensions new project lacks
   - Solution: Install required extensions first

---

## 📊 Recommended Structure

After consolidation, organize by schema:

```
postgres (main database)
├── public (shared utilities, cross-app tables)
│   ├── shared_users (optional unified user table)
│   └── analytics (cross-app metrics)
├── promptopedia
│   ├── prompts
│   ├── favorites
│   └── prompt_packs
├── soundswoop
│   ├── tracks
│   ├── generations
│   └── credits
└── dreamify
    ├── dreams
    ├── stories
    └── collections
```

---

## 🔧 Example Migration Script

```javascript
// scripts/migrate-promptopedia.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const OLD_URL = process.env.OLD_SUPABASE_URL;
const OLD_KEY = process.env.OLD_SERVICE_KEY;
const NEW_URL = process.env.NEW_SUPABASE_URL;
const NEW_KEY = process.env.NEW_SERVICE_KEY;

const oldClient = createClient(OLD_URL, OLD_KEY);
const newClient = createClient(NEW_URL, NEW_KEY);

async function migratePrompts() {
  console.log('📖 Fetching prompts from old project...');
  const { data: prompts, error } = await oldClient
    .from('prompts')
    .select('*');

  if (error) throw error;

  console.log(`✅ Found ${prompts.length} prompts`);

  // Insert into new schema (requires schema prefix or use direct SQL)
  const { error: insertError } = await newClient
    .rpc('insert_promptopedia_prompt', prompts);

  if (insertError) {
    console.error('❌ Error:', insertError);
  } else {
    console.log('✅ Migration complete!');
  }
}

migratePrompts();
```

---

## 🎯 Best Practices

1. **Test on staging first** — Always test migration process on a staging project

2. **Maintain backups** — Keep old projects for 30+ days after migration

3. **Gradual rollout** — Migrate one app at a time if possible

4. **Monitor closely** — Watch for errors, missing data, broken links

5. **Document changes** — Update all environment variables and API docs

6. **Plan downtime** — For full migrations, schedule maintenance window

---

## 📚 Additional Resources

- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL Schema Documentation](https://www.postgresql.org/docs/current/ddl-schemas.html)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)

---

## 🏁 Conclusion

Consolidating Supabase projects is a significant undertaking but provides long-term benefits:

- **Simplified management** — One project to monitor
- **Cost efficiency** — Single billing tier
- **Better integration** — Shared auth and data across apps
- **Easier analytics** — Unified metrics and insights

Plan carefully, test thoroughly, and migrate gradually for best results.



