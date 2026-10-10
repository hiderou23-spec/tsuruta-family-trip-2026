(function(){
  const api=()=>window.tripFamilyAuthApi;
  const profile=()=>window.tripFamilyAuth;
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const docId=k=>encodeURIComponent(k).replace(/%/g,'_');
  let notifUnsub=null;

  const style=document.createElement('style');
  style.textContent=
    '.co-badge{display:inline-flex;align-items:center;margin-left:6px;padding:2px 7px;border-radius:999px;font-size:10px;font-weight:900;background:#f2eff6;color:#6d7890;border:1px solid #e2dcea;vertical-align:middle}'+
    '.co-badge.unread{background:#bd665c;color:#fff;border-color:#bd665c}'+
    '.co-comments{font-size:10.5px;font-weight:850;color:#68748a;margin-left:2px}';
  document.head.appendChild(style);

  function titleOf(item){
    return (item.querySelector('.title')?.childNodes[0]?.textContent||item.querySelector('.title')?.textContent||'').trim();
  }
  function keyOf(item){
    return (item.closest('.section')?.id||'')+'|'+titleOf(item);
  }
  function itemById(id){
    return [...document.querySelectorAll('.item')].find(item=>docId(keyOf(item))===id);
  }
  function setCount(item,count){
    const entry=item?.querySelector('.fc-entry');if(!entry)return;
    let c=entry.querySelector('.co-comments');
    if(!c){c=document.createElement('span');c.className='co-comments';entry.appendChild(c)}
    c.textContent=count>0?'💬 '+count+'件':'';
  }
  function setUnread(item,count){
    const title=item?.querySelector('.title');if(!title)return;
    let b=title.querySelector('.co-badge');
    if(count>0){
      if(!b){b=document.createElement('span');b.className='co-badge unread';title.appendChild(b)}
      b.className='co-badge unread';b.textContent='未読 '+count;
    }else if(b){b.remove()}
  }
  async function loadCounts(){
    const a=api();if(!a?.db||!a?.fs||!profile()?.authenticated)return;
    const items=[...document.querySelectorAll('.item')].filter(x=>x.querySelector('.fc-entry'));
    await Promise.all(items.map(async item=>{
      try{
        const base=a.fs.doc(a.db,'trip_items',docId(keyOf(item)));
        const snap=await a.fs.getDocs(a.fs.collection(base,'comments'));
        setCount(item,snap.size);
      }catch(_){}
    }));
  }
  function subscribeUnread(){
    if(notifUnsub){notifUnsub();notifUnsub=null}
    document.querySelectorAll('.co-badge.unread').forEach(x=>x.remove());
    const a=api(),p=profile();if(!a?.db||!a?.fs||!p?.authenticated)return;
    const col=a.fs.collection(a.db,'family_notifications',p.uid,'items');
    notifUnsub=a.fs.onSnapshot(col,snap=>{
      const by={};
      snap.forEach(x=>{const d=x.data()||{};if(d.read!==true&&d.itemId)by[d.itemId]=(by[d.itemId]||0)+1});
      Object.entries(by).forEach(([id,n])=>setUnread(itemById(id),n));
      document.querySelectorAll('.item .co-badge.unread').forEach(b=>{
        const item=b.closest('.item'),id=docId(keyOf(item));
        if(!by[id])b.remove();
      });
    },()=>{});
  }
  function refresh(){
    setTimeout(()=>{loadCounts();subscribeUnread()},450);
  }
  document.addEventListener('tripFamilyAuthReady',refresh);
  document.addEventListener('tripSharedPlanningUpdated',()=>setTimeout(loadCounts,250));
  setTimeout(refresh,1300);
  window.tripCommentOverview={refresh};
})();