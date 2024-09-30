import { Command } from "commander";
import path from "node:path";
import type Provider from "~/core/entities/Provider";
import type ProviderRepository from "~/core/repositories/ProviderRepository";
import FileSystemProviderRepository from "~/infra/filesystem/FileSystemProviderRepository";
import inquirer from "inquirer";
import { ProviderTypes } from "~/core/entities/Provider";
import ProviderLogics from "~/logics/ProviderLogic";

export const providerCommand = new Command("provider").description(
  "Provider commands",
);

providerCommand
  .command("list")
  .description("List all providers")
  .option("-f, --file <path>", "Path to the providers file")
  .action(async (options) => {
    const filePath = options.file ? path.resolve(process.cwd(), options.file) : undefined;
    const providerRepository: ProviderRepository = new FileSystemProviderRepository(filePath);
    const providerLogics = new ProviderLogics(providerRepository);
    const providers: Provider[] = await providerLogics.getAll();
    console.log("All providers:");
    const txt = providers.map((provider: Provider) => {
      return `${provider.current ? "*" : " "} ${provider.name} type: ${provider.type}`;
    })
    txt.map((t) => console.log(t));
  });

providerCommand
  .command("add")
  .description("Add a provider")
  .option("-f, --file <path>", "Path to the providers file")
  .option("--name <name>", "Name of the provider")
  .option("--type <type>", "Type of the provider")
  .option("--url <url>", "URL of the provider")
  .option("--credential <credential>", "Credential for the provider")
  .action(async (options) => {
    const filePath = options.file ? path.resolve(process.cwd(), options.file) : undefined;
    const providerRepository: ProviderRepository = new FileSystemProviderRepository(filePath);
    const providerLogics = new ProviderLogics(providerRepository);

    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "name",
        message: "Name of the provider",
        default: "provider",
      },
      {
        type: "list",
        name: "type",
        message: "Type of the provider",
        choices: [ProviderTypes.REDASH, ProviderTypes.METABASE],
      },
      {
        type: "input",
        name: "url",
        message: "URL of the provider",
      },
      {
        type: "password",
        name: "credential",
        message: "Credential for the provider",
      }
    ])

    const provider: Provider = {
      name: answers.name,
      type: answers.type,
      url: answers.url,
      credential: answers.credential,
      current: true,
    };
    await providerLogics.addProvider(provider);
    console.log(`Added provider ${answers.name} of type ${answers.type}`);
})
    


providerCommand
  .command("delete <name>")
  .description("Delete a provider")
  .option("-f, --file <path>", "Path to the providers file")
  .action(async (name, options) => {
    const filePath = options.file ? path.resolve(process.cwd(), options.file) : undefined;
    const providerRepository: ProviderRepository = new FileSystemProviderRepository(filePath);
    const providerLogics = new ProviderLogics(providerRepository);
    await providerLogics.deleteProvider(name);
    console.log(`Deleted provider ${name}`);
  });

providerCommand
  .command("use <name>")
  .description("Use a provider")
  .option("-f, --file <path>", "Path to the providers file")
  .action(async (name, options) => {
    const filePath = options.file ? path.resolve(process.cwd(), options.file) : undefined;
    const providerRepository: ProviderRepository = new FileSystemProviderRepository(filePath);
    const providerLogics = new ProviderLogics(providerRepository);
    await providerLogics.useProvider(name);
    console.log(`Using provider ${name}`);
  });
