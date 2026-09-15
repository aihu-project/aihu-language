import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// `vsce package` walks the actual node_modules tree on disk to decide what to
// bundle. In this bun workspace, packages/vscode-aihu/node_modules/@aihu/language-server
// is a symlink straight to the packages/language-server *source* directory,
// which still carries its own devDependency symlinks (e.g. @aihu/tsc ->
// ../../../tsc). vsce follows those symlinks too, walks into sibling
// workspace packages, and ultimately trips over a relative path that climbs
// above the repo root (packages/tsc's tsconfig extends the workspace root's
// tsconfig.base.json). `vsce package --no-dependencies` sidesteps the crash
// but strips *all* dependencies from the VSIX, including @aihu/language-server
// itself, which packages/vscode-aihu/client/index.ts requires at runtime.
//
// The fix is to package from an isolated staging copy: a plain, non-workspace
// directory containing only the extension's real files plus a normally
// resolved (not workspace-symlinked) node_modules built from the extension's
// actual runtime dependency graph.

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const extensionDir = join(root, 'packages', 'vscode-aihu')
const languageServerDir = join(root, 'packages', 'language-server')

const run = (command: string[], cwd: string): void => {
  const proc = Bun.spawnSync(command, { cwd, stdout: 'inherit', stderr: 'inherit' })
  if (proc.exitCode !== 0) {
    throw new Error(`${command.join(' ')} failed (exit ${proc.exitCode})`)
  }
}

const readJson = async (path: string): Promise<Record<string, unknown>> =>
  JSON.parse(await readFile(path, 'utf8'))

const outIndex = process.argv.indexOf('--out')
const outPath =
  outIndex !== -1 && process.argv[outIndex + 1]
    ? resolve(process.argv[outIndex + 1] as string)
    : join(root, 'aihu-language.vsix')

const tempRoot = await mkdtemp(join(tmpdir(), 'aihu-vscode-package-'))

try {
  const vscodeManifest = await readJson(join(extensionDir, 'package.json'))
  const languageServerManifest = await readJson(join(languageServerDir, 'package.json'))
  const vscodeDeps = (vscodeManifest.dependencies ?? {}) as Record<string, string>
  const languageServerDeps = (languageServerManifest.dependencies ?? {}) as Record<string, string>

  // @aihu/language-server's package.json declares @aihu/tsc as a dependency
  // for npm publish metadata (enforced by scripts/check-boundaries.ts), but
  // rolldown.config.ts does NOT list it as external — it's bundled directly
  // into dist/bin.js and dist/server.js, so it is never required from
  // node_modules at runtime. It's also a workspace-only package that isn't
  // published to the registry at this workspace's exact version, so
  // vendoring it here would fail to resolve. Keep this in sync with the
  // `external` array in packages/language-server/rolldown.config.ts.
  const bundledNotRuntimeDeps = new Set(['@aihu/tsc'])

  // 1. Resolve the extension's real (non-workspace) runtime dependencies —
  // everything it depends on except the workspace-local @aihu/language-server
  // — into a plain, standalone node_modules via a throwaway package.json.
  // Run from outside the repo so bun doesn't treat it as a workspace member.
  const vendorDir = join(tempRoot, 'vendor')
  await mkdir(vendorDir, { recursive: true })
  const vendorDeps: Record<string, string> = {}
  for (const [name, versionRange] of Object.entries(languageServerDeps)) {
    if (!bundledNotRuntimeDeps.has(name)) vendorDeps[name] = versionRange
  }
  for (const [name, versionRange] of Object.entries(vscodeDeps)) {
    if (name !== '@aihu/language-server') vendorDeps[name] = versionRange
  }
  await writeFile(
    join(vendorDir, 'package.json'),
    JSON.stringify(
      { name: 'aihu-vscode-vendor', private: true, dependencies: vendorDeps },
      null,
      2,
    ),
  )
  run(['bun', 'install', '--no-save'], vendorDir)

  // 2. Build the extension's own files (not node_modules) in a staging copy.
  const stagingExtDir = join(tempRoot, 'extension')
  await cp(extensionDir, stagingExtDir, {
    recursive: true,
    filter: (source) => !source.split('/').includes('node_modules'),
  })

  // dist/client is already built by `bun run build:vscode` before this script
  // runs; drop vscode:prepublish so vsce doesn't try to re-run `tsc` in a
  // staging copy that has no devDependencies installed. Also rewrite the
  // `workspace:*` dependency spec to a real version — npm's dependency-tree
  // validator (which `vsce package` shells out to) doesn't understand the
  // bun/pnpm workspace protocol and reports the install as invalid.
  const stagingManifestPath = join(stagingExtDir, 'package.json')
  const stagingManifest = await readJson(stagingManifestPath)
  const stagingScripts = { ...(stagingManifest.scripts as Record<string, string>) }
  delete stagingScripts['vscode:prepublish']
  const stagingDependencies = { ...(stagingManifest.dependencies as Record<string, string>) }
  if (stagingDependencies['@aihu/language-server']) {
    stagingDependencies['@aihu/language-server'] = String(languageServerManifest.version)
  }
  await writeFile(
    stagingManifestPath,
    JSON.stringify(
      { ...stagingManifest, scripts: stagingScripts, dependencies: stagingDependencies },
      null,
      2,
    ),
  )

  // 3. Populate staging node_modules: the vendored real dependencies, plus
  // @aihu/language-server packed exactly as it would be published (dist +
  // README + LICENSE only — no devDependency symlinks to walk into).
  const stagingModules = join(stagingExtDir, 'node_modules')
  await cp(join(vendorDir, 'node_modules'), stagingModules, { recursive: true })

  const packDestination = join(tempRoot, 'pack')
  await mkdir(packDestination, { recursive: true })
  run(
    [
      'bun',
      'pm',
      'pack',
      '--cwd',
      languageServerDir,
      '--destination',
      packDestination,
      '--ignore-scripts',
    ],
    root,
  )
  const tarball = (await readdir(packDestination)).find((file) => file.endsWith('.tgz'))
  if (!tarball) throw new Error('bun pm pack produced no tarball for @aihu/language-server')

  const languageServerModuleDir = join(stagingModules, '@aihu', 'language-server')
  await rm(languageServerModuleDir, { recursive: true, force: true })
  await mkdir(languageServerModuleDir, { recursive: true })
  run(
    [
      'tar',
      '-xzf',
      join(packDestination, tarball),
      '--strip-components=1',
      '-C',
      languageServerModuleDir,
    ],
    root,
  )

  // vsce shells out to `npm list --production` to validate the dependency
  // tree; npm treats every declared "dependencies" entry as something that
  // must be physically present, so the bundled-not-vendored packages (see
  // bundledNotRuntimeDeps above) must also be dropped from the staged
  // package.json or npm reports them as missing.
  const packedManifestPath = join(languageServerModuleDir, 'package.json')
  const packedManifest = await readJson(packedManifestPath)
  const packedDependencies = { ...(packedManifest.dependencies as Record<string, string>) }
  for (const name of bundledNotRuntimeDeps) delete packedDependencies[name]
  await writeFile(
    packedManifestPath,
    JSON.stringify({ ...packedManifest, dependencies: packedDependencies }, null, 2),
  )

  // 4. Package the staged, self-contained extension directory.
  const vsceBin = join(root, 'node_modules', '.bin', 'vsce')
  const passthroughArgs = process.argv.slice(2).filter((arg, index, args) => {
    if (arg === '--out') return false
    if (args[index - 1] === '--out') return false
    return true
  })
  run([vsceBin, 'package', '--out', outPath, ...passthroughArgs], stagingExtDir)

  console.log(`✓ packaged ${outPath}`)
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}
