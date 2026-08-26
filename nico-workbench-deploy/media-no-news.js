(()=>{
'use strict';
const originalFetch=window.fetch.bind(window);
window.fetch=(input,init)=>{
  const url=typeof input==='string'?input:(input&&input.url)||'';
  if(/(?:^|\/)news\.json(?:[?#]|$)/.test(url))return Promise.reject(new Error('News radar disabled'));
  return originalFetch(input,init);
};
const stripNews=()=>{
  document.querySelectorAll('.nav[data-route="news"],#page-news').forEach(n=>n.remove());
  const dramaDesc=document.querySelector('#page-drama-library .desc');
  if(dramaDesc)dramaDesc.textContent='把库存剧、待剪剧和历史剧放在这里；系统结合账号表现、爆款与风险，判断更适合哪个 TikTok 账号。';
  const mentorDesc=document.querySelector('#miMentorPanel p');
  if(mentorDesc)mentorDesc.textContent='把历史爆款、近期发布、片单和违规风险一起交给 Mentor；Hashtag 只作为信号，不是因果证明。';
};
new MutationObserver(stripNews).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('#miCopyMentor');
  if(!btn)return;
  e.preventDefault();
  e.stopImmediatePropagation();
  const raw=window.NicoMediaIntel?.buildMentorEvidence?.();
  if(!raw)return;
  const data={...raw};
  delete data.industryNews;
  if(Array.isArray(data.interpretationGuardrails))data.interpretationGuardrails=data.interpretationGuardrails.filter(x=>!String(x).includes('行业新闻'));
  const text=JSON.stringify(data,null,2);
  navigator.clipboard?.writeText(text);
  const old=btn.textContent;
  btn.textContent='已复制';
  setTimeout(()=>{btn.textContent=old},1000);
},true);
queueMicrotask(stripNews);
})();
