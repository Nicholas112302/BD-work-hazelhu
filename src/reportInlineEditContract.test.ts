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

  it('includes followers gained as a backfillable report field', () => {
    const patch = read('nico-workbench-deploy/report-edit.js');
    expect(patch).toContain('增粉数');
    expect(patch).toContain('name="followersGained"');
    expect(patch).toContain("followersGained:Number(f.get('followersGained')||0)");
  });

  it('distinguishes an untouched followers field from an explicitly entered zero', () => {
    const patch = read('nico-workbench-deploy/followers-reminder.js');
    expect(patch).toContain('followersGainedRecorded');
    expect(patch).toContain("raw!==''");
    expect(patch).toContain("input.value=''");
  });

  it('reminds on the active Wednesday-to-Tuesday week and the immediately prior week only when followers were never confirmed', () => {
    const copy = read('nico-workbench-deploy/company-report-copy.js');
    expect(copy).toContain('followersReminder');
    expect(copy).toContain('待补涨粉');
    expect(copy).toContain('⚠');
    expect(copy).toContain('activeFollowersReminderWindow');
    expect(copy).toContain('currentStart');
    expect(copy).toContain('previousStart');
    expect(copy).toContain('publishDate');
    expect(copy).toContain('followersGainedRecorded');
    expect(copy).not.toContain('latestClosedReportWindow');
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
    expect(history).toContain('if(table.dataset.historyRenderKey===historyRenderKey(table,rows))return');
  });

  it('shows the company spreadsheet metric columns and copies exactly 14 company columns', () => {
    const copy = read('nico-workbench-deploy/company-report-copy.js');
    expect(copy).toContain('播放量');
    expect(copy).toContain('点赞量');
    expect(copy).toContain('增粉数');
    expect(copy).toContain('一键复制到公司表格');
    expect(copy).toContain('companyCopyColumns');
    expect(copy).toContain("['市场','Month','Week','发布日期','账号','片名','产地（微剧就写微剧）','片单类型','是否爱奇艺的剧','内容制作方向','视频链接','播放量','点赞量','增粉数']");
    expect(copy).toContain('navigator.clipboard.writeText');
    expect(copy).toContain('followersMetric(r)');
  });

  it('paginates company report records 15 at a time without limiting copy', () => {
    const copy = read('nico-workbench-deploy/company-report-copy.js');
    expect(copy).toContain('REPORT_PAGE_SIZE=15');
    expect(copy).toContain('reportPagination');
    expect(copy).toContain('上一页');
    expect(copy).toContain('下一页');
    expect(copy).toContain('每页 15 条');
    expect(copy).toContain('filteredRecords(table)');
    expect(copy).toContain('copyFiltered(table)');
  });

  it('keeps pagination controls stable so page buttons can receive clicks', () => {
    const copy = read('nico-workbench-deploy/company-report-copy.js');
    expect(copy).toContain('paginationRenderKey');
    expect(copy).toContain('dataset.paginationRenderKey');
    expect(copy).not.toContain('existing.outerHTML=html');
  });

  it('uses the Rayan Forest Night low-glare theme across Nico Workbench', () => {
    const css = read('nico-workbench-deploy/eye-theme.css');
    expect(css).toContain('--eye-bg:#111411');
    expect(css).toContain('--eye-surface:#19201b');
    expect(css).toContain('--eye-text-strong:#eef2ed');
    expect(css).toContain('--eye-text-soft:#c8d2c9');
    expect(css).toContain('--eye-heading:#a5c4aa');
    expect(css).toContain('--eye-accent:#6f9b78');
    expect(css).toContain('[style*="background:#fff"]');
    expect(css).toContain('[style*="background: #fff"]');
    expect(css).toContain('[style*="background:white"]');
    expect(css).toContain('.mi-mini span,.mi-tags span');
    expect(css).toContain('.mi-fit');
    expect(css).toContain('.strategy');
    expect(css).toContain('.account');
    expect(css).toContain('.reportInlineEditor');
  });

  it('loads the latest report and Agent-ready enhancements from the Nico bootstrap', () => {
    const bootstrap = read('nico-workbench-deploy/index.html');
    expect(bootstrap).toContain('eye-theme.css?v=7');
    expect(bootstrap).toContain('report-edit.js?v=3');
    expect(bootstrap).toContain('company-report-copy.js?v=5');
    expect(bootstrap).toContain('followers-reminder.js?v=1');
    expect(bootstrap).toContain('followers-reminder.css?v=1');
    expect(bootstrap).toContain('agent-ready.js?v=1');
    expect(bootstrap).toContain('agent-ready.css?v=1');
  });
});