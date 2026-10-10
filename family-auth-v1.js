(function(){
  const CONFIG={
    apiKey:"AIzaSyD0uKs2_O_--BwWg7a5PJWRIwOLaPe6Puk",
    authDomain:"tsuruta-family-trip-2026.firebaseapp.com",
    projectId:"tsuruta-family-trip-2026",
    storageBucket:"tsuruta-family-trip-2026.firebasestorage.app",
    messagingSenderId:"687129835506",
    appId:"1:687129835506:web:778b20db9500c92a9b1d6b"
  };
  const PROFILE_KEY='tsuruta_family_profile_v1';
  const ACCOUNT_OPEN_KEY='tsuruta_family_account_open_v1';
  function rememberAccountOpen(open){try{if(open)sessionStorage.setItem(ACCOUNT_OPEN_KEY,'1');else sessionStorage.removeItem(ACCOUNT_OPEN_KEY)}catch(_){}}
  function restoreAccountOpen(){try{if(sessionStorage.getItem(ACCOUNT_OPEN_KEY)==='1'&&current?.authenticated)modal.classList.add('show')}catch(_){}}
  window.tripCloseAccountOnNavigation=()=>{rememberAccountOpen(false);modal.classList.remove('show')};
  let auth=null,db=null,authMod=null,fs=null,current=null;
  let presenceTimer=null,presenceUnsub=null,usageRefreshTimer=null;
  let usageDashboardLoaded=false;
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const style=document.createElement('style');
  style.textContent=`
    .fa-badge{display:none!important;position:fixed;left:12px;bottom:12px;z-index:120;border:1px solid #ddd7e8;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800;color:#5e6a80;box-shadow:0 4px 14px rgba(80,72,102,.08)}
    .fa-badge.on{color:#477566}.fa-modal{position:fixed;inset:0 0 calc(69px + env(safe-area-inset-bottom)) 0;z-index:1850;background:#fffaf6;display:none;overflow:auto;-webkit-overflow-scrolling:touch;padding:0}.fa-modal.show{display:block}
    .fa-box{width:min(760px,100%);min-height:100%;box-sizing:border-box;margin:0 auto;background:linear-gradient(180deg,#fffaf6,#f9fbff 62%,#fff);border:0;border-radius:0;padding:18px 16px 36px;box-shadow:none}
    .fa-box input{width:100%;box-sizing:border-box;padding:11px;border:1px solid #d9d3e3;border-radius:11px;margin:6px 0 10px;font:inherit}
    .fa-primary{width:100%;border:0;border-radius:11px;padding:11px;background:linear-gradient(135deg,#82b9eb,#ad93de);color:#fff;font-weight:800}
    .fa-link{border:0;background:transparent;color:#687eab;font-weight:800;padding:8px}.fa-err{font-size:12px;color:#a34c4c;min-height:18px}
    .fa-presence{margin-top:12px;background:#fff;border:1px solid #e8e1eb;border-radius:14px;padding:12px}.fa-presence-title{font-size:12px;font-weight:900;color:#495268;margin-bottom:7px}.fa-presence-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #f0ebf3}.fa-presence-row:first-of-type{border-top:0}.fa-dot{width:9px;height:9px;border-radius:50%;background:#c8c4cf}.fa-dot.on{background:#54a873;box-shadow:0 0 0 3px rgba(84,168,115,.12)}.fa-presence-name{font-size:12px;font-weight:850;color:#384155}.fa-presence-meta{margin-left:auto;font-size:10.5px;color:#8a8295;text-align:right}
    .fa-dash{margin-top:10px}.fa-dash-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.fa-stat{background:#fff;border:1px solid #e8e1eb;border-radius:13px;padding:10px}.fa-stat b{display:block;font-size:19px;color:#39435a}.fa-stat span{font-size:10.5px;color:#8a8295}.fa-dash-person{margin-top:8px;padding:10px;border:1px solid #ece6ef;border-radius:13px;background:#fff}.fa-dash-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.fa-dash-name{font-weight:900;color:#384155}.fa-dash-meta{font-size:10.5px;color:#8a8295}.fa-dash-line{font-size:11px;color:#667085;margin-top:5px}.fa-popular{margin-top:10px}.fa-pop-row{display:grid;grid-template-columns:1fr auto;gap:10px;padding:7px 0;border-top:1px solid #f0ebf3;font-size:11px}.fa-pop-row:first-child{border-top:0}
  `;
  document.head.appendChild(style);

  const badge=document.createElement('button');
  badge.type='button';badge.className='fa-badge';badge.textContent='家族ログイン';
  document.body.appendChild(badge);

  const modal=document.createElement('div');
  modal.className='fa-modal';
  modal.innerHTML=`<div class="fa-box">
    <div style="font-size:10px;letter-spacing:.12em;font-weight:800;color:#9a8faa">FAMILY ACCOUNT</div>
    <div id="faTitle" style="font-size:22px;font-weight:800;color:#273247;margin:3px 0 5px">家族ログイン</div>
    <div id="faNote" style="font-size:13px;color:#7c8494;line-height:1.5;margin-bottom:12px">家族ごとの投票・既読・コメントを本人名義で保存します。</div>
    <div id="faLogin">
      <input id="faEmail" type="email" autocomplete="username" placeholder="メールアドレス">
      <input id="faPassword" type="password" autocomplete="current-password" placeholder="パスワード">
      <div id="faErr" class="fa-err"></div>
      <button id="faSubmit" class="fa-primary" type="button">ログイン</button>
      <button id="faForgot" class="fa-link" style="width:100%;margin-top:6px;text-decoration:underline;text-underline-offset:3px" type="button">パスワードを忘れた方はこちら</button>
    </div>
    <div id="faAccount" style="display:none"></div>
    <div style="display:flex;justify-content:center;margin-top:8px"><button id="faClose" class="fa-link" type="button">閉じる</button></div>
  </div>`;
  document.body.appendChild(modal);

  function dispatch(profile){
    document.dispatchEvent(new CustomEvent('tripFamilyAuthReady',{detail:profile||{authenticated:false}}));
  }
  function setProfile(p){
    current=p;
    window.tripFamilyAuth=p;
    if(p?.authenticated && p.memberId){
      window.tripFamilyProfile={id:p.memberId};
      localStorage.setItem(PROFILE_KEY,JSON.stringify({id:p.memberId,label:p.label}));
      document.dispatchEvent(new CustomEvent('tripFamilyProfileReady',{detail:{id:p.memberId,source:'auth'}}));
      badge.textContent=p.label+' · ログイン中';
      badge.classList.add('on');
    }else{
      badge.textContent='家族ログイン';
      badge.classList.remove('on');
    }
    dispatch(p);
  }
  function tokyoDay(offsetDays=0){
    const d=new Date(Date.now()+offsetDays*86400000);
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    const m={};p.forEach(x=>m[x.type]=x.value);return m.year+'-'+m.month+'-'+m.day;
  }
  function safeMetric(s){return String(s||'').toLowerCase().replace(/[^a-z0-9_]/g,'_').slice(0,50)}
  function itemMetricId(title){return encodeURIComponent(String(title||'').slice(0,120)).replace(/%/g,'_')}
  async function usageRootPatch(patch){
    const p=current;if(!p?.authenticated||!db||!fs)return;
    try{
      await fs.setDoc(fs.doc(db,'family_usage',p.uid),{
        uid:p.uid,memberId:p.memberId,label:p.label,lastActive:fs.serverTimestamp(),...patch
      },{merge:true});
    }catch(_){}
  }
  async function recordUsageSession(){
    const p=current;if(!p?.authenticated||!db||!fs)return;
    const key='trip_usage_session_'+p.uid;
    if(sessionStorage.getItem(key)){usageRootPatch({});return}
    sessionStorage.setItem(key,'1');
    try{
      await usageRootPatch({sessionsTotal:fs.increment(1)});
      await fs.setDoc(fs.doc(db,'family_usage',p.uid,'days',tokyoDay()),{
        uid:p.uid,memberId:p.memberId,label:p.label,day:tokyoDay(),
        visits:fs.increment(1),lastVisit:fs.serverTimestamp()
      },{merge:true});
    }catch(_){}
  }
  async function trackUsageAction(name){
    const key='count_'+safeMetric(name);
    await usageRootPatch({[key]:fs.increment(1)});
  }
  async function trackUsageItem(title){
    const p=current;if(!p?.authenticated||!db||!fs||!title)return;
    try{
      await fs.setDoc(fs.doc(db,'family_usage',p.uid,'items',itemMetricId(title)),{
        uid:p.uid,memberId:p.memberId,label:p.label,title:String(title).slice(0,120),
        views:fs.increment(1),lastViewed:fs.serverTimestamp()
      },{merge:true});
    }catch(_){}
  }
  window.tripUsage={trackAction:trackUsageAction,trackItem:trackUsageItem};

  let usageRequestId=0;
  let usageInFlight=false;
  async function loadUsageDashboard(){
    if(usageInFlight)return;
    const requestId=++usageRequestId;
    if(current?.role!=='admin'||!db||!fs)return;
    const host=document.getElementById('faUsageDashboard'); if(!host)return;
    usageInFlight=true;
    host.innerHTML='<div style="font-size:11px;color:#8a8295">集計中…（通信状況によって時間がかかります）</div>';
    const failSafe=setTimeout(()=>{if(requestId===usageRequestId&&host.isConnected&&host.textContent.includes('データを取得しています'))host.innerHTML='<div style="font-size:11px;color:#a34c4c">取得に時間がかかっています。通信状態を確認して、再試行してください。<button type="button" id="faUsageRetry">再試行</button></div>';document.getElementById('faUsageRetry')?.addEventListener('click',()=>{usageRequestId++;usageInFlight=false;loadUsageDashboard()})},25000);
    const slowNotice=setTimeout(()=>{if(requestId===usageRequestId&&host.isConnected&&host.textContent.includes('集計中'))host.innerHTML='<div style="font-size:11px;color:#8a8295">データを取得しています。時間がかかる場合は通信状態をご確認ください。</div>'},12000);
    try{
      const [usersSnap,votesSnap]=await Promise.all([fs.getDocs(fs.collection(db,'family_users')),fs.getDocs(fs.collection(db,'family_votes'))]);
      const users=[];usersSnap.forEach(s=>{const d=s.data()||{};if(d.active!==false)users.push({uid:s.id,memberId:d.memberId,label:d.label||d.memberId})});
      const voteSets={};votesSnap.forEach(s=>{const d=s.data()||{};if(d.memberId&&d.key){(voteSets[d.memberId]||(voteSets[d.memberId]=new Set())).add(d.key)}});
      let commentRows=[];
      try{
        const commentsSnap=await fs.getDocs(fs.collectionGroup(db,'comments'));
        commentsSnap.forEach(x=>{const d=x.data()||{};if(d.itemKey&&d.text)commentRows.push({id:x.id,...d})});
        commentRows.sort((a,b)=>((b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)));
      }catch(_){}
      const totalPlans=window.tripFamilyPlanning?.count?.()||4;
      const days=[0,-1,-2,-3,-4,-5,-6].map(tokyoDay);
      let todayUsers=0,weekVisits=0,totalComments=0;
      const popular={};
      const rows=[];
      const userStats=await Promise.all(users.map(async u=>{
        const [rootSnap,...otherSnaps]=await Promise.all([fs.getDoc(fs.doc(db,'family_usage',u.uid)),...days.map(day=>fs.getDoc(fs.doc(db,'family_usage',u.uid,'days',day))),fs.getDocs(fs.collection(db,'family_usage',u.uid,'items'))]);
        const rd=rootSnap.exists()?rootSnap.data()||{}:{};
        let uv=0,today=0;
        for(let i=0;i<days.length;i++){
          const ds=otherSnaps[i];
          const n=ds.exists()?Number(ds.data()?.visits||0):0;uv+=n;if(days[i]===days[0])today=n;
        }
        const items=otherSnaps[days.length];
        const last=rd.lastActive?.toDate?.();
        const lastText=last?new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(last):'—';
        const answered=voteSets[u.memberId]?.size||0;
        const rate=Math.round((answered/Math.max(totalPlans,1))*100);
        return {label:u.label,lastText,week:uv,answered,rate,comments:Number(rd.count_family_comment_add||0),today,uv,popularEntries:[...items.docs.map(x=>x.data())]};
      }));
      for(const r of userStats){
        if(r.today>0)todayUsers++;
        weekVisits+=r.uv;
        totalComments+=r.comments;
        for(const d of r.popularEntries){if(d.title)popular[d.title]=(popular[d.title]||0)+Number(d.views||0)}
        rows.push(r);
      }
      if(requestId!==usageRequestId||!host.isConnected)return;
      const tops=Object.entries(popular).sort((a,b)=>b[1]-a[1]).slice(0,5);
      host.innerHTML=
        '<div class="fa-dash-grid">'+
          '<div class="fa-stat"><b>'+todayUsers+' / '+users.length+'</b><span>今日利用</span></div>'+
          '<div class="fa-stat"><b>'+weekVisits+'</b><span>直近7日セッション</span></div>'+
          '<button type="button" id="faCommentsStat" class="fa-stat" style="text-align:left;cursor:pointer"><b>'+totalComments+'</b><span>コメント追加 ›</span></button>'+
          '<div class="fa-stat"><b>'+totalPlans+'</b><span>相談テーマ数</span></div>'+
        '</div>'+
        rows.map(r=>'<div class="fa-dash-person"><div class="fa-dash-head"><span class="fa-dash-name">'+r.label+'</span><span class="fa-dash-meta">最終 '+r.lastText+'</span></div><div class="fa-dash-line">7日 '+r.week+'回 ・ 相談 '+r.answered+'/'+totalPlans+'（'+r.rate+'%）・ <button type="button" class="fa-comment-link" data-comment-member="'+esc(r.label)+'" style="border:0;background:transparent;color:#687eab;padding:0;font:inherit;font-weight:800">コメント '+r.comments+'件 ›</button></div></div>').join('')+
        '<div class="fa-popular"><div class="fa-presence-title">よく見られている予定</div>'+(tops.length?tops.map(([t,n])=>'<div class="fa-pop-row"><span>'+t+'</span><b>'+n+'回</b></div>').join(''):'<div style="font-size:11px;color:#8a8295">これから閲覧データを蓄積します。</div>')+'</div>'+
        '<div id="faCommentList" style="display:none;margin-top:10px"></div>'+ 
        '<div style="font-size:10px;color:#9a92a1;margin-top:9px">セッション数・閲覧数はこの機能導入後から集計します。</div>';
      usageDashboardLoaded=true;
      const showComments=(label='')=>{
        const box=document.getElementById('faCommentList');if(!box)return;
        const rows2=commentRows.filter(c=>!label||c.label===label).slice(0,20);
        box.style.display='block';
        box.innerHTML='<div class="fa-presence-title">'+(label?esc(label)+'のコメント':'最近のコメント')+'</div>'+(rows2.length?rows2.map(c=>'<button type="button" class="fa-dash-person fa-open-comment" data-item-key="'+esc(c.itemKey)+'" data-comment-id="'+esc(c.id)+'" style="width:100%;text-align:left;cursor:pointer"><div class="fa-dash-head"><span class="fa-dash-name">'+esc(c.label||'家族')+'</span><span class="fa-dash-meta">'+esc(c.itemTitle||'予定')+'</span></div><div class="fa-dash-line">'+esc(c.text)+'</div></button>').join(''):'<div style="font-size:11px;color:#8a8295">コメントはありません。</div>');
        box.querySelectorAll('.fa-open-comment').forEach(b=>b.onclick=()=>{
          const id=encodeURIComponent(b.dataset.itemKey||'').replace(/%/g,'_');
          modal.classList.remove('show');
          setTimeout(()=>window.tripFamilyCollab?.openByDocId?.(id,b.dataset.commentId||''),50);
        });
      };
      document.getElementById('faCommentsStat')?.addEventListener('click',()=>showComments(''));
      host.querySelectorAll('.fa-comment-link').forEach(b=>b.onclick=()=>showComments(b.dataset.commentMember||''));
    }catch(e){
      console.warn(e);if(requestId===usageRequestId)host.innerHTML='<div style="font-size:11px;color:#a34c4c">集計できませんでした（'+esc(e?.code||e?.message||'不明なエラー')+'）。<button type="button" id="faUsageRetry">再試行</button></div>';
      document.getElementById('faUsageRetry')?.addEventListener('click',loadUsageDashboard);
    }finally{clearTimeout(slowNotice);clearTimeout(failSafe);usageInFlight=false}
  }

  function stopPresence(){
    if(presenceTimer){clearInterval(presenceTimer);presenceTimer=null}
    if(presenceUnsub){presenceUnsub();presenceUnsub=null}
  }
  async function writePresence(){
    const p=current;
    if(!p?.authenticated||!db||!fs)return;
    try{
      await fs.setDoc(fs.doc(db,'family_presence',p.uid),{
        uid:p.uid,memberId:p.memberId,label:p.label,role:p.role,
        lastSeen:fs.serverTimestamp(),visible:document.visibilityState==='visible'
      },{merge:true});
    }catch(_){}
  }
  function startPresence(){
    stopPresence();
    if(!current?.authenticated)return;
    writePresence();
    presenceTimer=setInterval(writePresence,60000);
  }
  function fmtSeen(ts){
    try{
      const d=ts?.toDate?.(); if(!d)return'未取得';
      const diff=Date.now()-d.getTime();
      if(diff<120000)return'オンライン';
      if(diff<3600000)return Math.max(2,Math.round(diff/60000))+'分前';
      return new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(d);
    }catch(_){return'未取得'}
  }
  function watchPresence(){
    if(presenceUnsub){presenceUnsub();presenceUnsub=null}
    if(current?.role!=='admin'||!db||!fs)return;
    const host=document.getElementById('faPresenceRows'); if(!host)return;
    host.innerHTML='<div style="font-size:11px;color:#8a8295">接続しています…</div>';
    presenceUnsub=fs.onSnapshot(fs.collection(db,'family_presence'),snap=>{
      const by={}; snap.forEach(s=>{const d=s.data()||{};if(d.memberId)by[d.memberId]=d});
      const members=[['family_01','パパ'],['family_02','Emi'],['family_03','Saki'],['family_04','Takeru']];
      host.innerHTML=members.map(([id,label])=>{
        const d=by[id]||{}; const online=d.lastSeen?.toDate&&Date.now()-d.lastSeen.toDate().getTime()<120000&&d.visible!==false;
        return '<div class="fa-presence-row"><span class="fa-dot '+(online?'on':'')+'"></span><span class="fa-presence-name">'+label+'</span><span class="fa-presence-meta">'+fmtSeen(d.lastSeen)+'</span></div>';
      }).join('');
    },err=>{console.warn('presence subscription failed',err);host.innerHTML='<div style="font-size:11px;color:#a34c4c">利用状況を取得できませんでした（'+esc(err?.code||'通信エラー')+'）。<button type="button" id="faPresenceRetry">再試行</button></div>';document.getElementById('faPresenceRetry')?.addEventListener('click',watchPresence)});
  }
  function render(){
    const on=current?.authenticated;
    const title=document.getElementById('faTitle'),note=document.getElementById('faNote');
    if(title)title.textContent=on?'アカウント':'家族ログイン';
    if(note)note.textContent=on?'家族アカウント・利用状況・設定を確認できます。':'家族ごとの投票・既読・コメントを本人名義で保存します。';
    document.getElementById('faClose').style.display=on?'inline-block':'none';
    document.getElementById('faLogin').style.display=on?'none':'block';
    const a=document.getElementById('faAccount');
    a.style.display=on?'block':'none';
    if(on){
      a.innerHTML='<div style="background:#fff;border:1px solid #e8e1eb;border-radius:14px;padding:14px"><b>'+current.label+'</b><div style="font-size:12px;color:#7d8493;margin-top:4px">'+
        (current.role==='admin'?'管理者：最終決定・家族管理が可能':current.role==='viewer'?'閲覧のみ':'家族メンバー：投票・既読・コメントが可能')+
        '</div></div>'+
        (current.role==='admin'?'<div class="fa-presence"><div class="fa-presence-title">現在の利用状況</div><div id="faPresenceRows"><div style="font-size:11px;color:#8a8295">確認中…</div></div></div><div id="faUsageWrap" class="fa-dash"><div class="fa-presence-title" style="margin:12px 0 7px">利用状況ダッシュボード</div><div id="faUsageDashboard"><div style="font-size:11px;color:#8a8295">集計中…</div></div></div>':'')+
        '<button id="faChangePw" class="fa-link" style="width:100%;margin-top:8px" type="button">パスワード変更</button>'+
        '<div id="faChangeArea" style="display:none;margin-top:6px">'+
          '<input id="faCurrentPw" type="password" autocomplete="current-password" placeholder="現在のパスワード">'+
          '<input id="faNewPw" type="password" autocomplete="new-password" placeholder="新しいパスワード（12文字以上推奨）">'+
          '<input id="faNewPw2" type="password" autocomplete="new-password" placeholder="新しいパスワードをもう一度">'+
          '<div id="faChangeErr" class="fa-err"></div>'+
          '<button id="faChangeSubmit" class="fa-primary" type="button">変更する</button>'+
        '</div>'+
        '<button id="faLogout" class="fa-link" style="width:100%;margin-top:8px" type="button">ログアウト</button>';
      document.getElementById('faLogout').onclick=async()=>{rememberAccountOpen(false);await authMod.signOut(auth);};
      if(current.role==='admin'){
        watchPresence();
        if(usageDashboardLoaded) setTimeout(loadUsageDashboard,50);
      }
      document.getElementById('faChangePw').onclick=()=>{const el=document.getElementById('faChangeArea');el.style.display=el.style.display==='none'?'block':'none';};
      document.getElementById('faChangeSubmit').onclick=async()=>{
        const msg=document.getElementById('faChangeErr');
        const cur=document.getElementById('faCurrentPw').value;
        const n1=document.getElementById('faNewPw').value;
        const n2=document.getElementById('faNewPw2').value;
        if(!cur){msg.textContent='現在のパスワードを入力してください。';return}
        if(n1.length<8){msg.textContent='新しいパスワードは8文字以上にしてください。';return}
        if(n1!==n2){msg.textContent='新しいパスワードが一致しません。';return}
        msg.textContent='変更しています…';
        try{
          const user=auth.currentUser;
          const cred=authMod.EmailAuthProvider.credential(user.email,cur);
          await authMod.reauthenticateWithCredential(user,cred);
          await authMod.updatePassword(user,n1);
          document.getElementById('faCurrentPw').value='';
          document.getElementById('faNewPw').value='';
          document.getElementById('faNewPw2').value='';
          msg.style.color='#477566';
          msg.textContent='パスワードを変更しました。';
        }catch(e){
          msg.style.color='#a34c4c';
          msg.textContent=e?.code==='auth/invalid-credential'?'現在のパスワードが違います。':e?.code==='auth/weak-password'?'新しいパスワードが弱すぎます。':'変更できませんでした。もう一度お試しください。';
        }
      };
    }
  }
  async function loadFamilyProfile(user){
    const ref=fs.doc(db,'family_users',user.uid);
    const snap=await fs.getDoc(ref);
    if(!snap.exists()) return null;
    const d=snap.data()||{};
    if(d.active===false)return null;
    return {authenticated:true,uid:user.uid,email:user.email||'',memberId:d.memberId,label:d.label||d.memberId,role:d.role||'member'};
  }
  async function init(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
      authMod=await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js');
      fs=await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
      const app=appMod.getApps().length?appMod.getApp():appMod.initializeApp(CONFIG);
      auth=authMod.getAuth(app);db=fs.getFirestore(app);
      window.tripFamilyAuthApi={auth,db,authMod,fs,isAdmin:()=>window.tripFamilyAuth?.role==='admin',canWrite:()=>['admin','member'].includes(window.tripFamilyAuth?.role)};
      authMod.onAuthStateChanged(auth,async user=>{
        if(!user){
          stopPresence();
          if(usageRefreshTimer){clearInterval(usageRefreshTimer);usageRefreshTimer=null}
          setProfile({authenticated:false,role:'guest'});render();
          setTimeout(()=>{ if(!window.tripFamilyAuth?.authenticated) modal.classList.add('show'); },900);
          return
        }
        try{
          const p=await loadFamilyProfile(user);
          if(!p){
            setProfile({authenticated:false,uid:user.uid,email:user.email||'',role:'unassigned'});
            document.getElementById('faErr').textContent='このアカウントはまだ家族メンバーに紐付いていません。';
          }else setProfile(p);
        }catch(e){setProfile({authenticated:false,role:'error'});}
        render();
        restoreAccountOpen();
        if(window.tripFamilyAuth?.authenticated){startPresence();recordUsageSession();if(window.tripFamilyAuth.role==='admin'){setTimeout(loadUsageDashboard,250);if(usageRefreshTimer)clearInterval(usageRefreshTimer);usageRefreshTimer=setInterval(()=>{if(document.visibilityState==='visible')loadUsageDashboard()},180000)}}
      });
    }catch(e){console.warn('Family Auth unavailable',e);setProfile({authenticated:false,role:'unavailable'});}
  }
  badge.onclick=()=>{rememberAccountOpen(true);modal.classList.add('show');render()};
  document.getElementById('faClose').onclick=()=>{if(current?.authenticated){rememberAccountOpen(false);modal.classList.remove('show')}};
  document.getElementById('faSubmit').onclick=async()=>{
    const err=document.getElementById('faErr');err.textContent='確認しています…';
    try{
      await authMod.signInWithEmailAndPassword(auth,document.getElementById('faEmail').value.trim(),document.getElementById('faPassword').value);
      err.textContent='';rememberAccountOpen(false);modal.classList.remove('show');
    }catch(e){
      err.textContent=e?.code==='auth/operation-not-allowed'?'FirebaseでEmail/Passwordログインを有効にしてください。':e?.code==='auth/invalid-credential'?'メールアドレスまたはパスワードが違います。':'ログインできません。メールアドレスとパスワードを確認してください。';
    }
  };
  document.getElementById('faPassword').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('faSubmit').click()});
  document.getElementById('faForgot').onclick=async()=>{
    const email=document.getElementById('faEmail').value.trim();
    const err=document.getElementById('faErr');
    if(!email){err.textContent='まずメールアドレスを入力してください。';return}
    err.textContent='再設定メールを送信しています…';
    try{
      await authMod.sendPasswordResetEmail(auth,email);
      err.style.color='#477566';
      err.textContent='パスワード再設定メールを送信しました。メールを確認してください。';
    }catch(e){
      err.style.color='#a34c4c';
      err.textContent='再設定メールを送信できませんでした。メールアドレスを確認してください。';
    }
  };
  document.addEventListener('visibilitychange',()=>{if(current?.authenticated){writePresence();if(current.role==='admin'&&document.visibilityState==='visible')loadUsageDashboard()}});
  window.addEventListener('focus',()=>{if(current?.authenticated){writePresence();if(current.role==='admin'&&modal.classList.contains('show'))loadUsageDashboard()}});
  window.openTripFamilyAccount=()=>{rememberAccountOpen(true);modal.classList.add('show');modal.scrollTop=0;render();if(current?.role==='admin')setTimeout(loadUsageDashboard,50)};
  window.openTripUsageDashboard=()=>{rememberAccountOpen(true);modal.classList.add('show');render();setTimeout(loadUsageDashboard,50)};
  init();
})();