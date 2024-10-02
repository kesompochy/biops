import { Command } from "commander";
import path from "node:path";
import type ProviderRepository from "~/core/repositories/ProviderRepository";
import ProviderLogics from "~/logics/ProviderLogic";
import FileSystemProviderRepository from "~/infra/filesystem/FileSystemProviderRepository";
import DatasourceLogics from "~/logics/DatasourceLogic";
import type DatasourceRepository from "~/core/repositories/DatasourceRepository";
import ApiDatasourceRepository from "~/infra/api/ApiDatasourceRepository";

export const datasourceCommand = new Command("datasource").description(
  "Provider commands",
);

datasourceCommand
  .command("list")
  .description("List all datasources")
  .option("-f, --file <path>", "Path to the providers file")
  .action(async (options) => {
    const filePath = options.file ? path.resolve(process.cwd(), options.file) : undefined;
    const providerRepository: ProviderRepository = new FileSystemProviderRepository(filePath);
    const providerLogics = new ProviderLogics(providerRepository);
    const currentProvider = await providerLogics.getCurrentProvider();
    const datasourceRepository: DatasourceRepository = new ApiDatasourceRepository(currentProvider.type, currentProvider.url, currentProvider.credential);
    const datasourceLogics = new DatasourceLogics(datasourceRepository, currentProvider.type);
    const datasources = await datasourceLogics.list();
    datasources.map((datasource) => {
      console.log(datasource.id, datasource.name, `(${datasource.type})`);
    });
  });
