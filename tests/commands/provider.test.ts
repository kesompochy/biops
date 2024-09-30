import { describe, expect, it, mock, beforeEach, afterEach, afterAll, beforeAll } from "bun:test";
import path from 'node:path';
import { existsSync } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import inquirer from 'inquirer';

import { providerCommand } from "~/commands/ProviderCommand";



describe("provider command", () => {
  const testFilePath = path.resolve(__dirname, "../fixtures/providers.json");
  let consoleLogMock: any;

  const testDir = "test_tmp_dir";
  beforeAll(async () => {
    const exists = existsSync(path.resolve(__dirname, testDir))
    if (exists) {
      await rm(path.resolve(__dirname, testDir), { recursive: true });
    }
    await mkdir(path.resolve(__dirname, testDir));
  })
  afterAll(async () => {
    await rm(path.resolve(__dirname, testDir), { recursive: true });
  });

  beforeEach(() => {
    consoleLogMock = mock(console, "log");
  });
  afterEach(() => {
    consoleLogMock.mockRestore();
  });

  it("should list all providers", async () => {
    const mockProviders = [
      { name: "provider1", current: true, type: "redash" },
      { name: "provider2", current: false, type: "metabase" },
    ];

    console.log = consoleLogMock;

    await providerCommand.parseAsync(["list", "--file", testFilePath], { from: "user" });
    expect(consoleLogMock).toHaveBeenCalledWith("All providers:");
    expect(consoleLogMock).toHaveBeenCalledWith(`* ${mockProviders[0].name} type: ${mockProviders[0].type}`);
    expect(consoleLogMock).toHaveBeenCalledWith(`  ${mockProviders[1].name} type: ${mockProviders[1].type}`);
  });

  it("should add a provider", async () => {
    console.log = consoleLogMock;
    inquirer.prompt = mock(async () => {
      return {
        name: "provider1",
        type: "redash",
        url: "redash.example.com",
        credential: "api-key",
      }
    });

    const filePath = path.resolve(__dirname, testDir, "add-test-provider.json");
    await providerCommand.parseAsync(["add","--file", filePath], { from: "user" });
    
    const data = Bun.file(filePath);
    const text = await data.text();
    const providers = JSON.parse(text);
    expect(providers).toEqual([
      { name: "provider1", type: "redash", url: "redash.example.com", credential: "api-key", current: true },
    ]);
  });

  it("should delete a provider", async () => {
    console.log = consoleLogMock;
    const filePath = path.resolve(__dirname, testDir, "delete-test-provider.json");
    const originalProviders = [
      { name: "provider1", type: "redash", url: "redash.example.com", credential: "api-key", current: true },
    ]
    await Bun.write(filePath, JSON.stringify(originalProviders));
    await providerCommand.parseAsync(["delete", "provider1", "--file", filePath], { from: "user" });
    expect(consoleLogMock).toHaveBeenCalledWith("Deleted provider provider1");
    const data = Bun.file(filePath);
    const text = await data.text();
    const providers = JSON.parse(text);
    expect(providers).toEqual([]);
  });

  it("should use a provider", async () => {
    console.log = consoleLogMock;
    const filePath = path.resolve(__dirname, testDir, "use-test-provider.json");
    const originalProviders = [
      { name: "provider1", type: "redash", url: "redash.example.com", credential: "api-key", current: false },
      { name: "provider2", type: "metabase", url: "metabase.example.com", credential: "api-key", current: true },
    ]
    await Bun.write(filePath, JSON.stringify(originalProviders));
    await providerCommand.parseAsync(["use", "provider1", "--file", filePath], { from: "user" });
    expect(consoleLogMock).toHaveBeenCalledWith("Using provider provider1");
    const data = Bun.file(filePath);
    const text = await data.text();
    const providers = JSON.parse(text);
    expect(providers).toEqual([
      { name: "provider1", type: "redash", url: "redash.example.com", credential: "api-key", current: true },
      { name: "provider2", type: "metabase", url: "metabase.example.com", credential: "api-key", current: false },
    ]);
  });
});
