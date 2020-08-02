module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true // Allows for the parsing of JSX
		}
	},
	extends: [
		"plugin:@typescript-eslint/recommended",
		"preact"
	],
}
