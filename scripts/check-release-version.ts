import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type PackageJson = {
  name?: unknown
  version?: unknown
  dependencies?: Record<string, unknown>
}

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

const readPackage = (packagePath: string): PackageJson =>
  JSON.parse(readFileSync(resolve(root, packagePath), 'utf8')) as PackageJson

const readStableVersion = (packagePath: string): string => {
  const packageJson = readPackage(packagePath)
  if (typeof packageJson.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
    throw new Error(
      `${packagePath} must use an exact stable semver version; found ${String(packageJson.version)}`,
    )
  }
  return packageJson.version
}

/** Verify the coordinated language release tag and package dependency order. */
export function checkReleaseVersion(tag: string): void {
  const languageServer = readStableVersion('packages/language-server/package.json')
  const tsc = readStableVersion('packages/tsc/package.json')
  const server = readPackage('packages/language-server/package.json')
  const expectedTag = `language-v${languageServer}`

  if (tag !== expectedTag) {
    throw new Error(
      `release tag must equal @aihu/language-server version (${expectedTag}); found ${tag || '(empty)'}`,
    )
  }

  if (server.dependencies?.['@aihu/tsc'] !== 'workspace:*') {
    throw new Error(
      `@aihu/language-server must consume the release-local @aihu/tsc workspace; found ${String(server.dependencies?.['@aihu/tsc'])}`,
    )
  }

  console.log(
    `✓ ${tag} matches @aihu/language-server@${languageServer}; @aihu/tsc@${tsc} publishes first`,
  )
}

if (process.argv[1]?.endsWith('check-release-version.ts')) {
  checkReleaseVersion(process.argv[2] ?? process.env.GITHUB_REF_NAME ?? '')
}
