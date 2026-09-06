import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "test_schedules.js",
    "scripts/**",
    "public/**",
    // These are un-routed legacy reference components. The production route
    // graph uses the secured App Router components under src/components/app,
    // src/components/bootcamp, and src/components/webinars instead.
    "src/app/board/**",
    "src/app/ruang-sosmed/_core/**",
    "src/app/ruang-sosmed/RuangSosmedLayoutClient.tsx",
    "src/app/ruang-sosmed/RuangSosmedLayoutContent.tsx",
    "src/app/ruang-sosmed/[[...slug]]/V2MasterRouterClient.tsx",
    "src/app/admin/calendar/CalendarMobileV1.tsx",
    "src/app/admin/dashboard/_core/**",
    "src/components/layout/**",
    "src/components/charts/**",
    "src/components/ui/**",
    "src/lib/utils.ts",
    "check_clients.mjs",
    "check_db.js",
    "fix_db.js",
    "generate_*.js",
    "rescue_migration.js",
    "restore_*.js",
    "test_in.js",
    "test_supabase.js",
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
