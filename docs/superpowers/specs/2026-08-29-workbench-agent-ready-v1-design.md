# Nico Workbench Agent-Ready V1 — Design Spec

## Goal
Prepare the existing Nico Workbench for safe Hermes integration without changing the current reporting, follower-gain, viral-analysis, or account-strategy behavior. Agent data must enter through explicit provenance and review boundaries before it can affect trusted analytics.

## Current architecture constraints
- The production Workbench is a static GitHub Pages app loaded from `nico-workbench-deploy/index.html` plus runtime patch scripts.
- Existing global state/save/render functions must remain compatible.
- Existing company-report logic, Wednesday–Tuesday period rules, follower-gain confirmation behavior, Excel import behavior, viral-analysis logic, and dark theme must not regress.
- No direct Hermes write into the static page in V1. API/database integration comes later on the VPS.

## Agent-ready V1 scope

### 1. Activity Log
Add an append-only operational activity log in Workbench state for important human and system actions.

Minimum fields:
- `id`
- `timestamp`
- `actor` (`human`, `tracker`, `media-scout`, `verifier`, `strategy`, `system`)
- `action_type`
- `entity_type`
- `entity_id`
- `summary`
- `metadata`

Initial automatically logged human actions should include material/clip decisions, drama inventory changes, account/drama allocation changes, editing-direction changes, report completion where detectable, manual postmortem changes, and Strategy decision outcomes once those controls exist.

The log is factual history, not an AI-generated narrative. Strategy later reads Monday–Friday Activity Log plus prior summaries to draft the Friday 15:00 work summary.

### 2. Drama → Clip data layer
Preserve the existing drama library and add a clip-level collection rather than replacing drama records.

Minimum clip fields:
- `clip_id`
- `drama_id` or stable drama title reference
- `source_filename`
- `created_at`
- `duration_seconds`
- `media_hash`
- `fingerprint`
- `status` (`received`, `ready_for_review`, `waiting_media_scout`, `processing`, `media_scout_completed`, `recommended`, `test`, `pending_publish`, `published`, `deferred`, `rejected`, `duplicate`, `needs_review`)
- `human_decision`
- `recommended_accounts`
- `published_account`
- `tiktok_url`
- `published_at`
- `source_provenance`

V1 UI may use metadata/placeholders before real FFmpeg upload and VPS media storage exist.

### 3. Media Scout submission flow
The Workbench must make the human-to-Media-Scout review flow explicit.

Intended flow:
1. Human uploads/imports or registers a video clip in Workbench.
2. Workbench creates a Clip record with status `received` or `ready_for_review`.
3. Human explicitly clicks `送交 Media Scout 审核`.
4. Only then may the future Hermes/VPS integration enqueue the clip for Media Scout and change status to `waiting_media_scout` / `processing`.
5. Media Scout uses FFmpeg preprocessing plus key-frame vision to produce structured analysis.
6. The result passes through Verifier/review rules before trusted use.
7. Workbench displays the result and lets the human decide `采用`, `暂缓`, or `不采用`.

Uploading or registering a clip must NOT automatically invoke an LLM/vision model. The user controls which clips consume AI credits.

Media Scout structured result should reserve fields for:
- opening / first-3-seconds type and clarity;
- visible conflict / emotional structure;
- whether the clip is understandable without extensive context;
- broad plot/conflict tags inferred from visible evidence;
- duplicate / similarity signal;
- visible content-risk signal;
- recommended account(s);
- per-account fit/recommendation strength where evidence exists;
- recommendation outcome (`recommended`, `test`, `defer`, `not_recommended`);
- confidence;
- evidence/reason summary;
- `analyzed_at`.

If key frames are insufficient to support a conclusion, Media Scout must lower confidence or return `needs_review` rather than invent dialogue or unseen plot information.

UI states should clearly distinguish:
- `ready_for_review` — clip exists but no AI review has been requested;
- `waiting_media_scout` — user requested review, waiting for Agent processing;
- `processing` — Media Scout/FFmpeg analysis is in progress;
- `media_scout_completed` — result returned and is available for verification/review;
- `needs_review` — result/conflict requires human attention.

Until the VPS API/FFmpeg pipeline exists, Workbench should expose the state model and submission control without pretending a real Media Scout job has run.

### 4. Agent Inbox / Needs Review
Create a staging collection for future Hermes payloads.

Minimum fields:
- `id`
- `agent`
- `entity_type`
- `entity_key`
- `payload`
- `created_at`
- `verification_status` (`pending`, `verified`, `needs_review`, `failed`, `rejected_duplicate`)
- `issues`
- `reviewed_at`

Agent-generated information must not silently become trusted human data. Pending/unverified entries are visually distinct and excluded from trusted analytics until verified.

### 5. Provenance and trust precedence
Use explicit provenance for fields/records where Agent integration can create conflicts.

Trust order:
1. `human-confirmed`
2. `verifier-verified`
3. `agent-generated`

If lower-trust data conflicts with higher-trust data, do not overwrite. Create a Needs Review issue instead.

Agent-writable factual/derived fields may include:
- `video_url`
- `account`
- `publish_time` / `publish_date`
- `views`
- `likes`
- `comments`
- `checked_at`
- metric snapshots
- discovery status
- verification status
- anomaly flags
- viral-candidate flags
- Clip ↔ TikTok match proposals
- Media Scout structured clip tags, recommendation, risk, similarity
- Strategy recommendations, confidence, evidence, Friday work-summary drafts

Protected fields must not be automatically overwritten:
- `followersGained`
- `followersGainedRecorded`
- human-confirmed follower gain, including explicit zero
- human-written viral/postmortem analysis
- human strategy notes
- human-confirmed drama/title assignment
- human-confirmed content direction
- human decision on clip adoption/publishing
- human-confirmed Clip ↔ TikTok match
- Strategy outcome (`accepted`, `partially_accepted`, `rejected`)

### 6. Agent Center foundation
Add one Workbench surface for integration readiness and future runtime state. V1 is a foundation panel, not a chat interface.

Show four roles:
- Tracker
- Media Scout
- Verifier
- Strategy

For each role reserve/display:
- status (`not_connected`, `idle`, `running`, `warning`, `error`)
- last run
- last successful run
- processed count
- pending/review count
- last error/attention item

Until VPS API integration exists, the panel should clearly show that live Agent sync is not connected rather than faking activity.

### 7. Command Center additions
Keep the homepage action-first. Add compact counters/links for:
- pending clip decisions
- clips ready for Media Scout review
- clips waiting for Media Scout
- Agent Inbox pending
- Needs Review
- existing follower reminders
- existing viral candidates
- Agent connection health

Do not add decorative dashboards that duplicate existing pages.

## Workbench identity and monitored accounts
Production Workbench URL:
`https://nicholas112302.github.io/BD-work-hazelhu/`

The Hermes configuration will monitor these eight TikTok accounts:
- `hammondbenjamin4`
- `plt.dropp`
- `williampowell8148`
- `clipjelly`
- `hits_drama`
- `vidcutie`
- `cliprainbowdots`
- `vidtutu`

All accounts operate in the Indonesia market with Indonesian local-drama material.

## Data ownership
V1 remains local/static Workbench state. The design should make future migration to VPS API/database possible without changing the user-facing trust rules.

Future intended flow:
Hermes → VPS Agent API/DB → Agent Inbox → Verifier → trusted Workbench data.

Media path:
Human clip intake → explicit `送交 Media Scout 审核` → VPS/Media Scout job → Verifier/review → Workbench result → human decision.

The static Workbench must not accept unauthenticated direct internet writes.

## UI approach
Reuse the existing eye-comfort dark theme and runtime patch architecture. Prefer one new Agent Center surface and integrate clip controls into the existing drama/media workflow rather than creating many disconnected pages.

The Media Scout review action must be explicit and user-triggered so that merely adding a video does not consume AI credits.

## Error handling
- Missing or malformed Agent payload: `failed` or `needs_review`; never guess.
- Conflicting high-trust field: preserve existing value and create review issue.
- Unknown account or video identity: Needs Review.
- Duplicate URL/clip: mark duplicate; do not create trusted duplicate record.
- Media Scout analysis requested while live Agent sync is unavailable: keep the clip safe, show `not_connected` / pending guidance, and do not fake completion.
- Existing legacy records without provenance remain valid human/existing records and must not be downgraded.

## Testing / regression requirements
Contract tests must cover:
- Activity Log append behavior and persistence contract.
- Clip schema/statuses and Drama→Clip relation.
- `ready_for_review` → user-triggered Media Scout submission state transition.
- Registering/uploading a clip alone does not trigger Media Scout analysis.
- Media Scout result/status contract and human final decision protection.
- Agent Inbox statuses and pending exclusion from trusted analytics.
- Human > verifier > agent precedence.
- Protected follower fields cannot be overwritten by Agent merge helpers.
- Agent Center bootstrap assets load.
- Existing company report, pagination, Excel import, follower reminder, Wednesday–Tuesday periods, dark theme, and viral logic remain present.

All behavior changes follow RED → GREEN CI. GitHub Pages deployment must be verified successful before claiming production deployment.

## V1 non-goals
- Live VPS API/database implementation.
- Actual FFmpeg upload processing.
- Speech-to-text.
- Automatic AI review immediately upon clip upload/import.
- Automatic TikTok publishing or creator-backend automation.
- Running Hermes Cron jobs.
- Full Strategy Center or automated Strategy decisions.
- Autonomous acceptance of Agent-generated data without verifier/review boundaries.

## Rollout order
1. Add state contracts and Activity Log.
2. Add Clip layer, basic material decision UI, and explicit `送交 Media Scout 审核` state flow.
3. Add Agent Inbox / provenance merge rules.
4. Add Agent Center foundation and Command Center counters.
5. Verify all legacy workflows.
6. Only after this V1 is stable, return to Hermes repository/profile sync and Tracker/Media Scout manual tests.
