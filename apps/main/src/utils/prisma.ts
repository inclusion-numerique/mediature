// This is due to how the underlying search engine parses the query (https://www.postgresql.org/docs/current/datatype-textsearch.html)
// Spaces need to be escaped, they are different strategies depending of the logic or search, we chose the simpler one
// Ref: https://github.com/prisma/prisma/issues/8939
// Characters having a meaning for `to_tsquery()` (operators, grouping, weights, prefix, quoting) are also escaped, otherwise
// a user typing them (e.g. `martin!` or `dupont (fils)`) or a citizen name containing them would make the query fail with a syntax error
export function formatSearchQuery(query: string): string {
  return query.replace(/[\s&|!():*<>\\']/g, '_');
}
