#!/usr/bin/env node

const { spawn } = require("node:child_process");
const path = require("node:path");
const { createRequire } = require("node:module");

const requireFromHere = createRequire(__filename);

const PACKAGE_BY_TARGET = {
  "darwin-arm64": "@samuelfaj/distill-darwin-arm64",
  "darwin-x64": "@samuelfaj/distill-darwin-x64",
  "linux-arm64": "@samuelfaj/distill-linux-arm64",
  "linux-x64": "@samuelfaj/distill-linux-x64"
};

function resolveBinaryPath() {
  const target = `${process.platform}-${process.arch}`;
  const packageName = PACKAGE_BY_TARGET[target];

  if (!packageName) {
    console.error(
      `[distill] Unsupported platform: ${process.platform}/${process.arch}.`
    );
    process.exit(1);
  }

  try {
    const packageJsonPath = requireFromHere.resolve(`${packageName}/package.json`);
    return path.join(path.dirname(packageJsonPath), "bin", "distill");
  } catch (error) {
    console.error(
      `[distill] Missing platform package ${packageName}. Reinstall @samuelfaj/distill for this platform.`
    );
    process.exit(1);
  }
}

const binPath = resolveBinaryPath();
const child = spawn(binPath, process.argv.slice(2), {
  stdio: "inherit"
});

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
  process.on(signal, () => forwardSignal(signal));
});

child.on("error", (error) => {
  console.error(`[distill] Failed to launch native binary: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.removeAllListeners(signal);
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});
