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
