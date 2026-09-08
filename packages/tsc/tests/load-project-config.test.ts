/**
 * loadTscProjectConfig — reads `AihuConfig.compiler.target` /
 * `AihuConfig.typecheck.strictTemplates` out of a project's `vite.config.ts`,
 * the only chance `aihu-tsc`/the language server get to see it (both are
 * invoked directly, with no orchestrating CLI command threading flags in —
 * see the file's own doc comment).
 */
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { loadTscProjectConfig } from '../src/load-project-config.ts'

;(vi.mock as any)(
  '@aihu/app',
  () => ({
    loadAihuConfig: async (root: string) => {
      try {
        await access(join(root, 'vite.config.ts'))
      } catch {
        return null
      }
      return { config: { compiler: { target: 'client' }, typecheck: { strictTemplates: true } } }
    },
  }),
  { virtual: true },
)

describe('loadTscProjectConfig', () => {
  it('returns {} when the directory has no vite.config.ts', async () => {
    const empty = await mkdtemp(join(tmpdir(), 'aihu-tsc-noconfig-'))
    try {
      expect(await loadTscProjectConfig(empty)).toEqual({})
    } finally {
      await rm(empty, { recursive: true, force: true })
    }
  })

  describe('configured vite.config.ts', () => {
    // The app loader is mocked above because @aihu/tsc deliberately does not
    // depend on the full app runtime. This keeps the test focused on the
    // config-shape boundary that tsc consumes.
    let dir: string

    afterAll(async () => {
      if (dir) await rm(dir, { recursive: true, force: true })
    })

    it('reads compiler.target and typecheck.strictTemplates', async () => {
      dir = resolve(import.meta.dirname, '.tmp-load-project-config')
      await mkdir(dir, { recursive: true })
      await writeFile(
        join(dir, 'vite.config.ts'),
        [
          "import { viteAihuPlugin } from '@aihu/app'",
          '',
          'export default {',
          '  plugins: [viteAihuPlugin({',
          "    compiler: { target: 'client' },",
          '    typecheck: { strictTemplates: true },',
          '  })],',
          '}',
        ].join('\n'),
      )

      const result = await loadTscProjectConfig(dir)
      expect(result).toEqual({ target: 'client', strictTemplates: true })
    })
  })
})
