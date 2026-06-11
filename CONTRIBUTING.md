# Contributing to StartItUp.in

Thanks for helping make startup opportunities more accessible for Indian founders.

## Ways to Contribute

### 1. Submit a Missing Opportunity
The easiest way — no code needed. Go to [startitup.in/submit](https://startitup.in/submit) and fill in the details. It'll be reviewed and added to the directory.

### 2. Report an Outdated or Incorrect Listing
Use the "Report" option on any opportunity page, or [open a GitHub issue](https://github.com/ashikjoy21/startitup/issues) with the opportunity name and what's wrong.

### 3. Code Contributions

#### Setup

```bash
git clone https://github.com/ashikjoy21/startitup.git
cd startitup
bun install
cp .env.example .env   # fill in your Supabase credentials
bun dev
```

#### Making Changes

1. Fork the repo and create a branch: `git checkout -b fix/your-change`
2. Make your changes
3. Run `npx tsc --noEmit` to check types
4. Commit with a clear message
5. Open a pull request

#### What We Welcome

- Bug fixes
- UI/UX improvements
- New filter options or search improvements
- MCP tool enhancements (`src/lib/mcp/`)
- Performance improvements
- Accessibility fixes

#### What to Avoid

- Adding hardcoded opportunity data directly to the codebase (use the submit form instead)
- Large refactors without prior discussion — open an issue first
- Breaking changes to the MCP API without a version bump

## Code Style

- TypeScript strict mode — no `any` unless unavoidable
- No comments explaining *what* the code does — only *why* when non-obvious
- Follow the existing file/component structure

## Questions?

Open a [GitHub issue](https://github.com/ashikjoy21/startitup/issues) or reach out via [startitup.in](https://startitup.in).
