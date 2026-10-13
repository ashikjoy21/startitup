import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const FILES = [
  "src/build/build-sitemap.ts",
  "src/lib/mcp/tools.ts",
  "src/lib/api/auth.functions.ts",
  "src/lib/api/opportunities.functions.ts",
];

function readChains(src: string): string[] {
  return src
    .split('.from("opportunities")')
    .slice(1)
    .map((chunk) => chunk.split(/;|\bsupabase\s*\n?\s*\./)[0]);
}

describe("founder scope guard", () => {
  for (const file of FILES) {
    it(`${file}: every opportunities read is scoped to founders`, () => {
      const chains = readChains(readFileSync(file, "utf8"));
      expect(chains.length).toBeGreaterThan(0);
      for (const chain of chains) {
        if (/\.(upsert|update|insert|delete)\(/.test(chain)) continue;
        expect(chain, `unscoped query in ${file}:\n${chain}`).toContain(
          '.contains("audience", ["founder"])',
        );
      }
    });
  }
});
