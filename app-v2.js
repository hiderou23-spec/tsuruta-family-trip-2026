(async function(){
  const app=document.querySelector('.wrap');
  if(!app) return;
  app.style.display='none';

  const te=new TextEncoder(),td=new TextDecoder();
  function b64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const x=atob(s),a=new Uint8Array(x.length);for(let i=0;i<x.length;i++)a[i]=x.charCodeAt(i);return a}

  let cfg,resData,fullData;
  async function loadData(){
    if(!cfg) cfg=await fetch('crypto-config.json',{cache:'no-store'}).then(r=>r.json());
    if(!resData) resData=await fetch('reservations.json?ts='+Date.now(),{cache:'no-store'}).then(r=>r.json());
  }
  async function loadFullData(){
    if(!fullData) fullData=await fetch('full-info.enc.json?ts='+Date.now(),{cache:'no-store'}).then(r=>r.json());
  }
  async function privateFromLegacyPassword(pw){
    await loadData();
    if(!cfg?.encryptedPrivateKey) throw new Error('legacy-key-unavailable');
    const base=await crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveKey']);
    const k=await crypto.subtle.deriveKey(
      {name:'PBKDF2',salt:b64u(cfg.encryptedPrivateKey.salt),iterations:cfg.encryptedPrivateKey.iter,hash:'SHA-256'},
      base,{name:'AES-GCM',length:256},false,['decrypt']
    );
    const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64u(cfg.encryptedPrivateKey.iv)},k,b64u(cfg.encryptedPrivateKey.ct));
    return JSON.parse(td.decode(pt));
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
  gate.id='vaultMigrationGate';
  gate.style.cssText='position:fixed;inset:0;z-index:5100;background:#f6f3ed;display:none;align-items:center;justify-content:center;padding:20px';
  gate.innerHTML='<div style="width:min(430px,100%);background:#fff;border:1px solid #ddd;border-radius:20px;padding:22px;box-shadow:0 16px 40px rgba(0,0,0,.12)">'+
    '<div style="font-size:12px;color:#65716e">Tsuruta Family Trip 2026</div>'+
    '<h2 id="vaultGateTitle" style="margin:6px 0 4px">暗号鍵の初回移行</h2>'+
    '<p id="vaultGateNote" style="font-size:13px;color:#65716e;line-height:1.55">パパのアカウントで一度だけ、これまでの家族共通パスワードを入力してください。4人の家族アカウントへ暗号鍵を登録します。以後、このパスワード入力は不要です。</p>'+
    '<div id="vaultPwArea"><input id="legacyFamilyPw" type="password" autocomplete="current-password" placeholder="これまでの家族共通パスワード" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #bbb;border-radius:9px;font:inherit">'+
    '<div id="vaultErr" style="color:#a33;font-size:12px;min-height:18px;margin-top:8px"></div>'+
    '<button id="vaultMigrate" class="btn" style="width:100%;padding:10px">一度だけ移行する</button></div>'+
    '<button id="vaultLogout" type="button" style="width:100%;margin-top:10px;border:0;background:transparent;color:#687eab;font-weight:800;padding:8px">ログアウト</button>'+
    '</div>';
  document.body.appendChild(gate);

  function showGate(mode,msg){
    gate.style.display='flex';
    const title=document.getElementById('vaultGateTitle');
    const note=document.getElementById('vaultGateNote');
    const area=document.getElementById('vaultPwArea');
    if(mode==='admin'){
      title.textContent='暗号鍵の初回移行';
      note.textContent='パパのアカウントで一度だけ、これまでの家族共通パスワードを入力してください。4人の家族アカウントへ暗号鍵を登録します。以後、このパスワード入力は不要です。';
      area.style.display='block';
    }else{
      title.textContent='初期設定待ち';
      note.textContent=msg||'パパのアカウントで暗号鍵の初回移行を完了すると、このアカウントでも予約情報を開けます。';
      area.style.display='none';
    }
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

  async function provisionFamilyVault(jwk){
    const api=window.tripFamilyAuthApi;
    const q=await api.fs.getDocs(api.fs.collection(api.db,'family_users'));
    const writes=[];
    q.forEach(s=>{
      const d=s.data()||{};
      if(d.active===false) return;
      writes.push(api.fs.updateDoc(api.fs.doc(api.db,'family_users',s.id),{
        vaultPrivateJwk:jwk,
        vaultVersion:1,
        vaultProvisionedAt:api.fs.serverTimestamp()
      }));
    });
    await Promise.all(writes);
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
        hideGate();
        return;
      }
      const jwk=await getOwnVaultJwk();
      if(jwk){
        await unlockWith(jwk);
        return;
      }
      app.style.display='none';
      if(profile.role==='admin') showGate('admin');
      else showGate('wait');
    }catch(e){
      app.style.display='none';
      showGate('wait','暗号鍵を読み込めませんでした。パパの初期設定完了後にもう一度ログインしてください。');
      console.warn('Family vault unavailable',e);
    }finally{
      handling=false;
    }
  }

  document.getElementById('vaultMigrate').onclick=async()=>{
    const err=document.getElementById('vaultErr');
    err.textContent='移行しています…';
    try{
      const jwk=await privateFromLegacyPassword(document.getElementById('legacyFamilyPw').value);
      await provisionFamilyVault(jwk);
      document.getElementById('legacyFamilyPw').value='';
      err.textContent='';
      await unlockWith(jwk);
      alert('移行が完了しました。今後は家族ログインだけで予約情報を開けます。');
    }catch(e){
      console.warn(e);
      err.textContent='移行できませんでした。これまでの家族共通パスワードを確認してください。';
    }
  };
  document.getElementById('legacyFamilyPw').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('vaultMigrate').click()});
  document.getElementById('vaultLogout').onclick=async()=>{
    try{await window.tripFamilyAuthApi?.authMod?.signOut(window.tripFamilyAuthApi.auth)}catch(_){}
  };

  document.addEventListener('tripFamilyAuthReady',e=>handleAuth(e.detail));

  // family-auth may already have completed before this script attached.
  if(window.tripFamilyAuth) handleAuth(window.tripFamilyAuth);

  // Backward-compatible hook used by older UI: now logs out rather than deleting a device key.
  window.forgetTripDevice=async function(){
    try{await window.tripFamilyAuthApi?.authMod?.signOut(window.tripFamilyAuthApi.auth)}catch(_){}
    alert('家族アカウントからログアウトしました。');
  };
})();