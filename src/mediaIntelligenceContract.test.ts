import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p: string) => fs.existsSync(path.join(root, p));

describe('Nico media intelligence contracts', () => {
  it('injects the media intelligence assets and exposes core bindings to extension scripts', () => {
    const bootstrap = read('nico-workbench-deploy/index.html');
    expect(bootstrap).toContain('media-intelligence.css?v=1');
    expect(bootstrap).toContain('media-no-news.js?v=1');
    expect(bootstrap).toContain('media-intelligence.js?v=1');
    expect(bootstrap).toContain("replace(\"(()=>{\\n'use strict';\"");
    expect(bootstrap).toContain('replace("\\n})();\\n<\\/script>"');
    expect(bootstrap).not.toContain('replace("\\n})();\\n</script>"');
  });

  it('keeps Nico Workbench media-only with no BD workspace entry or iframe', () => {
    const workspace = read('nico-workbench-deploy/workspace.js');
    expect(workspace).not.toContain('./bd/');
    expect(workspace).not.toContain('BD 运营');
    expect(workspace).not.toContain('iframe');
    expect(workspace).not.toContain('data-workspace="bd"');
  });

  it('lets users edit or delete existing publish records from 发布录入', () => {
    const patch = read('nico-workbench-deploy/patch.js');
    expect(patch).toContain('最近发布记录');
    expect(patch).toContain('编辑记录');
    expect(patch).toContain('删除记录');
    expect(patch).toContain('editPublishRecord');
    expect(patch).toContain('deletePublishRecord');
    expect(patch).toContain('state.publishes.findIndex');
    expect(patch).toContain('confirm(');
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

  it('removes the automated news radar and hides its UI', () => {
    expect(exists('.github/workflows/media-news.yml')).toBe(false);
    expect(exists('scripts/update-media-news.mjs')).toBe(false);
    expect(exists('nico-workbench-deploy/news.json')).toBe(false);
    const shim = read('nico-workbench-deploy/media-no-news.js');
    expect(shim).toContain('.nav[data-route="news"]');
    expect(shim).toContain('#page-news');
    expect(shim).toContain("delete data.industryNews");
    expect(shim).toContain('News radar disabled');
    expect(shim).toContain('dramaDesc.textContent!==dramaText');
    expect(shim).toContain('mentorDesc.textContent!==mentorText');
  });

  it('builds a provenance-aware fused Mentor Case for the remaining media signals', () => {
    const js = read('nico-workbench-deploy/media-intelligence.js');
    for (const bucket of ['historicalViralEvidence', 'recentPublishEvidence', 'dramaLibrary', 'riskEvidence']) {
      expect(js).toContain(bucket);
    }
    expect(js).toContain('不是因果证明');
    expect(js).toContain('buildMentorEvidence');
  });
});
