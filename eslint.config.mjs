import { defineConfig, globalIgnores } from "eslint/config";
import coreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...coreWebVitals,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "src/drizzle/**",
    "src/lib/blog-manifest.generated.ts",
  ]),
  {
    rules: {
      // eslint-config-next 16 引入的 React Compiler 严格规则，
      // 存量代码待逐步重构，先降为警告避免阻塞 CI
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
]);
