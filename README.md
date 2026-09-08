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

## Releases

The npm packages are released together from a `language-v<language-server-version>`
tag. The release workflow validates the exact tag, runs the full workspace gate,
publishes `@aihu/tsc` first, verifies that version is available on npm, and then
publishes `@aihu/language-server`. Re-running a release safely skips package
versions that already exist. The workflow requires the repository `NPM_TOKEN`
secret.

`vscode-aihu` is a separate VS Code Marketplace artifact. Its `fellwork` publisher
identity and `1.0.0` version are intentionally unchanged here; package and
Marketplace credentials, review, and release cadence remain manual and separate
from npm publishing.

## Package documentation

- [`@aihu/tsc`](packages/tsc/README.md)
- [`@aihu/language-server`](packages/language-server/README.md)
- [`vscode-aihu`](packages/vscode-aihu/README.md)
- [`@aihu/compiler`](https://github.com/aihu-project/aihu-compiler)

## License

MIT — see [LICENSE](LICENSE).
