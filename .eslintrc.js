module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true,
		},
	},
	extends: ["plugin:@typescript-eslint/recommended", "preact", "plugin:prettier/recommended"],
	rules: {
		quotes: [2, "double", { avoidEscape: true }],
		semi: [2, "always"],
	},
};
