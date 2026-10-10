(function(){
  let commentsUnsubs=[],notifUnsub=null,comments=[],unreadByComment={},replyNotices={},filter='all',commentBuckets=new Map();
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const api=()=>window.tripFamilyAuthApi;
  const profile=()=>window.tripFamilyAuth;

  const style=document.createElement('style');
  style.textContent=`
    #familyHubOverlay{position:fixed;inset:0 0 calc(69px + env(safe-area-inset-bottom)) 0;z-index:1850;background:#fffaf6;display:none;overflow:auto;-webkit-overflow-scrolling:touch}
    #familyHubOverlay .fh-shell{max-width:760px;margin:0 auto;min-height:100%;padding-bottom:24px;background:linear-gradient(180deg,#fffaf6,#f9fbff 62%,#fff)}
    .fh-head{position:sticky;top:0;z-index:3;background:rgba(255,250,246,.97);backdrop-filter:blur(10px);border-bottom:1px solid #e9e2ed;padding:14px 16px}
    .fh-title{font-size:20px;font-weight:900;color:#273247}.fh-sub{font-size:11px;color:#8b8295;margin-top:3px}
    .fh-body{padding:12px 14px 28px}.fh-card{background:#fff;border:1px solid #e8e1eb;border-radius:16px;padding:14px;margin:10px 0;box-shadow:0 5px 14px rgba(82,76,110,.05)}
    .fh-toolbar{display:flex;gap:7px;align-items:center;flex-wrap:wrap}.fh-filter{border:1px solid #ddd7e8;background:#fff;color:#647087;border-radius:999px;padding:7px 11px;font:inherit;font-size:11px;font-weight:850}.fh-filter.active{background:#eee8f7;color:#5f527c;border-color:#cec0e2}
    .fh-plan-btn{margin-left:auto;border:0;background:#eef4ff;color:#526b92;border-radius:11px;padding:8px 11px;font:inherit;font-size:11px;font-weight:850}
    .fh-comment{width:100%;text-align:left;border:1px solid #e8e1eb;background:#fff;border-radius:15px;padding:12px;margin:9px 0;box-shadow:0 4px 12px rgba(82,76,110,.04);font:inherit;color:inherit}
    .fh-comment.unread{border-color:#edc7bc;background:#fffaf8;box-shadow:inset 3px 0 0 #bd665c,0 4px 12px rgba(82,76,110,.04)}
    .fh-top{display:flex;align-items:center;gap:7px;flex-wrap:wrap}.fh-who{font-size:12px;font-weight:900;color:#35415a}.fh-unread{font-size:9.5px;font-weight:900;color:#fff;background:#bd665c;border-radius:999px;padding:2px 6px}.fh-time{margin-left:auto;font-size:10px;color:#9a92a1}
    .fh-date{font-size:10px;color:#9a8eaa;font-weight:850;margin-top:7px}.fh-item{font-size:13px;font-weight:900;color:#536b91;margin-top:2px}.fh-text{font-size:13px;color:#5f687a;line-height:1.55;margin-top:7px}.fh-reply{font-size:10px;color:#8c8295;margin-top:4px}.fh-go{font-size:11px;color:#617eb3;font-weight:900;margin-top:8px}
    .fh-empty{padding:28px 12px;text-align:center;color:#8b8295;font-size:13px}
  `;
  document.head.appendChild(style);

  const overlay=document.createElement('div');overlay.id='familyHubOverlay';
  overlay.innerHTML='<div class="fh-shell"><div class="fh-head"><div class="fh-title">家族で相談</div><div class="fh-sub">家族のコメントを、予定をまたいでまとめて確認できます。</div></div><div class="fh-body"><div id="fhLineInvite" class="fh-card" style="display:none"><div style="font-weight:850;font-size:13px">LINEでもコメント通知を受け取れます</div><div style="font-size:11px;color:#788197;margin-top:5px">約1分で連携できます。アカウント画面の案内に沿って設定してください。</div><button type="button" id="fhLineSetup" class="fh-plan-btn" style="margin-top:9px">LINE連携ガイドを開く ›</button></div><div class="fh-card"><div class="fh-toolbar"><button type="button" class="fh-filter active" data-filter="all">すべて</button><button type="button" class="fh-filter" data-filter="unread">未読のみ</button><button type="button" id="fhPlans" class="fh-plan-btn">相談テーマ・回答状況 ›</button></div></div><div id="fhComments"></div></div></div>';
  document.body.appendChild(overlay);

  function fmt(ts){
    try{const d=ts?.toDate?.();return d?new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(d):''}catch(_){return''}
  }
  function dateFor(c){
    const sec=(c.itemKey||'').split('|')[0];
    return document.querySelector('#'+CSS.escape(sec)+' h2')?.textContent?.trim()||'予定';
  }
  function isUnread(c){return !!unreadByComment[c.id]}
  function render(){
    const host=document.getElementById('fhComments');if(!host)return;
    const rows=comments.filter(c=>filter==='all'||isUnread(c));
    if(!rows.length){host.innerHTML='<div class="fh-empty">'+(filter==='unread'?'未読コメントはありません。':'まだコメントはありません。')+'</div>';return}
    host.innerHTML=rows.map(c=>'<button type="button" class="fh-comment '+(isUnread(c)?'unread':'')+'" data-comment-id="'+esc(c.id)+'" data-item-id="'+esc(c.itemId||'')+'">'+
      '<div class="fh-top"><span class="fh-who">'+esc(c.label||'家族')+'</span>'+(isUnread(c)?'<span class="fh-unread">未読</span>':'')+'<span class="fh-time">'+esc(fmt(c.createdAt))+'</span></div>'+
      '<div class="fh-date">'+esc(dateFor(c))+'</div><div class="fh-item">'+esc(c.itemTitle||'予定')+'</div>'+
      (c.parentCommentId?'<div class="fh-reply">↳ '+(replyNotices[c.id]?'あなたへの返信':'返信')+'</div>':'')+
      '<div class="fh-text">'+esc(c.text||'')+'</div><div class="fh-go">この予定・コメントを見る ›</div></button>').join('');
    host.querySelectorAll('.fh-comment').forEach(b=>b.onclick=()=>{
      overlay.style.display='none';
      document.body.style.overflow='';
      const c=comments.find(x=>x.id===b.dataset.commentId);
      const id=b.dataset.itemId||c?.itemId||'';
      setTimeout(()=>window.tripFamilyCollab?.openByDocId?.(id,b.dataset.commentId||''),30);
    });
  }
  function stop(){
    commentsUnsubs.forEach(fn=>fn());commentsUnsubs=[];commentBuckets.clear()
    if(notifUnsub){notifUnsub();notifUnsub=null}
  }
  function subscribe(){
    stop();comments=[];unreadByComment={};render();
    const a=api(),p=profile();if(!a?.db||!a?.fs||!p?.authenticated)return;
    try{
      // Read each itinerary item's comments directly. Collection-group queries may
      // silently omit results when Firestore collection-group rules are unavailable.
      const items=[...document.querySelectorAll('.item')].filter(x=>x.querySelector('.fc-entry'));
      const idFor=k=>encodeURIComponent(k).replace(/%/g,'_');
      if(!items.length){document.getElementById('fhComments').innerHTML='<div class="fh-empty">予定の読み込みを待っています。ホームに戻って再度お試しください。</div>';}
      items.forEach(item=>{
        const key=window.tripFamilyCollab?.itemKey?.(item);
        if(!key)return;
        const id=idFor(key);
        const ref=a.fs.collection(a.fs.doc(a.db,'trip_items',id),'comments');
        const unsub=a.fs.onSnapshot(ref,snap=>{
          const bucket=[];
          snap.forEach(x=>{const d=x.data()||{};if(d.text)bucket.push({id:x.id,itemId:id,itemKey:d.itemKey||key,itemTitle:d.itemTitle||key.split('|').slice(1).join('|'),...d})});
          commentBuckets.set(id,bucket);
          comments=[...commentBuckets.values()].flat().sort((x,y)=>(y.createdAt?.toMillis?.()||0)-(x.createdAt?.toMillis?.()||0));
          render();
        },err=>{console.warn('Family comments unavailable',id,err);});
        commentsUnsubs.push(unsub);
      });
      const ncol=a.fs.collection(a.db,'family_notifications',p.uid,'items');
      notifUnsub=a.fs.onSnapshot(ncol,snap=>{
        unreadByComment={};replyNotices={};snap.forEach(x=>{const d=x.data()||{};if(d.type==='comment_reply'&&d.commentId)replyNotices[d.commentId]=true;if(d.read!==true&&d.commentId)unreadByComment[d.commentId]=true});
        render();
      },()=>{});
    }catch(e){console.warn('Family hub subscription failed',e)}
  }
  let previewLineInvite=false;
  async function refreshLineInvite(){
    const invite=document.getElementById('fhLineInvite'),p=profile(),a=api();
    if(!invite)return;
    invite.style.display='none';
    if(!p?.authenticated||!a?.db)return;
    if(p.role==='admin'&&previewLineInvite){invite.style.display='block';return;}
    try{const snap=await a.fs.getDoc(a.fs.doc(a.db,'family_users',p.uid));if(overlay.style.display==='block'&&!snap.data()?.lineUserId)invite.style.display='block'}catch(_){}
  }
  document.getElementById('fhLineSetup').onclick=()=>{close();window.openTripFamilyAccount?.()};
  window.tripPreviewLineInvite=()=>{if(profile()?.role!=='admin')return;previewLineInvite=true;open()};
  function open(){
    overlay.style.display='block';
    refreshLineInvite();overlay.scrollTop=0;document.body.style.overflow='hidden';
    subscribe();window.tripAnalytics?.track('family_comment_hub_open',{});
  }
  function close(){overlay.style.display='none';document.body.style.overflow='';stop()}
  overlay.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{
    filter=b.dataset.filter;overlay.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));render();
  });
  document.getElementById('fhPlans').onclick=()=>{
    close();
    setTimeout(()=>window.tripFamilyPlanning?.openHub?.(),30);
  };
  document.addEventListener('tripFamilyAuthReady',()=>{if(overlay.style.display==='block')subscribe()});
  window.tripFamilyHub={open,close,refresh:subscribe};
})();