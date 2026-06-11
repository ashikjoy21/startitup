# MCP CLI Onboarding Design

**Date:** 2026-06-12
**Package:** `startitup-mcp`

## Overview

When a user runs `npx startitup-mcp` without an API key in an interactive terminal, they get a guided onboarding experience: a branded ASCII art banner, step-by-step instructions to get their key, an interactive prompt, key validation, and local storage so they never have to enter it again.

---

## Startup Flow

Key loading priority (first match wins):

1. `--api-key` CLI flag
2. `STARTITUP_API_KEY` environment variable
3. `~/.startitup/config.json` (saved from a previous run)
4. Interactive onboarding prompt (TTY only)

If no key is found and `process.stdout.isTTY` is `false` (running as an MCP server over piped stdio), the existing error message is shown and the process exits — no interactive flow.

---

## Onboarding Screen

Triggers when: no API key found AND `process.stdout.isTTY === true`.

### Banner

ASCII art "STARTITUP" generated once with figlet (locally, during development), hardcoded as a string in source. Colored with `chalk.hex('#4361EE')` (closest hex to the site's oklch primary).

### Layout

```
  [ASCII ART: STARTITUP in blue-indigo]

  Discover Indian startup opportunities — from your AI agent.

  To get started:

    1. Go to  https://startitup.in/profile
    2. Click the  API Access  tab
    3. Copy your API key and paste it below

  API key: _
```

- Banner: `chalk.hex('#4361EE')`
- URL: `chalk.underline.white`
- "API Access": `chalk.bold.white`
- Steps: plain white
- Prompt label: `chalk.hex('#4361EE')`

### Input

Plain text input (not masked) via Node.js built-in `readline`. API keys aren't sensitive in the same way as passwords, and masking makes paste-from-clipboard harder.

### Validation

Call `POST /api/mcp` with the entered key and a `tools/list` JSON-RPC request. A `200 OK` response means the key is valid.

- Valid → save key, show success, show config snippet, exit 0
- Invalid → show red error, re-prompt (max 3 attempts)
- 3 failures → exit 1 with message: `Get your key at https://startitup.in/profile`

### Success Screen

```
  ✓ API key verified and saved to ~/.startitup/config.json

  Add this to your MCP config (Claude, Cursor, etc.):

  {
    "mcpServers": {
      "startitup": {
        "command": "npx",
        "args": ["-y", "startitup-mcp"]
      }
    }
  }

  No --api-key flag needed — it's saved locally.
```

Note: the config snippet no longer needs `--api-key` or `--endpoint` since the key is saved and the endpoint defaults to `https://startitup.in/api/mcp`.

---

## Local Config Storage

**Path:** `~/.startitup/config.json`
**Format:**
```json
{ "apiKey": "siu_live_..." }
```

- Read with `os.homedir()` for cross-platform compatibility
- Directory `~/.startitup/` created if it doesn't exist
- Written synchronously after validation succeeds

---

## File Structure

```
packages/startitup-mcp/src/
  index.ts       — entry point; orchestrates startup
  config.ts      — read/write ~/.startitup/config.json
  onboarding.ts  — TTY detection, banner, prompt, validation loop
```

New dependency: `chalk` (^5.x, ESM-native, ~5kb)

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| No API key, non-TTY | Existing error + exit 1 |
| Invalid key (< 3 tries) | Red error, re-prompt |
| Invalid key (3rd fail) | Error + link to profile + exit 1 |
| Network error during validation | "Could not reach startitup.in — check connection" + exit 1 |
| Config file unwritable | Warning shown, key not saved, MCP server starts anyway |
