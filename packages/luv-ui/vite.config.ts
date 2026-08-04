import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        react(),
        dts({
            tsconfigPath: resolve(__dirname, "tsconfig.json"),
            insertTypesEntry: true,
            exclude: ["**/*.test.ts", "**/*.test.tsx", "src/vitest.setup.ts"]
        })
    ],

    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "LuvUI",
            formats: ["es"],
            fileName: "index"
        },

        rollupOptions: {
            external: (id) =>
                id === "react" ||
                id === "react-dom" ||
                id.startsWith("react/")
        }
    }
});