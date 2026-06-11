# MCP CLI Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a guided interactive onboarding flow to `startitup-mcp` so users who run `npx startitup-mcp` without an API key see a branded banner, get step-by-step instructions, are prompted for their key, have it validated, and have it saved to `~/.startitup/config.json`.

**Architecture:** Three files: `config.ts` handles reading/writing `~/.startitup/config.json`, `onboarding.ts` owns the banner + interactive prompt + validation loop, and `index.ts` is updated to load the key from config and trigger onboarding when no key is found in a TTY.

**Tech Stack:** Node.js built-ins (`readline`, `fs`, `os`, `path`), `chalk` ^5.x (ESM, color output)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `packages/startitup-mcp/src/config.ts` | Create | Read/write `~/.startitup/config.json` |
| `packages/startitup-mcp/src/onboarding.ts` | Create | Banner, prompt loop, key validation |
| `packages/startitup-mcp/src/index.ts` | Modify | Load key from config, trigger onboarding |
| `packages/startitup-mcp/package.json` | Modify | Add `chalk` dependency |

---

## Task 1: Add chalk dependency

**Files:**
- Modify: `packages/startitup-mcp/package.json`

- [ ] **Step 1: Install chalk**

```bash
cd packages/startitup-mcp && npm install chalk
```

Expected: `chalk` appears in `package.json` dependencies, version `^5.x`.

- [ ] **Step 2: Verify ESM compatibility**

```bash
node -e "import('chalk').then(m => console.log(m.default.green('ok')))"
```

Expected output: `ok` (in green).

- [ ] **Step 3: Commit**

```bash
git add packages/startitup-mcp/package.json packages/startitup-mcp/package-lock.json
git commit -m "feat(mcp): add chalk for terminal color"
```

---

## Task 2: Create config.ts

**Files:**
- Create: `packages/startitup-mcp/src/config.ts`

- [ ] **Step 1: Create the file**

```typescript
import { homedir } from "os";
import { join } from "path";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";

const CONFIG_DIR = join(homedir(), ".startitup");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

interface Config {
  apiKey?: string;
}

export function readSavedApiKey(): string {
  try {
    if (!existsSync(CONFIG_FILE)) return "";
    const raw = readFileSync(CONFIG_FILE, "utf8");
    const cfg = JSON.parse(raw) as Config;
    return cfg.apiKey ?? "";
  } catch {
    return "";
  }
}

export function saveApiKey(apiKey: string): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  const existing: Config = (() => {
    try {
      return existsSync(CONFIG_FILE)
        ? (JSON.parse(readFileSync(CONFIG_FILE, "utf8")) as Config)
        : {};
    } catch {
      return {};
    }
  })();
  writeFileSync(CONFIG_FILE, JSON.stringify({ ...existing, apiKey }, null, 2));
}
```

- [ ] **Step 2: Smoke-test manually**

```bash
cd packages/startitup-mcp
npx tsc --noEmit
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add packages/startitup-mcp/src/config.ts
git commit -m "feat(mcp): add local config read/write for API key"
```

---

## Task 3: Create onboarding.ts

**Files:**
- Create: `packages/startitup-mcp/src/onboarding.ts`

The ASCII art below was generated with `npx figlet -f "ANSI Shadow" "STARTITUP"` and hardcoded so figlet is not a runtime dependency.

- [ ] **Step 1: Create the file**

```typescript
import { createInterface } from "readline";
import chalk from "chalk";
import { saveApiKey } from "./config.js";

const BRAND = chalk.hex("#4361EE");

const BANNER = `
███████╗████████╗ █████╗ ██████╗ ████████╗██╗████████╗██╗   ██╗██████╗ 
██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██║╚══██╔══╝██║   ██║██╔══██╗
███████╗   ██║   ███████║██████╔╝   ██║   ██║   ██║   ██║   ██║██████╔╝
╚════██║   ██║   ██╔══██║██╔══██╗   ██║   ██║   ██║   ██║   ██║██╔═══╝ 
███████║   ██║   ██║  ██║██║  ██║   ██║   ██║   ██║   ╚██████╔╝██║     
╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝   ╚═╝    ╚═════╝ ╚═╝    
`;

function askQuestion(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function validateKey(key: string, endpoint: string): Promise<boolean> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function runOnboarding(endpoint: string): Promise<string> {
  process.stdout.write(BRAND(BANNER) + "\n");
  process.stdout.write(
    BRAND("  Discover Indian startup opportunities — from your AI agent.\n\n")
  );
  process.stdout.write("  To get started:\n\n");
  process.stdout.write(
    `    1. Go to  ${chalk.underline.white("https://startitup.in/profile")}\n`
  );
  process.stdout.write(
    `    2. Click the  ${chalk.bold.white("API Access")}  tab\n`
  );
  process.stdout.write("    3. Copy your API key and paste it below\n\n");

  for (let attempt = 1; attempt <= 3; attempt++) {
    const key = await askQuestion(BRAND("  API key: "));

    if (!key) {
      process.stdout.write(chalk.red("  Key cannot be empty.\n\n"));
      continue;
    }

    process.stdout.write("  Verifying...");

    const valid = await validateKey(key, endpoint);

    if (valid) {
      process.stdout.write(" " + chalk.green("✓") + "\n");

      try {
        saveApiKey(key);
        process.stdout.write(
          chalk.green("\n  ✓ API key saved to ~/.startitup/config.json\n\n")
        );
      } catch {
        process.stdout.write(
          chalk.yellow(
            "\n  ⚠ Could not save key — pass --api-key next time\n\n"
          )
        );
      }

      process.stdout.write(
        "  Add this to your MCP config (Claude, Cursor, etc.):\n\n"
      );
      process.stdout.write(
        chalk.dim(
          [
            '  {',
            '    "mcpServers": {',
            '      "startitup": {',
            '        "command": "npx",',
            '        "args": ["-y", "startitup-mcp"]',
            '      }',
            '    }',
            '  }',
          ].join("\n")
        ) + "\n\n"
      );
      process.stdout.write(
        chalk.dim("  No --api-key flag needed — it's saved locally.\n\n")
      );

      return key;
    }

    process.stdout.write(" " + chalk.red("✗") + "\n");

    if (attempt < 3) {
      const remaining = 3 - attempt;
      process.stdout.write(
        chalk.red(
          `  Invalid key. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.\n\n`
        )
      );
    }
  }

  process.stderr.write(chalk.red("\n  Too many failed attempts.\n"));
  process.stderr.write(
    `  Get your key at ${chalk.underline("https://startitup.in/profile")}\n\n`
  );
  process.exit(1);
}
```

- [ ] **Step 2: Type-check**

```bash
cd packages/startitup-mcp && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add packages/startitup-mcp/src/onboarding.ts
git commit -m "feat(mcp): add interactive onboarding with banner and key prompt"
```

---

## Task 4: Update index.ts to use config + onboarding

**Files:**
- Modify: `packages/startitup-mcp/src/index.ts`

- [ ] **Step 1: Replace index.ts**

Replace the entire file with:

```typescript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readSavedApiKey } from "./config.js";
import { runOnboarding } from "./onboarding.js";

const DEFAULT_ENDPOINT = "https://startitup.in/api/mcp";

function parseArgs() {
  const args = process.argv.slice(2);
  let apiKey =
    process.env.STARTITUP_API_KEY ?? readSavedApiKey();
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
  let { apiKey, endpoint } = parseArgs();

  if (!apiKey) {
    if (!process.stdout.isTTY) {
      process.stderr.write(
        "Error: API key required.\n" +
          "  Set STARTITUP_API_KEY env var, or pass --api-key siu_live_xxx\n" +
          "  Get your key at https://startitup.in/profile\n"
      );
      process.exit(1);
    }
    apiKey = await runOnboarding(endpoint);
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
```

- [ ] **Step 2: Type-check the whole package**

```bash
cd packages/startitup-mcp && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Build**

```bash
cd packages/startitup-mcp && npm run build
```

Expected: `dist/` updated with `index.js`, `config.js`, `onboarding.js`.

- [ ] **Step 4: Smoke-test non-TTY path (should error, not prompt)**

```bash
echo "" | node packages/startitup-mcp/dist/index.js
```

Expected output on stderr:
```
Error: API key required.
  Set STARTITUP_API_KEY env var, or pass --api-key siu_live_xxx
  Get your key at https://startitup.in/profile
```

- [ ] **Step 5: Commit**

```bash
git add packages/startitup-mcp/src/index.ts
git commit -m "feat(mcp): wire onboarding into startup, load key from config"
```

---

## Task 5: Bump version and publish

**Files:**
- Modify: `packages/startitup-mcp/package.json`

- [ ] **Step 1: Bump version to 1.1.0**

In `packages/startitup-mcp/package.json`, change:
```json
"version": "1.0.0",
```
to:
```json
"version": "1.1.0",
```

- [ ] **Step 2: Build final dist**

```bash
cd packages/startitup-mcp && npm run build
```

- [ ] **Step 3: Commit and tag**

```bash
git add packages/startitup-mcp/package.json packages/startitup-mcp/package-lock.json
git commit -m "chore(mcp): bump to 1.1.0 — add onboarding flow"
git tag startitup-mcp@1.1.0
```

- [ ] **Step 4: Publish to npm**

```bash
cd packages/startitup-mcp && npm publish
```

Expected: `+ startitup-mcp@1.1.0` in output.

- [ ] **Step 5: Verify with npx**

```bash
npx startitup-mcp@1.1.0
```

Expected: banner appears, API key prompt shown.
