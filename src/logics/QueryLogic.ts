import type Query from "~/core/entities/Query";
import type QueryRepository from "~/core/repositories/QueryRepository";
import type { ProviderType } from "~/core/entities/Provider";
import type { QueryListOptions, QueryUpdateOptions } from "~/commands/QueryCommand";

interface QueryFilter {
  datasource?: string;
  queryReplace?: [string, string];
}
export default class QueryLogic {
  constructor(private repository: QueryRepository, private type: ProviderType) {}
  async list(options: QueryListOptions): Promise<Query[]> {
    return this.repository.listQueries[this.type](options);
  }
  async updateQuery(id: string, options: QueryUpdateOptions): Promise<[Query, Query]> {
    return this.repository.updateQuery[this.type](id, options);
  }
}
