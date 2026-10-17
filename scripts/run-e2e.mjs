import { spawnSync } from "node:child_process";
function run(args) {
  return (
    spawnSync(process.execPath, args, { stdio: "inherit", env: process.env })
      .status ?? 1
  );
}
const fixtureArgs = [
  "--import",
  "tsx",
  "--env-file=.env",
  "scripts/test-fixture.ts",
];
let result = run(fixtureArgs);
if (!result) {
  try {
    result = run([
      "node_modules/@playwright/test/cli.js",
      "test",
      ...process.argv.slice(2),
    ]);
  } finally {
    const cleanup = run([...fixtureArgs, "--cleanup"]);
    if (!result) result = cleanup;
  }
}
process.exitCode = result;
