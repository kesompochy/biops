import { describe, expect, it, mock, beforeEach, afterEach } from "bun:test";
import { queryCommand } from "~/commands/QueryCommand";
import path from 'node:path';

describe("query command", () => {
  let mockFetch: any;
  let mockConsole: any;

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
    }
  };

  beforeEach(() => {
    mockFetch = mock((input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const method = init?.method || 'GET';
      const endpoint = `${method} ${url.split('?')[0]}`;  // Remove query params
      
      const response = mockResponses[endpoint] || {};
      
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
  it("should list all queries", async () => {
    const testFilePath = path.resolve(__dirname, "../fixtures/providers.json");

    await queryCommand.parseAsync(["list", "--file", testFilePath], { from: "user" });

    expect(mockFetch.mock.calls[0]).toEqual([
      "https://example.com/api/queries?page_size=250", 
      {
        headers: new Headers({
          "authorization": "Key example",
          "content-type": "application/json",
        }),
        method: "GET",
      }
    ]);

    mockConsole = mock((message: string) => {
      expect(message).toEqual("1");
      expect(message).toEqual("2");
    });
  });
  it("should update a query", async () => {
    const testFilePath = path.resolve(__dirname, "../fixtures/providers.json");

    await queryCommand.parseAsync(["update", "1", "--file", testFilePath, "--data-source", "10", "--apply"], { from: "user" });

    expect(mockFetch.mock.calls[0]).toEqual([
      "https://example.com/api/queries/1", 
      {
        headers: new Headers({
          "authorization": "Key example",
          "content-type": "application/json",
        }),
        method: "GET",
      }
    ]);
    expect(mockFetch.mock.calls[1]).toEqual([
      "https://example.com/api/queries/1", 
      {
        headers: new Headers({
          "authorization": "Key example",
          "content-type": "application/json",
        }),
        method: "POST",
        body: JSON.stringify({
          data_source_id: "10",
        }),
      }
      ]);
  });
});
