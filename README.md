# Aihu Language

TypeScript tooling and editor integrations for [Aihu](https://github.com/aihu-project/aihu)
Single File Components.

This repository owns the editor-facing layer:

- `@aihu/tsc` provides TypeScript checking for `.aihu` sources through Volar's
  TypeScript proxy.
- `@aihu/language-server` provides diagnostics, hover, completion, and code
  actions over the Language Server Protocol.
- `vscode-aihu` provides TextMate grammar, snippets, and the VS Code client
  that launches the published language server.

The compiler is an external runtime dependency. The packages resolve the
published `@aihu/compiler` API and never reach into the Aihu framework source
tree. This keeps language tooling releases independently testable and lets
consumer repositories upgrade the compiler on their own cadence.

## Development

Requires Bun 1.2+ and Node.js 18+.

```bash
bun install --frozen-lockfile
bun run check
```

`bun run check` runs lint, boundary checks, TypeScript checks, package tests,
all builds, npm pack dry-runs, and a VS Code extension package dry-run.

## Package documentation

- [`@aihu/tsc`](packages/tsc/README.md)
- [`@aihu/language-server`](packages/language-server/README.md)
- [`vscode-aihu`](packages/vscode-aihu/README.md)
- [`@aihu/compiler`](https://github.com/aihu-project/aihu-compiler)

## License

MIT — see [LICENSE](LICENSE).
