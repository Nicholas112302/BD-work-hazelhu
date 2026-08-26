import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const workspaceScript = readFileSync(
  resolve(root, "nico-workbench-deploy/workspace.js"),
  "utf8",
);
const pagesWorkflow = readFileSync(
  resolve(root, ".github/workflows/nico-workbench-pages.yml"),
  "utf8",
);

describe("internal BD GitHub Pages deployment", () => {
  it("does not expose the BD workspace from Nico Workbench", () => {
    expect(workspaceScript).not.toContain("./bd/");
    expect(workspaceScript).not.toContain("BD 运营");
    expect(workspaceScript).not.toContain('data-workspace="bd"');
  });

  it("keeps the existing Vite BD app source deployable as a recoverable backup", () => {
    expect(pagesWorkflow).toContain("npm ci");
    expect(pagesWorkflow).toContain("/BD-work-hazelhu/bd/");
    expect(pagesWorkflow).toContain("site/bd");
    expect(pagesWorkflow).toContain("path: site");
  });
});
