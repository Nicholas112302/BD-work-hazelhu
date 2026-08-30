(()=>{
'use strict';
const TRACKER_INPUT_EXPORT_VERSION='2';
const text=value=>String(value??'').trim();
const REPORT_TIMEZONE='Asia/Singapore';
const GMT8_OFFSET='+08:00';
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
function singaporeDateParts(date){
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:REPORT_TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const get=type=>parts.find(part=>part.type===type)?.value||'';
  return{date:`${get('year')}-${get('month')}-${get('day')}`,time:`${get('hour')}:${get('minute')}:${get('second')}`};
}
function publishDate(record){
  const direct=text(record?.publishDate);
  if(/^\d{4}-\d{2}-\d{2}$/.test(direct))return direct;
  const candidates=[record?.publish_time,record?.publishedAt,record?.published_at,record?.publishTime].map(text).filter(Boolean);
  for(const value of candidates){
    const prefix=value.match(/^(\d{4}-\d{2}-\d{2})/);
    if(prefix)return prefix[1];
    const parsed=new Date(value);
    if(!Number.isNaN(parsed.getTime()))return singaporeDateParts(parsed).date;
  }
  return'';
}
function completePublishTime(record){
  const date=publishDate(record);
  const values=[record?.publishTime,record?.publish_time,record?.publishedAt,record?.published_at].map(text).filter(Boolean);
  for(const value of values){
    const timeOnly=value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if(timeOnly&&date){
      const hh=String(Number(timeOnly[1])).padStart(2,'0');
      const ss=timeOnly[3]||'00';
      return `${date}T${hh}:${timeOnly[2]}:${ss}${GMT8_OFFSET}`;
    }
    const localDateTime=value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if(localDateTime){
      const hh=String(Number(localDateTime[2])).padStart(2,'0');
      return `${localDateTime[1]}T${hh}:${localDateTime[3]}:${localDateTime[4]||'00'}${GMT8_OFFSET}`;
    }
    if(/^\d{4}-\d{2}-\d{2}[ T]\d{1,2}:\d{2}/.test(value)){
      const parsed=new Date(value);
      if(!Number.isNaN(parsed.getTime())){
        const parts=singaporeDateParts(parsed);
        return `${parts.date}T${parts.time}${GMT8_OFFSET}`;
      }
    }
  }
  return date;
}
function extractPostId(url){
  const match=text(url).match(/\/video\/(\d+)/i);
  return match?match[1]:null;
}
function postId(record){
  const fromUrl=extractPostId(record?.videoLink);
  if(fromUrl)return fromUrl;
  const value=record?.post_id??record?.postId??record?.video_id??record?.videoId;
  return value==null||text(value)===''?null:text(value);
}
function canonicalVideoUrl(url){
  const raw=text(url);
  if(!raw)return'';
  try{
    const parsed=new URL(raw);
    parsed.search='';parsed.hash='';
    return parsed.toString().replace(/\/$/,'');
  }catch{
    return raw.split(/[?#]/,1)[0].replace(/\/$/,'');
  }
}
function extractUrlAccount(url){
  const match=text(url).match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^/?#]+)/i);
  if(!match)return'';
  try{return decodeURIComponent(match[1]);}catch{return match[1];}
}
function normalizedAccount(value){return text(value).replace(/^@/,'').toLowerCase();}
function dedupeKey(record){
  const id=postId(record);
  if(id)return `post:${id}`;
  return `url:${canonicalVideoUrl(record?.videoLink)}`;
}
function sortTime(record){
  const value=completePublishTime(record);
  if(/^\d{4}-\d{2}-\d{2}T/.test(value)){
    const parsed=Date.parse(value);
    if(Number.isFinite(parsed))return parsed;
  }
  const date=publishDate(record);
  return /^\d{4}-\d{2}-\d{2}$/.test(date)?Date.parse(`${date}T00:00:00${GMT8_OFFSET}`):0;
}
function buildTrackerInput(records=state.publishes||[],now=new Date()){
  const report_window=currentReportWindow(now);
  const inWindow=(records||[]).filter(record=>{const date=publishDate(record);return date>=report_window.start_date&&date<=report_window.end_date;});
  const missingLinks=inWindow.filter(record=>!text(record?.videoLink)).length;
  const seen=new Set();
  const kept=inWindow
    .filter(record=>text(record?.videoLink))
    .sort((a,b)=>sortTime(b)-sortTime(a))
    .filter(record=>{const key=dedupeKey(record);if(seen.has(key))return false;seen.add(key);return true;});
  const validation_warnings=[];
  const videos=kept.map(record=>{
    const account=text(record.account);
    const video_url=text(record.videoLink);
    const urlAccount=extractUrlAccount(video_url);
    if(urlAccount&&normalizedAccount(account)!==normalizedAccount(urlAccount)){
      validation_warnings.push({type:'account_url_mismatch',account,video_url,url_account:urlAccount});
    }
    return{account,video_url,post_id:postId(record),publish_time:completePublishTime(record)};
  });
  return{payload:{report_window,validation_warnings,videos},missingLinks,accountUrlMismatches:validation_warnings.length};
}
function downloadJson(payload,filename){
  const blob=new Blob([`${JSON.stringify(payload,null,2)}\n`],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function exportTrackerInput(){
  const {payload,missingLinks,accountUrlMismatches}=buildTrackerInput(state.publishes||[]);
  const {start_date,end_date}=payload.report_window;
  downloadJson(payload,`tracker-input-${start_date}_to_${end_date}.json`);
  if(typeof toast==='function')toast(`已导出 ${payload.videos.length} 条 Tracker Input；有 ${missingLinks} 条缺少视频链接；有 ${accountUrlMismatches} 条账号与视频链接不一致`);
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
window.NicoTrackerInputExport={version:TRACKER_INPUT_EXPORT_VERSION,currentReportWindow,buildTrackerInput,exportTrackerInput};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue,{once:true});else queue();
})();
