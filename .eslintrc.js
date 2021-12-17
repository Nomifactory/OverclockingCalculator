module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module",
	},
	extends: ["plugin:prettier/recommended", "plugin:@typescript-eslint/recommended", "plugin:react/recommended"],
	rules: {
		"quotes": ["error", "double", { avoidEscape: true }],
		"@typescript-eslint/no-explicit-any": "off",
		"unused-imports/no-unused-imports": "error",
		"curly": ["error", "multi-or-nest"],
		"eqeqeq": ["error", "smart"],
		"prettier/prettier": [
			"error",
			{
				semi: true,
				trailingComma: "all",
				printWidth: 120,
				useTabs: true,
				alignObjectProperties: true,
				quoteProps: "consistent",
			},
		],
	},
	plugins: ["unused-imports"],
	settings: {
		react: {
			pragma: "h",
		},
	},
};
