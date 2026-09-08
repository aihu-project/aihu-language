# @aihu/language-server

> **Aihu** — agentic discovery and interaction, for human purpose.

Cross-editor Language Server (aihu-language-server) for .aihu Single File Components — diagnostics, hover, completion, and quick-fix code actions.

Published package maintained in the standalone [aihu-language repository](https://github.com/aihu-project/aihu-language).

<!-- BEGIN_HANDWRITTEN: prose -->
Cross-editor [Language Server Protocol](https://microsoft.github.io/language-server-protocol/)
implementation for `.aihu` Single File Components. Ships the runnable
`aihu-language-server` binary that any LSP-aware editor (VS Code, Neovim, Helix,
Zed, …) can launch over stdio.

## Features

- **Diagnostics** — uses the Volar TypeScript project and the published
  `@aihu/compiler` bridge so editor diagnostics share the compiler's virtual
  source model.
- **Hover** — Markdown documentation for the 13 aihu macro keywords, aware of
  `@state` vs `@template` block context.
- **Completion** — 9 `$`-triggered macro-kind snippets (context-filtered) and 5
  `@`-triggered top-level block names.
- **Code actions** — QuickFix for the `C440`–`C444` old-spec macro diagnostics,
  backed by the macro-simplification codemod.

## Layout

The package is laid out with a clean editor-agnostic seam (`src/core/`) so the
diagnostics, hover, completion, and code-action logic stays separate from the
Volar connection wiring.

- `src/core/*` — pure logic + the compiler bridge (no LSP connection objects).
- `src/server.ts` — wires the core onto a Volar language-server connection.
- `src/bin.ts` — the runnable `aihu-language-server` stdio entry.
<!-- END_HANDWRITTEN: prose -->

## Install

<!-- BEGIN_AUTOGEN: install -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

```bash
npm install @aihu/language-server
# or
bun add @aihu/language-server
```

<sub><i>Auto-generated against `@aihu/language-server@0.4.1`.</i></sub>

<!-- END_AUTOGEN: install -->

## Package facts

<!-- BEGIN_AUTOGEN: stats -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

| | |
|---|---|
| **Version** | `0.4.1` |
| **Tier** | D — Toolchain — cross-editor Language Server for .aihu SFCs |
| **Published files** | 3 entries |
| **License** | MIT |

<sub><i>Auto-generated against `@aihu/language-server@0.4.1`.</i></sub>

<!-- END_AUTOGEN: stats -->

## Exports

<!-- BEGIN_AUTOGEN: exports -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

| Subpath | ESM | CJS |
|---|---|---|
| `.` | `./dist/server.js` | `—` |
| `./core` | `./dist/core/index.js` | `—` |
| `./package.json` | `./package.json` | — |

<sub><i>Auto-generated against `@aihu/language-server@0.4.1`.</i></sub>

<!-- END_AUTOGEN: exports -->

## Dependencies

<!-- BEGIN_AUTOGEN: deps -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

**Dependencies:**

- `@aihu/compiler` — `^1.3.6`
- `@volar/language-core` — `2.4.28`
- `@volar/language-server` — `2.4.28`
- `@volar/source-map` — `2.4.28`
- `vscode-uri` — `3.1.0`
- `@aihu/tsc` — `workspace:*`
- `typescript` — `^5.6.2`
- `volar-service-typescript` — `0.0.71`

<sub><i>Auto-generated against `@aihu/language-server@0.4.1`.</i></sub>

<!-- END_AUTOGEN: deps -->

## See also

<!-- BEGIN_AUTOGEN: see-also -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

- [@aihu/tsc](https://github.com/aihu-project/aihu-language/tree/main/packages/tsc)
- [@aihu/compiler](https://github.com/aihu-project/aihu-compiler)
- [vscode-aihu](https://github.com/aihu-project/aihu-language/tree/main/packages/vscode-aihu)
- [Aihu framework root](https://github.com/aihu-project/aihu)

<sub><i>Auto-generated against `@aihu/language-server@0.4.1`.</i></sub>

<!-- END_AUTOGEN: see-also -->

## License

<!-- BEGIN_AUTOGEN: license -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

MIT — see [LICENSE](../../LICENSE).

<sub><i>Auto-generated against `@aihu/language-server@0.4.1`.</i></sub>

<!-- END_AUTOGEN: license -->
