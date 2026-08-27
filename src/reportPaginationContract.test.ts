import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('company report pagination', () => {
  it('paginates report rows 15 at a time with navigation and summary', () => {
    const code = read('nico-workbench-deploy/company-report-copy.js');
    expect(code).toContain('REPORT_PAGE_SIZE=15');
    expect(code).toContain('reportPagination');
    expect(code).toContain('上一页');
    expect(code).toContain('下一页');
    expect(code).toContain('每页 15 条');
    expect(code).toContain('.slice(start,start+REPORT_PAGE_SIZE)');
  });

  it('resets to page one when report filters change', () => {
    const code = read('nico-workbench-deploy/company-report-copy.js');
    expect(code).toContain('reportPage=1');
    expect(code).toContain('.reportHistoryMode,.excelOnlyFilter,.selectedReportWeek');
  });

  it('copies all currently filtered records instead of only the visible page', () => {
    const code = read('nico-workbench-deploy/company-report-copy.js');
    expect(code).toContain('filteredRecords(table)');
    expect(code).toContain('copyFiltered(table)');
    expect(code).not.toContain('copyVisible(table)');
  });
});
