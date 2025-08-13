module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
	env: { browser: true, es2022: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:react-hooks/recommended',
		'prettier',
	],
	plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'import/order': [
			'warn',
			{
				'newlines-between': 'always',
				'alphabetize': { order: 'asc', caseInsensitive: true },
			},
		],
	},
}


