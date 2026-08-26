import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Excel import source labels and low-glare theme', () => {
  it('supports Excel import preview, dedupe, temporary labels, and label removal', () => {
    const js = read('nico-workbench-deploy/excel-import.js');
    expect(js).toContain('Excel 导入');
    expect(js).toContain('预计新增');
    expect(js).toContain('疑似重复');
    expect(js).toContain('字段异常');
    expect(js).toContain("sourceTag:'excel_import'");
    expect(js).toContain('importFileName');
    expect(js).toContain('importRowNumber');
    expect(js).toContain('移除 Excel 标签');
    expect(js).toContain('只看 Excel 导入');
  });

  it('overrides bright dashboard surfaces with a consistent low-glare dark palette', () => {
    const css = read('nico-workbench-deploy/eye-theme.css');
    expect(css).toContain('--eye-bg:#11151c');
    expect(css).toContain('--eye-surface:#1b222c');
    expect(css).toContain('--eye-surface-2:#232c38');
    expect(css).toContain('.hero');
    expect(css).toContain('.statCard');
    expect(css).toContain('.coreCard');
    expect(css).toContain('background:var(--eye-surface)!important');
  });
});
