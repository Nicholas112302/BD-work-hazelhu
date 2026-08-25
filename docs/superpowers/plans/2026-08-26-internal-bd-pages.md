# Internal BD GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing React/Vite BD workbench inside the same GitHub Pages site at `/BD-work-hazelhu/bd/` and make the Nico workspace switcher load that same-origin page instead of the blocked external Vercel iframe.

**Architecture:** The Pages workflow assembles a single `site/` artifact. Existing `nico-workbench-deploy/*` becomes the site root, while `npm run build -- --base=/BD-work-hazelhu/bd/ --outDir=site/bd` builds the existing BD application into the internal `/bd/` path. `workspace.js` points its BD frame and fallback link to the relative internal path.

**Tech Stack:** GitHub Actions, GitHub Pages, Vite, React, TypeScript, existing Nico static deploy shell.

**Spec:** `docs/superpowers/specs/2026-08-26-nico-dual-workspace-design.md`

## Global Constraints

- Keep Media and BD business data separate.
- Preserve current Media behavior and storage keys.
- Reuse the existing BD React application; do not copy or rewrite its business logic.
- Remove dependency on the old external Vercel URL for workspace loading.
- Keep the same public Nico Workbench URL.

---

### Task 1: Build BD into the Pages artifact

**Files:**
- Modify: `.github/workflows/nico-workbench-pages.yml`

**Interfaces:**
- Consumes: existing `npm run build` Vite build.
- Produces: Pages artifact with root Media files plus `bd/index.html` and BD assets.

- [ ] Expand workflow path triggers to include BD source/build configuration.
- [ ] Set up Node and run `npm ci`.
- [ ] Create `site/`, copy `nico-workbench-deploy/*` into it.
- [ ] Build Vite with base `/BD-work-hazelhu/bd/` and output `site/bd`.
- [ ] Upload `site` instead of `nico-workbench-deploy`.

### Task 2: Switch BD workspace to same-origin internal app

**Files:**
- Modify: `nico-workbench-deploy/workspace.js`

**Interfaces:**
- Consumes: `./bd/` produced by Task 1.
- Produces: BD workspace iframe loading same-origin GitHub Pages path.

- [ ] Replace the external Vercel URL with `./bd/`.
- [ ] Update helper text and link copy to remove the external-embed warning.
- [ ] Keep `nico_active_workspace` behavior unchanged.

### Task 3: Verify and publish

**Files:**
- No additional production files expected.

**Interfaces:**
- Consumes: Task 1 and Task 2 outputs.
- Produces: green CI and successful Pages deployment.

- [ ] Verify formatting, lint, tests, typecheck, and build in CI.
- [ ] Verify Pages workflow builds and deploys successfully.
- [ ] Verify the deployed artifact contains the `/bd/` application path.
