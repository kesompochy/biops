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
    const queries = await this.repository.listQueries[this.type](options);
    return this.filterQueries(queries, options);
  }
  async updateQuery(id: string, options: QueryUpdateOptions): Promise<[Query, Query]> {
    return this.repository.updateQuery[this.type](id, options);
  }

  private filterQueries(queries: Query[], options: QueryListOptions): Query[] {
    return queries.filter(query => {
      if (options?.datasource && String(query.dataSource) !== options.datasource) {
        return false;
      }
      if (options?.queryRegexp && !new RegExp(options.queryRegexp).test(query.sql)) {
        return false;
      }
      if (options?.name && query.name !== options.name) {
        return false;
      }
      if (options?.nameRegexp && !new RegExp(options.nameRegexp).test(query.name)) {
        return false;
      }
      return true;
    });
  }
}
