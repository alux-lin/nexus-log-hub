## Add Google Sign-In to Nexus Log

Supabase has built-in Google OAuth support. The code change is small — most of the work is a one-time configuration in the Google Cloud Console and Supabase dashboard.

### What changes in the app

**`src/pages/Auth.tsx`** — add a "Continue with Google" button above the email/password form, with a divider ("or continue with email") between them. The button calls:

```ts
await supabase.auth.signInWithOAuth({
  provider: "google",
  options: { redirectTo: `${window.location.origin}/` },
});
```

The existing `AuthContext` + `onAuthStateChange` listener already handles the post-redirect session, and the `handle_new_user` DB function already creates a profile row on signup — so Google users will flow through onboarding the same way email users do. No DB migration needed.

Email/password sign-in stays as a fallback so existing users aren't locked out.

### What you need to do (one-time setup)

This part can't be automated — Supabase needs OAuth credentials from Google.

1. **Google Cloud Console** (https://console.cloud.google.com)
   - Create / pick a project → OAuth consent screen → add your domain
   - Credentials → Create OAuth Client ID → Web application
   - **Authorized redirect URI**: `https://kmwhipmonetbinddttos.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

2. **Supabase Dashboard** → Authentication → Providers → Google
   - Enable, paste Client ID + Secret, save

3. **Supabase Dashboard** → Authentication → URL Configuration
   - Site URL: your published URL (or preview URL while testing)
   - Redirect URLs: add both the preview URL and any custom domain

Without these steps the button will return a "provider not enabled" or "redirect invalid" error.

### Out of scope (ask if you want them)

- Other providers (Apple, GitHub, Microsoft)
- Forgot-password / reset-password flow for the existing email users
- Migrating/merging an existing email account with a Google account of the same address
