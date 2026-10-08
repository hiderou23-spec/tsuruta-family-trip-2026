(function(){
  const members=[
    {id:'family_01',label:'パパ',initial:'P'},
    {id:'family_02',label:'Emi',initial:'E'},
    {id:'family_03',label:'Saki',initial:'S'},
    {id:'family_04',label:'Takeru',initial:'T'}
  ];
  const labels=Object.fromEntries(members.map(x=>[x.id,x.label]));
  let api=null,currentKey='',currentItem=null,unsubReads=null,unsubComments=null,currentResponses={},pendingCommentId='';
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const docId=k=>encodeURIComponent(k).replace(/%/g,'_');

  const style=document.createElement('style');
  style.textContent=`
   .fc-entry{margin-top:7px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
   .fc-open{border:0;background:transparent;color:#6d7890;font-size:11px;font-weight:800;padding:3px 0;cursor:pointer}
   .fc-mini-family{display:flex;gap:4px;align-items:center}.fc-mini-avatar{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;border:1px solid #ddd7e8;background:#f5f2f7;color:#9a91a5;font-size:9px;font-weight:900}.fc-mini-avatar.has{background:#eee8f7;color:#62577b;border-color:#d8cdea}.fc-mini-avatar.go{background:#e9f5ee;color:#46705b;border-color:#cfe4d6}.fc-mini-avatar.no{background:#f8ece9;color:#9a5f58;border-color:#edd5d1}
   .fc-modal{position:fixed;inset:0;z-index:1500;background:#fffaf6;display:none;overflow:auto;padding-bottom:calc(78px + env(safe-area-inset-bottom))}.fc-modal.show{display:block}
   .fc-shell{max-width:760px;margin:0 auto;min-height:100%;background:linear-gradient(180deg,#fffaf6,#f9fbff 65%,#fff)}
   .fc-head{position:sticky;top:0;z-index:2;background:rgba(255,250,246,.96);backdrop-filter:blur(8px);border-bottom:1px solid #e9e2ed;padding:12px 16px;display:flex;gap:12px;align-items:center}
   .fc-back{width:44px;height:44px;border-radius:50%;border:1px solid #e1dbea;background:#f5f1fb;color:#5f6d85;font-size:28px}
   .fc-card{background:#fff;border:1px solid #e8e1eb;border-radius:16px;padding:14px;margin:10px 0;box-shadow:0 4px 14px rgba(82,76,110,.04)}
   .fc-card-title{font-weight:900;color:#30384a;margin-bottom:9px}.fc-card-sub{font-size:11px;color:#8b8295;margin-top:-5px;margin-bottom:9px}
   .fc-family-grid{display:grid;gap:8px}.fc-person{display:grid;grid-template-columns:38px 1fr;gap:10px;align-items:center;padding:9px;border-radius:13px;background:#fbfafc;border:1px solid #eee9f1}.fc-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:900;background:#eee8f7;color:#62577b}.fc-person-name{font-weight:850;color:#374056}.fc-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:4px}.fc-tag{font-size:10.5px;font-weight:800;padding:3px 7px;border-radius:999px;background:#f1eff4;color:#777083}.fc-tag.go{background:#eaf5ee;color:#4f735e}.fc-tag.no{background:#f8ece9;color:#985f58}.fc-tag.hot{background:#fff1d8;color:#8c6a2a}.fc-tag.info{background:#edf3fb;color:#57708d}
   .fc-group{margin-top:12px}.fc-label{font-size:11px;color:#7d8493;font-weight:900;margin-bottom:6px}.fc-options{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.fc-options.two{grid-template-columns:repeat(2,1fr)}.fc-choice{border:1px solid #ddd7e8;border-radius:11px;padding:9px 6px;background:#fff;color:#5f687a;font:inherit;font-size:12px;font-weight:800}.fc-choice.selected{background:#eee8f7;border-color:#cfc0e5;color:#5f527c}
   .fc-toggles{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}.fc-toggle{border:1px solid #ddd7e8;background:#fff;border-radius:12px;padding:10px 8px;font:inherit;font-size:12px;font-weight:800;color:#5f687a}.fc-toggle.on{background:#edf6f0;border-color:#cfe5d7;color:#4d725d}
   .fc-save-state{font-size:11px;color:#8b8295;min-height:18px;margin-top:8px}.fc-comment{padding:10px 0;border-top:1px solid #f0ebf3}.fc-comment:first-child{border-top:0}.fc-comment-head{display:flex;justify-content:space-between;gap:10px}.fc-comment-name{font-weight:850}.fc-comment-time{font-size:10px;color:#a19aaa}
   .fc-input{display:flex;gap:7px;margin-top:10px}.fc-input input{flex:1;min-width:0;border:1px solid #ddd7e8;border-radius:11px;padding:10px;font:inherit}.fc-input button,.fc-read{border:0;border-radius:11px;padding:9px 11px;background:#eef4ff;color:#526b92;font-weight:800}.fc-read.done{background:#eaf5ee;color:#4f735e}
   .fc-comment.reply{margin-left:18px;padding-left:10px;border-left:2px solid #e5ddf0}.fc-reply-note{font-size:10px;color:#9b91a4;margin-bottom:2px}.fc-quick{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.fc-quick button{border:1px solid #ddd7e8;background:#faf8fd;color:#625a76;border-radius:999px;padding:5px 8px;font:inherit;font-size:10.5px;font-weight:800}.fc-comment.flash{background:#fff6cf;border-radius:10px;padding-left:8px;padding-right:8px}
   @media(max-width:520px){.fc-options{grid-template-columns:repeat(3,minmax(0,1fr))}.fc-choice{font-size:11px;padding:9px 4px}.fc-toggles{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);

  const modal=document.createElement('div');modal.className='fc-modal';
  modal.innerHTML='<div class="fc-shell"><div class="fc-head"><button class="fc-back">‹</button><div><div id="fcTitle" style="font-weight:900;font-size:18px">家族メモ</div><div id="fcAuth" style="font-size:11px;color:#8b8295"></div></div></div><div style="padding:14px">'+
    '<div class="fc-card"><div class="fc-card-title">家族の状況</div><div class="fc-card-sub">誰が行きたいか、参加するかをひと目で確認</div><div id="fcFamilyGrid" class="fc-family-grid"></div></div>'+
    '<div class="fc-card" id="fcMyCard"><div class="fc-card-title">自分の希望</div>'+
      '<div class="fc-group"><div class="fc-label">行きたい度</div><div class="fc-options" id="fcInterest"><button class="fc-choice" data-value="high">ぜひ行きたい</button><button class="fc-choice" data-value="maybe">どちらでも</button><button class="fc-choice" data-value="low">優先低め</button></div></div>'+
      '<div class="fc-group"><div class="fc-label">参加</div><div class="fc-options" id="fcAttendance"><button class="fc-choice" data-value="yes">参加する</button><button class="fc-choice" data-value="maybe">未定</button><button class="fc-choice" data-value="no">参加しない</button></div></div>'+
      '<div class="fc-toggles"><button type="button" class="fc-toggle" id="fcGuide">案内できる</button><button type="button" class="fc-toggle" id="fcRecommend">おすすめ</button></div>'+
      '<div id="fcSaveState" class="fc-save-state"></div><button id="fcReadBtn" class="fc-read" type="button">✓ 既読にする</button>'+
    '</div>'+
    '<div class="fc-card"><div class="fc-card-title">コメント</div><div id="fcComments"></div><div class="fc-input"><input id="fcText" maxlength="300" placeholder="この予定について家族にコメント"><button id="fcSend" type="button">送信</button></div></div>'+
  '</div></div>';
  document.body.appendChild(modal);
  modal.querySelector('.fc-back').onclick=close;

  function baseTitle(item){
    return (item.querySelector('.title')?.childNodes[0]?.textContent||item.querySelector('.title')?.textContent||'').trim();
  }
  function shouldCollaborate(item){
    const title=baseTitle(item);

    // Special case: the two Honolulu arrival items need family rendezvous coordination.
    if(/Honolulu到着/.test(title))return true;

    // Meals / dining.
    if(/朝食|昼食|夕食|Dinner|ビュッフェ|レストラン|食事/.test(title))return true;

    // Sightseeing, activities, shopping destinations, and experiences.
    if(/Diamond Head|Blowhole|Sandy Beach|Makapu|Kailua|Pali Lookout|Waikiki Beach|Ala Moana|Kualoa Ranch UTV|Rock-A-Hula|Gun Club|サンセット|Canada Place|Coal Harbour散策|Inner Harbour散歩|Butchart Gardens|Inner Harbour・BC州議事堂|UBCキャンパス|生活圏を案内/.test(title))return true;

    return false;
  }

  function itemKey(item){
    const sec=item.closest('.section')?.id||'';
    const title=(item.querySelector('.title')?.childNodes[0]?.textContent||item.querySelector('.title')?.textContent||'').trim();
    return sec+'|'+title;
  }
  function currentProfile(){return window.tripFamilyAuth}
  function isWritable(){const p=currentProfile();return !!p?.authenticated&&p.role!=='viewer'}
  function ownResponse(){const p=currentProfile();return p?.memberId?currentResponses[p.memberId]||{}:{}}
  function formatTime(ts){
    try{const d=ts?.toDate?.();return d?new Intl.DateTimeFormat('ja-JP',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(d):''}catch(_){return''}
  }
  function quickReplies(title){
    if(/朝食|昼食|夕食|Dinner|ビュッフェ|レストラン|食事/.test(title))return ['ここ行きたい！','どちらでもOK','別候補も見たい'];
    if(/UBC|案内|生活圏/.test(title))return ['案内お願い！','ぜひ見たい','あとで相談しよう'];
    if(/Honolulu到着/.test(title))return ['了解！','この合流でOK','時間を相談しよう'];
    return ['行きたい！','時間あれば','あとで相談しよう'];
  }
  function responseTags(d){
    const tags=[];
    if(d.interest==='high')tags.push('<span class="fc-tag hot">★ 行きたい</span>');
    else if(d.interest==='maybe')tags.push('<span class="fc-tag">○ どちらでも</span>');
    else if(d.interest==='low')tags.push('<span class="fc-tag">△ 優先低め</span>');
    if(d.attendance==='yes')tags.push('<span class="fc-tag go">参加</span>');
    else if(d.attendance==='maybe')tags.push('<span class="fc-tag info">未定</span>');
    else if(d.attendance==='no')tags.push('<span class="fc-tag no">不参加</span>');
    if(d.canGuide)tags.push('<span class="fc-tag info">案内できる</span>');
    if(d.recommend)tags.push('<span class="fc-tag hot">おすすめ</span>');
    if(d.readAt)tags.push('<span class="fc-tag">既読</span>');
    return tags.join('')||'<span class="fc-tag">未回答</span>';
  }
  function renderFamily(){
    const grid=document.getElementById('fcFamilyGrid');
    grid.innerHTML=members.map(m=>{
      const d=currentResponses[m.id]||{};
      return '<div class="fc-person"><div class="fc-avatar">'+m.initial+'</div><div><div class="fc-person-name">'+esc(m.label)+'</div><div class="fc-tags">'+responseTags(d)+'</div></div></div>';
    }).join('');
    renderOwn();
    updateEntry(currentItem,currentResponses);
  }
  function renderOwn(){
    const p=currentProfile(),d=ownResponse();
    const card=document.getElementById('fcMyCard');
    card.style.opacity=p?.authenticated?'1':'.6';
    card.querySelectorAll('button').forEach(b=>{if(b.id!=='fcReadBtn')b.disabled=!isWritable()});
    document.querySelectorAll('#fcInterest .fc-choice').forEach(b=>b.classList.toggle('selected',b.dataset.value===d.interest));
    document.querySelectorAll('#fcAttendance .fc-choice').forEach(b=>b.classList.toggle('selected',b.dataset.value===d.attendance));
    document.getElementById('fcGuide').classList.toggle('on',!!d.canGuide);
    document.getElementById('fcRecommend').classList.toggle('on',!!d.recommend);
    const rb=document.getElementById('fcReadBtn');
    rb.disabled=!isWritable();
    rb.classList.toggle('done',!!d.readAt);
    rb.textContent=d.readAt?'✓ 既読済み':'✓ 既読にする';
  }
  function miniClass(d){
    if(d.attendance==='no')return'no';
    if(d.attendance==='yes'||d.interest||d.canGuide||d.recommend||d.readAt)return d.attendance==='yes'?'go':'has';
    return'';
  }
  function updateEntry(item,responses){
    if(!item)return;
    const box=item.querySelector('.fc-entry');if(!box)return;
    const mini=box.querySelector('.fc-mini-family');if(!mini)return;
    mini.innerHTML=members.map(m=>'<span class="fc-mini-avatar '+miniClass(responses[m.id]||{})+'" title="'+esc(m.label)+'">'+m.initial+'</span>').join('');
  }
  async function loadEntryStatus(item){
    if(!shouldCollaborate(item))return;
    api=window.tripFamilyAuthApi;
    if(!api?.db||!api?.fs||!window.tripFamilyAuth?.authenticated)return;
    try{
      const base=api.fs.doc(api.db,'trip_items',docId(itemKey(item)));
      const snap=await api.fs.getDocs(api.fs.collection(base,'reads'));
      const got={};snap.forEach(x=>{const d=x.data()||{};if(d.memberId)got[d.memberId]=d});
      updateEntry(item,got);
    }catch(_){}
  }
  function close(){
    modal.classList.remove('show');document.body.style.overflow='';
    if(unsubReads){unsubReads();unsubReads=null} if(unsubComments){unsubComments();unsubComments=null}
  }
  function decorate(){
    document.querySelectorAll('.item').forEach(item=>{
      const existing=item.querySelector('.fc-entry');
      if(!shouldCollaborate(item)){
        existing?.remove();
        return;
      }
      if(existing)return;
      const t=item.querySelector('.title');if(!t)return;
      const box=document.createElement('div');box.className='fc-entry';
      box.innerHTML='<div class="fc-mini-family">'+members.map(m=>'<span class="fc-mini-avatar" title="'+esc(m.label)+'">'+m.initial+'</span>').join('')+'</div><button class="fc-open" type="button">家族メモ・参加状況 ›</button>';
      (t.parentElement||item).appendChild(box);
      box.querySelector('button').onclick=e=>{e.stopPropagation();open(item)};
      if('IntersectionObserver'in window){
        const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();loadEntryStatus(item)}},{rootMargin:'250px'});
        io.observe(item);
      }else setTimeout(()=>loadEntryStatus(item),500);
    });
  }
  async function open(item){
    api=window.tripFamilyAuthApi;currentItem=item;currentKey=itemKey(item);currentResponses={};
    document.getElementById('fcTitle').textContent=(item.querySelector('.title')?.childNodes[0]?.textContent||'予定').trim();
    const p=currentProfile();
    document.getElementById('fcAuth').textContent=p?.authenticated?p.label+'として編集':'ログインすると参加状況・コメントを編集できます';
    document.getElementById('fcSend').disabled=!isWritable();
    document.getElementById('fcText').disabled=!isWritable();
    modal.classList.add('show');document.body.style.overflow='hidden';
    window.tripFamilyLine?.markItemRead(docId(currentKey));
    window.tripUsage?.trackItem(document.getElementById('fcTitle').textContent||'');
    window.tripAnalytics?.track('family_collab_open',{item_title:document.getElementById('fcTitle').textContent||''});
    if(!api?.db||!api?.fs){document.getElementById('fcComments').innerHTML='<div style="font-size:13px;color:#8b8295;margin-top:8px">家族ログイン後に利用できます。</div>';renderFamily();return}
    subscribe();
  }
  function subscribe(){
    const {db,fs}=api,base=fs.doc(db,'trip_items',docId(currentKey));
    unsubReads=fs.onSnapshot(fs.collection(base,'reads'),snap=>{
      const got={};snap.forEach(x=>{const d=x.data()||{};if(d.memberId)got[d.memberId]=d});
      currentResponses=got;renderFamily();
    });
    const q=fs.query(fs.collection(base,'comments'),fs.orderBy('createdAt','asc'));
    unsubComments=fs.onSnapshot(q,snap=>{
      let h='';const me=currentProfile();
      snap.forEach(x=>{
        const d=x.data()||{},mine=me?.uid===d.uid,title=document.getElementById('fcTitle').textContent||'';
        const chips=!mine?'<div class="fc-quick">'+quickReplies(title).map(t=>'<button type="button" data-quick-reply="'+esc(t)+'" data-parent-comment="'+esc(x.id)+'">'+esc(t)+'</button>').join('')+'</div>':'';
        h+='<div class="fc-comment '+(d.parentCommentId?'reply ':'')+'" data-comment-id="'+esc(x.id)+'">'+
          (d.parentCommentId?'<div class="fc-reply-note">↳ 返信</div>':'')+
          '<div class="fc-comment-head"><span class="fc-comment-name">'+esc(d.label||labels[d.memberId]||'家族')+'</span><span class="fc-comment-time">'+esc(formatTime(d.createdAt))+'</span></div>'+
          '<div style="font-size:13px;color:#5f687a;margin-top:3px">'+esc(d.text)+'</div>'+chips+'</div>';
      });
      const host=document.getElementById('fcComments');
      host.innerHTML=h||'<div style="font-size:13px;color:#8b8295;margin-top:8px">まだコメントはありません。</div>';
      if(pendingCommentId){
        const target=host.querySelector('[data-comment-id="'+CSS.escape(pendingCommentId)+'"]');
        if(target){setTimeout(()=>{target.scrollIntoView({behavior:'smooth',block:'center'});target.classList.add('flash');setTimeout(()=>target.classList.remove('flash'),1800)},100);pendingCommentId=''}
      }
    },()=>{});
  }
  async function saveOwn(patch){
    const p=currentProfile();if(!isWritable()||!api?.db)return;
    const state=document.getElementById('fcSaveState');state.textContent='保存中…';
    try{
      const {db,fs}=api,base=fs.doc(db,'trip_items',docId(currentKey));
      await fs.setDoc(fs.doc(base,'reads',p.uid),{
        uid:p.uid,memberId:p.memberId,label:p.label,...patch,updatedAt:fs.serverTimestamp()
      },{merge:true});
      state.textContent='保存しました';
      const title=document.getElementById('fcTitle').textContent||'';
      if(Object.prototype.hasOwnProperty.call(patch,'interest')){window.tripAnalytics?.track('family_interest_set',{item_title:title,value:patch.interest});window.tripUsage?.trackAction('family_interest_set')}
      if(Object.prototype.hasOwnProperty.call(patch,'attendance')){window.tripAnalytics?.track('family_attendance_set',{item_title:title,value:patch.attendance});window.tripUsage?.trackAction('family_attendance_set')}
      if(Object.prototype.hasOwnProperty.call(patch,'canGuide')){window.tripAnalytics?.track('family_guide_set',{item_title:title,value:patch.canGuide?'yes':'no'});window.tripUsage?.trackAction('family_guide_set')}
      if(Object.prototype.hasOwnProperty.call(patch,'recommend')){window.tripAnalytics?.track('family_recommend_set',{item_title:title,value:patch.recommend?'yes':'no'});window.tripUsage?.trackAction('family_recommend_set')}
      setTimeout(()=>{if(state.textContent==='保存しました')state.textContent=''},1200);
    }catch(e){state.textContent='保存できませんでした';console.warn(e)}
  }

  document.querySelectorAll('#fcInterest .fc-choice').forEach(b=>b.onclick=()=>saveOwn({interest:b.dataset.value,readAt:api.fs.serverTimestamp()}));
  document.querySelectorAll('#fcAttendance .fc-choice').forEach(b=>b.onclick=()=>saveOwn({attendance:b.dataset.value,readAt:api.fs.serverTimestamp()}));
  document.getElementById('fcGuide').onclick=()=>saveOwn({canGuide:!ownResponse().canGuide,readAt:api.fs.serverTimestamp()});
  document.getElementById('fcRecommend').onclick=()=>saveOwn({recommend:!ownResponse().recommend,readAt:api.fs.serverTimestamp()});
  document.getElementById('fcReadBtn').onclick=()=>saveOwn({readAt:api.fs.serverTimestamp()});

  async function postComment(text,parentCommentId='',quickReply=false){
    const p=currentProfile();text=String(text||'').trim();
    if(!isWritable()||!text)return;
    const {db,fs}=api,itemId=docId(currentKey),base=fs.doc(db,'trip_items',itemId);
    await fs.addDoc(fs.collection(base,'comments'),{
      uid:p.uid,memberId:p.memberId,label:p.label,text,
      itemKey:currentKey,itemTitle:document.getElementById('fcTitle').textContent||'',
      parentCommentId:parentCommentId||null,quickReply:!!quickReply,
      createdAt:fs.serverTimestamp()
    });
    window.tripAnalytics?.track(quickReply?'family_quick_reply':'family_comment_add',{item_title:document.getElementById('fcTitle').textContent||''});
    window.tripUsage?.trackAction(quickReply?'family_quick_reply':'family_comment_add');
    await saveOwn({readAt:fs.serverTimestamp()});
  }
  document.getElementById('fcSend').onclick=async()=>{
    const input=document.getElementById('fcText'),text=input.value.trim();
    if(!text)return;
    await postComment(text);
    input.value='';
  };
  document.getElementById('fcComments').addEventListener('click',async e=>{
    const b=e.target.closest('[data-quick-reply]');if(!b)return;
    b.disabled=true;
    try{await postComment(b.dataset.quickReply,b.dataset.parentComment||'',true)}finally{b.disabled=false}
  });
  document.getElementById('fcText').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();document.getElementById('fcSend').click()}});

  document.addEventListener('tripFamilyAuthReady',()=>{decorate();document.querySelectorAll('.item').forEach(loadEntryStatus)});
  setTimeout(decorate,800);
  function openByDocId(id,commentId=''){
    const item=[...document.querySelectorAll('.item')].find(x=>shouldCollaborate(x)&&docId(itemKey(x))===id);
    if(!item)return false;
    pendingCommentId=commentId||'';
    open(item);
    return true;
  }
  window.tripFamilyCollab={open,close,openByDocId,itemKey,docId};
})();