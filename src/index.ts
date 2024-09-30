import { Command } from "commander";
import { providerCommand } from "./commands/ProviderCommand";
import { queryCommand } from "./commands/QueryCommand";

const program = new Command();
program
  .name("biops")
  .version("0.0.1")
  .description("A CLI tool for BI operations");

program.addCommand(queryCommand);
program.addCommand(providerCommand);

program.parse(process.argv);
