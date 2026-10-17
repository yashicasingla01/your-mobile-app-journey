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
- Each bottom tab is a separate TanStack file route using a shared placeholder view and its own head metadata; this keeps navigation and page identity real while features remain intentionally empty.
- Read theme and splash browser storage only after hydration to preserve server-rendered consistency.
