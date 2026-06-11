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
            "  {",
            '    "mcpServers": {',
            '      "startitup": {',
            '        "command": "npx",',
            '        "args": ["-y", "startitup-mcp"]',
            "      }",
            "    }",
            "  }",
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
