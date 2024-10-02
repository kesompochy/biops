#!/usr/bin/env bun

import { Command } from "commander";
import { providerCommand } from "./commands/ProviderCommand";
import { queryCommand } from "./commands/QueryCommand";
import { datasourceCommand } from "./commands/DatasourceCommand";

const program = new Command();
program
  .name("biops")
  .version("0.0.1")
  .description("A CLI tool for BI operations");

program.addCommand(queryCommand);
program.addCommand(providerCommand);
program.addCommand(datasourceCommand);

program.parse(process.argv);
