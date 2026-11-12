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

- Recruiter pages use a shared `/recrutador` Outlet layout and focused CRM, form, messaging and candidate components so workflows stay independently maintainable.
- Recruiter workspace persistence is authenticated and owner-scoped in Lovable Cloud; local state is only the existing demo/offline view, never an authorization source.
- Interview generation uses server-only AI SDK Responses helpers with request-local run IDs, streamed output, user authentication and durable denial state to protect credentials and prevent repeated blocked calls.
- Recruiter-owned jobs override seed jobs by ID; filled and deleted records remain available for application history but are excluded from public discovery.
- Student navigation mode (top/side) lives in src/lib/nav-mode.ts with try/catch storage access, read after mount to avoid hydration mismatch.
