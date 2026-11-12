const DEFAULT_TEST_DATABASE_URL =
  "postgresql://postgres:postgres@127.0.0.1:5432/jobsearch_test?schema=public";

export function getTestDatabaseUrl(value = DEFAULT_TEST_DATABASE_URL) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Tests require a local jobsearch_test PostgreSQL database.");
  }

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.pathname !== "/jobsearch_test" ||
    [...url.searchParams].some(([key, setting]) => key !== "schema" || setting !== "public")
  ) {
    throw new Error("Tests require a local jobsearch_test PostgreSQL database.");
  }

  return value;
}
