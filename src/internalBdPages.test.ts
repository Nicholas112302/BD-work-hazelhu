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
  it("loads the BD workspace from the same-origin /bd path", () => {
    expect(workspaceScript).toContain("./bd/");
    expect(workspaceScript).not.toContain("bd-work-hazelhu-byhazel.vercel.app");
  });

  it("builds the existing Vite BD app into the Pages /bd directory", () => {
    expect(pagesWorkflow).toContain("npm ci");
    expect(pagesWorkflow).toContain("/BD-work-hazelhu/bd/");
    expect(pagesWorkflow).toContain("site/bd");
    expect(pagesWorkflow).toContain("path: site");
  });
});
