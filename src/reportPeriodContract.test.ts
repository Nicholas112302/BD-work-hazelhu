import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('Wednesday-Tuesday report period normalization', () => {
  it('derives Month and Week from publish date and repairs historical records', () => {
    const js = read('nico-workbench-deploy/period-normalizer.js');
    expect(js).toContain('periodForDate');
    expect(js).toContain('normalizePublishPeriods');
    expect(js).toContain("'2026-08-05':'202608W2'");
    expect(js).toContain("'2026-08-12':'202608W3'");
    expect(js).toContain("'2026-08-19':'202608W4'");
    expect(js).toContain("'2026-08-26':'202608W5'");
    expect(js).toContain("'2026-09-01':'202608W5'");
    expect(js).toContain('record.month=period.month');
    expect(js).toContain('record.week=period.week');
  });

  it('loads the period normalizer before Excel/report enhancement scripts', () => {
    const html = read('nico-workbench-deploy/index.html');
    expect(html).toContain('period-normalizer.js?v=1');
    expect(html.indexOf('period-normalizer.js?v=1')).toBeLessThan(
      html.indexOf('excel-import.js'),
    );
  });
});
