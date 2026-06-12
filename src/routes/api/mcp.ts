import { createFileRoute } from "@tanstack/react-router";
import { validateApiKey } from "@/lib/mcp/auth";
import {
  toolListCategories,
  toolListFilters,
  toolSearchOpportunities,
  toolGetOpportunity,
} from "@/lib/mcp/tools";

// ── JSON-RPC types ────────────────────────────────────────────────────────────

type RpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
};

type RpcResponse = {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string };
};

function ok(id: string | number | null, result: unknown): RpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(
  id: string | number | null,
  code: number,
  message: string,
): RpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

// ── Tool definitions (returned to clients) ───────────────────────────────────

const TOOLS = [
  {
    name: "list_categories",
    description:
      "List all opportunity categories available on StartItUp with their counts. Call this first to understand what types of opportunities exist.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "list_filters",
    description:
      "List all valid filter values (industries, stages, locations) for opportunity search. Optionally scoped to a category.",
    inputSchema: {
      type: "object",
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
      "Search startup opportunities on StartItUp. Returns summary fields. Use get_opportunity to fetch full details.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Full-text search query" },
        category: {
          type: "string",
          description: "Filter by category (e.g. Grants, Accelerators)",
        },
        industry: {
          type: "string",
          description: "Filter by industry (e.g. SaaS, FinTech)",
        },
        stage: {
          type: "string",
          description: "Filter by startup stage (e.g. Seed, Pre-Seed)",
        },
        location: {
          type: "string",
          description: "Filter by location (e.g. India, Global)",
        },
        limit: {
          type: "number",
          description: "Results per page (max 20, default 10)",
        },
        offset: {
          type: "number",
          description: "Pagination offset (default 0)",
        },
      },
    },
  },
  {
    name: "get_opportunity",
    description:
      "Get full details of a specific opportunity including description, eligibility criteria, and source URL.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Opportunity ID from search results" },
      },
      required: ["id"],
    },
  },
];

// ── Handler ───────────────────────────────────────────────────────────────────

async function handleRequest(req: RpcRequest) {
  const id = req.id ?? null;

  if (req.method === "initialize") {
    return ok(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "startitup", version: "1.0.0" },
    });
  }

  if (req.method === "notifications/initialized") {
    return null; // notification, no response
  }

  if (req.method === "tools/list") {
    return ok(id, { tools: TOOLS });
  }

  if (req.method === "tools/call") {
    const p = req.params as { name: string; arguments?: Record<string, unknown> };
    const args = p.arguments ?? {};

    let result;
    switch (p.name) {
      case "list_categories":
        result = await toolListCategories();
        break;
      case "list_filters":
        result = await toolListFilters(args.category as string | undefined);
        break;
      case "search_opportunities":
        result = await toolSearchOpportunities({
          q: args.q as string | undefined,
          category: args.category as string | undefined,
          industry: args.industry as string | undefined,
          stage: args.stage as string | undefined,
          location: args.location as string | undefined,
          limit: args.limit as number | undefined,
          offset: args.offset as number | undefined,
        });
        break;
      case "get_opportunity":
        result = await toolGetOpportunity(args.id as string);
        break;
      default:
        return rpcError(id, -32601, `Unknown tool: ${p.name}`);
    }

    return ok(id, result);
  }

  return rpcError(id, -32601, `Method not found: ${req.method}`);
}

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Auth
        const authHeader = request.headers.get("authorization") ?? "";
        const raw = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7).trim()
          : null;

        const validated = await validateApiKey(raw);
        if (!validated) {
          return Response.json(
            {
              jsonrpc: "2.0",
              id: null,
              error: { code: -32001, message: "Unauthorized: invalid or missing API key" },
            },
            { status: 401 },
          );
        }

        let body: RpcRequest | RpcRequest[];
        try {
          body = await request.json();
        } catch {
          return Response.json(
            rpcError(null, -32700, "Parse error"),
            { status: 400 },
          );
        }

        // Support batch requests
        if (Array.isArray(body)) {
          const results = await Promise.all(
            body.map((req) => handleRequest(req)),
          );
          const responses = results.filter(Boolean);
          return Response.json(responses);
        }

        const response = await handleRequest(body);
        if (response === null) {
          return new Response(null, { status: 204 });
        }
        return Response.json(response);
      },

      GET: async ({ request }) => {
        // SSE endpoint for server-initiated messages (keep-alive)
        const authHeader = request.headers.get("authorization") ?? "";
        const raw = authHeader.startsWith("Bearer ")
          ? authHeader.slice(7).trim()
          : null;

        const validated = await validateApiKey(raw);
        if (!validated) {
          return Response.json(
            { error: "Unauthorized" },
            { status: 401 },
          );
        }

        // Return endpoint info for MCP clients that probe with GET
        return Response.json({
          server: "startitup-mcp",
          version: "1.0.0",
          transport: "streamable-http",
          endpoint: new URL(request.url).pathname,
        });
      },
    },
  },
});
