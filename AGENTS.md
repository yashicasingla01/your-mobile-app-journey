<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## App architecture
- Keep shared MyVita branding, theme state, splash, footer, and bottom navigation in the root shell so every tab has consistent framing.
- Keep all five tab pages and onboarding under the client-only _authenticated gate, with the gated index as the sole / claimant; public /auth handles email confirmations and OAuth callbacks before entering the gate.
- All private profile operations use authenticated server functions and owner-scoped RLS, never service-role reads; server validation mirrors form validation.
- Register the bearer attacher in start.ts and keep one root auth-state subscriber; clear protected query caches before sign-out.
- Deleting health data removes the profile and consent record, not the Supabase Auth account; return to onboarding and require renewed consent.
- BMI uses unrounded kg/m² for adult category boundaries and displays age-specific assessment guidance below age 20, since adult categories are inappropriate for children.
- Read theme and splash browser storage only after hydration to preserve server-rendered consistency.
