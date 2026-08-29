# Workbench Agent-Ready Rayan Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the deployed Nico Workbench Agent-ready while applying the Rayan Forest Night theme without changing existing report, follower, viral, or period behavior.

**Architecture:** Keep the current packed static Workbench and extend it through runtime patch assets in `nico-workbench-deploy/`. Add one isolated Agent-ready state/runtime module plus one isolated UI stylesheet, then switch the existing eye theme palette to forest green. Future Hermes integration talks to stable state/contracts rather than DOM layout.

**Tech Stack:** Static HTML/CSS/JavaScript deployment, existing browser localStorage state, Vitest contract tests, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-08-29-workbench-agent-ready-v1-design.md`

## Global Constraints

- Preserve existing company-report behavior and Wednesday–Tuesday periods.
- Preserve `followersGained` and `followersGainedRecorded`; Agent merge helpers must never overwrite them.
- Preserve existing Excel import, viral logic, pagination, and dark-theme usability.
- Uploading/adding a clip must not trigger AI automatically.
- Media Scout review is explicit human action only.
- Trust precedence is `human-confirmed` > `verifier-verified` > `agent-generated`.
- Rayan decoration is presentation-only, non-interactive, and must never cover primary controls, tables, forms, or reading areas.
- No VPS API, Cron, TikTok publishing, FFmpeg execution, or speech-to-text in this change.

---

### Task 1: Deployment contract tests

**Files:**
- Create: `src/workbenchAgentReadyContract.test.ts`

**Interfaces:**
- Consumes: files under `nico-workbench-deploy/`.
- Produces: regression contract for required new assets, Media Scout states, protected fields, Agent Center copy, and Rayan theme tokens.

- [ ] **Step 1: Write failing contract tests**
  - Assert `index.html` loads `agent-ready.js`, `agent-ready.css`, and the new eye-theme version.
  - Assert `agent-ready.js` contains Activity Log, Clip, Agent Inbox, trust precedence, protected follower fields, `ready_for_review`, `waiting_media_scout`, `media_scout_completed`, and four Agent roles.
  - Assert `eye-theme.css` exposes forest-green palette tokens and readable light text tokens.
  - Assert decoration CSS uses `pointer-events:none` and non-content-edge positioning.

- [ ] **Step 2: Run CI and verify RED**
  - Open a PR from the feature branch.
  - Expected: CI fails because the new deployment assets/contracts do not yet exist.

### Task 2: Agent-ready state and review workflow

**Files:**
- Create: `nico-workbench-deploy/agent-ready.js`
- Create: `nico-workbench-deploy/agent-ready.css`
- Modify: `nico-workbench-deploy/index.html`

**Interfaces:**
- Produces browser state keys for `activityLog`, `clips`, `agentInbox`, and `agentRuntime` while preserving unknown existing state fields.
- Produces explicit clip submission transition `ready_for_review` → `waiting_media_scout`; no AI call is made locally.
- Produces protected merge helper semantics where human-confirmed fields win.

- [ ] **Step 1: Implement minimal state helpers**
  - Initialize missing collections without deleting legacy data.
  - Append factual Activity Log entries.
  - Add/update clips with stable IDs and review states.
  - Queue future Agent Inbox entries and mark pending/review status.
  - Expose trust-aware merge logic that rejects lower-trust overwrite of protected/human-confirmed values.

- [ ] **Step 2: Implement UI foundation**
  - Add an Agent Center surface showing Tracker, Media Scout, Verifier, Strategy as `not_connected` until VPS integration.
  - Add compact counts for pending clip decisions, Agent Inbox, and Needs Review.
  - Add explicit `送交 Media Scout 审核` action on eligible clip rows/cards.
  - Keep actual video upload/FFmpeg/API unavailable and label that honestly.

- [ ] **Step 3: Verify contract tests become GREEN**

### Task 3: Rayan Forest Night theme

**Files:**
- Modify: `nico-workbench-deploy/eye-theme.css`
- Modify: `nico-workbench-deploy/index.html`
- Optional create: `nico-workbench-deploy/rayan-decor.css` only if isolation improves maintainability.

**Interfaces:**
- Presentation only; no Agent/state field names or business logic change.

- [ ] **Step 1: Replace blue-gray tokens with Rayan Forest Night tokens**
  - Near-black green background, dark moss surfaces, muted forest borders.
  - Primary/active accents use low-saturation green.
  - Body text remains warm near-white/high-contrast; muted text remains visibly separate from surfaces.
  - Warning uses restrained cream/gold; danger remains muted red.

- [ ] **Step 2: Apply ergonomic visual rules**
  - Linear/Vercel-like sidebar density.
  - Notion-like soft surfaces and spacing.
  - No glowing neon effects.
  - Maintain strong form/table readability.

- [ ] **Step 3: Add safe Rayan decoration hooks**
  - Decorative cutout containers may live only in sidebar footer, empty page corners, or card-edge peeks.
  - `pointer-events:none`, low z-index relative to menus/modals, responsive hide/reduce rules under constrained widths.
  - Do not embed copyrighted source screenshots; only layout hooks/assets supplied or explicitly prepared for this private Workbench may be referenced.

### Task 4: Regression and deployment verification

**Files:**
- Modify only as required by failing checks.

**Interfaces:**
- Existing Workbench workflows remain intact.

- [ ] **Step 1: Run full CI**
  - `npm run format:check`
  - `npm run lint`
  - `npm test`
  - `npx tsc --noEmit --pretty false`
  - `npm run build`

- [ ] **Step 2: Review PR diff for contract boundary**
  - Confirm no existing follower/report/viral logic was modified unless required solely for non-breaking asset loading.

- [ ] **Step 3: Merge only after CI passes**

- [ ] **Step 4: Verify GitHub Pages workflow succeeds for the merge SHA**
  - Do not claim production deployment until exact merge SHA has successful Pages deployment.
