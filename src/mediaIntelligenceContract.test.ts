import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Nico media intelligence contracts', () => {
  it('injects the media intelligence assets and exposes core bindings to extension scripts', () => {
    const bootstrap = read('nico-workbench-deploy/index.html');
    expect(bootstrap).toContain('media-intelligence.css?v=1');
    expect(bootstrap).toContain('media-intelligence.js?v=1');
    expect(bootstrap).toContain("replace(\"(()=>{\\n'use strict';\"");
    expect(bootstrap).toContain('replace("\\n})();\\n</script>"');
    expect(read('nico-workbench-deploy/workspace.js')).toContain('./bd/');
  });

  it('implements the approved viral qualification and snapshot rules', () => {
    const js = read('nico-workbench-deploy/media-intelligence.js');
    expect(js).toContain('100000');
    expect(js).toContain('RECENT_LIMIT=10');
    expect(js).toContain('MIN_BASELINE_SAMPLE=5');
    expect(js).toContain('RELATIVE_MULTIPLIER=3');
    expect(js).toContain('viralItems');
    expect(js).toContain('dramaLibrary');
    expect(js).toContain('observedAt');
    expect(js).toContain('followersGained');
    expect(js).toContain('重新扫描全部记录');
    expect(js).toContain('历史补录');
  });

  it('keeps uploaded videos out of localStorage and in IndexedDB', () => {
    const js = read('nico-workbench-deploy/media-intelligence.js');
    expect(js).toContain('indexedDB.open');
    expect(js).toContain('nico_media_assets');
    expect(js).toContain("accept=\"video/*\"");
  });

  it('adds the drama library and explainable TikTok-only account recommendations', () => {
    const js = read('nico-workbench-deploy/media-intelligence.js');
    expect(js).toContain('片单库');
    for (const field of ['actors', 'genre', 'period', 'isIqiyi', 'tags', 'conflicts', 'inventoryStatus', 'editingStatus', 'active', 'note']) {
      expect(js).toContain(field);
    }
    for (const state of ['推荐', '可测试', '暂不建议', '风险偏高']) {
      expect(js).toContain(state);
    }
    expect(js).toContain('TikTok');
  });

  it('adds a daily medium/high-impact news radar with protected API usage', () => {
    const script = read('scripts/update-media-news.mjs');
    const workflow = read('.github/workflows/media-news.yml');
    const js = read('nico-workbench-deploy/media-intelligence.js');
    expect(workflow).toContain('cron:');
    expect(workflow).toContain('OPENAI_API_KEY');
    expect(workflow).not.toMatch(/sk-[A-Za-z0-9_-]{20,}/);
    expect(script).toContain('MAX_CANDIDATES');
    expect(script).toContain('MAX_DEEP_ITEMS');
    expect(script).toContain('gpt-5.6-luna');
    expect(script).toContain("impact === 'medium' || x.impact === 'high'");
    expect(js).toContain('影视行业新闻雷达');
    expect(js).toContain('今日暂无需要跟进的影视行业动态');
    expect(read('nico-workbench-deploy/news.json')).toContain('"items"');
  });

  it('builds a provenance-aware fused Mentor Case', () => {
    const js = read('nico-workbench-deploy/media-intelligence.js');
    for (const bucket of ['historicalViralEvidence', 'recentPublishEvidence', 'dramaLibrary', 'riskEvidence', 'industryNews']) {
      expect(js).toContain(bucket);
    }
    expect(js).toContain('不是因果证明');
    expect(js).toContain('buildMentorEvidence');
  });
});
