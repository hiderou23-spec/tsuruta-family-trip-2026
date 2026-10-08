(function(){
  let unsub=null,unread=[];
  const style=document.createElement('style');
  style.textContent=`
    .fl-card{margin-top:10px;background:#fff;border:1px solid #e8e1eb;border-radius:14px;padding:12px}
    .fl-title{font-size:12px;font-weight:900;color:#39435a}.fl-sub{font-size:11px;color:#81899a;margin-top:3px;line-height:1.5}
    .fl-btn{margin-top:9px;width:100%;border:1px solid #dcd6e6;background:#f8f5fc;color:#5e5574;border-radius:11px;padding:9px;font:inherit;font-size:12px;font-weight:850}
    .fl-code{font-size:24px;font-weight:900;letter-spacing:.14em;text-align:center;margin:9px 0;color:#4f4666}
    #tbFamilyLineCount{display:none;position:absolute;top:3px;right:18%;min-width:17px;height:17px;border-radius:9px;padding:0 4px;background:#bd665c;color:#fff;border:2px solid rgba(255,255,255,.96);font-size:9px;font-weight:800;line-height:13px;text-align:center}
  `;
  document.head.appendChild(style);

  function api(){return window.tripFamilyAuthApi}
  function profile(){return window.tripFamilyAuth}
  function code(){
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',a=new Uint32Array(8);crypto.getRandomValues(a);
    return [...a].map(n=>chars[n%chars.length]).join('');
  }
  function ensureBadge(){
    const b=document.getElementById('tbFamily');if(!b)return null;
    b.style.position='relative';
    let x=document.getElementById('tbFamilyLineCount');
    if(!x){x=document.createElement('span');x.id='tbFamilyLineCount';b.appendChild(x)}
    return x;
  }
  function renderBadge(){
    const b=ensureBadge();if(!b)return;
    const n=unread.length;b.textContent=n>9?'9+':String(n);b.style.display=n?'block':'none';
  }
  function stop(){if(unsub){unsub();unsub=null}unread=[];renderBadge()}
  function subscribe(){
    stop();
    const p=profile(),a=api();if(!p?.authenticated||!a?.db)return;
    const col=a.fs.collection(a.db,'family_notifications',p.uid,'items');
    unsub=a.fs.onSnapshot(col,snap=>{
      unread=[];snap.forEach(s=>{const d=s.data()||{};if(d.read!==true)unread.push({id:s.id,...d})});
      unread.sort((x,y)=>(y.createdAt?.toMillis?.()||0)-(x.createdAt?.toMillis?.()||0));
      renderBadge();
    },()=>{});
  }
  async function markItemRead(itemId){
    const p=profile(),a=api();if(!p?.authenticated||!a?.db)return;
    const list=unread.filter(x=>x.itemId===itemId);if(!list.length)return;
    const batch=a.fs.writeBatch(a.db);
    list.forEach(n=>batch.update(a.fs.doc(a.db,'family_notifications',p.uid,'items',n.id),{read:true,readAt:a.fs.serverTimestamp()}));
    try{await batch.commit()}catch(_){}
  }
  function openLatestUnread(){
    const n=unread[0];if(!n)return false;
    const ok=window.tripFamilyCollab?.openByDocId?.(n.itemId,n.commentId);
    if(ok){markItemRead(n.itemId);window.tripAnalytics?.track('family_notification_open',{source:'bottom_bar'});return true}
    return false;
  }
  async function renderAccount(){
    const host=document.getElementById('faAccount'),p=profile(),a=api();
    if(!host||!p?.authenticated||!a?.db)return;
    let card=document.getElementById('faLineCard');
    if(!card){card=document.createElement('div');card.id='faLineCard';card.className='fl-card';host.insertBefore(card,document.getElementById('faChangePw')||null)}
    try{
      const snap=await a.fs.getDoc(a.fs.doc(a.db,'family_users',p.uid)),d=snap.data()||{},linked=!!d.lineUserId,enabled=d.lineNotifications!==false;
      card.innerHTML='<div class="fl-title">LINE通知</div>'+
        '<div class="fl-sub">'+(linked?(enabled?'連携済み・コメント通知ON':'連携済み・通知OFF'):'未連携。コメント通知をLINEで受け取れます。')+'</div>'+
        (linked?'<button class="fl-btn" id="flToggle">'+(enabled?'LINE通知をOFF':'LINE通知をON')+'</button>':'<button class="fl-btn" id="flLink">連携コードを発行</button>')+
        '<div id="flHelp" class="fl-sub"></div>';
      if(linked){
        document.getElementById('flToggle').onclick=async()=>{
          await a.fs.updateDoc(a.fs.doc(a.db,'family_users',p.uid),{lineNotifications:!enabled});
          window.tripAnalytics?.track('line_notification_toggle',{enabled:!enabled?'yes':'no'});renderAccount();
        };
      }else{
        document.getElementById('flLink').onclick=async()=>{
          const c=code(),expires=new Date(Date.now()+10*60*1000);
          await a.fs.setDoc(a.fs.doc(a.db,'line_link_codes',c),{
            uid:p.uid,memberId:p.memberId,label:p.label,createdAt:a.fs.serverTimestamp(),expiresAt:a.fs.Timestamp.fromDate(expires)
          });
          document.getElementById('flHelp').innerHTML='<div class="fl-code">'+c+'</div>LINE公式アカウントを友だち追加後、この8桁コードだけを送信してください。10分間有効です。';
          window.tripAnalytics?.track('line_link_code_created',{});
        };
      }
    }catch(e){card.innerHTML='<div class="fl-title">LINE通知</div><div class="fl-sub">設定を読み込めませんでした。</div>'}
  }
  function tryDeepLink(){
    const p=profile();if(!p?.authenticated)return;
    const q=new URLSearchParams(location.search),item=q.get('familyItem'),comment=q.get('comment')||'';
    if(!item)return;
    let tries=0;
    const t=setInterval(()=>{
      tries++;
      if(window.tripFamilyCollab?.openByDocId?.(item,comment)){
        clearInterval(t);markItemRead(item);
        q.delete('familyItem');q.delete('comment');
        const qs=q.toString(),url=location.pathname+(qs?'?'+qs:'')+location.hash;
        history.replaceState(null,'',url);
      }else if(tries>20)clearInterval(t);
    },250);
  }
  const account=document.getElementById('faAccount');
  if(account)new MutationObserver(()=>setTimeout(renderAccount,0)).observe(account,{childList:true});
  document.addEventListener('tripFamilyAuthReady',()=>{subscribe();setTimeout(renderAccount,100);setTimeout(tryDeepLink,350)});
  setTimeout(()=>{ensureBadge();subscribe();renderAccount();tryDeepLink()},1200);
  window.tripFamilyLine={markItemRead,openLatestUnread,refresh:subscribe};
})();