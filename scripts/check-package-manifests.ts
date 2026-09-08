import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type PackageJson = {
  name?: unknown
  version?: unknown
  [key: string]: unknown
}

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const packages = [
  { directory: 'packages/tsc', name: '@aihu/tsc' },
  { directory: 'packages/language-server', name: '@aihu/language-server' },
] as const

const run = (command: string[], cwd: string): string => {
  const process = Bun.spawnSync(command, { cwd, stdout: 'pipe', stderr: 'pipe' })
  const stdout = new TextDecoder().decode(process.stdout)
  const stderr = new TextDecoder().decode(process.stderr)
  if (process.exitCode !== 0) {
    throw new Error(`${command.join(' ')} failed${stderr ? `: ${stderr.trim()}` : ''}`)
  }
  return stdout
}

const findWorkspaceSpec = (value: unknown, path = 'package.json'): string | undefined => {
  if (typeof value === 'string') {
    return value.startsWith('workspace:') ? `${path}: ${value}` : undefined
  }
  if (Array.isArray(value)) {
    for (const [index, nested] of value.entries()) {
      const found = findWorkspaceSpec(nested, `${path}[${index}]`)
      if (found) return found
    }
    return undefined
  }
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      const found = findWorkspaceSpec(nested, `${path}.${key}`)
      if (found) return found
    }
  }
  return undefined
}

const tempRoot = await mkdtemp(join(tmpdir(), 'aihu-language-pack-'))

try {
  for (const packageInfo of packages) {
    const packageTemp = await mkdtemp(join(tempRoot, 'package-'))
    run(
      [
        'bun',
        'pm',
        'pack',
        '--cwd',
        packageInfo.directory,
        '--destination',
        packageTemp,
        '--ignore-scripts',
      ],
      root,
    )
    const tarball = (await readdir(packageTemp)).find((file) => file.endsWith('.tgz'))
    if (!tarball) {
      throw new Error(`bun pm pack produced no tarball for ${packageInfo.name}`)
    }

    const manifest = JSON.parse(
      run(['tar', '-xOf', join(packageTemp, tarball), 'package/package.json'], root),
    ) as PackageJson
    if (manifest.name !== packageInfo.name) {
      throw new Error(
        `packed manifest name mismatch: expected ${packageInfo.name}, found ${String(manifest.name)}`,
      )
    }
    const workspaceSpec = findWorkspaceSpec(manifest)
    if (workspaceSpec) {
      throw new Error(
        `${packageInfo.name} packed manifest contains an unsupported workspace spec: ${workspaceSpec}`,
      )
    }
    console.log(
      `✓ ${packageInfo.name}@${String(manifest.version)} packed manifest contains no workspace: specs`,
    )
  }
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}
