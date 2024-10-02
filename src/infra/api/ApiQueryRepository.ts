import type QueryRepository from "~/core/repositories/QueryRepository";
import type Query from "~/core/entities/Query";
import type { ProviderType } from "~/core/entities/Provider";
import { sleep } from "bun";
import type { QueryListOptions, QueryUpdateOptions } from "~/commands/QueryCommand";

export default class ApiQueryRepository implements QueryRepository {
  url: string;
  type: ProviderType;
  apiKey?: string;
  constructor(type: ProviderType, url: string, apiKey?: string) {
    this.url = url;
    this.type = type;
    this.apiKey = apiKey;
  }
  get listQueries(): Record<ProviderType, (options?: QueryListOptions) => Promise<Query[]>> {
    return {
      redash: async (options?: QueryListOptions) => {
        return getRedashQueries(this.url, this.apiKey || "", options);
      },
      metabase: async (options?: QueryListOptions) => {
        return [];
      },
    };
  }
  get updateQuery(): Record<ProviderType, (id: string, options: QueryUpdateOptions) => Promise<[Query, Query]>> {
    return {
      redash: async (id, options) => {
        return updateRedashQuery(this.url, this.apiKey || "", id, options);
      },
      metabase: async (id, options) => {
        return [{} as Query, {} as Query];
      },
    };
  }
}


const getRedashQueries = async (endpoint: string, apiKey: string, options?: QueryListOptions): Promise<Query[]> => {
  const pageSize = 250;
  const baseUrl = `https://${endpoint}/api/queries?page_size=${pageSize}`;
  const headers = new Headers({
    "Content-Type": "application/json",
    "Authorization": `Key ${apiKey}`,
  })

  const fetchPage = async (url: string) => {
    const res = await fetch(url, { method: "GET", headers });
    if (!res.ok) {
      throw new Error(`Failed to fetch queries: ${res.statusText}`);
    }
    return res.json();
  };

  const firstPage = await fetchPage(baseUrl);
  const totalPages = Math.ceil(firstPage.count / firstPage.page_size);
  const pagesToFetch = options?.all ? totalPages : 1;
  
  const allQueries = [firstPage.results];
  for (let i = 2; i <= pagesToFetch; i++) {
    const pageData = await fetchPage(`${baseUrl}&page=${i}`);
    allQueries.push(pageData.results);
    await sleep(options?.delay || 1000);
  }

  interface RedashResponseQuery {
    query: string;
    id: string;
    name: string;
    description: string;
    user: string;
    data_source_id: string;
  }

  const flattenQueries = allQueries.flat().filter(Boolean);
  const resultQueries = flattenQueries.map((query: RedashResponseQuery) => ({
    sql: query.query || '',
    id: query.id || '',
    name: query.name || '',
    description: query.description || '',
    createdBy: query.user || '',
    dataSource: query.data_source_id || '',
  })).filter((query: Query) => {
    return !options?.datasource || String(query.dataSource) === options.datasource;
  });

  return resultQueries;
}


const updateRedashQuery = async (endpoint: string, apiKey: string, id: string, options?: QueryUpdateOptions): Promise<[Query, Query]> => {
  const url = `https://${endpoint}/api/queries/${id}`;
  const headers = new Headers({
    "Content-Type": "application/json",
    "Authorization": `Key ${apiKey}`,
  })

  const getResponse = await fetch(url, {
    method: "GET",
    headers,
  })
  const originalQueryData = await getResponse.json();
  const originalQuery: Query = {
    sql: originalQueryData.query || '',
    id: originalQueryData.id || '',
    name: originalQueryData.name || '',
    description: originalQueryData.description || '',
    dataSource: originalQueryData.data_source_id || '',
  }

  const newQuery = { ...originalQuery } as Query; // Deep copy
  if (options?.dataSource) {
    newQuery.dataSource = options.dataSource;
  }
  if (options?.query && options.queryReplace) {
    throw new Error("query and query-replace cannot be used together");
  }
  if (options?.queryReplace) {
    if (options.queryReplace.length % 2 !== 0) {
      throw new Error("query-replace requires an even number of arguments");
    }
    for (let i = 0; i < options.queryReplace.length; i += 2) {
      const originalString = options.queryReplace[i];
      const newString = options.queryReplace[i + 1];
      if (!originalString || !newString) {
        throw new Error("query-replace arguments cannot be empty");
      }
      newQuery.sql = newQuery.sql.replace(new RegExp(originalString, 'g'), newString);
    }
  }
  if (options?.query) {
    newQuery.sql = options.query;
  }

  interface RedashUpdateRequestBody {
    query?: string;
    description?: string;
    data_source_id?: string;
  }
  const bodyData = {} as RedashUpdateRequestBody;
  if (newQuery.sql !== originalQuery.sql) {
    bodyData.query = newQuery.sql;
  }
  if (newQuery.description !== originalQuery.description) {
    bodyData.description = newQuery.description;
  }
  if (newQuery.dataSource !== originalQuery.dataSource) {
    bodyData.data_source_id = newQuery.dataSource;
  }

  if (Object.keys(bodyData).length === 0) {
    return [originalQuery, newQuery];
  }

  if (options?.apply && Object.keys(bodyData).length > 0) {
    const postResponse = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyData),
    })
    const postData = await postResponse.json();
  }

  return [originalQuery, newQuery];
}
