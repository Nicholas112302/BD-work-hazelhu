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

  it('lets the company report show all history, current week, or a selected week', () => {
    const js = read('nico-workbench-deploy/excel-import.js');
    expect(js).toContain('全部历史');
    expect(js).toContain('当前周');
    expect(js).toContain('指定 Week');
    expect(js).toContain('reportHistoryMode');
    expect(js).toContain('selectedReportWeek');
    expect(js).toContain('showImportedHistory');
    expect(js).toContain("sessionStorage.setItem('nico_report_history_mode','all')");
    expect(js).toContain("sessionStorage.setItem('nico_report_excel_only','1')");
  });

  it('overrides bright dashboard surfaces with the Rayan Forest Night low-glare palette', () => {
    const css = read('nico-workbench-deploy/eye-theme.css');
    expect(css).toContain('--eye-bg:#111411');
    expect(css).toContain('--eye-surface:#19201b');
    expect(css).toContain('--eye-surface-2:#202922');
    expect(css).toContain('--eye-accent:#6f9b78');
    expect(css).toContain('.hero');
    expect(css).toContain('.statCard');
    expect(css).toContain('.coreCard');
    expect(css).toContain('background:var(--eye-surface)!important');
  });
});
