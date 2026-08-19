import { defineConfig } from "vite";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        dts({
            tsconfigPath: resolve(__dirname, "tsconfig.json"),
            insertTypesEntry: true,
            exclude: ["**/*.test.ts"]
        })
    ],

    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "LuvIcons",
            formats: ["es"],
            fileName: "index"
        }
    }
});
