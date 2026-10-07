
(async function(){
  try{
    const here=document.documentElement.dataset.build||'';
    const probe=location.pathname+'?__latest='+Date.now();
    const html=await fetch(probe,{cache:'no-store'}).then(r=>r.text());
    const m=html.match(/data-build="([^"]+)"/);
    const latest=m&&m[1];
    if(latest && here && latest!==here){
      const u=new URL(location.href);
      u.searchParams.set('build',latest);
      u.searchParams.set('_',Date.now());
      location.replace(u.toString());
    }
  }catch(_){}
})();