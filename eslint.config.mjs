import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test_schedules.js",
    "scripts/**",
    "public/**",
  ]),
  {
    // Removing rules that require manual plugin definition for now to avoid build errors.
    // Instead, using the existing rule definitions from nextVitals and nextTs.
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-require-imports": "warn",
    }
  }
]);

export default eslintConfig;
