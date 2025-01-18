import { defineConfig } from "vite";

export default defineConfig(({}) => {
  return {
    root: "./src",
    build: {
      outDir: "../dist",
      emptyOutDir: true,
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
