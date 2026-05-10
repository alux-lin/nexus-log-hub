## Polish the Google OAuth Sign-In Experience

Right now users see an unbranded redirect during Google sign-in — the Supabase callback URL (`kmwhipmonetbinddttos.supabase.co`) flashes in the address bar, and the final redirect lands on the root route with no loading state. We can fix this in two layers: **code** (a branded callback page) and **configuration** (Google Cloud Console + Supabase dashboard).

### Code changes

**1. Add a branded `/auth/callback` page** (`src/pages/AuthCallback.tsx`)
- Shows a centered Nexus Log branded loading spinner with text: "Signing you in..."
- Uses the existing app aesthetic (dark slate background, gold accent, font-display heading)
- Calls `supabase.auth.getSession()` on mount and redirects to `/` once the session is detected
- If no session appears after a timeout, shows an error with a "Back to Sign In" button

**2. Update `src/App.tsx`**
- Add a new route: `<Route path="/auth/callback" element={<AuthCallback />} />`

**3. Update `src/pages/Auth.tsx`**
- Change the Google sign-in `redirectTo` from `window.location.origin + "/"` to `window.location.origin + "/auth/callback"`

### Configuration changes (user action required)

These can't be automated via code, but the plan includes the exact steps:

**Google Cloud Console** — Polish the consent screen:
- Go to **APIs & Services → OAuth consent screen**
- Set **App name** to "Nexus Log"
- Add a support email and app logo (optional but recommended)
- Under **Authorized domains**, add:
  - `lovable.app`
  - `nexus-log-keeper.lovable.app`

**Supabase Dashboard** — Ensure clean redirects:
- Go to **Authentication → URL Configuration**
- **Site URL**: `https://nexus-log-keeper.lovable.app`
- **Redirect URLs**: add both `https://nexus-log-keeper.lovable.app/**` and the preview URL `https://id-preview--774f1547-4fa4-4640-a6db-194ee193d1f0.lovable.app/**`

### What the user will see after

1. Clicks "Continue with Google"
2. Google's consent screen shows "Nexus Log" as the app name
3. After approval, lands on a branded Nexus Log page: "Signing you in..." with a spinner
4. Seamlessly redirected to the Dashboard

No more raw Supabase URLs visible to the user.
