import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypeScript,
  {
    ignores: [
      "**/.next/**",
      "**/next-env.d.ts",
      ".claude/**",
      ".pnpm-store/**",
      "graphify-out/**",
    ],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@next/next/no-img-element": "off",
      // Next 16 enables the React Compiler lint family. The existing apps
      // predate those rules; keep the migration debt visible without making
      // an unrelated compiler refactor part of the 1SP production cutover.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react/no-children-prop": "warn",
    },
  },
];

export default eslintConfig;
