import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
	return {
		root: "./src",
		build: {
			outDir: "../dist",
			emptyOutDir: true,
			minify: command !== "serve",
		},
		define: {
			"process.env": {},
		},
		css: {
			modules: {
				localsConvention: "camelCaseOnly",
			},
		},
	};
});
