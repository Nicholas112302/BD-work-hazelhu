(()=>{
'use strict';
const PERIOD_EXAMPLES={'2026-08-05':'202608W2','2026-08-12':'202608W3','2026-08-19':'202608W4','2026-08-26':'202608W5','2026-09-01':'202608W5'};
const pad2=n=>String(n).padStart(2,'0');
const parseDate=value=>{const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m)return null;return new Date(Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3])))};
function periodForDate(value){
  const date=parseDate(value);if(!date)return null;
  const day=date.getUTCDay();
  const daysBackToWednesday=(day-3+7)%7;
  const wednesday=new Date(date);wednesday.setUTCDate(wednesday.getUTCDate()-daysBackToWednesday);
  const midpoint=new Date(wednesday);midpoint.setUTCDate(midpoint.getUTCDate()+3);
  const year=midpoint.getUTCFullYear(),monthNumber=midpoint.getUTCMonth()+1;
  const weekNumber=Math.floor((midpoint.getUTCDate()-1)/7)+1;
  return {month:String(monthNumber),week:`${year}${pad2(monthNumber)}W${weekNumber}`};
}
function normalizePublishPeriods(){
  if(typeof state==='undefined'||!Array.isArray(state.publishes))return false;
  let changed=false;
  state.publishes.forEach(record=>{
    const period=periodForDate(record.publishDate);if(!period)return;
    if(String(record.month||'')!==period.month){record.month=period.month;changed=true}
    if(String(record.week||'')!==period.week){record.week=period.week;changed=true}
  });
  return changed;
}
let normalizing=false;
function normalizeAndPersist(){
  if(normalizing)return;
  normalizing=true;
  try{
    if(normalizePublishPeriods()){
      try{save()}catch(e){try{storageSet(K,JSON.stringify(state))}catch(_){}}
      try{renderAll()}catch(e){}
    }
  }finally{normalizing=false}
}
window.NicoPeriod={periodForDate,normalizePublishPeriods,examples:PERIOD_EXAMPLES};
normalizeAndPersist();
new MutationObserver(normalizeAndPersist).observe(document.body,{childList:true,subtree:true});
})();
