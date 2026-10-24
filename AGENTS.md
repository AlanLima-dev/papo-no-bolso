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

## Project rules
- The AI agent lives in `src/lib/chat.server.ts` behind the `/api/chat` server route; it authenticates the bearer token and writes with an RLS-scoped user client, so tools can never touch another user's rows.
- Pure money rules (totals, categories, goal progress) live in `src/lib/finance.ts` with tests in `src/test/finance.test.ts`; UI and agent both reuse them.
- Signed-in pages wrap their content in `AppShell`, which redirects to `/login` when there is no session.
