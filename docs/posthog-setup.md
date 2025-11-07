# PostHog Setup Guide

## Current Configuration

Your PostHog is configured for self-hosting at `https://posthog.onpointprompt.com`, but the DNS subdomain is not set up yet.

## Options

### Option 1: Set Up DNS (Recommended for Self-Hosting)

1. **Add DNS Record**:
   - Go to your DNS provider (where `onpointprompt.com` is hosted)
   - Add a CNAME or A record:
     - **Type**: CNAME
     - **Name**: `posthog`
     - **Value**: Your PostHog server hostname/IP

2. **Wait for DNS Propagation** (usually 5-60 minutes)

3. **Verify**:
   ```bash
   nslookup posthog.onpointprompt.com
   ```

### Option 2: Use PostHog Cloud (Quick Setup)

If you want to use PostHog Cloud instead:

1. Sign up at https://posthog.com
2. Get your Project API Key from Project Settings
3. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_key_here
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   # or for EU: https://eu.i.posthog.com
   ```

### Option 3: Use Different Self-Hosted URL

If your PostHog is hosted at a different URL:

1. Update `.env.local`:
   ```bash
   NEXT_PUBLIC_POSTHOG_HOST=https://your-posthog-server.com
   # or with port: http://your-server:8000
   ```

### Option 4: Temporarily Disable PostHog

If you want to disable PostHog until DNS is configured:

1. Remove or comment out PostHog in `.env.local`:
   ```bash
   # NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
   # NEXT_PUBLIC_POSTHOG_HOST=https://posthog.onpointprompt.com
   ```

2. The app will continue to work, just without analytics tracking.

## Testing

After configuration, check your browser console for:
```
✅ PostHog initialized: { host: '...', isSelfHosted: true/false }
```

## Troubleshooting

- **DNS_PROBE_FINISHED_NXDOMAIN**: Subdomain not configured in DNS
- **Invalid API key**: Replace `phc_xxx` with your actual key
- **CORS errors**: Ensure your PostHog server allows requests from your domain

