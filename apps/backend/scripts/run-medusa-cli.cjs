const { spawnSync } = require("node:child_process")
const path = require("node:path")

const rootNodeModules = path.resolve(__dirname, "../../..", "node_modules")
const args = ["-y", "@medusajs/cli@2.15.1", ...process.argv.slice(2)]

const result = spawnSync("npx", args, {
  cwd: path.resolve(__dirname, ".."),
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    NODE_PATH: [rootNodeModules, process.env.NODE_PATH].filter(Boolean).join(path.delimiter),
  },
})

process.exit(result.status ?? 1)
