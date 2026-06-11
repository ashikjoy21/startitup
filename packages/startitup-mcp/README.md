# startitup-mcp

MCP server for [StartItUp.in](https://startitup.in) — search Indian startup opportunities from any AI agent.

Gives AI assistants (Claude, Cursor, Windsurf, and more) access to 1000+ startup grants, credits, accelerators, incubators, government schemes, fellowships, and competitions across India.

## Get an API Key

1. Sign in at [startitup.in](https://startitup.in)
2. Go to **Profile → API Access**
3. Click **Generate API key** — copy it immediately, it's shown only once

## Setup

### Claude Code

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "startitup": {
      "command": "npx",
      "args": ["startitup-mcp", "--api-key", "siu_live_YOUR_KEY"]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "startitup": {
      "command": "npx",
      "args": ["startitup-mcp", "--api-key", "siu_live_YOUR_KEY"]
    }
  }
}
```

### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "startitup": {
      "command": "npx",
      "args": ["startitup-mcp", "--api-key", "siu_live_YOUR_KEY"]
    }
  }
}
```

### Environment variable (all clients)

Instead of passing the key as an argument, set it as an env var:

```bash
export STARTITUP_API_KEY=siu_live_YOUR_KEY
```

Then use `"args": ["startitup-mcp"]` without the `--api-key` flag.

---

## Available Tools

### `list_categories`
List all opportunity categories with counts.

```
No input required
```

Returns: `Grants (338)`, `Incubators (194)`, `Startup Credits (141)`, `Government Schemes (105)`, `Accelerators (101)`, `Competitions (79)`, `Fellowships (24)`, `Investor Programs (18)`

---

### `list_filters`
Get valid filter values for search. Optionally scope to a category.

```
category?: string   — e.g. "Grants"
```

Returns: all valid `industries`, `stages`, and `locations` to use in `search_opportunities`.

---

### `search_opportunities`
Search and filter opportunities.

```
q?:        string   — full-text search
category?: string   — e.g. "Accelerators"
industry?: string   — e.g. "SaaS", "FinTech"
stage?:    string   — e.g. "Pre-Seed", "Seed"
location?: string   — e.g. "India", "Global", "Bengaluru"
limit?:    number   — max 20 (default 10)
offset?:   number   — for pagination
```

---

### `get_opportunity`
Get full details of a specific opportunity.

```
id: string   — opportunity ID from search results
```

Returns: name, org, description, eligibility, amount, deadline, source URL.

---

## Example Usage

Once connected, ask your AI agent:

> *"Find me government grants for a women-led SaaS startup at pre-seed stage in Bengaluru"*

> *"What accelerators are open for fintech startups?"*

> *"Show me all fellowships available for student founders"*

> *"What are the eligibility requirements for the Startup India Seed Fund?"*

---

## Direct HTTP Access

The MCP server is also accessible as a JSON-RPC endpoint for custom integrations:

```bash
curl -X POST https://startitup.in/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer siu_live_YOUR_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_categories","arguments":{}}}'
```

---

## License

MIT © [StartItUp.in](https://startitup.in)
