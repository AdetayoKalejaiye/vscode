# Veronica UI scope

Veronica is a desktop Code OSS fork for physical engineering. This first pass changes the product shell and adds a built-in, dependency-free `extensions/veronica` extension. It does not implement an agent connection, CAD rendering, simulation, machine control, or fabrication.

## Available now

- Veronica application name, protocol, data folders, installer identities, and issue link. Existing VS Code installations keep separate data.
- Veronica Dark as the default theme; existing theme preferences are respected.
- Design home in the central editor. It opens only when no editor tabs are restored. Use **Veronica: Open Design Home** at any time.
- The existing native Copilot chat UI on the right, titled Veronica, with design-oriented welcome text. **Veronica: Open Design Assistant** delegates to `workbench.action.chat.open` without passing or submitting a query.
- Native conversation history, attachments, model selection, tool permissions, and change review remain in their existing implementations. Provider identity, authentication, setup, and safety prompts remain intact. Availability depends on the installed provider and account setup.
- No custom chat panel, local brief model, approval workflow, or second conversation history. Earlier prototype commits remain in Git history; the current implementation uses native chat.
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
| Existing Copilot/chat surfaces | **Retained and adapted as Veronica** | Reuse native chat; attach engineering tools in a later backend pass |
| Project explorer, search, tabs, command palette | Retained | Add semantic parts/assemblies only with a real document model |
| Native application icons, About/legal text, remote server prompts | Upstream assets/text remain | Design and validate platform icon assets in a later branding pass; preserve attribution |

Default overrides do not overwrite existing user or workspace preferences. Software features are documented as candidates instead of being deleted from the codebase in this reversible first pass. Native menu terminology and coding commands still exist.

## Validation and development

Run the dependency-free routing and rendering tests with `node --test extensions/veronica/test/*.test.cjs`. These verify that startup respects restored tabs, commands open native chat without submitting prompts, and the home renders safely without a duplicate composer. JavaScript sources require no extension compile step; the built-in extension packaging pipeline includes them directly.

For the actual desktop shell, use this repository's pinned Node and pnpm versions, run `pnpm install`, then follow the normal Code OSS development build/run instructions (`pnpm run build-fast`, then `./scripts/code.sh`). The built-in extension is discovered under `extensions/veronica`. Alternatively launch an existing compatible Code OSS 1.146+ build with `--extensionDevelopmentPath=<absolute path>/extensions/veronica`; that previews the home/theme but does not apply the fork's product branding or native chat label changes.

The native chat welcome test's expected labels are updated in `src/vs/workbench/contrib/chat/test/browser/widget/chatWidget.test.ts`. Run that browser suite using the repository's test runner when dependencies and compiled client output are available. The full Electron distribution has not been built or tested in this pass.

Manual desktop checks: launch a fresh profile and verify the design home and native chat on the right; verify provider setup or sign-in still identifies the actual provider; open an existing conversation and verify history, context attachments, model picker, and review controls remain native; relaunch with restored tabs and verify they are not replaced. Check light, dark, high-contrast, narrow layouts, and keyboard navigation.
