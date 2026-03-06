import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const targets = [
  {
    bunTarget: "bun-darwin-arm64",
    output: ".dist/bun-darwin-arm64/distill"
  },
  {
    bunTarget: "bun-darwin-x64",
    output: ".dist/bun-darwin-x64/distill"
  },
  {
    bunTarget: "bun-linux-arm64",
    output: ".dist/bun-linux-arm64/distill"
  },
  {
    bunTarget: "bun-linux-x64",
    output: ".dist/bun-linux-x64/distill"
  }
] as const;

const root = path.resolve(import.meta.dir, "..");
const entrypoint = path.join(root, "src", "cli.ts");

for (const target of targets) {
  const outfile = path.join(root, target.output);
  await mkdir(path.dirname(outfile), { recursive: true });

  const result = spawnSync(
    "bun",
    [
      "build",
      "--compile",
      `--target=${target.bunTarget}`,
      `--outfile=${outfile}`,
      entrypoint
    ],
    {
      cwd: root,
      stdio: "inherit"
    }
  );

  if (result.status !== 0) {
    throw new Error(`Failed to compile ${target.bunTarget}.`);
  }
}
