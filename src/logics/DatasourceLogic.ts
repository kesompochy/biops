import type Datasource from "~/core/entities/Datasource";
import type DatasourceRepository from "~/core/repositories/DatasourceRepository";
import type { ProviderType } from "~/core/entities/Provider";

export default class DatasourceLogic {
  constructor(private datasourceRepository: DatasourceRepository, private type: ProviderType) {}
  async list(): Promise<Datasource[]> {
    return this.datasourceRepository.list[this.type]();
  }
}
