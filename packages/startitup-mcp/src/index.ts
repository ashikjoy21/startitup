#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const DEFAULT_ENDPOINT = "https://startitup.in/api/mcp";

function parseArgs() {
  const args = process.argv.slice(2);
  let apiKey = process.env.STARTITUP_API_KEY ?? "";
  let endpoint = process.env.STARTITUP_MCP_ENDPOINT ?? DEFAULT_ENDPOINT;

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === "--api-key" || args[i] === "-k") && args[i + 1]) {
      apiKey = args[++i];
    } else if (args[i].startsWith("--api-key=")) {
      apiKey = args[i].slice("--api-key=".length);
    } else if (args[i] === "--endpoint" && args[i + 1]) {
      endpoint = args[++i];
    }
  }

  return { apiKey, endpoint };
}

const TOOLS = [
  {
    name: "list_categories",
    description:
      "List all opportunity categories on StartItUp.in with counts. Call this first to understand what types of opportunities exist.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "list_filters",
    description:
      "List valid filter values (industries, stages, locations). Optionally scope to a category.",
    inputSchema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          description: "Scope filters to a specific category (optional)",
        },
      },
    },
  },
  {
    name: "search_opportunities",
    description:
      "Search startup opportunities on StartItUp.in. Returns summary fields. Use get_opportunity for full details.",
    inputSchema: {
      type: "object" as const,
      properties: {
        q: { type: "string", description: "Full-text search query" },
        category: { type: "string", description: "Filter by category" },
        industry: { type: "string", description: "Filter by industry" },
        stage: { type: "string", description: "Filter by startup stage" },
        location: { type: "string", description: "Filter by location" },
        limit: { type: "number", description: "Results per page (max 20)" },
        offset: { type: "number", description: "Pagination offset" },
      },
    },
  },
  {
    name: "get_opportunity",
    description:
      "Get full details of an opportunity including description, eligibility, and source URL.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "Opportunity ID from search results" },
      },
      required: ["id"],
    },
  },
];

async function callRemote(
  endpoint: string,
  apiKey: string,
  method: string,
  params?: unknown,
): Promise<unknown> {
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method,
    params,
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`Remote MCP error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as {
    result?: unknown;
    error?: { code: number; message: string };
  };

  if (json.error) {
    throw new Error(`MCP error ${json.error.code}: ${json.error.message}`);
  }

  return json.result;
}

async function main() {
  const { apiKey, endpoint } = parseArgs();

  if (!apiKey) {
    console.error(
      "Error: API key required.\n" +
        "  Set STARTITUP_API_KEY env var, or pass --api-key siu_live_xxx\n" +
        "  Get your key at https://startitup.in/profile",
    );
    process.exit(1);
  }

  const server = new Server(
    { name: "startitup", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    const result = await callRemote(endpoint, apiKey, "tools/call", {
      name,
      arguments: args,
    });

    return result as { content: Array<{ type: string; text: string }> };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
