import type { ExpressionStatement, ImportDeclaration } from '@babel/types'

/**
 * Test helper, to verify sort order and newline placement
 */
// prettier-ignore
export const getSortedNodesNamesAndNewlines = (
	imports: (ImportDeclaration | ExpressionStatement)[],
) =>
	imports
		.filter((i) => i.type === 'ImportDeclaration' || i.type === 'ExpressionStatement')
		.map((i) => (i.type === 'ImportDeclaration' ? i.source.value : ''))
