
(async function(){
  try{
    const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});
    if(!r.ok)return;
    const v=await r.json();
    const current=document.documentElement.dataset.build||'';
    if(v.version && current && v.version!==current){
      const u=new URL(location.href);
      if(u.searchParams.get('build')!==v.version){
        u.searchParams.set('build',v.version);
        location.replace(u.toString());
      }
    }
  }catch(_){}
})();