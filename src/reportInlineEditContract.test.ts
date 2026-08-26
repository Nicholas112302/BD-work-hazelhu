import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('report inline editing and eye-comfort theme', () => {
  it('adds expandable editing directly to the company report table', () => {
    const patch = read('nico-workbench-deploy/report-edit.js');
    expect(patch).toContain('展开');
    expect(patch).toContain('reportExpandBtn');
    expect(patch).toContain('reportInlineEditor');
    expect(patch).toContain('保存修改');
    expect(patch).toContain('补充或修改这条发布资料');
    expect(patch).toContain('enhanceReportTable');
  });

  it('keeps an open report editor from being erased by history table rerenders', () => {
    const history = read('nico-workbench-deploy/excel-import.js');
    expect(history).toContain("table.querySelector('.reportInlineEditor')");
    expect(history).toContain('if(table.querySelector');
    expect(history).toContain('return;');
  });

  it('does not continuously rebuild an unchanged history table', () => {
    const history = read('nico-workbench-deploy/excel-import.js');
    expect(history).toContain('historyRenderKey');
    expect(history).toContain('table.dataset.historyRenderKey');
    expect(history).toContain('if(table.dataset.historyRenderKey===historyRenderKey)return');
  });

  it('uses a low-glare dark slate theme across Nico Workbench', () => {
    const css = read('nico-workbench-deploy/eye-theme.css');
    expect(css).toContain('--eye-bg:#11151c');
    expect(css).toContain('--eye-surface:#1b222c');
    expect(css).toContain('body{background:var(--eye-bg)!important');
    expect(css).toContain('.reportInlineEditor');
  });

  it('loads both enhancements from the Nico bootstrap', () => {
    const bootstrap = read('nico-workbench-deploy/index.html');
    expect(bootstrap).toContain('eye-theme.css?v=5');
    expect(bootstrap).toContain('report-edit.js?v=2');
  });
});
