import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Tracker Input export contract', () => {
  it('loads the Tracker export script next to the company report copy enhancer', () => {
    const html = read('nico-workbench-deploy/index.html');
    expect(html).toContain('company-report-copy.js?v=5');
    expect(html).toContain('tracker-input-export.js?v=1');
  });

  it('exports only current Wednesday-to-Tuesday report-window videos from state.publishes', () => {
    const js = read('nico-workbench-deploy/tracker-input-export.js');
    expect(js).toContain('state.publishes');
    expect(js).toContain("timezone:'GMT+8'");
    expect(js).toContain('publishDate');
    expect(js).toContain('videoLink');
    expect(js).toContain('post_id');
    expect(js).toContain('publish_time');
    expect(js).toContain('tracker-input-');
  });

  it('deduplicates URLs, skips missing links with a user notice, and sorts newest first', () => {
    const js = read('nico-workbench-deploy/tracker-input-export.js');
    expect(js).toContain('new Set');
    expect(js).toContain('缺少视频链接');
    expect(js).toContain('.sort(');
    expect(js).toContain('导出 Tracker Input');
    expect(js).toContain('.reportHistoryControls');
  });
});
