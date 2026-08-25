(()=>{
  const legacyDemo=r=>!!(r&&((r.isDemo===true)||(String(r.captionOriginal||'').startsWith('Demo caption ')&&/^Account 0[123]$/.test(String(r.account||'')))));
  const hasDemo=()=>state.publishes.some(legacyDemo);
  const realAccounts=()=>{
    const seen=new Set(), out=[];
    const add=x=>{x=String(x||'').trim();const k=x.toLowerCase();if(x&&!seen.has(k)){seen.add(k);out.push(x)}};
    state.publishes.filter(r=>!legacyDemo(r)).slice().reverse().forEach(r=>add(r.account));
    (state.accounts||[]).forEach(r=>add(r.account));
    return out;
  };
  const rank=(q)=>{
    q=String(q||'').trim().toLowerCase();
    const xs=realAccounts();
    if(!q)return xs.slice(0,8);
    return xs.map((name,i)=>{const n=name.toLowerCase();let score=9999;if(n===q)score=-100;else if(n.startsWith(q))score=n.length-q.length;else{const p=n.indexOf(q);if(p>=0)score=100+p;else{let qi=0,gaps=0,last=-1;for(let j=0;j<n.length&&qi<q.length;j++){if(n[j]===q[qi]){if(last>=0)gaps+=j-last-1;last=j;qi++}}if(qi===q.length)score=300+gaps+n.length}}return{name,score,i}}).filter(x=>x.score<9999).sort((a,b)=>a.score-b.score||a.i-b.i).slice(0,8).map(x=>x.name);
  };
  const clearDemo=()=>{
    const before=state.publishes.length;
    state.publishes=state.publishes.filter(r=>!legacyDemo(r));
    state.accounts=(state.accounts||[]).filter(a=>!/^Account 0[123]$/.test(String(a.account||'')));
    const n=before-state.publishes.length;
    if(n){save();toast(`已清除 ${n} 条演示数据，你自己的记录已保留`)}else toast('目前没有演示数据');
    syncTop();
  };
  const syncTop=()=>{
    const b=document.querySelector('#demoBtn'); if(!b)return;
    b.textContent=hasDemo()?'清除演示':'演示数据';
    b.onclick=()=>{if(hasDemo()){if(confirm('只删除演示数据？你自己录入的真实记录会保留。'))clearDemo()}else seedDemo()};
  };
  const enhanceAccount=()=>{
    const input=document.querySelector('#entryForm input[name="account"]'); if(!input||input.dataset.smartAccount)return;
    input.dataset.smartAccount='1'; input.removeAttribute('list'); input.autocomplete='off'; input.placeholder='输入前几个字即可搜索账号';
    document.querySelector('#accountList')?.remove();
    const wrap=document.createElement('div'); wrap.className='account-autocomplete';
    input.parentNode.insertBefore(wrap,input); wrap.appendChild(input);
    const box=document.createElement('div'); box.className='account-suggestions'; wrap.appendChild(box);
    const help=document.createElement('div'); help.className='help'; help.textContent='保存过的账号会自动记住；以后输入前几个字，最相似账号会排在最上面。'; wrap.parentNode.appendChild(help);
    const draw=()=>{const items=rank(input.value);box.innerHTML=items.map((x,i)=>`<button type="button" class="account-option ${i===0?'active':''}" data-account="${escapeHtml(x)}">${escapeHtml(x)}<small>${input.value?'点击填入此账号':'最近使用'}</small></button>`).join('');box.classList.toggle('show',items.length>0)};
    input.addEventListener('input',draw); input.addEventListener('focus',draw);
    input.addEventListener('keydown',e=>{const first=box.querySelector('.account-option');if(e.key==='Enter'&&box.classList.contains('show')&&first){e.preventDefault();input.value=first.dataset.account;box.classList.remove('show')}});
    box.addEventListener('mousedown',e=>{const b=e.target.closest('.account-option');if(!b)return;e.preventDefault();input.value=b.dataset.account;box.classList.remove('show');input.focus()});
    input.addEventListener('blur',()=>setTimeout(()=>box.classList.remove('show'),120));
  };
  const oldEntry=renderEntry; renderEntry=function(){oldEntry();enhanceAccount()};
  const oldSettings=renderSettings; renderSettings=function(){oldSettings();const demo=document.querySelector('#demo2');const clearAll=document.querySelector('#clearBtn');if(demo&&clearAll&&!document.querySelector('#clearDemoBtn')){const b=document.createElement('button');b.className='btn primary';b.id='clearDemoBtn';b.textContent='清除演示数据';b.disabled=!hasDemo();b.onclick=()=>{if(confirm('只删除演示数据？你自己录入的真实记录会保留。'))clearDemo()};clearAll.parentNode.insertBefore(b,clearAll)}};
  const oldSeed=seedDemo; seedDemo=function(){if(hasDemo()){toast('演示数据已经存在，可先清除演示数据');return}oldSeed();syncTop()};
  renderEntry(); renderSettings(); syncTop();
})();
