import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

describe('media-no-news observer regression', () => {
  it('does not rewrite identical text inside its own MutationObserver callback', () => {
    const js = read('nico-workbench-deploy/media-no-news.js');
    expect(js).toContain("dramaDesc.textContent!==dramaText");
    expect(js).toContain("mentorDesc.textContent!==mentorText");
  });
});
