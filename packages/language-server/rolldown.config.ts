import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

// Runtime deps, the compiler package, and node builtins stay external. The
// installed @aihu/compiler package supplies the public codemod and resolver at
// runtime; node: builtins must never be bundled.
const external = [
  /^node:/,
  /^@aihu\/compiler(?:\/|$)/,
  'vscode-languageserver',
  'vscode-languageserver/node.js',
  'vscode-languageserver-textdocument',
]

// TypeScript's bundled CJS internals (e.g. getNodeSystem's case-sensitivity
// check) reference the bare `__filename`/`__dirname` globals that only exist
// in CommonJS. rolldown's ESM output doesn't shim them, so without this
// banner every entry crashes with `ReferenceError: __filename is not defined`
// as soon as that code path runs. Assigning through `globalThis` (rather than
// declaring local bindings) lets the free-variable lookups already baked into
// the bundled code resolve without rolldown's renamer needing to touch them.
const nodeGlobalsShimBanner = `import * as __aihuNodeUrl from "node:url";
globalThis.__filename = __aihuNodeUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __aihuNodeUrl.fileURLToPath(new URL(".", import.meta.url));`

export default defineConfig([
  // ---------------------------------------------------------------------------
  // Library entries — server connection layer + editor-agnostic core surface.
  // ---------------------------------------------------------------------------
  {
    input: {
      server: 'src/server.ts',
      'core/index': 'src/core/index.ts',
    },
    platform: 'node',
    external,
    checks: { circularDependency: true },
    output: {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
      entryFileNames: '[name].js',
      banner: nodeGlobalsShimBanner,
    },
    plugins: [dts()],
  },

  // ---------------------------------------------------------------------------
  // Bin entry — the runnable `aihu-language-server` binary (stdio LSP server).
  // ---------------------------------------------------------------------------
  {
    input: { bin: 'src/bin.ts' },
    platform: 'node',
    external,
    checks: { circularDependency: true },
    output: {
      dir: 'dist',
      format: 'esm',
      banner: `#!/usr/bin/env node\n${nodeGlobalsShimBanner}`,
      entryFileNames: '[name].js',
    },
  },
])
