
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
/* Display the latest GitHub commit time in Japan time; fall back to the HTML stamp offline. */
(async function(){
  const stamp=document.getElementById('lastUpdatedStamp');
  if(!stamp)return;
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),6000);
    let response;
    try{
      response=await fetch('https://api.github.com/repos/hiderou23-spec/tsuruta-family-trip-2026/commits?sha=main&per_page=1',{
        cache:'no-store',
        headers:{Accept:'application/vnd.github+json'},
        signal:controller.signal
      });
    }finally{clearTimeout(timeout)}
    if(!response.ok) return;
    const commits=await response.json();
    const iso=commits?.[0]?.commit?.committer?.date;
    if(!iso||!Number.isFinite(Date.parse(iso)))return;
    const formatted=new Intl.DateTimeFormat('ja-JP',{
      timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit',
      hour:'2-digit',minute:'2-digit',hour12:false
    }).format(new Date(iso));
    stamp.textContent='最終更新';
    stamp.appendChild(document.createElement('br'));
    stamp.appendChild(document.createTextNode(formatted+' JST'));
  }catch(_){/* Keep the existing static stamp if the API is unavailable. */}
})();
