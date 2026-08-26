import fs from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';

const OUT = path.resolve('nico-workbench-deploy/news.json');
const MAX_CANDIDATES = Number(process.env.MEDIA_NEWS_MAX_CANDIDATES || 40);
const MAX_DEEP_ITEMS = Number(process.env.MEDIA_NEWS_MAX_DEEP_ITEMS || 8);
const MODEL = process.env.MEDIA_NEWS_MODEL || 'gpt-5.6-luna';
const NOW = new Date();
const TWO_DAYS = 48 * 60 * 60 * 1000;
const queries = [
  'Indonesia entertainment film sinetron aktor aktris',
  'Indonesia streaming Vidio Netflix WeTV iQIYI film series',
  'TikTok Indonesia policy copyright content entertainment',
  'Indonesia film censorship LSF KPI entertainment industry',
];
const rssUrls = queries.map(
  (q) => `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=id&gl=ID&ceid=ID:id`,
);

const strip = (s = '') =>
  s
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
const tag = (block, name) => strip(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, 'i'))?.[1] || '');
const normalize = (s = '') => strip(s).toLowerCase().replace(/[^a-z0-9\u00c0-\u024f\u4e00-\u9fff]+/g, ' ').trim();
const idFor = (s) => Buffer.from(normalize(s)).toString('base64url').slice(0, 24);

async function fetchCandidates() {
  const rows = [];
  for (const url of rssUrls) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'NicoWorkbenchMediaRadar/1.0' } });
      if (!r.ok) continue;
      const xml = await r.text();
      for (const match of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
        const block = match[1];
        const title = tag(block, 'title');
        const link = tag(block, 'link');
        const pubDate = tag(block, 'pubDate');
        const description = tag(block, 'description');
        const source = tag(block, 'source') || title.split(' - ').at(-1) || 'Google News';
        const published = new Date(pubDate || 0);
        if (!title || !link || Number.isNaN(published.getTime())) continue;
        if (NOW - published > TWO_DAYS || published > NOW) continue;
        rows.push({ title, url: link, source, date: published.toISOString().slice(0, 10), description: description.slice(0, 420) });
      }
    } catch (error) {
      console.warn('feed failed', url, error?.message || error);
    }
  }
  const seen = new Set();
  return rows
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((x) => {
      const key = normalize(x.title.replace(/\s+-\s+[^-]+$/, ''));
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_CANDIDATES);
}

async function readPrevious() {
  try {
    const raw = JSON.parse(await fs.readFile(OUT, 'utf8'));
    return Array.isArray(raw.items) ? raw.items : [];
  } catch {
    return [];
  }
}

function parseJson(text) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```$/, '').trim();
  return JSON.parse(cleaned);
}

async function classify(client, candidates) {
  if (!candidates.length) return [];
  const input = candidates.map((x, i) => ({ i, title: x.title, source: x.source, date: x.date, description: x.description }));
  const response = await client.responses.create({
    model: MODEL,
    input: [
      { role: 'system', content: 'You triage news for a TikTok short-drama operator focused on Indonesia. Return JSON only. Low-impact celebrity chatter, routine relationship gossip, promotional fluff, and small fandom updates are low. Medium means it could reasonably affect near-term actor/drama/topic choices. High means it could directly affect platform policy, censorship, copyright, major reputation risk, or broad industry attention.' },
      { role: 'user', content: `Classify each candidate as low, medium, or high. Return {"items":[{"i":0,"impact":"low|medium|high","reason":"short reason"}]}. Candidates: ${JSON.stringify(input)}` },
    ],
  });
  const parsed = parseJson(response.output_text);
  return (parsed.items || []).filter((x) => x.impact === 'medium' || x.impact === 'high');
}

async function enrich(client, selected, candidates) {
  if (!selected.length) return [];
  const chosen = selected.slice(0, MAX_DEEP_ITEMS).map((s) => ({ ...candidates[s.i], impact: s.impact, triageReason: s.reason }));
  const response = await client.responses.create({
    model: MODEL,
    input: [
      { role: 'system', content: 'You analyze medium/high-impact Indonesian entertainment and media-industry news for a TikTok short-drama operator. Do not invent facts beyond the supplied candidate. News is an auxiliary signal, not proof it will cause view changes. Return concise JSON only.' },
      { role: 'user', content: `For each item return: title, impact, summary, whyItMatters, tiktokImpact, people[], dramas[], platforms[], mentorAction. Keep wording concise and operational. Input: ${JSON.stringify(chosen)}` },
    ],
  });
  const parsed = parseJson(response.output_text);
  return (parsed.items || []).map((x, i) => {
    const src = chosen[i] || chosen.find((c) => normalize(c.title) === normalize(x.title)) || chosen[0];
    return {
      id: idFor(src.title),
      title: x.title || src.title,
      date: src.date,
      source: src.source,
      url: src.url,
      impact: x.impact === 'high' ? 'high' : 'medium',
      summary: x.summary || '',
      whyItMatters: x.whyItMatters || src.triageReason || '',
      tiktokImpact: x.tiktokImpact || '',
      people: Array.isArray(x.people) ? x.people.slice(0, 8) : [],
      dramas: Array.isArray(x.dramas) ? x.dramas.slice(0, 8) : [],
      platforms: Array.isArray(x.platforms) ? x.platforms.slice(0, 8) : [],
      mentorAction: x.mentorAction || '',
      sourceCount: 1,
      sourceCaveat: x.impact === 'high' ? '单一来源，重大影响结论建议继续观察第二来源。' : '',
    };
  });
}

async function main() {
  const previous = await readPrevious();
  const candidates = await fetchCandidates();
  if (!process.env.OPENAI_API_KEY) {
    await fs.writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), status: 'missing_api_key', items: previous }, null, 2) + '\n');
    console.log('OPENAI_API_KEY missing; preserved previous items.');
    return;
  }
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const selected = await classify(client, candidates);
    const items = await enrich(client, selected, candidates);
    await fs.writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), status: 'ok', candidateCount: candidates.length, items }, null, 2) + '\n');
    console.log(`wrote ${items.length} medium/high items from ${candidates.length} candidates`);
  } catch (error) {
    await fs.writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), status: 'error_preserved_previous', error: String(error?.message || error).slice(0, 240), items: previous }, null, 2) + '\n');
    console.error(error);
    process.exitCode = 1;
  }
}

await main();
