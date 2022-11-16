module.exports = {
  extends: ["next", "turbo", "prettier"],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "interface-name": false,
    "deprecation": true,
    "no-console": false,
    "no-implicit-dependencies": false,
    "no-submodule-imports": false,
    "no-trailing-whitespace": true,
    "object-literal-sort-keys": false,
    "react/jsx-key": "off"
  },
};
