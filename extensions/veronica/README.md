# Veronica Design Workspace

The first Veronica outer-layer prototype: a design home, a right-side assistant panel, and a local brief review workflow. **No agent or CAD engine is connected.**

Use **Veronica: Open Design Home** and **Veronica: Open Design Assistant** from the command palette. Startup opens both only if no editor tabs were restored. Disable this with `veronica.openHomeOnStartup`.

Briefs are stored locally in extension workspace storage. Approval records intent only; it never modifies geometry, calls a service, or runs a tool. The active-file option attaches a path only. This preview keeps one current brief and clearly labels replacement.

See `docs/veronica/ui-scope.md` in the repository for clutter decisions, remaining branding work, launch instructions, and verification.
