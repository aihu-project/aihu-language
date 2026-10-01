/**
 * packages/language-server/src/core/project-config.ts
 *
 * Reads `AihuConfig.compiler.target` out of a workspace's `vite.config.ts` via
 * `@aihu/app`'s `loadAihuConfig(root)` — the same shared loader
 * `viteAihuPlugin({...})` publishes and `aihu build`/`aihu dev` read, so the
 * editor's diagnostics agree with the CLI's instead of drifting from a
 * private re-reading of project config (#12).
 *
 * `@aihu/app` is resolved at RUNTIME from the user's project, not linked at
 * build time — the language server is invoked directly by editors with no
 * orchestrating CLI command threading flags in, and a scaffolded project
 * always has `@aihu/app` installed even though this package does not depend
 * on it. Held in a variable, not a literal specifier, so tsc does not attempt
 * to resolve `@aihu/app`'s types while building this package.
 */
const AIHU_APP = '@aihu/app'

interface ProjectConfig {
  readonly compiler?: { readonly target?: 'client' | 'server' | 'universal' }
}

interface AihuAppModule {
  loadAihuConfig: (
    root: string,
    opts?: { mode?: string; command?: 'build' | 'serve' },
  ) => Promise<{ config: ProjectConfig } | null>
}

/**
 * Load `{ target }` from `root`'s `vite.config.ts`.
 *
 * Returns `{}` (not throwing) whenever there's nothing to read — `@aihu/app`
 * not installed, no vite config present, or the config itself threw. The
 * caller already has its own default (the compiler's `universal` target), so
 * a project with no `compiler.target` configured behaves exactly as it did
 * before this file existed.
 */
export async function loadLspProjectConfig(
  root: string,
): Promise<{ target?: 'client' | 'server' | 'universal' }> {
  try {
    const { loadAihuConfig } = (await import(AIHU_APP)) as AihuAppModule
    const loaded = await loadAihuConfig(root)
    if (!loaded) return {}
    return loaded.config.compiler?.target ? { target: loaded.config.compiler.target } : {}
  } catch {
    return {}
  }
}
