import antfu from "@antfu/eslint-config"

export default antfu({
  stylistic: {
    quotes: "double",
  },
  vue: true,
  typescript: true,
}, {
  files: ["**/*.vue"],
  rules: {
    "vue/block-order": ["error", {
      order: ["template", "script", "style"],
    }],
    "vue/max-attributes-per-line": ["error", {
      singleline: {
        max: 1,
      },
      multiline: {
        max: 1,
      },
    }],
    "vue/html-closing-bracket-newline": ["error", {
      singleline: "never",
      multiline: "never",
    }],
  },
}, {
  files: ["**/*.ts", "**/*.vue"],
  rules: {
    "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  },
}, {
  rules: {
    "no-useless-return": "off",
  },
})
