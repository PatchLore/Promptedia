# Why Model Field Cannot Be Removed from Database

## Summary

The `model` field cannot be simply removed from non-art prompts in the database because:

1. **Database Schema Constraint**: The `model` column exists in the `prompts` table schema for all prompt records. Removing it would require:
   - A database migration to drop the column (which would affect ALL prompts, including art prompts that legitimately need it)
   - Or updating thousands of individual records to set `model = NULL` (time-consuming and error-prone)
   - Risk of data loss if the migration fails

2. **Data Integrity**: The model field may contain important metadata that could be useful in the future, even if not displayed. Removing it entirely would be destructive.

3. **Conditional Rendering is the Right Approach**: Instead of modifying the database, we use **conditional rendering logic** in the UI layer to hide the model field for non-art prompts. This is:
   - Non-destructive (data remains intact)
   - Flexible (can adjust logic without database changes)
   - Performant (no database queries needed to filter)
   - Maintainable (logic is centralized in one function)

## Previous Implementation Issue (Now Fixed)

The previous `isImagePrompt()` function checked the model field value itself, which caused false positives. For example:

- **Category**: Writing
- **Model**: `bytedance/seedream-v4-text-to-image` 
- **Tags**: horror, technology, ghost

Even though this is a Writing prompt, the function matched because the model string contains "text-to-image" which includes the word "image", triggering the regex pattern.

## Solution Applied

The function now:
1. **Excludes** the model field value from the check (since it's what we're trying to conditionally hide)
2. Checks **category** as the primary indicator (most reliable)
3. Checks **tags** as a secondary signal

This ensures Writing prompts never show the model, regardless of what the model field contains. The model value is only used for display when the category/tags indicate it's an art/image prompt.

