export class CollectionsHelper {
  static selectUnique<T, R>(collection: T[], selector: (element: T) => R): R[] {
    const selected = collection.map(element => JSON.stringify(selector(element)));
    return [...new Set(selected)].map(j => JSON.parse(j) as R);
  }
}
