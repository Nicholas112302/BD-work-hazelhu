(()=>{
  try{localStorage.removeItem('nico_active_workspace')}catch(e){}
  document.querySelectorAll('.workspace-switcher').forEach(el=>el.remove());
  document.querySelectorAll('.workspace-media-hidden').forEach(el=>el.classList.remove('workspace-media-hidden'));
  document.title='Nico Workbench';
})();
