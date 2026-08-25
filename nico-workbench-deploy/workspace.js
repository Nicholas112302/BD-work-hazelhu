(()=>{
  const KEY='nico_active_workspace';
  const BD_URL='https://bd-work-hazelhu-byhazel.vercel.app/';
  const app=document.querySelector('.app');
  const sidebar=document.querySelector('.sidebar');
  const main=document.querySelector('.main');
  if(!app||!sidebar||!main)return;

  const brand=sidebar.querySelector('.brand');
  const switcher=document.createElement('div');
  switcher.className='workspace-switcher';
  switcher.innerHTML='<button type="button" data-workspace="media">🎬 影视运营</button><button type="button" data-workspace="bd">💼 BD 运营</button>';
  brand?.insertAdjacentElement('afterend',switcher);

  const bd=document.createElement('section');
  bd.className='workspace-bd';
  bd.innerHTML=`<div class="workspace-bd-badge">💼 Nico Workbench · BD 运营</div><div class="workspace-bd-tools"><a href="${BD_URL}" target="_blank" rel="noopener">↗ 单独打开 BD 工作台</a></div><div class="workspace-bd-fallback"><div><b>BD 工作台正在载入…</b><br>影视运营与 BD 运营的数据彼此独立。如果内嵌页面被浏览器阻止，可点右上角「单独打开 BD 工作台」。</div></div><iframe title="Nico BD Workbench" loading="eager" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  app.appendChild(bd);
  const iframe=bd.querySelector('iframe');

  const mediaSidebarChildren=[...sidebar.children].filter(el=>el!==brand&&el!==switcher);
  const set=(workspace)=>{
    const next=workspace==='bd'?'bd':'media';
    try{localStorage.setItem(KEY,next)}catch(e){}
    switcher.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.workspace===next));
    if(next==='bd'){
      main.classList.add('workspace-media-hidden');
      mediaSidebarChildren.forEach(el=>el.classList.add('workspace-media-hidden'));
      bd.classList.add('active');
      if(!iframe.src)iframe.src=BD_URL;
      document.title='Nico Workbench · BD 运营';
    }else{
      main.classList.remove('workspace-media-hidden');
      mediaSidebarChildren.forEach(el=>el.classList.remove('workspace-media-hidden'));
      bd.classList.remove('active');
      document.title='Nico Workbench';
    }
  };
  switcher.addEventListener('click',e=>{const b=e.target.closest('[data-workspace]');if(b)set(b.dataset.workspace)});
  window.NicoWorkspace={set,get:()=>{try{return localStorage.getItem(KEY)||'media'}catch(e){return 'media'}}};
  set(window.NicoWorkspace.get());
})();
