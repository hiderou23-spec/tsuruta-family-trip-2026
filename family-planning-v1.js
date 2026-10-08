(function(){
  const STORE='tsuruta_family_planning_v1';
  const ADMIN='family_01';
  const plans={
    'Christmas Eve Dinner':{
      question:'クリスマスイブの夕食、どれが良い？',
      recs:[
        {id:'waikiki_view',name:'景色の良い特別ディナー',why:'12/24らしい特別感を優先。早めの予約向き。'},
        {id:'hawaiian',name:'ハワイ料理を楽しむ',why:'旅行らしさと家族での楽しさを優先。'},
        {id:'casual',name:'カジュアル＋夜散歩',why:'食事を軽めにしてワイキキの夜を楽しむ。'}
      ]
    },
    'ハワイ最後の夕食':{
      question:'ハワイ最後の夜、どんな夕食にする？',
      recs:[
        {id:'local',name:'ハワイらしい料理',why:'最後にローカルフードを楽しむ。'},
        {id:'favorite',name:'家族の好きなものを優先',why:'旅行終盤なので全員が食べたいものを選ぶ。'},
        {id:'easy',name:'Waikikiで気軽に',why:'翌日の移動に備えてゆったり締める。'}
      ]
    },
    'Hawaii Waikīkī Gun Club':{
      question:'Takeruの射撃体験、どうする？',
      recs:[
        {id:'waikiki_gun_club',name:'Waikīkī Gun Clubに行きたい',why:'ワイキキ中心部で移動が楽。16歳でも保護者同伴で利用可能。'},
        {id:'808_gun_club',name:'808 Gun Clubも見て決めたい',why:'Kakaʻakoの候補。パッケージ内容を比べてから決める。'},
        {id:'skip_shooting',name:'今回は見送る',why:'最終日をもっとゆっくり過ごしたい場合はこちら。'}
      ]
    },
    'Victoria / UBC 時間配分':{
      question:'Victoriaを少し短くして、12/29午後をUBCに使う案でどう？',
      recs:[
        {id:'ubc_priority',name:'この案で進めたい',why:'VictoriaはInner Harbour＋Butchart Gardensに絞り、午後は咲喜の寮・キャンパス・生活圏を見る。'},
        {id:'victoria_priority',name:'Victoriaをもう少し見たい',why:'Victoria滞在を長くして、UBCの時間を短くする。'},
        {id:'neutral',name:'どちらでもよい',why:'家族全体の希望に合わせる。'}
      ]
    }
  };

  function read(){
    if(window.tripSharedPlanning?.read)return window.tripSharedPlanning.read();
    try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(_){return {}}
  }
  function save(s){localStorage.setItem(STORE,JSON.stringify(s));}
  function me(){return window.tripFamilyAuth?.authenticated?window.tripFamilyAuth.memberId:(window.tripFamilyProfile?.id||null)}
  function isAdmin(){return window.tripFamilyAuth?.authenticated?window.tripFamilyAuth.role==='admin':me()===ADMIN}
  function label(id){return ({family_01:'パパ',family_02:'Emi',family_03:'Saki',family_04:'Takeru'})[id]||id}
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function keyFor(item){const sec=item.closest('.section')?.id||'';const title=(item.querySelector('.title')?.childNodes[0]?.textContent||item.querySelector('.title')?.textContent||'').trim();return sec+'|'+title}
  function baseTitle(item){return (item.querySelector('.title')?.childNodes[0]?.textContent||item.querySelector('.title')?.textContent||'').trim()}
  function shouldConsult(title){
    const t=(title||'').replace(/\s+/g,' ').trim();
    return t==='Christmas Eve Dinner'
      || t==='ハワイ最後の夕食'
      || t==='Hawaii Waikīkī Gun Club'
      || t==='Victoria / UBC 時間配分';
  }
  function planFor(title){
    if(plans[title])return plans[title];
    if(/朝食|昼食/.test(title))return {question:'家族の希望を聞きますか？',recs:[
      {id:'quick',name:'近くで手早く',why:'移動時間を減らせる。'},
      {id:'local',name:'現地らしい店を探す',why:'食事自体を旅行体験にできる。'},
      {id:'decide_later',name:'前日に決める',why:'体調と当日の動線に合わせやすい。'}
    ]};
    return {question:'この予定をどうする？',recs:[
      {id:'keep',name:'この案で進める',why:'現在の旅程をベースにする。'},
      {id:'relax',name:'ゆったりめに変更',why:'移動や疲労を抑える。'},
      {id:'other',name:'別案を考える',why:'家族の希望を見て候補を見直す。'}
    ]};
  }

  const style=document.createElement('style');
  style.textContent=`
    #familyPlanOverlay{position:fixed;inset:0;z-index:1400;background:#fffaf6;display:none;overflow:auto}
    #familyPlanOverlay .fp-shell{max-width:760px;margin:0 auto;min-height:100%;background:linear-gradient(180deg,#fffaf6,#f9fbff 60%,#fff)}
    #familyPlanOverlay .fp-head{position:sticky;top:0;z-index:3;background:rgba(255,250,246,.96);backdrop-filter:blur(8px);border-bottom:1px solid #e9e2ed;padding:12px 16px;display:flex;align-items:center;gap:12px}
    #familyPlanOverlay .fp-back{width:44px;height:44px;border-radius:50%;border:1px solid #e1dbea;background:#f5f1fb;color:#5f6d85;font-size:28px}
    .fp-card{background:#fff;border:1px solid #e8e1eb;border-radius:16px;padding:15px;margin:10px 0;box-shadow:0 5px 14px rgba(82,76,110,.05)}
    .fp-rec{border:1px solid #e6dfeb;border-radius:14px;padding:12px;margin:9px 0;background:#fff}
    .fp-rec.chosen{box-shadow:inset 0 0 0 2px #8eb1df;background:#f7fbff}
    .fp-votes{font-size:12px;color:#7b8293;margin-top:8px}
    .fp-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
    .fp-actions button{border:1px solid #ddd7e8;background:#fff;border-radius:10px;padding:8px 10px;font-weight:700;color:#526077}
    .fp-admin{margin-top:10px;padding-top:10px;border-top:1px dashed #e4ddec}
    .fp-admin button{width:100%;border:0;border-radius:12px;padding:10px;background:linear-gradient(135deg,#82b9eb,#ad93de);color:#fff;font-weight:800}
    .planning-hint{font-size:10px;color:#8d83a0;margin-left:5px}
    .fp-summary-btn{position:fixed;right:12px;bottom:54px;z-index:91;display:none;border:1px solid #dfd8e8;background:rgba(255,255,255,.94);backdrop-filter:blur(7px);box-shadow:0 4px 14px rgba(80,72,102,.08);border-radius:999px;padding:8px 11px;font-size:11px;font-weight:800;color:#5d6880}
    .fp-summary-btn.show{display:block}
    #familySummaryOverlay{position:fixed;inset:0;z-index:1450;background:#fffaf6;display:none;overflow:auto}
    #familySummaryOverlay .fps-shell{max-width:760px;margin:0 auto;min-height:100%;background:linear-gradient(180deg,#fffaf6,#f9fbff 60%,#fff)}
    .fps-row{background:#fff;border:1px solid #e8e1eb;border-radius:16px;padding:14px;margin:10px 0;box-shadow:0 5px 14px rgba(82,76,110,.05)}
    .fps-member{display:flex;justify-content:space-between;gap:8px;padding:5px 0;border-top:1px solid #f0ebf3;font-size:13px}
    .fp-home-card{margin:10px 0 12px;padding:14px;border:1px solid #e5deeb;border-radius:18px;background:linear-gradient(135deg,#f8fcff,#f8f4ff 58%,#fff9ef);box-shadow:0 7px 18px rgba(82,76,110,.06)}
    .fp-home-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
    .fp-home-title{font-weight:800;color:#273247;font-size:16px}.fp-home-count{font-size:12px;color:#7f7891}
    .fp-progress{height:7px;border-radius:999px;background:#ebe7f0;overflow:hidden;margin:10px 0}.fp-progress>span{display:block;height:100%;background:linear-gradient(90deg,#82b9eb,#ad93de);border-radius:inherit}
    .fp-quick{background:#fff;border:1px solid #e8e1eb;border-radius:14px;padding:12px;margin-top:10px}.fp-quick-q{font-size:13px;font-weight:800;color:#35415a;margin-bottom:8px}
    .fp-quick-options{display:grid;gap:7px}.fp-quick-options button{border:1px solid #ddd7e8;background:#fff;border-radius:11px;padding:9px 10px;text-align:left;color:#4e5b72;font-weight:700}
    .fp-home-open{margin-top:10px;border:0;background:transparent;color:#617eb3;font-weight:800;padding:4px 0}
    .fp-done{font-size:13px;color:#527b69;font-weight:800;padding:8px 0}
    .fp-nudge{position:fixed;left:50%;bottom:78px;transform:translateX(-50%);z-index:1500;width:min(420px,calc(100% - 28px));background:#fff;border:1px solid #e5deeb;border-radius:16px;padding:13px 14px;box-shadow:0 14px 34px rgba(72,64,96,.16);display:none}
    .fp-nudge.show{display:block}.fp-nudge b{color:#273247}.fp-nudge-actions{display:flex;gap:8px;margin-top:9px}.fp-nudge-actions button{border:1px solid #ddd7e8;background:#fff;border-radius:10px;padding:8px 10px;font-weight:700;color:#526077}.fp-nudge-actions .primary{background:linear-gradient(135deg,#82b9eb,#ad93de);color:#fff;border:0}
  `;
  document.head.appendChild(style);

  const overlay=document.createElement('div');
  overlay.id='familyPlanOverlay';
  overlay.innerHTML='<div class="fp-shell"><div class="fp-head"><button class="fp-back" aria-label="戻る">‹</button><div><div style="font-weight:800;font-size:18px">家族で決める</div><div id="fpSyncState" style="font-size:11px;color:#8b8295">この端末に保存中</div></div></div><div id="fpBody" style="padding:16px 14px 34px"></div></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('.fp-back').onclick=()=>{overlay.style.display='none';document.body.style.overflow=''};

  const summaryBtn=document.createElement('button');
  summaryBtn.type='button';summaryBtn.className='fp-summary-btn';summaryBtn.textContent='👨‍👩‍👧‍👦 家族の希望一覧';
  document.body.appendChild(summaryBtn);

  const summaryOverlay=document.createElement('div');
  summaryOverlay.id='familySummaryOverlay';
  summaryOverlay.innerHTML='<div class="fps-shell"><div class="fp-head" style="position:sticky;top:0;z-index:3;background:rgba(255,250,246,.96);backdrop-filter:blur(8px);border-bottom:1px solid #e9e2ed;padding:12px 16px;display:flex;align-items:center;gap:12px"><button id="fpsBack" class="fp-back" aria-label="戻る">‹</button><div><div style="font-weight:800;font-size:18px">家族の希望一覧</div><div style="font-size:11px;color:#8b8295">パパ 管理者ビュー</div></div></div><div id="fpsBody" style="padding:16px 14px 34px"></div></div>';
  document.body.appendChild(summaryOverlay);
  document.getElementById('fpsBack').onclick=()=>{summaryOverlay.style.display='none';document.body.style.overflow=''};

  const homeCard=document.createElement('section');
  homeCard.id='familyPlanningHome';
  homeCard.className='fp-home-card';
  const navwrap=document.querySelector('.navwrap');
  if(navwrap)navwrap.insertAdjacentElement('afterend',homeCard);

  const nudge=document.createElement('div');
  nudge.className='fp-nudge';nudge.id='fpNudge';
  nudge.innerHTML='<b id="fpNudgeText"></b><div class="fp-nudge-actions"><button type="button" id="fpNudgeLater">あとで</button><button type="button" class="primary" id="fpNudgeAnswer">答える</button></div>';
  document.body.appendChild(nudge);

  let current=null;
  function render(){
    if(!current)return;
    const {item,key,title}=current,p=planFor(title),state=read(),entry=state[key]||{votes:{},decision:null};
    const body=document.getElementById('fpBody');
    let html='<div class="fp-card"><div style="font-size:11px;color:#9a8eaa;font-weight:800">'+esc(item.closest('.section')?.querySelector('h2')?.textContent||'')+'</div><h2 style="margin:4px 0 8px;color:#273247">'+esc(title)+'</h2><div style="color:#6f788c">'+esc(p.question)+'</div></div>';
    p.recs.forEach(r=>{
      const chosen=entry.decision===r.id;
      const voters=Object.entries(entry.votes||{}).filter(([,v])=>v.choice===r.id);
      html+='<div class="fp-rec '+(chosen?'chosen':'')+'"><div style="font-weight:800;color:#273247">'+esc(r.name)+(chosen?' <span style="font-size:11px;color:#527bb2">✓ 決定</span>':'')+'</div><div style="font-size:13px;color:#7b8293;margin-top:3px">'+esc(r.why)+'</div><div class="fp-votes">'+(voters.length?voters.map(([id,v])=>esc(label(id))+' '+(v.feel==='like'?'👍':v.feel==='neutral'?'○':'△')).join(' · '):'まだ希望なし')+'</div><div class="fp-actions"><button data-vote="'+r.id+'" data-feel="like">👍 行きたい</button><button data-vote="'+r.id+'" data-feel="neutral">○ どちらでも</button><button data-vote="'+r.id+'" data-feel="other">△ 別案希望</button></div>'+(isAdmin()?'<div class="fp-admin"><button data-decide="'+r.id+'">パパとして「'+esc(r.name)+'」に決定</button></div>':'')+'</div>';
    });
    if(!isAdmin())html+='<div style="font-size:12px;color:#81788f;text-align:center;margin-top:14px">家族の希望を見て、最終決定はパパが行います。</div>';
    body.innerHTML=html;
    body.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>{
      const uid=me(); if(!uid){alert('家族ログイン、または利用者選択をしてください。');return}
      if(window.tripFamilyAuth?.authenticated && window.tripFamilyAuth.role==='viewer'){alert('このアカウントは閲覧のみです。');return}
      const vote={choice:b.dataset.vote,feel:b.dataset.feel,updated:Date.now()};
      if(window.tripSharedPlanning?.saveVote)window.tripSharedPlanning.saveVote(key,uid,vote);
      else{
        const s=read(); const e=s[key]||{votes:{},decision:null};
        e.votes=e.votes||{};e.votes[uid]=vote;s[key]=e;save(s);
      }
      window.tripAnalytics?.track('family_preference_set',{plan_key:key,choice:b.dataset.vote,feel:b.dataset.feel});
      render();
    });
    body.querySelectorAll('[data-decide]').forEach(b=>b.onclick=()=>{
      if(!isAdmin())return;
      if(window.tripSharedPlanning?.saveDecision)window.tripSharedPlanning.saveDecision(key,b.dataset.decide);
      else{
        const s=read();const e=s[key]||{votes:{},decision:null};
        e.decision=b.dataset.decide;e.decidedBy=ADMIN;e.decidedAt=Date.now();s[key]=e;save(s);
      }
      window.tripAnalytics?.track('family_plan_decided',{plan_key:key,choice:b.dataset.decide});
      render();
    });
  }
  function open(item){
    const title=baseTitle(item);current={item,key:keyFor(item),title};
    render();overlay.style.display='block';overlay.scrollTop=0;document.body.style.overflow='hidden';
    window.tripAnalytics?.track('family_plan_open',{plan_key:current.key,item_title:title});
  }

  function planningItems(){
    return [...document.querySelectorAll('.item')].map(item=>({
      item,key:keyFor(item),title:baseTitle(item),
      date:(item.closest('.section')?.querySelector('h2')?.textContent||'').trim()
    })).filter(x=>shouldConsult(x.title));
  }
  function unansweredFor(uid){
    if(!uid)return [];
    const s=read();
    return planningItems().filter(r=>!(s[r.key]?.votes||{})[uid]);
  }
  function answeredCount(uid){
    const rows=planningItems(), s=read();
    return rows.filter(r=>!!(s[r.key]?.votes||{})[uid]).length;
  }
  function quickVote(row,choice){
    const uid=me();if(!uid)return;
    const vote={choice,feel:'like',updated:Date.now()};
    if(window.tripSharedPlanning?.saveVote)window.tripSharedPlanning.saveVote(row.key,uid,vote);
    else{const s=read();const e=s[row.key]||{votes:{},decision:null};e.votes=e.votes||{};e.votes[uid]=vote;s[row.key]=e;save(s);}
    window.tripAnalytics?.track('family_quick_answer',{plan_key:row.key,choice});
    renderHome();
  }
  function renderHome(){
    const uid=me(), rows=planningItems();
    if(!uid||!rows.length){homeCard.style.display='none';return}
    homeCard.style.display='block';
    const s=read(), answered=answeredCount(uid), total=rows.length, pending=unansweredFor(uid);
    const pct=Math.round((answered/Math.max(total,1))*100);
    let admin='';
    if(uid===ADMIN){
      const members=['family_01','family_02','family_03','family_04'];
      const totalSlots=total*members.length;
      let allAnswered=0;
      rows.forEach(r=>members.forEach(id=>{if((s[r.key]?.votes||{})[id])allAnswered++}));
      admin='<div style="font-size:11px;color:#8a8295;margin-top:4px">家族全体 '+allAnswered+' / '+totalSlots+' 回答済み</div>';
    }
    let html='<div class="fp-home-top"><div><div class="fp-home-title">みんなに聞きたいこと</div><div class="fp-home-count">'+esc(label(uid))+'：'+answered+' / '+total+' 回答済み</div>'+admin+'</div><div style="font-size:22px">'+(pending.length?'💬':'✓')+'</div></div><div class="fp-progress"><span style="width:'+pct+'%"></span></div>';
    if(pending.length){
      const row=pending[0], p=planFor(row.title);
      html+='<div class="fp-quick"><div style="font-size:10px;color:#9a8eaa;font-weight:800">'+esc(row.date)+'</div><div class="fp-quick-q">'+esc(p.question)+'</div><div class="fp-quick-options">'+p.recs.map(r=>'<button type="button" data-quick="'+esc(r.id)+'">'+esc(r.name)+'</button>').join('')+'</div></div><button type="button" class="fp-home-open">あと '+pending.length+' 件を見る ›</button>';
    }else{
      html+='<div class="fp-done">✓ 回答ありがとう。パパがみんなの希望を見て決めます。</div>';
      if(uid===ADMIN)html+='<button type="button" class="fp-home-open">家族の回答状況を見る ›</button>';
    }
    homeCard.innerHTML=html;
    homeCard.querySelectorAll('[data-quick]').forEach(b=>{
      b.onclick=()=>{const row=unansweredFor(uid)[0];if(row)quickVote(row,b.dataset.quick)};
    });
    homeCard.querySelector('.fp-home-open')?.addEventListener('click',()=>{
      if(uid===ADMIN){renderSummary();summaryOverlay.style.display='block';summaryOverlay.scrollTop=0;document.body.style.overflow='hidden'}
      else{const row=unansweredFor(uid)[0];if(row)open(row.item)}
    });
  }
  function maybeNudge(){
    const uid=me();if(!uid)return;
    const pending=unansweredFor(uid);if(!pending.length)return;
    const d=new Date();const day=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const k='trip_family_nudge_'+uid;
    if(localStorage.getItem(k)===day)return;
    localStorage.setItem(k,day);
    document.getElementById('fpNudgeText').textContent='旅行の希望があと '+pending.length+' 件あります。30秒で答えられます。';
    nudge.classList.add('show');
  }
  document.getElementById('fpNudgeLater').onclick=()=>nudge.classList.remove('show');
  document.getElementById('fpNudgeAnswer').onclick=()=>{nudge.classList.remove('show');const row=unansweredFor(me())[0];if(row)open(row.item)};

  function renderSummary(){
    const s=read(), members=['family_01','family_02','family_03','family_04'];
    const rows=planningItems();
    const body=document.getElementById('fpsBody');
    let voted=0,decided=0;
    rows.forEach(r=>{const e=s[r.key]||{};if(Object.keys(e.votes||{}).length)voted++;if(e.decision)decided++;});
    let html='<div class="fp-card"><div style="font-size:13px;color:#70798c">対象予定 <b>'+rows.length+'</b>件 ・ 回答あり <b>'+voted+'</b>件 ・ 決定済み <b>'+decided+'</b>件</div><div class="fp-sync-note" style="font-size:11px;color:#9a8eaa;margin-top:5px">Firebase接続後は家族全員分を共有表示します。</div></div>';
    rows.forEach(r=>{
      const e=s[r.key]||{votes:{},decision:null}, p=planFor(r.title);
      const decision=p.recs.find(x=>x.id===e.decision);
      html+='<div class="fps-row" data-summary-key="'+esc(r.key)+'"><div style="font-size:10px;color:#9a8eaa;font-weight:800">'+esc(r.date)+'</div><div style="font-weight:800;color:#273247;margin:2px 0 8px">'+esc(r.title)+'</div>';
      html+='<div style="font-size:12px;margin-bottom:8px;color:'+(decision?'#4776a8':'#a06c2f')+'">'+(decision?'✓ 決定：'+esc(decision.name):'未決定')+'</div>';
      members.forEach(id=>{
        const vv=e.votes?.[id];
        const rr=vv?p.recs.find(x=>x.id===vv.choice):null;
        const mark=vv?(vv.feel==='like'?'👍':vv.feel==='neutral'?'○':'△'):'—';
        html+='<div class="fps-member"><b>'+esc(label(id))+'</b><span style="color:#70798c;text-align:right">'+mark+' '+esc(rr?.name||'未回答')+'</span></div>';
      });
      html+='<button type="button" data-open-summary="'+esc(r.key)+'" style="margin-top:10px;border:1px solid #ddd7e8;background:#fff;border-radius:10px;padding:7px 10px;font-weight:700;color:#526077">この予定を開く</button></div>';
    });
    body.innerHTML=html;
    body.querySelectorAll('[data-open-summary]').forEach(b=>b.onclick=()=>{
      const found=rows.find(x=>x.key===b.dataset.openSummary); if(!found)return;
      summaryOverlay.style.display='none'; open(found.item);
    });
  }
  function refreshAdmin(){
    const admin=isAdmin();
    summaryBtn.classList.toggle('show',admin);
  }
  summaryBtn.onclick=()=>{renderSummary();summaryOverlay.style.display='block';summaryOverlay.scrollTop=0;document.body.style.overflow='hidden';window.tripAnalytics?.track('family_summary_open',{})};
  document.addEventListener('tripFamilyProfileReady',()=>{refreshAdmin();renderHome();setTimeout(maybeNudge,700)});
  document.addEventListener('tripFamilyAuthReady',()=>{refreshAdmin();renderHome();if(current)render()});
  document.addEventListener('tripSharedPlanningUpdated',()=>{if(current)render();if(summaryOverlay.style.display==='block')renderSummary();renderHome();});
  setTimeout(()=>{refreshAdmin();renderHome();maybeNudge()},900);

  document.querySelectorAll('.item').forEach(item=>{
    const title=baseTitle(item);
    const t=item.querySelector('.title');
    if(!title || !shouldConsult(title)){
      item.removeAttribute('data-family-plan');
      t?.querySelector('.planning-hint')?.remove();
      item.style.cursor='';
      return;
    }
    item.style.cursor='pointer';item.dataset.familyPlan='1';
    if(t&&!t.querySelector('.planning-hint'))t.insertAdjacentHTML('beforeend','<span class="planning-hint"> 家族で相談 ›</span>');
    item.addEventListener('click',e=>{if(e.target.closest('a,button,summary,details'))return;open(item)});
  });

  window.tripFamilyPlanning={open,read,renderSummary,renderHome};
})();