(function(){
  const STORE='tsuruta_family_planning_v1';
  const ADMIN='family_01';
  const plans={
    'Christmas Eve Dinner':{
      question:'クリスマスイブの夕食、どれが良い？',
      recs:[
        {id:'waikiki_view',name:'ワイキキで景色の良いディナー',why:'移動が少なく、イブらしい雰囲気を作りやすい。'},
        {id:'hawaiian',name:'ハワイ料理を楽しむ',why:'家族旅行らしさを優先。早めの予約向き。'},
        {id:'casual',name:'カジュアルにして夜散歩',why:'食事を軽めにし、ワイキキ散策の時間を取れる。'}
      ]
    },
    'ビーチ・観光':{
      question:'12/24午前、どんな過ごし方が良い？',
      recs:[
        {id:'diamond',name:'Diamond Head＋Waikiki',why:'初めてでも満足度が高く、午前に動きやすい。'},
        {id:'beach',name:'Waikiki Beachをゆっくり',why:'到着翌日なので無理をせず時差調整しやすい。'},
        {id:'kcc',name:'街歩き＋カフェ',why:'体力を使いすぎず家族で話しながら過ごせる。'}
      ]
    },
    '買い物・観光':{
      question:'12/24午後は何を優先する？',
      recs:[
        {id:'ala_moana',name:'Ala Moanaで買い物',why:'買い物をまとめやすく、家族それぞれ自由時間も作れる。'},
        {id:'waikiki_walk',name:'Waikiki周辺を散策',why:'移動負担が少なく、イブの街の雰囲気を楽しめる。'},
        {id:'rest',name:'ホテル休憩＋夕食準備',why:'夜のディナーを中心にして疲れを残しにくい。'}
      ]
    },
    '終日自由行動':{
      question:'12/26の1日、何をしたい？',
      recs:[
        {id:'north_shore',name:'North Shore方面へ',why:'ホノルルとは違う景色を楽しめる1日観光。'},
        {id:'east_oahu',name:'東海岸ドライブ・観光',why:'海岸景観を楽しみながら比較的まとまりやすい。'},
        {id:'waikiki_free',name:'Waikikiで完全自由行動',why:'旅行後半に備えて各自の希望を優先できる。'}
      ]
    },
    '夕食':{
      question:'この日の夕食、どの方向が良い？',
      recs:[
        {id:'local',name:'現地らしい料理',why:'その土地ならではの食事を優先。'},
        {id:'nearby',name:'ホテル近くで便利に',why:'移動を減らして翌日の予定に備える。'},
        {id:'family_choice',name:'当日、家族投票で決める',why:'その日の体調や気分を反映しやすい。'}
      ]
    }
  };

  function read(){
    if(window.tripSharedPlanning?.read)return window.tripSharedPlanning.read();
    try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(_){return {}}
  }
  function save(s){localStorage.setItem(STORE,JSON.stringify(s));}
  function me(){return window.tripFamilyProfile?.id||null}
  function label(id){return ({family_01:'Henri',family_02:'Emi',family_03:'Saki',family_04:'Takeru'})[id]||id}
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function keyFor(item){const sec=item.closest('.section')?.id||'';const title=(item.querySelector('.title')?.childNodes[0]?.textContent||item.querySelector('.title')?.textContent||'').trim();return sec+'|'+title}
  function baseTitle(item){return (item.querySelector('.title')?.childNodes[0]?.textContent||item.querySelector('.title')?.textContent||'').trim()}
  function isFixedTravel(title){
    return /Delta DL198|AC1783|AC1782|ZIPAIR ZG21|Waikiki Shore|Coast Coal Harbour|Chateau Victoria|West Coast Suites|チェックイン|チェックアウト/.test(title);
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
  summaryOverlay.innerHTML='<div class="fps-shell"><div class="fp-head" style="position:sticky;top:0;z-index:3;background:rgba(255,250,246,.96);backdrop-filter:blur(8px);border-bottom:1px solid #e9e2ed;padding:12px 16px;display:flex;align-items:center;gap:12px"><button id="fpsBack" class="fp-back" aria-label="戻る">‹</button><div><div style="font-weight:800;font-size:18px">家族の希望一覧</div><div style="font-size:11px;color:#8b8295">Henri 管理者ビュー</div></div></div><div id="fpsBody" style="padding:16px 14px 34px"></div></div>';
  document.body.appendChild(summaryOverlay);
  document.getElementById('fpsBack').onclick=()=>{summaryOverlay.style.display='none';document.body.style.overflow=''};

  let current=null;
  function render(){
    if(!current)return;
    const {item,key,title}=current,p=planFor(title),state=read(),entry=state[key]||{votes:{},decision:null};
    const body=document.getElementById('fpBody');
    let html='<div class="fp-card"><div style="font-size:11px;color:#9a8eaa;font-weight:800">'+esc(item.closest('.section')?.querySelector('h2')?.textContent||'')+'</div><h2 style="margin:4px 0 8px;color:#273247">'+esc(title)+'</h2><div style="color:#6f788c">'+esc(p.question)+'</div></div>';
    p.recs.forEach(r=>{
      const chosen=entry.decision===r.id;
      const voters=Object.entries(entry.votes||{}).filter(([,v])=>v.choice===r.id);
      html+='<div class="fp-rec '+(chosen?'chosen':'')+'"><div style="font-weight:800;color:#273247">'+esc(r.name)+(chosen?' <span style="font-size:11px;color:#527bb2">✓ 決定</span>':'')+'</div><div style="font-size:13px;color:#7b8293;margin-top:3px">'+esc(r.why)+'</div><div class="fp-votes">'+(voters.length?voters.map(([id,v])=>esc(label(id))+' '+(v.feel==='like'?'👍':v.feel==='neutral'?'○':'△')).join(' · '):'まだ希望なし')+'</div><div class="fp-actions"><button data-vote="'+r.id+'" data-feel="like">👍 行きたい</button><button data-vote="'+r.id+'" data-feel="neutral">○ どちらでも</button><button data-vote="'+r.id+'" data-feel="other">△ 別案希望</button></div>'+(me()===ADMIN?'<div class="fp-admin"><button data-decide="'+r.id+'">Henriとして「'+esc(r.name)+'」に決定</button></div>':'')+'</div>';
    });
    if(me()!==ADMIN)html+='<div style="font-size:12px;color:#81788f;text-align:center;margin-top:14px">家族の希望を見て、最終決定はHenriが行います。</div>';
    body.innerHTML=html;
    body.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>{
      const uid=me(); if(!uid){alert('右下から利用者を選んでください。');return}
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
      if(me()!==ADMIN)return;
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
    return [...document.querySelectorAll('.item[data-family-plan="1"]')].map(item=>({
      item,key:keyFor(item),title:baseTitle(item),
      date:(item.closest('.section')?.querySelector('h2')?.textContent||'').trim()
    }));
  }
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
    const admin=me()===ADMIN;
    summaryBtn.classList.toggle('show',admin);
  }
  summaryBtn.onclick=()=>{renderSummary();summaryOverlay.style.display='block';summaryOverlay.scrollTop=0;document.body.style.overflow='hidden';window.tripAnalytics?.track('family_summary_open',{})};
  document.addEventListener('tripFamilyProfileReady',refreshAdmin);
  document.addEventListener('tripSharedPlanningUpdated',()=>{if(current)render();if(summaryOverlay.style.display==='block')renderSummary();});
  setTimeout(refreshAdmin,500);

  document.querySelectorAll('.item').forEach(item=>{
    if(item.querySelector('.badge.ok'))return;
    const title=baseTitle(item);
    if(!title || isFixedTravel(title) || /自宅を出発|空港.*到着|入国・荷物|帰宅|荷造り|ホテルへ戻って準備/.test(title))return;
    item.style.cursor='pointer';item.dataset.familyPlan='1';
    const t=item.querySelector('.title');
    if(t&&!t.querySelector('.planning-hint'))t.insertAdjacentHTML('beforeend','<span class="planning-hint"> 家族で相談 ›</span>');
    item.addEventListener('click',e=>{if(e.target.closest('a,button,summary,details'))return;open(item)});
  });

  window.tripFamilyPlanning={open,read,renderSummary};
})();