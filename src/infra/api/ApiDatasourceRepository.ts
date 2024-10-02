import type Datasource from "~/core/entities/Datasource";
import type DatasourceRepository from "~/core/repositories/DatasourceRepository";
import type { ProviderType } from "~/core/entities/Provider";

export default class ApiDatasourceRepository implements DatasourceRepository {
  constructor(private type: ProviderType, private url: string, private apiKey?: string) {}

  get list(): Record<ProviderType, ()=>Promise<Datasource[]>> {
    return {
      redash: () => { return listRedashDatasources(this.url, this.apiKey || "") },
      metabase: () => { return listMetabaseDatasources(this.url, this.apiKey || "") },
    }
  }
}

const listRedashDatasources = async (endpoint: string, apiKey: string): Promise<Datasource[]> => {
  const url = `https://${endpoint}/api/data_sources`;
  const headers = new Headers({
    "Content-Type": "application/json",
    "Authorization": `Key ${apiKey}`,
  });

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch datasources: ${res.statusText}`);
  }
  const data = res.body !== null ? await res.json() : [];

  const datasources = data.map((d: any) => ({
    id: d.id,
    name: d.name,
    type: d.type,
  }));

  return datasources;
}

const listMetabaseDatasources = async (endpoint: string, apiKey: string): Promise<Datasource[]> => {
  return [];
}
