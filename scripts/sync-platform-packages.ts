import { chmod, copyFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const targets = [
  {
    source: ".dist/bun-darwin-arm64/distill",
    destination: "packages/distill-darwin-arm64/bin/distill"
  },
  {
    source: ".dist/bun-darwin-x64/distill",
    destination: "packages/distill-darwin-x64/bin/distill"
  },
  {
    source: ".dist/bun-linux-arm64/distill",
    destination: "packages/distill-linux-arm64/bin/distill"
  },
  {
    source: ".dist/bun-linux-x64/distill",
    destination: "packages/distill-linux-x64/bin/distill"
  }
] as const;

const root = path.resolve(import.meta.dir, "..");

for (const target of targets) {
  const source = path.join(root, target.source);
  const destination = path.join(root, target.destination);

  await stat(source);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  await chmod(destination, 0o755);
}
