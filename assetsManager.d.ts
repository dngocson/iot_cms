import type { Plugin } from "vite";

/** Vite plugin that generates `src/assetsMap.ts` from the `public/` directory. */
export function assetsManager(): Plugin;
export default assetsManager;
