# Nico Dual Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a clear Media / BD workspace switcher to the existing Nico Workbench while preserving both apps' existing data and behavior, and expose a dedicated “清空演示数据” action in the Media cleanup area.

**Architecture:** Keep the current Nico Workbench as the Media workspace. Add a lightweight workspace shell patch that swaps the visible Media navigation/content for a BD workspace container. The BD workspace embeds the already-deployed BD app in an iframe so its existing localStorage, workflow logic, and code remain independent. Only the active workspace preference is shared via `nico_active_workspace`.

**Tech Stack:** Static HTML/CSS/JavaScript, existing Nico Workbench deploy bootstrap, existing Vercel-hosted BD app, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-26-nico-dual-workspace-design.md`

## Global Constraints

- Existing Media workspace data must not be deleted or migrated.
- BD and Media business data must remain independent.
- Existing Media navigation and pages must continue working unchanged when Media is active.
- “清空演示数据” must delete only demo Media records, not real records.
- The workspace switcher must clearly label “影视运营” and “BD 运营”.

---

### Task 1: Workspace switcher shell

**Files:**
- Create: `nico-workbench-deploy/workspace.css`
- Create: `nico-workbench-deploy/workspace.js`
- Modify: `nico-workbench-deploy/index.html`

**Interfaces:**
- Consumes: current Nico Workbench DOM after bootstrap writes the original app.
- Produces: `window.NicoWorkspace.set('media'|'bd')` and persistent key `nico_active_workspace`.

- [ ] **Step 1: Add workspace switcher styles**
- [ ] **Step 2: Add workspace switcher DOM injection and state handling**
- [ ] **Step 3: Add isolated BD iframe container pointing to the existing BD deployment**
- [ ] **Step 4: Inject workspace assets from the bootstrap after the original app loads**
- [ ] **Step 5: Verify switching does not remove Media DOM or localStorage**

### Task 2: Media demo cleanup control

**Files:**
- Modify: `nico-workbench-deploy/patch.js`

**Interfaces:**
- Consumes: existing Media `state`, `save()`, `renderSettings()` and demo records.
- Produces: dedicated “清空演示数据” button in Settings / 演示与清理.

- [ ] **Step 1: Ensure the cleanup area always contains all three actions**
- [ ] **Step 2: Disable “清空演示数据” when no demo records exist**
- [ ] **Step 3: Verify real Media records remain after demo cleanup**

### Task 3: Integration verification and rollout

**Files:**
- No new files.

- [ ] **Step 1: Check JavaScript syntax for both patches**
- [ ] **Step 2: Confirm BD URL responds and loads independently**
- [ ] **Step 3: Open a PR from `feat/nico-dual-workspace` to `main`**
- [ ] **Step 4: Merge after verification**
- [ ] **Step 5: Confirm GitHub Pages deployment succeeds**
