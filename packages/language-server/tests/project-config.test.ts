/**
 * loadLspProjectConfig — reads `AihuConfig.compiler.target` out of a
 * workspace's `vite.config.ts` via `@aihu/app`'s `loadAihuConfig(root)`, the
 * same shared loader the CLI reads (#12).
 */
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, it, vi } from 'vitest'
import { loadLspProjectConfig } from '../src/core/project-config.ts'

;(vi.mock as any)(
  '@aihu/app',
  () => ({
    loadAihuConfig: async (root: string) => {
      try {
        await access(join(root, 'vite.config.ts'))
      } catch {
        return null
      }
      return { config: { compiler: { target: 'client' } } }
    },
  }),
  { virtual: true },
)

describe('loadLspProjectConfig', () => {
  it('returns {} when the directory has no vite.config.ts', async () => {
    const empty = await mkdtemp(join(tmpdir(), 'aihu-lsp-noconfig-'))
    try {
      expect(await loadLspProjectConfig(empty)).toEqual({})
    } finally {
      await rm(empty, { recursive: true, force: true })
    }
  })

  describe('configured vite.config.ts', () => {
    // The app loader is mocked above because @aihu/language-server
    // deliberately does not depend on the full app runtime (see
    // project-config.ts's own doc comment).
    let dir: string

    afterAll(async () => {
      if (dir) await rm(dir, { recursive: true, force: true })
    })

    it('reads compiler.target via the shared @aihu/app loader', async () => {
      dir = resolve(import.meta.dirname, '.tmp-project-config')
      await mkdir(dir, { recursive: true })
      await writeFile(
        join(dir, 'vite.config.ts'),
        [
          "import { viteAihuPlugin } from '@aihu/app'",
          '',
          'export default {',
          '  plugins: [viteAihuPlugin({',
          "    compiler: { target: 'client' },",
          '  })],',
          '}',
        ].join('\n'),
      )

      const result = await loadLspProjectConfig(dir)
      expect(result).toEqual({ target: 'client' })
    })
  })
})
