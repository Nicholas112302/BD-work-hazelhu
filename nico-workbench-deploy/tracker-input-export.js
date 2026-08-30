(()=>{
'use strict';
const text=value=>String(value??'').trim();
const REPORT_TIMEZONE='Asia/Singapore';
const ymd=date=>`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}-${String(date.getUTCDate()).padStart(2,'0')}`;
function singaporeToday(now=new Date()){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:REPORT_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get=type=>Number(parts.find(part=>part.type===type)?.value||0);
  return new Date(Date.UTC(get('year'),get('month')-1,get('day')));
}
function currentReportWindow(now=new Date()){
  const today=singaporeToday(now);
  const daysSinceWednesday=(today.getUTCDay()-3+7)%7;
  const start=new Date(today);
  start.setUTCDate(start.getUTCDate()-daysSinceWednesday);
  const end=new Date(start);
  end.setUTCDate(end.getUTCDate()+6);
  return{start_date:ymd(start),end_date:ymd(end),timezone:'GMT+8'};
}
function publishTime(record){
  return text(record?.publishTime||record?.publish_time||record?.publishedAt||record?.published_at||record?.publishDate);
}
function publishDate(record){
  const direct=text(record?.publishDate);
  if(/^\d{4}-\d{2}-\d{2}$/.test(direct))return direct;
  const value=publishTime(record);
  if(!value)return'';
  const parsed=new Date(value);
  if(Number.isNaN(parsed.getTime()))return /^\d{4}-\d{2}-\d{2}/.test(value)?value.slice(0,10):'';
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:REPORT_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(parsed);
  const get=type=>parts.find(part=>part.type===type)?.value||'';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function postId(record){
  const value=record?.post_id??record?.postId??record?.video_id??record?.videoId;
  return value==null||text(value)===''?null:value;
}
function sortTime(record){
  const value=publishTime(record);
  const parsed=Date.parse(value);
  if(Number.isFinite(parsed))return parsed;
  const date=publishDate(record);
  return /^\d{4}-\d{2}-\d{2}$/.test(date)?Date.parse(`${date}T00:00:00+08:00`):0;
}
function buildTrackerInput(records=state.publishes||[],now=new Date()){
  const report_window=currentReportWindow(now);
  const inWindow=(records||[]).filter(record=>{const date=publishDate(record);return date>=report_window.start_date&&date<=report_window.end_date;});
  const missingLinks=inWindow.filter(record=>!text(record?.videoLink)).length;
  const seen=new Set();
  const videos=inWindow
    .filter(record=>text(record?.videoLink))
    .sort((a,b)=>sortTime(b)-sortTime(a))
    .filter(record=>{const url=text(record.videoLink);if(seen.has(url))return false;seen.add(url);return true;})
    .map(record=>({account:text(record.account),video_url:text(record.videoLink),post_id:postId(record),publish_time:publishTime(record)}));
  return{payload:{report_window,videos},missingLinks};
}
function downloadJson(payload,filename){
  const blob=new Blob([`${JSON.stringify(payload,null,2)}\n`],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function exportTrackerInput(){
  const {payload,missingLinks}=buildTrackerInput(state.publishes||[]);
  const {start_date,end_date}=payload.report_window;
  downloadJson(payload,`tracker-input-${start_date}_to_${end_date}.json`);
  if(typeof toast==='function')toast(`已导出 ${payload.videos.length} 条 Tracker Input；有 ${missingLinks} 条缺少视频链接`);
}
function ensureButton(){
  document.querySelectorAll('.reportHistoryControls').forEach(bar=>{
    if(bar.querySelector('.trackerInputExportBtn'))return;
    const button=document.createElement('button');
    button.type='button';button.className='btn trackerInputExportBtn';button.textContent='导出 Tracker Input';
    button.addEventListener('click',exportTrackerInput);
    const copyButton=bar.querySelector('.copyCompanyReportBtn');
    if(copyButton)copyButton.insertAdjacentElement('afterend',button);else bar.appendChild(button);
  });
}
let queued=false;
const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;ensureButton()})};
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});
window.NicoTrackerInputExport={currentReportWindow,buildTrackerInput,exportTrackerInput};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
})();
