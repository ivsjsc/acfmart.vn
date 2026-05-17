import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tsconfigPath = path.join(root, "tsconfig.json");
const viteConfigPath = path.join(root, "vite.config.ts");

function fail(message) {
  console.error(`Alias sync check failed: ${message}`);
  process.exit(1);
}

function readRequired(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${path.relative(root, filePath)}`);
  }

  return fs.readFileSync(filePath, "utf8");
}

const tsconfig = JSON.parse(readRequired(tsconfigPath));
const compilerOptions = tsconfig.compilerOptions ?? {};
const paths = compilerOptions.paths ?? {};
const aliasTargets = paths["@/*"];

if (compilerOptions.baseUrl !== ".") {
  fail('tsconfig compilerOptions.baseUrl must be "."');
}

if (!Array.isArray(aliasTargets) || !aliasTargets.includes("*")) {
  fail('tsconfig compilerOptions.paths["@/*"] must include "*"');
}

const viteConfig = readRequired(viteConfigPath);
const viteRootAliasPattern =
  /["']@["']\s*:\s*path\.resolve\(\s*__dirname\s*,\s*["']\.\/?["']\s*\)/;

if (!viteRootAliasPattern.test(viteConfig)) {
  fail('vite.config.ts must map "@" to path.resolve(__dirname, "./")');
}

console.log("Alias sync check passed: @ resolves to the src root in TypeScript and Vite.");
