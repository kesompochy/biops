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
  queryReplace?: string[];
  query?: string;
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

    const queryRepository: QueryRepository = new ApiQueryRepository(currentProvider.type, currentProvider.url, currentProvider.credential);
    const queryLogic = new QueryLogic(queryRepository, currentProvider.type);
    const queries: Query[] = await queryLogic.list(options);
    queries.map((query) => console.log(query.id));
  });

queryCommand
  .command("update <id>")
  .option("-f, --file <path>", "Path to the providers file")
  .option("--apply", "Apply the update, otherwise just show the diff")
  .option("--data-source <datasource>", "Datasource to update")
  .option("--query-replace <items...>", "Original string and new string in Query to update")
  .option("--query <query>", "Query to update")
  .description("Update a query")
  .action(async (id, options) => {
    console.log(`Updating a query ${id}...`);
    const providerRepository: ProviderRepository = new FileSystemProviderRepository(options.file);
    const providerLogic = new ProviderLogic(providerRepository);
    const currentProvider = await providerLogic.getCurrentProvider();

    const queryRepository: QueryRepository = new ApiQueryRepository(currentProvider.type, currentProvider.url, currentProvider.credential);
    const queryLogic = new QueryLogic(queryRepository, currentProvider.type);
    const [originalQuery, newQuery] = await queryLogic.updateQuery(id, options)

    if (!options.apply) {
      console.log("You are in dry-run mode. To apply the update, use --apply option.");
      console.log("Diff:")
      console.log(generateDiffString(originalQuery, newQuery).join('\n'));
      return;
    }
    console.log(`Updated query ${id}!`);
    console.log("Diff:")
    console.log(generateDiffString(originalQuery, newQuery).join('\n'));
    console.log("Recovery command:")
    console.log(generateRecoveryCommand(originalQuery, newQuery));
  });

  const generateRecoveryCommand = (originalQuery: Query, newQuery: Query): string => {
    const command = `biops query update ${originalQuery.id}`;
    const options: string[] = [];
    
    if (originalQuery.sql !== newQuery.sql) {
      const escapedSql = originalQuery.sql
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\$/g, '\\$');
      options.push(`--query "${escapedSql}"`);
    }
    if (originalQuery.dataSource !== newQuery.dataSource) {
      options.push(`--data-source ${originalQuery.dataSource}`);
    }

    if (options.length === 0) {
      return "It seems that there is no change in the query.";
    }
    
    return `${command} ${options.join(" ")}`;
  };

  const generateDiffString = (originalQuery: Query, newQuery: Query): string[] => {
    const diffs: string[] = [];
  
    for (const key of Object.keys(originalQuery) as Array<keyof Query>) {
      if (originalQuery[key] !== newQuery[key]) {
        diffs.push(`--- ${key}`);
        diffs.push(`+++ ${key}`);
        if (typeof originalQuery[key] === 'string' && typeof newQuery[key] === 'string') {
          const originalLines = originalQuery[key].split('\n');
          const newLines = newQuery[key].split('\n');
          for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
            if (i >= originalLines.length) {
              diffs.push(`+ ${newLines[i]}`);
            } else if (i >= newLines.length) {
              diffs.push(`- ${originalLines[i]}`);
            } else if (originalLines[i] !== newLines[i]) {
              diffs.push(`- ${originalLines[i]}`);
              diffs.push(`+ ${newLines[i]}`);
            } else {
              diffs.push(`  ${originalLines[i]}`);
            }
          }
        } else {
          diffs.push(`- ${JSON.stringify(originalQuery[key])}`);
          diffs.push(`+ ${JSON.stringify(newQuery[key])}`);
        }
        diffs.push('');
      }
    }
  
    return diffs;
  };
  