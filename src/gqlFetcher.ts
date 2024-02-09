import { GraphQLClient, Variables } from "graphql-request";

export const gqlFetch = async <T = any>({
  endpoint,
  query,
  variables = {},
  headers = {},
}: {
  endpoint: string;
  query: string;
  variables?: Variables;
  headers?: Record<string, string>;
}): Promise<T> => {
  const client = new GraphQLClient(endpoint, { headers });
  return client.request<T>(query, variables);
};
