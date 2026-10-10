(async function(){
  const app=document.querySelector('.wrap');
  if(!app) return;
  app.style.display='none';

  const td=new TextDecoder();
  function b64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const x=atob(s),a=new Uint8Array(x.length);for(let i=0;i<x.length;i++)a[i]=x.charCodeAt(i);return a}

  let resData,fullData;
  async function loadData(){
    if(!resData) resData=await fetch('reservations.json?ts='+Date.now(),{cache:'no-store'}).then(r=>r.json());
  }
  async function loadFullData(){
    if(!fullData) fullData=await fetch('full-info.enc.json?ts='+Date.now(),{cache:'no-store'}).then(r=>r.json());
  }
  async function importPrivate(jwk){
    return crypto.subtle.importKey('jwk',jwk,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt']);
  }
  async function decryptReservations(pk){
    await loadData();
    const out={};
    for(const [name,ct] of Object.entries(resData.items||{})){
      const pt=await crypto.subtle.decrypt({name:'RSA-OAEP'},pk,b64u(ct));
      out[name]=td.decode(pt);
    }
    window.tripReservations=out;
    document.dispatchEvent(new CustomEvent('tripReservationsReady',{detail:out}));
  }
  async function decryptFullInfo(pk){
    const out={};
    try{
      await loadFullData();
      for(const [name,o] of Object.entries(fullData.items||{})){
        try{
          const raw=await crypto.subtle.decrypt({name:'RSA-OAEP'},pk,b64u(o.key));
          const aes=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']);
          const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64u(o.iv)},aes,b64u(o.ct));
          out[name]=JSON.parse(td.decode(pt));
        }catch(_){}
      }
    }catch(_){}
    window.tripFullInfo=out;
    document.dispatchEvent(new CustomEvent('tripFullInfoReady',{detail:out}));
  }

  const gate=document.createElement('div');
  gate.id='vaultStatusGate';
  gate.style.cssText='position:fixed;inset:0;z-index:1700;background:#fffaf6;display:flex;align-items:center;justify-content:center;padding:20px';
  gate.innerHTML='<div style="width:min(430px,100%);background:#fff;border:1px solid #ddd;border-radius:20px;padding:22px;box-shadow:0 16px 40px rgba(0,0,0,.12)">'+
    '<div style="font-size:12px;color:#65716e">Tsuruta Family Trip 2026</div>'+
    '<h2 id="vaultStatusTitle" style="margin:6px 0 4px">旅行サイトを準備しています</h2>'+
    '<p id="vaultStatusNote" style="font-size:13px;color:#65716e;line-height:1.55">この家族アカウントには予約情報を開くための鍵が登録されていません。パパに確認してください。</p>'+
    '<button id="vaultLogin" type="button" style="width:100%;margin-top:12px;border:0;border-radius:12px;background:#eee8f7;color:#5f527c;font-weight:800;padding:12px">家族アカウントでログイン</button>'+ 
    '<button id="vaultLogout" type="button" style="width:100%;margin-top:10px;border:0;background:transparent;color:#687eab;font-weight:800;padding:8px">ログアウト</button>'+
    '</div>';
  document.body.appendChild(gate);

  function showGate(msg){
    app.style.display='none';
    document.getElementById('vaultStatusTitle').textContent='暗号鍵を確認できません';
    document.getElementById('vaultLogin').style.display='none';
    document.getElementById('vaultStatusNote').textContent=msg||'この家族アカウントには予約情報を開くための鍵が登録されていません。パパに確認してください。';
    gate.style.display='flex';
  }
  function hideGate(){gate.style.display='none'}

  async function getOwnVaultJwk(){
    const api=window.tripFamilyAuthApi,auth=window.tripFamilyAuth;
    if(!api||!auth?.authenticated) return null;
    const ref=api.fs.doc(api.db,'family_users',auth.uid);
    const snap=await api.fs.getDoc(ref);
    if(!snap.exists()) return null;
    return snap.data()?.vaultPrivateJwk||null;
  }

  async function unlockWith(jwk){
    const pk=await importPrivate(jwk);
    await decryptReservations(pk);
    app.style.display='block';
    hideGate();
    decryptFullInfo(pk);
  }

  let handling=false;
  async function handleAuth(profile){
    if(handling) return;
    handling=true;
    try{
      if(!profile?.authenticated){
        app.style.display='none';
        document.getElementById('vaultStatusTitle').textContent='家族ログインが必要です';
        document.getElementById('vaultStatusNote').textContent='アカウント画面からログインすると旅行日程を表示できます。';
        document.getElementById('vaultLogin').style.display='block';
        gate.style.display='flex';
        return;
      }
      const jwk=await getOwnVaultJwk();
      if(!jwk){
        showGate();
        return;
      }
      await unlockWith(jwk);
    }catch(e){
      console.warn('Family vault unavailable',e);
      showGate('予約情報の暗号鍵を読み込めませんでした。いったんログアウトして、もう一度ログインしてください。');
    }finally{
      handling=false;
    }
  }

  document.getElementById('vaultLogin').onclick=()=>window.openTripFamilyAccount?.();
  document.getElementById('vaultLogout').onclick=async()=>{
    try{await window.tripFamilyAuthApi?.authMod?.signOut(window.tripFamilyAuthApi.auth)}catch(_){}
  };

  document.addEventListener('tripFamilyAuthReady',e=>handleAuth(e.detail));
  if(window.tripFamilyAuth) handleAuth(window.tripFamilyAuth);
  setTimeout(()=>{
    if(app.style.display==='none' && gate.style.display!=='none' && !window.tripFamilyAuth?.authenticated){
      document.getElementById('vaultStatusTitle').textContent='ログイン状態を確認できません';
      document.getElementById('vaultStatusNote').textContent='アカウントからログインしてください。接続できない場合は通信状況を確認し、再読み込みしてください。';
      document.getElementById('vaultLogin').style.display='block';
    }
  },6000);

  window.forgetTripDevice=async function(){
    try{await window.tripFamilyAuthApi?.authMod?.signOut(window.tripFamilyAuthApi.auth)}catch(_){}
    alert('家族アカウントからログアウトしました。');
  };
})();