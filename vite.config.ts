import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import viteReact from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { assetsManager } from "./assetsManager.js";

const config = defineConfig({
	resolve: {
		tsconfigPaths: true,
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	plugins: [
		assetsManager(),
		devtools(),
		tailwindcss(),
		tanstackRouter({ target: "react", autoCodeSplitting: true }),
		viteReact(),
	],
	server: {
		host: "0.0.0.0",
		port: 5173,
		proxy: {
      "/valhalla": {
        target: "https://valhalla1.openstreetmap.de",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/valhalla/, ""),
      },
    },
	},
});

export default config;
