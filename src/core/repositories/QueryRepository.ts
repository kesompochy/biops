import type Query from "~/core/entities/Query";
import type { ProviderType } from "../entities/Provider";

import type { QueryListOptions, QueryUpdateOptions } from "~/commands/QueryCommand";

export default interface QueryRepository {
  listQueries: Record<ProviderType, (options: QueryListOptions) => Promise<Query[]>>;
  updateQuery: Record<ProviderType, (id: string, options: QueryUpdateOptions) => Promise<[Query, Query]>>;
}
