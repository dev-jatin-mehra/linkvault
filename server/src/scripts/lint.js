import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const srcRoot = join(process.cwd(), "src");

const collectJsFiles = (dirPath) => {
  const files = [];

  for (const entry of readdirSync(dirPath)) {
    const fullPath = join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectJsFiles(fullPath));
      continue;
    }

    if (fullPath.endsWith(".js")) {
      files.push(fullPath);
    }
  }

  return files;
};

const files = collectJsFiles(srcRoot);

if (!files.length) {
  console.log("No JavaScript files found in src");
  process.exit(0);
}

let hasFailures = false;

for (const filePath of files) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    hasFailures = true;
  }
}

if (hasFailures) {
  process.exit(1);
}

console.log(`Server lint passed: checked ${files.length} file(s)`);
