import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslintPlugin({
      cache: false,
      include: [
        "./src/**/*.ts",
        "./src/**/*.tsx",
        "./src/**/*.js",
        "./src/**/*.jsx",
      ],
      fix: true,
      failOnError: false,
      failOnWarning: false,
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
    extensions: [".js", ".ts", ".jsx", ".tsx"],
  },
  server: {
    hmr: {
      // overlay: false,
    },
  },
});
