/**
 * Create path to translation property
 * @param scope directories strings array
 * @param property properties strings array
 * @returns string with translation path
 */
export function getTranslationPath(scope: string[], property: string[]): string {
  const scopeStr = scope.length > 0
    ? scope
    .join('/')
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index == 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+|_|-|\//g, '') + '.'
    : '';

  return `${scopeStr}${property.join('.')}`;
}
