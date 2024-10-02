import type Datasource from "~/core/entities/Datasource";
import type { ProviderType } from "~/core/entities/Provider";

export default interface DatasourceRepository {
  list: Record<ProviderType, ()=>Promise<Datasource[]>>;
}
