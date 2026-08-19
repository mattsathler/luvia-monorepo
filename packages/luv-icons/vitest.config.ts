import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            globals: true,
            coverage: {
                provider: "v8",
                all: true,
                include: ["src/**/*.ts"],
                exclude: ["src/**/*.d.ts", "src/**/*.test.ts"],
                thresholds: {
                    statements: 100,
                    branches: 100,
                    functions: 100,
                    lines: 100,
                },
            },
        },
    })
);
