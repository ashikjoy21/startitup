<div align="center">

# StartItUp.in

**Every startup opportunity in India. In one place.**

Grants · Credits · Accelerators · Incubators · Government Schemes · Fellowships · Competitions · Investors

[![Live Site](https://img.shields.io/badge/Live-startitup.in-blue?style=flat-square)](https://startitup.in)
[![npm](https://img.shields.io/npm/v/startitup-mcp?style=flat-square&label=MCP+Server)](https://www.npmjs.com/package/startitup-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare_Workers-orange?style=flat-square)](https://developers.cloudflare.com/workers/)

</div>

---

> Building a startup is hard. Finding opportunities shouldn't be.

StartItUp.in is a free, open-source directory of **1,000+ startup opportunities** across India — curated, filtered, and now accessible directly from your AI agent via [MCP](https://modelcontextprotocol.io).

## What's Inside

| Category | Count |
|---|---|
| Grants | 338 |
| Incubators | 194 |
| Startup Credits | 141 |
| Government Schemes | 105 |
| Accelerators | 101 |
| Competitions | 79 |
| Fellowships | 24 |
| Investor Programs | 18 |

Plus a live **investor graph** with funded startups, funding rounds, and sector data for the Indian ecosystem.

---

## AI Agent Support (MCP)

StartItUp ships a production MCP server — connect your AI agent and ask it to find opportunities for you.

```bash
npx startitup-mcp --api-key siu_live_YOUR_KEY
```

**Claude Code** (`~/.claude/settings.json`):
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

**Cursor** (`~/.cursor/mcp.json`) and **Windsurf** (`~/.codeium/windsurf/mcp_config.json`) use the same format.

Get your API key at [startitup.in/profile?tab=api](https://startitup.in/profile?tab=api).

→ Full MCP docs: [`packages/startitup-mcp`](packages/startitup-mcp/README.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, SSR) |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com/) (edge, global) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL + RLS) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| MCP Server | [`startitup-mcp`](https://www.npmjs.com/package/startitup-mcp) on npm |

---

## Self-Hosting

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.0
- A [Supabase](https://supabase.com/) project (free tier works)
- A [Cloudflare](https://cloudflare.com/) account (for deploy)

### 1. Clone & install

```bash
git clone https://github.com/ashikjoy21/startitup.git
cd startitup
bun install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET=choose-a-strong-secret
```

### 3. Run database migrations

Run the SQL files in `supabase/migrations/` in your Supabase SQL editor (in order by filename).

### 4. Start dev server

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Cloudflare Workers

```bash
bun run deploy
```

---

## Project Structure

```
startitup/
├── src/
│   ├── routes/          # File-based pages (TanStack Router)
│   │   ├── api/mcp.ts   # MCP JSON-RPC endpoint
│   │   ├── opportunities/
│   │   ├── investors/
│   │   └── ...
│   ├── lib/
│   │   ├── api/         # Server functions (createServerFn)
│   │   ├── mcp/         # MCP tool implementations
│   │   └── ...
│   └── components/      # Shared UI components
├── packages/
│   └── startitup-mcp/   # npm MCP package
├── supabase/
│   └── migrations/      # SQL schema migrations
└── .env.example
```

---

## Contributing

Contributions are welcome — whether it's adding a missing opportunity, fixing a bug, or improving the UI.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Adding an Opportunity

The fastest way is via the site itself: [startitup.in/submit](https://startitup.in/submit). Submissions go into a review queue.

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

Built for Indian founders. Open-sourced for everyone.

**[startitup.in](https://startitup.in)** · [Submit an opportunity](https://startitup.in/submit) · [Get MCP key](https://startitup.in/profile?tab=api)

</div>
