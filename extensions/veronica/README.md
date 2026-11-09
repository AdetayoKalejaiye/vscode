# Veronica Design Workspace

Veronica uses the existing native Copilot chat UI for all human-agent interaction. The built-in extension adds only a design home, the Veronica Dark theme, and quieter editor defaults. It registers no custom chat view or conversation store.

Use **Veronica: Open Design Home** and **Veronica: Open Design Assistant** from the command palette. The assistant command delegates to `workbench.action.chat.open` without sending a query. Startup opens both only if no editor tabs were restored. Disable this with `veronica.openHomeOnStartup`.

The native chat retains its provider setup, authentication, history, context attachments, model picker, tool permissions, and change review. Existing providers may require installation and sign-in. No CAD engine or machine-control tools are added by this pass.

See `docs/veronica/ui-scope.md` for clutter decisions, launch instructions, and verification.
