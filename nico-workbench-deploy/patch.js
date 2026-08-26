(()=>{
  const legacyDemo=r=>!!(r&&((r.isDemo===true)||(String(r.captionOriginal||'').startsWith('Demo caption ')&&/^Account 0[123]$/.test(String(r.account||'')))));
  const hasDemo=()=>state.publishes.some(legacyDemo);
  const escAttr=x=>escapeHtml(String(x??''));
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
    save();
    if(n)toast(`已清空 ${n} 条演示数据，你自己的记录已保留`);else toast('目前没有演示数据');
    syncTop();
    if(document.querySelector('#page-settings.active'))renderSettings();
  };
  const syncTop=()=>{
    const b=document.querySelector('#demoBtn'); if(!b)return;
    b.textContent=hasDemo()?'清空演示':'演示数据';
    b.onclick=()=>{if(hasDemo()){if(confirm('只清空演示数据？你自己录入的真实记录会保留。'))clearDemo()}else seedDemo()};
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
  const parseHashtags=x=>String(x||'').split(/[\s,，]+/).map(s=>s.trim()).filter(Boolean);
  const refreshAfterPublishChange=()=>{
    save();
    try{window.NicoMediaIntel?.scanPublishes?.()}catch(e){}
    try{renderAll()}catch(e){renderEntry()}
  };
  const deletePublishRecord=id=>{
    const row=state.publishes.find(r=>r.id===id);if(!row)return;
    if(!confirm(`确定删除这条发布记录吗？\n${row.dramaTitle||'未填片名'} · ${row.account||'未填账号'}\n\n删除后无法撤回。`))return;
    state.publishes=state.publishes.filter(r=>r.id!==id);
    if(Array.isArray(state.viralItems))state.viralItems=state.viralItems.filter(v=>!(v.source==='publish_sync'&&v.publishId===id));
    refreshAfterPublishChange();
    toast('发布记录已删除');
  };
  const editPublishRecord=id=>{
    const index=state.publishes.findIndex(r=>r.id===id);if(index<0)return;
    const r=state.publishes[index];
    showModal('编辑记录',`<form id="editPublishForm"><div class="formGrid">
      <div class="field"><label>发布日期</label><input type="date" name="publishDate" value="${escAttr(r.publishDate)}"></div>
      <div class="field"><label>账号</label><input name="account" value="${escAttr(r.account)}" required></div>
      <div class="field"><label>片名</label><input name="dramaTitle" value="${escAttr(r.dramaTitle)}" required></div>
      <div class="field"><label>现偶 / 古偶</label><select name="period"><option value="现代" ${r.period==='现代'?'selected':''}>现代</option><option value="古装" ${r.period==='古装'?'selected':''}>古装</option></select></div>
      <div class="field"><label>是否爱奇艺</label><select name="isIqiyi"><option value="是" ${String(r.isIqiyi)==='是'?'selected':''}>是</option><option value="否" ${String(r.isIqiyi)!=='是'?'selected':''}>否</option></select></div>
      <div class="field"><label>发布状态</label><select name="videoStatus">${['正常发布','视频被系统判定违规，已隐藏','发布后自行删除','审核中','其他'].map(x=>`<option ${r.videoStatus===x?'selected':''}>${x}</option>`).join('')}</select></div>
      <div class="field full"><label>内容运营方向</label><input name="contentDirection" value="${escAttr(r.contentDirection)}"></div>
      <div class="field full"><label>Caption 原文</label><textarea name="captionOriginal">${escapeHtml(r.captionOriginal||'')}</textarea></div>
      <div class="field full"><label>Caption 中文翻译</label><textarea name="captionChinese">${escapeHtml(r.captionChinese||'')}</textarea></div>
      <div class="field full"><label>普通 Hashtag</label><input name="normalHashtags" value="${escAttr(Array.isArray(r.normalHashtags)?r.normalHashtags.join(' '):r.normalHashtags)}"></div>
      <div class="field"><label>片名 Hashtag</label><input name="titleHashtag" value="${escAttr(r.titleHashtag)}"></div>
      <div class="field"><label>视频链接</label><input name="videoLink" value="${escAttr(r.videoLink)}"></div>
      <div class="field"><label>播放量</label><input type="number" min="0" name="views" value="${Number(r.views||0)}"></div>
      <div class="field"><label>点赞量</label><input type="number" min="0" name="likes" value="${Number(r.likes||0)}"></div>
      <div class="field"><label>增粉数</label><input type="number" name="followersGained" value="${Number(r.followersGained||0)}"></div>
    </div><div class="heroActions"><button class="btn primary">保存修改</button></div></form>`);
    const form=document.querySelector('#editPublishForm');
    if(!form)return;
    form.onsubmit=e=>{
      e.preventDefault();const f=new FormData(form),oldId=r.id;
      const next={...r,publishDate:String(f.get('publishDate')||''),account:String(f.get('account')||'').trim(),dramaTitle:String(f.get('dramaTitle')||'').trim(),period:String(f.get('period')||''),isIqiyi:String(f.get('isIqiyi')||''),videoStatus:String(f.get('videoStatus')||''),contentDirection:String(f.get('contentDirection')||'').trim(),captionOriginal:String(f.get('captionOriginal')||''),captionChinese:String(f.get('captionChinese')||''),normalHashtags:parseHashtags(f.get('normalHashtags')),titleHashtag:String(f.get('titleHashtag')||'').trim(),videoLink:String(f.get('videoLink')||'').trim(),views:Number(f.get('views')||0),likes:Number(f.get('likes')||0),followersGained:Number(f.get('followersGained')||0),updatedAt:new Date().toISOString()};
      state.publishes[index]=next;
      if(Array.isArray(state.viralItems)){const v=state.viralItems.find(x=>x.source==='publish_sync'&&x.publishId===oldId);if(v){v.account=next.account;v.dramaTitle=next.dramaTitle;v.publishDate=next.publishDate;v.captionOriginal=next.captionOriginal;v.captionChinese=next.captionChinese;v.contentDirection=next.contentDirection;v.normalHashtags=next.normalHashtags;v.titleHashtag=next.titleHashtag;v.videoLink=next.videoLink;v.videoStatus=next.videoStatus;v.updatedAt=new Date().toISOString()}}
      document.querySelector('#modal')?.classList.remove('show');
      refreshAfterPublishChange();
      toast('发布记录已更新');
    };
  };
  const enhanceRecentPublishes=()=>{
    const page=document.querySelector('#page-entry');if(!page)return;
    page.querySelector('#recentPublishEditor')?.remove();
    const rows=state.publishes.filter(r=>!legacyDemo(r)).slice().sort((a,b)=>String(b.publishDate||'').localeCompare(String(a.publishDate||''))).slice(0,12);
    const panel=document.createElement('div');panel.id='recentPublishEditor';panel.className='panel';panel.style.marginTop='18px';
    panel.innerHTML=`<div class="panelHead"><div><h3>最近发布记录</h3><div class="desc">填错资料可以直接编辑，不需要重新新增一条。</div></div></div>${rows.length?`<div class="tableWrap"><table><thead><tr><th>日期</th><th>账号</th><th>片名</th><th>播放</th><th>操作</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${escapeHtml(r.publishDate||'—')}</td><td>${escapeHtml(r.account||'—')}</td><td>${escapeHtml(r.dramaTitle||'—')}</td><td>${Number(r.views||0).toLocaleString()}</td><td><div class="heroActions"><button type="button" class="btn editPublishBtn" data-id="${escAttr(r.id)}">编辑记录</button><button type="button" class="btn deletePublishBtn" data-id="${escAttr(r.id)}">删除记录</button></div></td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">还没有真实发布记录。</div>'}`;
    page.appendChild(panel);
    panel.querySelectorAll('.editPublishBtn').forEach(b=>b.onclick=()=>editPublishRecord(b.dataset.id));
    panel.querySelectorAll('.deletePublishBtn').forEach(b=>b.onclick=()=>deletePublishRecord(b.dataset.id));
  };
  const hideMotivationMeta=()=>{
    document.querySelectorAll('body *').forEach(el=>{
      if(el.children.length)return;
      const text=(el.textContent||'').trim();
      if(text.startsWith('今日鼓励语 · Day')||text==='365 天自动换，不用手动') el.style.display='none';
    });
  };
  const oldEntry=renderEntry; renderEntry=function(){oldEntry();enhanceAccount();enhanceRecentPublishes()};
  const oldSettings=renderSettings; renderSettings=function(){oldSettings();const demo=document.querySelector('#demo2');const clearAll=document.querySelector('#clearBtn');let b=document.querySelector('#clearDemoBtn');if(demo&&clearAll&&!b){b=document.createElement('button');b.className='btn primary';b.id='clearDemoBtn';clearAll.parentNode.insertBefore(b,clearAll)}if(b){b.textContent='清空演示数据';b.disabled=!hasDemo();b.onclick=()=>{if(confirm('只清空演示数据？你自己录入的真实记录会保留。'))clearDemo()}}};
  const oldSeed=seedDemo; seedDemo=function(){if(hasDemo()){toast('演示数据已经存在，可先清空演示数据');return}oldSeed();syncTop();if(document.querySelector('#page-settings.active'))renderSettings()};
  window.editPublishRecord=editPublishRecord;
  window.deletePublishRecord=deletePublishRecord;
  new MutationObserver(()=>hideMotivationMeta()).observe(document.body,{childList:true,subtree:true});
  renderEntry(); renderSettings(); syncTop(); hideMotivationMeta();
})();