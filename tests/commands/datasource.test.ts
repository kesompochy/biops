import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import path from 'node:path';
import { datasourceCommand } from "~/commands/DatasourceCommand";


describe("datasource command", () => {
  let mockConsole: any;
  let mockFetch: any;

  const mockResponses = {
    'GET /api/queries': {
      result: [
        { id: 1, name: "query1", sql: "SELECT * from hoge;" },
        { id: 2, name: "query2", sql: "SELECT * from fuga;" },
      ]
    },
    'GET /api/queries/1': {
      result: { id: 1, name: "query1", sql: "SELECT * from hoge;", description: "", data_source_id: 1, user: { id: 1 } }
    },
    'POST /api/queries/1': {
      result: { id: 1, name: "query1", sql: "SELECT * from hoge;" }
    },
    'GET /api/data_sources': [
      { id: 1, name: "datasource1" },
      { id: 2, name: "datasource2" },
    ]
  };

  beforeEach(() => {
    mockFetch = mock((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method || 'GET';
      const endpoint = `${method} ${url.split('?')[0]}`;
      
      const response = mockResponses[endpoint];
      
      return Promise.resolve(new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      }));
    });
    global.fetch = mockFetch;

    mockConsole = mock((message: string) => {});
    global.console.log = mockConsole;
  });
  afterEach(() => {
    mockFetch.mockRestore();
    mockConsole.mockRestore();
  });

  it("should list all datasources", async () => {
    const testFilePath = path.resolve(__dirname, "../fixtures/providers.json");

    await datasourceCommand.parseAsync(["list", "--file", testFilePath], { from: "user" });

    expect(mockFetch.mock.calls[0]).toEqual([
      "https://example.com/api/data_sources", 
      {
        headers: new Headers({
          "authorization": "Key example",
          "content-type": "application/json",
        }),
        method: "GET",
      }
    ]);
  });
});
