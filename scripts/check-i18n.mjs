#!/usr/bin/env node
/**
 * i18n 键一致性检查：对比 messages/ 下所有语言文件的键集合，
 * 存在差异时打印缺失键并以非零码退出（可挂进 CI）。
 *
 * 用法: pnpm i18n:check
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const messagesDir = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");

function flattenKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value && typeof value === "object" && !Array.isArray(value)
      ? flattenKeys(value, path)
      : [path];
  });
}

const files = readdirSync(messagesDir).filter((f) => f.endsWith(".json"));
const keySets = new Map(
  files.map((f) => [
    f,
    new Set(flattenKeys(JSON.parse(readFileSync(join(messagesDir, f), "utf8")))),
  ])
);

const allKeys = new Set([...keySets.values()].flatMap((s) => [...s]));
let hasError = false;

for (const [file, keys] of keySets) {
  const missing = [...allKeys].filter((k) => !keys.has(k));
  if (missing.length > 0) {
    hasError = true;
    console.error(`\n❌ ${file} 缺失 ${missing.length} 个键:`);
    for (const key of missing.sort()) console.error(`   - ${key}`);
  }
}

if (hasError) {
  process.exit(1);
}
console.log(`✅ i18n 键一致 (${files.join(", ")}，共 ${allKeys.size} 个键)`);
