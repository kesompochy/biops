import { Command } from "commander";
import type Query from "~/core/entities/Query";
import type QueryRepository from "~/core/repositories/QueryRepository";
import FileSystemProviderRepository from "~/infra/filesystem/FileSystemProviderRepository";
import ApiQueryRepository from "~/infra/api/ApiQueryRepository";
import ProviderLogic from "~/logics/ProviderLogic";
import type ProviderRepository from "~/core/repositories/ProviderRepository";
import QueryLogic from "~/logics/QueryLogic";

export const queryCommand = new Command("query").description("Query commands");

export interface QueryListOptions {
  all?: boolean;
  datasource?: string;
  name?: string;
  nameRegexp?: string;
  queryRegexp?: string;
  delay?: number;
}

export interface QueryUpdateOptions {
  apply?: boolean;
  dataSource?: string;
  queryReplace?: [string, string];
}

queryCommand
  .command("list")
  .option("-f, --file <path>", "Path to the providers file")
  .option("--all", "List all queries")
  .option("--delay <delay>", "Delay between requests")
  .option("--datasource <datasource>", "Datasource to list")
  .option("--name <name>", "Name of the query to list")
  .option("--name-regexp <name>", "Name of the query to list")
  .option("--query-regexp <regexp>", "Query to list")
  .description("List all queries")
  .action(async (options) => {
    const providerRepository: ProviderRepository= new FileSystemProviderRepository(options.file);
    const providerLogic = new ProviderLogic(providerRepository);
    const currentProvider = await providerLogic.getCurrentProvider();

    const queryRepository: QueryRepository = new ApiQueryRepository(currentProvider.type, currentProvider.url, currentProvider.credential, options.all);
    const queryLogic = new QueryLogic(queryRepository, currentProvider.type);
    const queries: Query[] = await queryLogic.list(options);
    queries.map((query) => console.log(query.id));
  });

queryCommand
  .command("update <id>")
  .option("-f, --file <path>", "Path to the providers file")
  .option("--apply", "Apply the update, otherwise just show the diff")
  .option("--data-source <datasource>", "Datasource to update")
  .option("--query-replace <items...>", "Query to update")
  .description("Update a query")
  .action(async (id, options) => {
    console.log(`Update a query ${id}`);
    const providerRepository: ProviderRepository = new FileSystemProviderRepository(options.file);
    const providerLogic = new ProviderLogic(providerRepository);
    const currentProvider = await providerLogic.getCurrentProvider();

    const queryRepository: QueryRepository = new ApiQueryRepository(currentProvider.type, currentProvider.url, currentProvider.credential);
    const query = await queryRepository.updateQuery[currentProvider.type](id, options);
  });
