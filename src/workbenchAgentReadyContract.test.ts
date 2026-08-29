import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const deployPath = (name: string) =>
  new URL(`../nico-workbench-deploy/${name}`, import.meta.url);
const readDeploy = (name: string) => readFileSync(deployPath(name), 'utf8');

describe('Nico Workbench agent-ready deployment contract', () => {
  it('loads isolated Agent-ready assets from the production bootstrap', () => {
    const index = readDeploy('index.html');

    expect(index).toContain('agent-ready.css?v=1');
    expect(index).toContain('agent-ready.js?v=1');
    expect(index).toContain('eye-theme.css?v=7');
  });

  it('defines the Agent-ready state, trust, protected fields, and Media Scout submission states', () => {
    expect(existsSync(deployPath('agent-ready.js'))).toBe(true);
    const script = readDeploy('agent-ready.js');

    for (const marker of [
      'activityLog',
      'clips',
      'agentInbox',
      'agentRuntime',
      'human-confirmed',
      'verifier-verified',
      'agent-generated',
      'followersGained',
      'followersGainedRecorded',
      'ready_for_review',
      'waiting_media_scout',
      'media_scout_completed',
      'Tracker',
      'Media Scout',
      'Verifier',
      'Strategy',
      '送交 Media Scout 审核',
    ]) {
      expect(script).toContain(marker);
    }
  });

  it('uses a readable Rayan Forest Night palette instead of the old blue-gray accent palette', () => {
    const theme = readDeploy('eye-theme.css');

    expect(theme).toContain('--eye-bg:#111411');
    expect(theme).toContain('--eye-surface:#19201b');
    expect(theme).toContain('--eye-accent:#6f9b78');
    expect(theme).toContain('--eye-accent-strong:#8db596');
    expect(theme).toContain('--eye-text-strong:#eef2ed');
    expect(theme).toContain('--eye-text:#d5ddd5');
  });

  it('keeps decorative Rayan hooks non-interactive and out of narrow workspaces', () => {
    expect(existsSync(deployPath('agent-ready.css'))).toBe(true);
    const css = readDeploy('agent-ready.css');

    expect(css).toContain('.rayan-decor');
    expect(css).toContain('pointer-events:none');
    expect(css).toMatch(/@media\(max-width:\s*1100px\)/);
    expect(css).toMatch(/\.rayan-decor[^}]*display:none/s);
  });
});
