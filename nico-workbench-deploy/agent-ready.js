(()=>{
'use strict';
const STORAGE_KEY='nico_agent_ready_v1';
const TRUST={'agent-generated':1,'verifier-verified':2,'human-confirmed':3};
const PROTECTED_FIELDS=new Set(['followersGained','followersGainedRecorded','humanPostmortem','humanStrategyNotes','humanConfirmedDrama','humanConfirmedContentDirection','humanDecision','humanConfirmedClipMatch','strategyOutcome']);
const AGENTS=['Tracker','Media Scout','Verifier','Strategy'];
const CLIP_STATUSES=['received','ready_for_review','waiting_media_scout','processing','media_scout_completed','recommended','test','pending_publish','published','deferred','rejected','duplicate','needs_review'];
const now=()=>new Date().toISOString();
const uid=(prefix)=>`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
const defaultRuntime=()=>Object.fromEntries(AGENTS.map(name=>[name,{status:'not_connected',lastRun:null,lastSuccessfulRun:null,processedCount:0,pendingCount:0,lastError:null}]));
const defaultState=()=>({version:1,activityLog:[],clips:[],agentInbox:[],agentRuntime:defaultRuntime()});
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return defaultState();
    const parsed=JSON.parse(raw);
    return {...defaultState(),...parsed,activityLog:Array.isArray(parsed.activityLog)?parsed.activityLog:[],clips:Array.isArray(parsed.clips)?parsed.clips:[],agentInbox:Array.isArray(parsed.agentInbox)?parsed.agentInbox:[],agentRuntime:{...defaultRuntime(),...(parsed.agentRuntime||{})}};
  }catch(e){console.warn('[AgentReady] state reset after parse failure',e);return defaultState();}
}
let state=load();
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){console.warn('[AgentReady] save failed',e);}render();}
function log(action_type,entity_type,entity_id,summary,metadata={},actor='human'){
  const entry={id:uid('activity'),timestamp:now(),actor,action_type,entity_type,entity_id,summary,metadata};
  state.activityLog.push(entry);save();return entry;
}
function addClip(input={}){
  const clip={clip_id:input.clip_id||uid('clip'),drama_id:input.drama_id||'',source_filename:input.source_filename||'未命名素材',created_at:input.created_at||now(),duration_seconds:input.duration_seconds??null,media_hash:input.media_hash||'',fingerprint:input.fingerprint||'',status:CLIP_STATUSES.includes(input.status)?input.status:'ready_for_review',human_decision:input.human_decision||'',recommended_accounts:Array.isArray(input.recommended_accounts)?input.recommended_accounts:[],published_account:input.published_account||'',tiktok_url:input.tiktok_url||'',published_at:input.published_at||null,source_provenance:input.source_provenance||'human-confirmed',media_scout_result:input.media_scout_result||null};
  state.clips.push(clip);log('clip_added','clip',clip.clip_id,`加入素材：${clip.source_filename}`,{status:clip.status});return clip;
}
function updateClip(id,patch,actor='human'){
  const clip=state.clips.find(x=>x.clip_id===id);if(!clip)return null;
  Object.assign(clip,patch);log('clip_updated','clip',id,`更新素材：${clip.source_filename}`,patch,actor);return clip;
}
function submitMediaScout(id){
  const clip=state.clips.find(x=>x.clip_id===id);if(!clip)return null;
  if(!['ready_for_review','media_scout_completed','needs_review'].includes(clip.status))return clip;
  clip.status='waiting_media_scout';
  const inbox={id:uid('inbox'),agent:'media-scout',entity_type:'clip',entity_key:id,payload:{review_requested:true,source_filename:clip.source_filename,drama_id:clip.drama_id},created_at:now(),verification_status:'pending',issues:[],reviewed_at:null};
  state.agentInbox.push(inbox);
  log('media_scout_review_requested','clip',id,`送交 Media Scout 审核：${clip.source_filename}`,{inbox_id:inbox.id});
  return clip;
}
function mergeTrusted(existing,incoming,{incomingTrust='agent-generated',fieldTrust={}}={}){
  const result={...existing};const conflicts=[];
  for(const [key,value] of Object.entries(incoming||{})){
    const currentTrust=fieldTrust[key]||existing?.__provenance?.[key]||'agent-generated';
    const protectedFromAutomation=PROTECTED_FIELDS.has(key)&&incomingTrust!=='human-confirmed';
    if(protectedFromAutomation||((TRUST[incomingTrust]||0)<(TRUST[currentTrust]||0)&&existing?.[key]!==undefined&&existing[key]!==value)){
      conflicts.push({field:key,kept:existing?.[key],rejected:value,currentTrust,incomingTrust});continue;
    }
    result[key]=value;
  }
  if(conflicts.length){result.__needsReview=true;result.__conflicts=conflicts;}
  return result;
}
function setAgentRuntime(name,patch){if(!AGENTS.includes(name))return;state.agentRuntime[name]={...state.agentRuntime[name],...patch};save();}
function counts(){return {pendingClips:state.clips.filter(x=>['ready_for_review','waiting_media_scout','processing','media_scout_completed','needs_review'].includes(x.status)&&!x.human_decision).length,pendingInbox:state.agentInbox.filter(x=>x.verification_status==='pending').length,needsReview:state.agentInbox.filter(x=>x.verification_status==='needs_review').length+state.clips.filter(x=>x.status==='needs_review').length};}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function ensureShell(){
  let launcher=document.getElementById('agentReadyLauncher');
  if(!launcher){launcher=document.createElement('button');launcher.id='agentReadyLauncher';launcher.className='agent-ready-launcher';launcher.type='button';launcher.innerHTML='✦ <span>Agent Center</span>';launcher.addEventListener('click',()=>document.getElementById('agentReadyPanel')?.classList.toggle('is-open'));const sidebar=document.querySelector('.sidebar');(sidebar||document.body).appendChild(launcher);}
  let panel=document.getElementById('agentReadyPanel');
  if(!panel){panel=document.createElement('section');panel.id='agentReadyPanel';panel.className='agent-ready-panel';panel.innerHTML='<div class="agent-ready-head"><div><small>HERMES FOUNDATION</small><h2>Agent Center</h2><p>目前尚未连接 VPS API；这里只准备数据契约、素材送审队列与人工审核边界。</p></div><button type="button" class="agent-ready-close" aria-label="关闭">×</button></div><div id="agentReadyContent"></div><div class="rayan-decor rayan-decor-panel" aria-hidden="true"></div>';panel.querySelector('.agent-ready-close')?.addEventListener('click',()=>panel.classList.remove('is-open'));document.body.appendChild(panel);}
}
function statusLabel(status){return ({not_connected:'未连接',idle:'空闲',running:'运行中',warning:'需注意',error:'错误'})[status]||status;}
function render(){
  ensureShell();const root=document.getElementById('agentReadyContent');if(!root)return;const c=counts();
  root.innerHTML=`<div class="agent-ready-summary"><div><b>${c.pendingClips}</b><span>待素材决定</span></div><div><b>${c.pendingInbox}</b><span>Agent Inbox</span></div><div><b>${c.needsReview}</b><span>Needs Review</span></div></div>
  <div class="agent-ready-grid">${AGENTS.map(name=>{const r=state.agentRuntime[name];return `<article class="agent-role"><div><strong>${esc(name)}</strong><span class="agent-status" data-status="${esc(r.status)}">${esc(statusLabel(r.status))}</span></div><small>上次运行：${esc(r.lastRun||'—')}</small><small>已处理：${esc(r.processedCount||0)} · 待处理：${esc(r.pendingCount||0)}</small></article>`}).join('')}</div>
  <section class="agent-material"><div class="agent-section-title"><div><small>MATERIAL REVIEW</small><h3>素材 → Media Scout</h3></div><span>上传/加入素材不会自动调用 AI</span></div><form id="agentClipForm"><input name="filename" placeholder="素材文件名，例如 episode12_hookA.mp4" required><input name="drama" placeholder="剧名（可选）"><button type="submit">加入素材</button></form><div class="agent-clip-list">${state.clips.length?state.clips.slice().reverse().map(clip=>`<article class="agent-clip"><div><strong>${esc(clip.source_filename)}</strong><small>${esc(clip.drama_id||'未绑定剧名')} · ${esc(clip.status)}</small></div><div class="agent-clip-actions">${['ready_for_review','media_scout_completed','needs_review'].includes(clip.status)?`<button type="button" data-submit-scout="${esc(clip.clip_id)}">送交 Media Scout 审核</button>`:''}${clip.status==='waiting_media_scout'?'<span class="agent-wait">等待 Hermes 连接</span>':''}<button type="button" data-decision="deferred" data-clip="${esc(clip.clip_id)}">暂缓</button><button type="button" data-decision="rejected" data-clip="${esc(clip.clip_id)}">不采用</button></div></article>`).join(''):'<div class="agent-empty">还没有素材。V1 先记录元数据；真正影片上传与 FFmpeg 会在 VPS 接入阶段启用。</div>'}</div></section>
  <section class="agent-activity"><div class="agent-section-title"><div><small>ACTIVITY LOG</small><h3>最近动作</h3></div></div>${state.activityLog.length?state.activityLog.slice(-6).reverse().map(x=>`<div class="agent-log"><span>${esc(new Date(x.timestamp).toLocaleString())}</span><b>${esc(x.summary)}</b></div>`).join(''):'<div class="agent-empty">暂无动作记录</div>'}</section>`;
  const form=root.querySelector('#agentClipForm');form?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(form);addClip({source_filename:String(fd.get('filename')||''),drama_id:String(fd.get('drama')||'')});});
  root.querySelectorAll('[data-submit-scout]').forEach(btn=>btn.addEventListener('click',()=>submitMediaScout(btn.getAttribute('data-submit-scout'))));
  root.querySelectorAll('[data-decision]').forEach(btn=>btn.addEventListener('click',()=>updateClip(btn.getAttribute('data-clip'),{human_decision:btn.getAttribute('data-decision'),status:btn.getAttribute('data-decision')==='rejected'?'rejected':'deferred'})));
}
window.NicoAgentReady={getState:()=>JSON.parse(JSON.stringify(state)),addClip,updateClip,submitMediaScout,mergeTrusted,setAgentRuntime,log,counts,PROTECTED_FIELDS:[...PROTECTED_FIELDS],TRUST:{...TRUST}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
