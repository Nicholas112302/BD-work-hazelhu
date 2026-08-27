# Full Workbench Eye Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Nico Workbench page use one readable, low-glare dark visual system with no residual bright cards or low-contrast text.

**Architecture:** Keep the existing application logic untouched and implement the change as a high-priority global theme layer in `eye-theme.css`. Use semantic CSS variables plus broad compatibility selectors for legacy cards, inline light backgrounds, tables, forms, badges, and media intelligence components. Bump the bootstrap asset version so deployed browsers receive the new stylesheet.

**Tech Stack:** Static HTML bootstrap, CSS overrides, Vitest contract tests, GitHub Pages.

**Spec:** User-approved full-site eye-comfort redesign in conversation on 2026-08-27.

## Global Constraints

- Preserve all application data and business logic.
- Keep the current dark slate direction; do not switch to pure black.
- Remove large white/light-gray surfaces across every page.
- Increase text contrast and hierarchy without using pure white everywhere.
- Lower blue saturation/brightness for large headings and accents.
- Keep status colors readable but subdued.
- Cover homepage, publish entry, account battle map, recommendations, hashtag analysis, risk center, viral analysis, drama library, Mentor, company report, and data/backup.

---

### Task 1: Add full-site visual regression contract

**Files:**
- Modify: `src/reportInlineEditContract.test.ts`

**Interfaces:**
- Consumes: `nico-workbench-deploy/eye-theme.css`
- Produces: contract assertions for dark surfaces, readable text, legacy light-background overrides, media cards, forms, tables, badges, and account strategy blocks.

- [ ] **Step 1: Write failing assertions for the approved global theme behaviors.**
- [ ] **Step 2: Run CI and verify tests fail because the new selectors/tokens are absent.**
- [ ] **Step 3: Do not change production CSS until the failure is observed.**

### Task 2: Implement unified low-glare theme layer

**Files:**
- Modify: `nico-workbench-deploy/eye-theme.css`

**Interfaces:**
- Consumes: legacy page/card classes and inline light backgrounds.
- Produces: consistent surfaces, typography, inputs, tables, cards, badges, navigation, and media intelligence styling.

- [ ] **Step 1: Add semantic contrast tokens for primary, secondary, muted, heading, accent, borders, and nested surfaces.**
- [ ] **Step 2: Override generic legacy light surfaces and common inline pale backgrounds.**
- [ ] **Step 3: Strengthen body/card/table/form typography and nested card readability.**
- [ ] **Step 4: Normalize media intelligence cards, account strategy blocks, tags, status badges, and buttons.**
- [ ] **Step 5: Run tests and verify green.**

### Task 3: Force fresh deployment asset and verify

**Files:**
- Modify: `nico-workbench-deploy/index.html`
- Modify: `src/reportInlineEditContract.test.ts`

**Interfaces:**
- Produces: `eye-theme.css?v=6` in the live bootstrap.

- [ ] **Step 1: Update the contract to require the new theme asset version.**
- [ ] **Step 2: Bump `eye-theme.css` to `v=6` in the bootstrap.**
- [ ] **Step 3: Run full CI, merge only when green, and wait for GitHub Pages success.**
