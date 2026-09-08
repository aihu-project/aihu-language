import { readFile } from 'node:fs/promises'

type PackageJson = {
  name?: string
  dependencies?: Record<string, string>
  repository?: { url?: string; directory?: string }
}

const packages = [
  ['packages/tsc/package.json', '@aihu/compiler', '^1.3.6'],
  ['packages/language-server/package.json', '@aihu/compiler', '^1.3.6'],
  ['packages/language-server/package.json', '@aihu/tsc', 'workspace:*'],
  ['packages/vscode-aihu/package.json', '@aihu/language-server', 'workspace:*'],
] as const

for (const [path, dependency, expected] of packages) {
  const pkg = JSON.parse(await readFile(path, 'utf8')) as PackageJson
  const actual = pkg.dependencies?.[dependency]
  if (actual !== expected) {
    throw new Error(`${path} must use ${dependency} ${expected}; found ${actual ?? 'missing'}`)
  }
}

for (const path of ['packages/tsc/package.json', 'packages/language-server/package.json']) {
  const pkg = JSON.parse(await readFile(path, 'utf8')) as PackageJson
  if (pkg.repository?.url !== 'https://github.com/aihu-project/aihu-language') {
    throw new Error(`${path} repository must point to aihu-project/aihu-language`)
  }
  if (pkg.repository?.directory === undefined) {
    throw new Error(`${path} repository directory must identify the package`)
  }
}

const sourceFiles = [
  'packages/tsc/src/index.ts',
  'packages/tsc/src/language-plugin.ts',
  'packages/language-server/src/core/code-action.ts',
  'packages/language-server/src/core/diagnostics.ts',
]
for (const path of sourceFiles) {
  const source = await readFile(path, 'utf8')
  if (source.includes('packages/compiler') || source.includes('src/compiler')) {
    throw new Error(`${path} reaches into the removed root compiler source tree`)
  }
}

console.log('Aihu language package boundaries are valid')
