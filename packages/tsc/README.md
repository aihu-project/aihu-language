# @aihu/tsc

> **Aihu** — agentic discovery and interaction, for human purpose.

aihu-tsc — `tsc` for projects containing .aihu Single File Components. Type-checks .aihu sources as virtual TypeScript, with no .aihu.ts files written to disk.

Published package maintained in the standalone [aihu-language repository](https://github.com/aihu-project/aihu-language).

<!-- BEGIN_HANDWRITTEN: prose -->
`aihu-tsc` is a type-CHECKER (`--noEmit`), not a general-purpose `tsc`: it reads
a project's `tsconfig.json`, projects `.aihu` sources into the TypeScript
program as virtual TypeScript (via Volar's `proxyCreateProgram`, the same
mechanism `vue-tsc` uses), and reports diagnostics against the `.aihu` file
itself — on the line the author wrote, with no `.aihu.ts` sidecar ever written
to disk. Emitting from `.aihu` is `aihu build`'s job, not this tool's.

## Usage

```bash
aihu-tsc [-p <tsconfig|dir>] [--strict-templates] [--target <client|server|universal>]
```

Exits non-zero when there are type errors, so it drops straight into a
`typecheck` script in place of `tsc --noEmit` (the scaffolded default is the
bare `"typecheck": "aihu-tsc"`, no flags).

- `-p, --project <tsconfig|dir>` — path to a `tsconfig.json`, or a directory
  containing one. Defaults to the current working directory.
- `--strict-templates` — also report implicit-`any` diagnostics inside
  `.aihu` state blocks (suppressed by default, since `.aihu` state bodies were
  never type-checked before this tool existed).
- `--target <client|server|universal>` — build target threaded to the
  compiler's sidecar compilation; affects type-check accuracy for
  target-specific APIs.

`--strict-templates` and `--target` are OR'd with (never override-to-off) the
project's own `vite.config.ts` (`AihuConfig.typecheck.strictTemplates` /
`AihuConfig.compiler.target`) — invoked bare, this CLI is the only place that
config gets threaded in, since `run()` itself is synchronous and has no other
caller that reads it.
<!-- END_HANDWRITTEN: prose -->

## Install

<!-- BEGIN_AUTOGEN: install -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

```bash
npm install @aihu/tsc
# or
bun add @aihu/tsc
```

<sub><i>Auto-generated against `@aihu/tsc@0.3.4`.</i></sub>

<!-- END_AUTOGEN: install -->

## Package facts

<!-- BEGIN_AUTOGEN: stats -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

| | |
|---|---|
| **Version** | `0.3.4` |
| **Tier** | D — Toolchain — `aihu-tsc` type-checker for .aihu Single-File Components |
| **Published files** | 4 entries |
| **License** | MIT |

<sub><i>Auto-generated against `@aihu/tsc@0.3.4`.</i></sub>

<!-- END_AUTOGEN: stats -->

## Exports

<!-- BEGIN_AUTOGEN: exports -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

| Subpath | ESM | CJS |
|---|---|---|
| `.` | `./dist/index.js` | `—` |

<sub><i>Auto-generated against `@aihu/tsc@0.3.4`.</i></sub>

<!-- END_AUTOGEN: exports -->

## Dependencies

<!-- BEGIN_AUTOGEN: deps -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

**Dependencies:**

- `@aihu/compiler` — `^1.3.6`
- `@volar/typescript` — `2.4.28`
- `@volar/language-core` — `2.4.28`

**Peer dependencies:**

- `typescript` — `>=5.0.0`

<sub><i>Auto-generated against `@aihu/tsc@0.3.4`.</i></sub>

<!-- END_AUTOGEN: deps -->

## See also

<!-- BEGIN_AUTOGEN: see-also -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

- [@aihu/compiler](https://github.com/aihu-project/aihu-compiler)
- [@aihu/language-server](https://github.com/aihu-project/aihu-language/tree/main/packages/language-server)
- [Aihu framework root](https://github.com/aihu-project/aihu)

<sub><i>Auto-generated against `@aihu/tsc@0.3.4`.</i></sub>

<!-- END_AUTOGEN: see-also -->

## License

<!-- BEGIN_AUTOGEN: license -->
<!-- regenerate: bun scripts/sync-readme.ts (also runs in pre-commit + CI) -->

MIT — see [LICENSE](../../LICENSE).

<sub><i>Auto-generated against `@aihu/tsc@0.3.4`.</i></sub>

<!-- END_AUTOGEN: license -->
