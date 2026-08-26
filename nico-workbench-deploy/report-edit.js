(()=>{
'use strict';
const escReport=x=>typeof escapeHtml==='function'?escapeHtml(String(x??'')):String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const reportText=el=>String(el?.textContent||'').trim();
const parseTags=x=>String(x||'').split(/[\s,，]+/).map(s=>s.trim()).filter(Boolean);
const reportHeaders=table=>[...table.querySelectorAll('thead th')].map(th=>reportText(th));
const isCompanyReportTable=table=>{const h=reportHeaders(table);return h.includes('状态')&&h.includes('日期')&&h.includes('账号')&&h.includes('片名')&&h.includes('内容制作方向')&&h.includes('操作')};
const findRecordForRow=(row,headers)=>{
  const cells=[...row.children];
  const at=name=>{const i=headers.indexOf(name);return i>=0?reportText(cells[i]):''};
  const date=at('日期'),account=at('账号'),drama=at('片名'),direction=at('内容制作方向');
  const candidates=(state.publishes||[]).filter(r=>String(r.publishDate||'')===date&&String(r.account||'')===account&&String(r.dramaTitle||'')===drama);
  return candidates.find(r=>!direction||String(r.contentDirection||'')===direction)||candidates[0]||null;
};
const option=(value,current)=>`<option value="${escReport(value)}" ${String(current||'')===value?'selected':''}>${escReport(value)}</option>`;
const buildEditor=(r,colspan)=>`<tr class="reportInlineEditor" data-report-editor="${escReport(r.id)}"><td colspan="${colspan}"><div class="reportEditorShell"><div class="reportEditorHead"><div><b>补充或修改这条发布资料</b><span>已有内容会自动带入；空缺的地方直接补上即可。</span></div><button type="button" class="btn reportCollapseBtn">收起</button></div><form class="reportInlineForm" data-id="${escReport(r.id)}"><div class="reportEditGrid">
<label>发布日期<input type="date" name="publishDate" value="${escReport(r.publishDate)}"></label>
<label>账号<input name="account" value="${escReport(r.account)}"></label>
<label>片名<input name="dramaTitle" value="${escReport(r.dramaTitle)}"></label>
<label>市场<input name="market" value="${escReport(r.market||'印尼')}"></label>
<label>微剧市场<input name="microMarket" value="${escReport(r.microMarket||r.miniMarket||'印尼')}"></label>
<label>现 / 古<select name="period">${option('现代',r.period)}${option('古装',r.period)}</select></label>
<label>爱奇艺<select name="isIqiyi">${option('是',r.isIqiyi)}${option('否',r.isIqiyi)}</select></label>
<label>发布状态<select name="videoStatus">${['正常发布','视频被系统判定违规，已隐藏','发布后自行删除','审核中','其他'].map(x=>option(x,r.videoStatus)).join('')}</select></label>
<label class="reportWide">内容制作方向<input name="contentDirection" value="${escReport(r.contentDirection)}"></label>
<label class="reportWide">Caption 原文<textarea name="captionOriginal">${escReport(r.captionOriginal||'')}</textarea></label>
<label class="reportWide">Caption 中文翻译<textarea name="captionChinese">${escReport(r.captionChinese||'')}</textarea></label>
<label class="reportWide">普通 Hashtag<input name="normalHashtags" value="${escReport(Array.isArray(r.normalHashtags)?r.normalHashtags.join(' '):r.normalHashtags)}"></label>
<label>片名 Hashtag<input name="titleHashtag" value="${escReport(r.titleHashtag)}"></label>
<label>视频链接<input name="videoLink" value="${escReport(r.videoLink)}"></label>
<label>播放量<input type="number" min="0" name="views" value="${Number(r.views||0)}"></label>
<label>点赞量<input type="number" min="0" name="likes" value="${Number(r.likes||0)}"></label>
<label>增粉数<input type="number" name="followersGained" value="${Number(r.followersGained||0)}"></label>
</div><div class="reportEditorActions"><button type="submit" class="btn primary">保存修改</button><button type="button" class="btn reportCollapseBtn">取消</button></div></form></div></td></tr>`;
const syncViralFromPublish=r=>{if(!Array.isArray(state.viralItems))return;const v=state.viralItems.find(x=>x.source==='publish_sync'&&x.publishId===r.id);if(!v)return;Object.assign(v,{account:r.account,dramaTitle:r.dramaTitle,publishDate:r.publishDate,captionOriginal:r.captionOriginal,captionChinese:r.captionChinese,contentDirection:r.contentDirection,normalHashtags:r.normalHashtags,titleHashtag:r.titleHashtag,videoLink:r.videoLink,videoStatus:r.videoStatus,updatedAt:new Date().toISOString()})};
const saveReportForm=form=>{
  const id=form.dataset.id,index=(state.publishes||[]).findIndex(r=>r.id===id);if(index<0)return;
  const old=state.publishes[index],f=new FormData(form);
  const next={...old,publishDate:String(f.get('publishDate')||''),account:String(f.get('account')||'').trim(),dramaTitle:String(f.get('dramaTitle')||'').trim(),market:String(f.get('market')||'').trim(),microMarket:String(f.get('microMarket')||'').trim(),miniMarket:String(f.get('microMarket')||'').trim(),period:String(f.get('period')||''),isIqiyi:String(f.get('isIqiyi')||''),videoStatus:String(f.get('videoStatus')||''),contentDirection:String(f.get('contentDirection')||'').trim(),captionOriginal:String(f.get('captionOriginal')||''),captionChinese:String(f.get('captionChinese')||''),normalHashtags:parseTags(f.get('normalHashtags')),titleHashtag:String(f.get('titleHashtag')||'').trim(),videoLink:String(f.get('videoLink')||'').trim(),views:Number(f.get('views')||0),likes:Number(f.get('likes')||0),followersGained:Number(f.get('followersGained')||0),updatedAt:new Date().toISOString()};
  state.publishes[index]=next;syncViralFromPublish(next);
  try{save()}catch(e){try{storageSet(K,JSON.stringify(state))}catch(_){}}
  try{window.NicoMediaIntel?.scanPublishes?.()}catch(e){}
  try{renderAll()}catch(e){}
  if(typeof toast==='function')toast('报表资料已更新');
};
const closeEditor=btn=>btn.closest('table')?.querySelector('.reportInlineEditor')?.remove();
const openEditor=btn=>{
  const table=btn.closest('table'),row=btn.closest('tr');if(!table||!row)return;
  table.querySelector('.reportInlineEditor')?.remove();
  const record=(state.publishes||[]).find(r=>r.id===btn.dataset.id);if(!record)return;
  row.insertAdjacentHTML('afterend',buildEditor(record,row.children.length));
};
function enhanceReportTable(){
  document.querySelectorAll('table').forEach(table=>{
    if(!isCompanyReportTable(table))return;
    const headers=reportHeaders(table),opIndex=headers.indexOf('操作');
    table.querySelectorAll('tbody tr:not(.reportInlineEditor)').forEach(row=>{
      if(row.dataset.reportEnhanced==='1')return;
      const record=findRecordForRow(row,headers);if(!record)return;
      const cell=row.children[opIndex];if(!cell)return;
      cell.innerHTML=`<button type="button" class="btn reportExpandBtn" data-id="${escReport(record.id)}">展开</button>`;
      row.dataset.reportEnhanced='1';
    });
  });
}
document.addEventListener('click',e=>{const expand=e.target.closest?.('.reportExpandBtn');if(expand){openEditor(expand);return}const collapse=e.target.closest?.('.reportCollapseBtn');if(collapse){closeEditor(collapse)}});
document.addEventListener('submit',e=>{const form=e.target.closest?.('.reportInlineForm');if(!form)return;e.preventDefault();saveReportForm(form)});
let reportEnhanceQueued=false;
const queueEnhance=()=>{if(reportEnhanceQueued)return;reportEnhanceQueued=true;requestAnimationFrame(()=>{reportEnhanceQueued=false;enhanceReportTable()})};
new MutationObserver(queueEnhance).observe(document.body,{childList:true,subtree:true});
window.enhanceReportTable=enhanceReportTable;
queueEnhance();
})();
