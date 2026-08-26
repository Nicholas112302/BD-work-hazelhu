(()=>{
'use strict';
const text=x=>String(x??'').trim();
const companyCopyColumns=['市场','Month','Week','发布日期','账号','片名','产地（微剧就写微剧）','片单类型','是否爱奇艺的剧','内容制作方向','视频链接','播放量','点赞量','增粉数'];
const headers=table=>[...table.querySelectorAll('thead th')].map(th=>text(th.textContent));
const isReport=table=>{const h=headers(table);return h.includes('日期')&&h.includes('账号')&&h.includes('片名')&&h.includes('操作')};
const recordForRow=(row,h)=>{const cells=[...row.children],at=n=>{const i=h.indexOf(n);return i>=0?text(cells[i]?.textContent):''};const date=at('日期'),account=at('账号'),title=at('片名'),direction=at('内容制作方向');const matches=(state.publishes||[]).filter(r=>text(r.publishDate)===date&&text(r.account)===account&&text(r.dramaTitle)===title);return matches.find(r=>!direction||text(r.contentDirection)===direction)||matches[0]||null};
const metric=x=>x==null||Number(x)===0?'':String(x);
const typeText=r=>r.period==='现代'?'现偶':r.period==='古装'?'古偶':text(r.period);
const linkText=r=>r.videoStatus==='视频被系统判定违规，已隐藏'?'视频被系统判定违规，已隐藏':text(r.videoLink);
const companyRow=r=>[
  text(r.market)||'印尼',text(r.month),text(r.week),text(r.publishDate),text(r.account),text(r.dramaTitle),'微剧',typeText(r),text(r.isIqiyi),text(r.contentDirection),linkText(r),metric(r.views),metric(r.likes),metric(r.followersGained)
];
function visibleRecords(table){const h=headers(table);return [...table.querySelectorAll('tbody tr:not(.reportInlineEditor)')].map(row=>recordForRow(row,h)).filter(Boolean)}
async function copyVisible(table){const rows=visibleRecords(table);if(!rows.length){if(typeof toast==='function')toast('当前筛选没有可复制的记录');return}const tsv=rows.map(r=>companyRow(r).join('\t')).join('\n');await navigator.clipboard.writeText(tsv);if(typeof toast==='function')toast(`已复制 ${rows.length} 条，可直接粘贴到公司表格`)}
function ensureMetricColumns(table){let h=headers(table),op=h.indexOf('操作');if(op<0)return;const headRow=table.querySelector('thead tr');if(!headRow)return;for(const name of ['播放量','点赞量','增粉数']){h=headers(table);if(!h.includes(name)){const th=document.createElement('th');th.textContent=name;headRow.insertBefore(th,headRow.children[headers(table).indexOf('操作')])}}
  h=headers(table);op=h.indexOf('操作');table.querySelectorAll('tbody tr:not(.reportInlineEditor)').forEach(row=>{const r=recordForRow(row,h);if(!r)return;for(const [name,key] of [['播放量','views'],['点赞量','likes'],['增粉数','followersGained']]){const idx=headers(table).indexOf(name);while(row.children.length<headers(table).length){row.insertBefore(document.createElement('td'),row.children[op]||null)}const cell=row.children[idx];if(cell)cell.textContent=metric(r[key])}})
}
function ensureCopyButton(table){const wrap=table.parentElement?.parentElement||table.parentElement;if(!wrap)return;const bar=wrap.querySelector('.reportHistoryControls');if(!bar||bar.querySelector('.copyCompanyReportBtn'))return;const b=document.createElement('button');b.type='button';b.className='btn primary copyCompanyReportBtn';b.textContent='一键复制到公司表格';b.addEventListener('click',()=>copyVisible(table).catch(()=>typeof toast==='function'&&toast('复制失败，请允许浏览器访问剪贴板')));bar.appendChild(b)}
function enhance(){document.querySelectorAll('table').forEach(table=>{if(!isReport(table))return;ensureMetricColumns(table);ensureCopyButton(table)})}
let queued=false;const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})};
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});
window.companyCopyColumns=companyCopyColumns;
queue();
})();
