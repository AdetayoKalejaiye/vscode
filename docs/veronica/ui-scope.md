# Veronica UI scope

Veronica is a desktop Code OSS fork for physical engineering. This first pass changes the product shell and adds a built-in, dependency-free `extensions/veronica` extension. It does not implement an agent connection, CAD rendering, simulation, machine control, or fabrication.

## Available now

- Veronica application name, protocol, data folders, installer identities, and issue link. Existing VS Code installations keep separate data.
- A theme-aware design surface, with Veronica Dark as the default theme; existing theme preferences are respected.
- Design home in the central editor, and Design Assistant in the secondary sidebar on the right. The home opens only when no editor tabs are restored. Use **Veronica: Open Design Home** or **Veronica: Open Design Assistant** at any time.
- A user-authored brief, optionally referencing the active project file's relative path. No file content is read or sent to any service. If there is no active project file, the interface explains how to select one.
- Review → approve → undo approval, or discard a pending brief. Both surfaces share state, persisted in extension workspace storage across reloads. This preview keeps one current brief, not a version history. Creating a new brief replaces it, as stated beside the composer.
- **Open as document** opens an untitled Markdown brief; the user chooses whether and where to save it.
- The geometric bracket on the home is an illustration, explicitly labeled. It is not a CAD viewport.

## Clutter decisions

| Surface | Current treatment | Next decision |
| --- | --- | --- |
| Stock welcome and coding tips | Default welcome replaced with Veronica home; tips disabled by default | Rewrite any remaining onboarding references |
| Minimap, line numbers, glyph margin, breadcrumbs | Off by default; users can restore them in Settings | Keep available for scripts and advanced workflows |
| Status bar (encoding, language, line endings, branch indicators) | Off by default; restore with **View: Toggle Status Bar Visibility** | Replace with design units, validation, agent state |
| Run and Debug, breakpoints, call stacks, Debug Console | **Removal candidate; still present** | Hide from primary navigation after deciding where simulation belongs |
| Source Control, staging, commits, merge conflicts | **Adaptation candidate; still present** | Introduce design history and review terminology without misrepresenting Git semantics |
| Extensions marketplace, language tooling | **Removal candidate; still present** | Curate engineering integrations before hiding discovery |
| Terminal, ports, remote development, developer commands | **Advanced-only candidate; still present** | Retain recovery access; later move into an advanced workspace mode |
| Problems panel | **Adaptation candidate; still present** | Connect actual geometry/constraint checks before relabeling results |
| Existing Copilot/chat surfaces | **Replacement candidate; still present** | Settle agent provider and authentication before replacing them |
| Project explorer, search, tabs, command palette | Retained | Add semantic parts/assemblies only with a real document model |
| Native application icons, About/legal text, remote server prompts | Upstream assets/text remain | Design and validate platform icon assets in a later branding pass; preserve attribution |

Default overrides do not overwrite existing user or workspace preferences. Software features are documented as candidates instead of being deleted from the codebase in this reversible first pass. Native menu terminology and coding commands still exist.

## Validation and development

Run the dependency-free behavior tests with `node --test extensions/veronica/test/*.test.cjs`. These exercise state transitions, webview message handling, persistence, and safe rendering. JavaScript sources require no extension compile step; the built-in extension packaging pipeline includes them directly.

For the actual desktop shell, use this repository's pinned Node and pnpm versions, run `pnpm install`, then follow the normal Code OSS development build/run instructions (`pnpm run build-fast`, then `./scripts/code.sh`). The built-in extension is discovered under `extensions/veronica`. Alternatively launch an existing compatible Code OSS 1.146+ build with `--extensionDevelopmentPath=<absolute path>/extensions/veronica`; that previews the extension but does not apply this fork's product branding.

Manual desktop checks: launch a fresh profile, verify the Veronica home and right sidebar; create a brief on each surface; approve and undo; reload and verify persistence; reference a project file and verify only its relative path appears; open a brief document; relaunch with restored tabs and verify they are not replaced. Check light, dark, high-contrast, narrow layouts, and keyboard navigation. The independent browser check validates the webview surfaces but does not establish that a complete Electron distribution has been built or tested.
