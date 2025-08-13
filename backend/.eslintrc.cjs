module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
	env: { node: true, es2022: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		'no-console': 'off',
		'import/order': [
			'warn',
			{
				'newlines-between': 'always',
				'alphabetize': { order: 'asc', caseInsensitive: true },
			},
		],
	},
}


