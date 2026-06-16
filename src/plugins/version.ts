import fs from "fs";
import path from "path";
import type { Plugin, ResolvedConfig } from "vite";

function resolveBuildVersion(): string {
  return (
    process.env.APP_VERSION ||
    process.env.GITHUB_SHA ||
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  );
}

const buildVersion = resolveBuildVersion();

export function versionPlugin(): Plugin {
  const buildId = buildVersion;
  let resolvedConfig: ResolvedConfig;

  return {
    name: "version-plugin",
    config(config) {
      config.define = {
        ...config.define,
        __APP_VERSION__: JSON.stringify(buildId),
      };
    },
    configResolved(config) {
      resolvedConfig = config;
    },
    writeBundle() {
      const outDir = resolvedConfig.build.outDir;
      fs.writeFileSync(
        path.resolve(outDir, "version.json"),
        JSON.stringify({ version: buildId }),
      );
    },
  };
}

export function getBuildVersion(): string {
  return buildVersion;
}
