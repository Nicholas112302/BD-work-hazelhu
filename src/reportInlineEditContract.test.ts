import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('report inline editing and eye-comfort theme', () => {
  it('adds expandable editing directly to the company report table', () => {
    const patch = read('nico-workbench-deploy/patch.js');
    expect(patch).toContain('展开');
    expect(patch).toContain('reportExpandBtn');
    expect(patch).toContain('reportInlineEditor');
    expect(patch).toContain('保存修改');
    expect(patch).toContain('补充或修改这条发布资料');
    expect(patch).toContain('enhanceReportTable');
  });

  it('uses a low-glare dark slate theme across Nico Workbench', () => {
    const css = read('nico-workbench-deploy/patch.css');
    expect(css).toContain('--eye-bg:#111722');
    expect(css).toContain('--eye-surface:#18212e');
    expect(css).toContain('body{background:var(--eye-bg)!important');
    expect(css).toContain('.reportInlineEditor');
  });
});
