
(function(){
  const KEY='tsuruta_family_profile_v1';
  const members=[
    {label:'パパ',id:'family_01'},
    {label:'Emi',id:'family_02'},
    {label:'Saki',id:'family_03'},
    {label:'Takeru',id:'family_04'}
  ];

  function read(){
    try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch(_){return null}
  }
  function write(m){
    localStorage.setItem(KEY,JSON.stringify({id:m.id,label:m.label}));
    window.tripFamilyProfile={id:m.id};
    renderBadge();
    document.dispatchEvent(new CustomEvent('tripFamilyProfileReady',{detail:{id:m.id,source:'selection'}}));
  }

  const style=document.createElement('style');
  style.textContent=
    '.family-profile-modal{position:fixed;inset:0;z-index:5000;background:rgba(39,50,71,.42);display:none;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(5px)}'+
    '.family-profile-modal.show{display:flex}.family-profile-box{width:min(420px,100%);background:#fffaf6;border:1px solid #e7dfeb;border-radius:20px;padding:20px;box-shadow:0 18px 50px rgba(70,62,95,.18)}'+
    '.family-profile-kicker{font-size:10px;letter-spacing:.14em;font-weight:800;color:#9a8faa}.family-profile-title{font-size:22px;font-weight:800;color:#273247;margin:3px 0 6px}.family-profile-note{font-size:13px;color:#7c8494;margin-bottom:14px;line-height:1.5}.family-profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.family-profile-choice{min-height:48px;border-radius:13px;border:1px solid #ddd7e8;background:linear-gradient(135deg,#f8fcff,#f8f3ff);font:inherit;font-weight:800;color:#46536b;cursor:pointer}'+
    '.family-profile-badge{position:fixed;right:12px;bottom:12px;z-index:90;display:none;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;border:1px solid #e1dbea;background:rgba(255,255,255,.92);backdrop-filter:blur(7px);box-shadow:0 4px 14px rgba(80,72,102,.08);font-size:11px;color:#69758c;cursor:pointer}.family-profile-badge.show{display:flex}.family-profile-dot{width:7px;height:7px;border-radius:50%;background:#8eb1df}';
  document.head.appendChild(style);

  const modal=document.createElement('div');
  modal.className='family-profile-modal';
  modal.innerHTML=
    '<div class="family-profile-box">'+
      '<div class="family-profile-kicker">FAMILY DEVICE</div>'+
      '<div class="family-profile-title">このiPhoneを使っている人</div>'+
      '<div class="family-profile-note">初回のみ選択してください。この端末に保存します。</div>'+
      '<div class="family-profile-grid">'+
        members.map(m=>'<button type="button" class="family-profile-choice" data-member="'+m.id+'">'+m.label+'</button>').join('')+
      '</div>'+
    '</div>';
  document.body.appendChild(modal);

  const badge=document.createElement('button');
  badge.type='button';
  badge.className='family-profile-badge';
  badge.setAttribute('aria-label','利用者を変更');
  document.body.appendChild(badge);

  function renderBadge(){
    const s=read();
    if(!s){badge.classList.remove('show');return}
    badge.innerHTML='<span class="family-profile-dot"></span><span>'+s.label+'</span><span>変更</span>';
    badge.classList.add('show');
  }
  function open(){modal.classList.add('show')}
  function close(){modal.classList.remove('show')}

  modal.addEventListener('click',e=>{
    const b=e.target.closest('.family-profile-choice');
    if(!b)return;
    const m=members.find(x=>x.id===b.dataset.member);
    if(!m)return;
    write(m);
    close();
  });
  badge.addEventListener('click',open);

  const current=read();
  if(current){
    if(current.id==='family_01' && current.label!=='パパ'){
      current.label='パパ';
      localStorage.setItem(KEY,JSON.stringify(current));
    }
    window.tripFamilyProfile={id:current.id};
    renderBadge();
    document.dispatchEvent(new CustomEvent('tripFamilyProfileReady',{detail:{id:current.id,source:'stored'}}));
  }else{
    setTimeout(open,400);
  }
})();