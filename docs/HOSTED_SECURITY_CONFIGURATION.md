# Hosted Security Configuration

Local Supabase configuration does not update a linked hosted project. Before a
release, an administrator must verify the hosted Auth boundary independently.

## Read-only verification

Create a short-lived or fine-grained Supabase Management API token with
`auth_config_read`. Keep it outside the repository:

```env
SUPABASE_ACCESS_TOKEN=your-management-api-token
SUPABASE_PROJECT_REF=your-20-character-project-ref
NEXT_PUBLIC_SITE_URL=https://your-production-origin.example
```

Run:

```bash
pnpm security:hosted
```

The verifier sends one read-only request to the official Supabase Management
API. It never prints the token or raw Auth configuration.

Required controls include:

- confirmed email ownership and secure email changes;
- disabled anonymous sign-in and manual identity linking;
- refresh-token rotation and bounded reuse;
- one-hour-or-shorter JWT lifetime;
- password length and character-class requirements;
- bounded Auth endpoint rates;
- a canonical HTTPS site URL;
- exact, HTTPS-only redirect URLs without wildcards;
- reauthentication before password changes.

Leaked-password protection, CAPTCHA, and session inactivity timeout are
reported separately because availability or application integration may still
be pending. A warning must not be described as an enabled control.

## Dashboard checks outside the verifier

1. Enable GitHub secret scanning, push protection, Dependabot alerts, and
   private vulnerability reporting.
2. Confirm production and preview URLs separately; never add a broad wildcard
   merely to make previews work.
3. Use a custom SMTP provider before increasing the built-in email quota.
4. Enable CAPTCHA only after login, signup, and recovery flows submit the
   provider challenge token.
5. Enable leaked-password protection when the Supabase plan supports it.
6. Record the verification date and operator without copying tokens or raw
   configuration into issues, logs, or screenshots.
