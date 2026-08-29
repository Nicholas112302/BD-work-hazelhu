(()=>{
'use strict';
const text=x=>String(x??'').trim();
const hasFollowersRecorded=r=>r?.followersGainedRecorded===true||Number(r?.followersGained||0)!==0;
function enhanceEditors(){
  document.querySelectorAll('.reportInlineForm').forEach(form=>{
    const input=form.querySelector('[name="followersGained"]');
    if(!input||input.dataset.followersCompletionEnhanced==='1')return;
    const r=(state.publishes||[]).find(x=>x.id===form.dataset.id);
    if(!r)return;
    input.dataset.followersCompletionEnhanced='1';
    if(!hasFollowersRecorded(r)&&Number(r.followersGained||0)===0)input.value='';
    input.placeholder='本周报统一补填；实际为 0 请填写 0';
  });
}
document.addEventListener('submit',e=>{
  const form=e.target.closest?.('.reportInlineForm');
  if(!form)return;
  const input=form.querySelector('[name="followersGained"]');
  const r=(state.publishes||[]).find(x=>x.id===form.dataset.id);
  if(!input||!r)return;
  const raw=text(input.value);
  r.followersGainedRecorded=raw!=='';
},true);
let queued=false;
const queue=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhanceEditors()})};
new MutationObserver(queue).observe(document.body,{childList:true,subtree:true});
window.hasFollowersRecorded=hasFollowersRecorded;
queue();
})();
