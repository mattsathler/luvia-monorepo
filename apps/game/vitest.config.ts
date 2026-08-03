import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: "jsdom",
            setupFiles: ["./vitest.setup.ts"],
            globals: true,
            css: true,
            coverage: {
                provider: "v8",
                all: true,
                include: ["src/**/*.{ts,tsx}"],
                exclude: ["src/**/*.d.ts", "src/**/*.test.{ts,tsx}"],
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
