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

- Keep shared audio state and a single audio element in MusicProvider across TanStack routes so navigation never interrupts playback.
- Store imported device audio in IndexedDB, not Cloud, because the player manages private local files rather than shared server data.
- Keep all player appearance tokens and responsive layouts in src/styles.css to preserve the reference design across themes.
- Use Capacitor for the separate Android package; the Lovable web deployment remains TanStack Start and is not itself an APK.
