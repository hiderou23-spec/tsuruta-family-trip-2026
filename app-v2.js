
(async function(){
  const app=document.querySelector('.wrap');
  if(!app) return;

  // Build lock screen
  const gate=document.createElement('div');
  gate.id='familyGate';
  gate.innerHTML=`
    <div style="width:min(430px,100%);background:#fff;border:1px solid #ddd;border-radius:20px;padding:22px;box-shadow:0 16px 40px rgba(0,0,0,.12)">
      <div style="font-size:12px;color:#65716e">Tsuruta Family Trip 2026</div>
      <h2 style="margin:6px 0 4px">家族用パスワード</h2>
      <p style="font-size:13px;color:#65716e">予約情報を表示するため、家族共通パスワードを入力してください。</p>
      <input id="familyPw" type="password" autocomplete="current-password" style="width:100%;box-sizing:border-box;padding:11px;border:1px solid #bbb;border-radius:9px;font:inherit">
      <label style="display:flex;gap:8px;align-items:center;margin:12px 0;font-size:13px"><input id="rememberFamilyDevice" type="checkbox"> この端末で記憶する</label>
      <div id="familyErr" style="color:#a33;font-size:12px;min-height:18px"></div>
      <button id="familyUnlock" class="btn" style="width:100%;padding:10px">ロック解除</button>
    </div>`;
  Object.assign(gate.style,{position:'fixed',inset:'0',zIndex:'999',background:'#f6f3ed',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'});
  document.body.appendChild(gate);
  app.style.display='none';

  const te=new TextEncoder(),td=new TextDecoder();
  function b64u(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const x=atob(s),a=new Uint8Array(x.length);for(let i=0;i<x.length;i++)a[i]=x.charCodeAt(i);return a}
  function enc64(a){let s='';new Uint8Array(a).forEach(x=>s+=String.fromCharCode(x));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}

  let cfg,resData;
  async function loadData(){
    if(!cfg) cfg=await fetch('crypto-config.json',{cache:'no-store'}).then(r=>r.json());
    if(!resData) resData=await fetch('reservations.json',{cache:'no-store'}).then(r=>r.json());
  }
  async function privateFromPassword(pw){
    await loadData();
    const base=await crypto.subtle.importKey('raw',te.encode(pw),'PBKDF2',false,['deriveKey']);
    const k=await crypto.subtle.deriveKey({name:'PBKDF2',salt:b64u(cfg.encryptedPrivateKey.salt),iterations:cfg.encryptedPrivateKey.iter,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['decrypt']);
    const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64u(cfg.encryptedPrivateKey.iv)},k,b64u(cfg.encryptedPrivateKey.ct));
    return JSON.parse(td.decode(pt));
  }
  async function importPrivate(jwk){return crypto.subtle.importKey('jwk',jwk,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt'])}
  async function decryptReservations(pk){
    await loadData();
    const out={};
    for(const [name,ct] of Object.entries(resData.items)){
      const pt=await crypto.subtle.decrypt({name:'RSA-OAEP'},pk,b64u(ct));
      out[name]=td.decode(pt);
    }
    window.tripReservations=out;
    document.dispatchEvent(new CustomEvent('tripReservationsReady',{detail:out}));
  }

  function openDb(){return new Promise((resolve,reject)=>{const q=indexedDB.open('trip-vault',1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains('keys'))q.result.createObjectStore('keys')};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
  async function dbGet(k){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction('keys','readonly'),r=tx.objectStore('keys').get(k);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
  async function dbPut(k,v){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction('keys','readwrite');tx.objectStore('keys').put(v,k);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
  async function dbDel(k){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction('keys','readwrite');tx.objectStore('keys').delete(k);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}

  async function rememberPrivate(jwk){
    let dk=await dbGet('deviceKey');
    if(!dk){dk=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await dbPut('deviceKey',dk)}
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const ct=await crypto.subtle.encrypt({name:'AES-GCM',iv},dk,te.encode(JSON.stringify(jwk)));
    localStorage.setItem('tripWrappedPrivate',JSON.stringify({iv:enc64(iv),ct:enc64(ct)}));
  }
  async function autoPrivate(){
    const saved=localStorage.getItem('tripWrappedPrivate'); if(!saved)return null;
    const dk=await dbGet('deviceKey'); if(!dk)return null;
    const o=JSON.parse(saved);
    const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64u(o.iv)},dk,b64u(o.ct));
    return JSON.parse(td.decode(pt));
  }
  async function unlockWith(jwk){
    const pk=await importPrivate(jwk);
    await decryptReservations(pk);
    gate.style.display='none'; app.style.display='block';
  }

  document.getElementById('familyUnlock').onclick=async()=>{
    const err=document.getElementById('familyErr');
    err.textContent='確認しています…';
    try{
      const jwk=await privateFromPassword(document.getElementById('familyPw').value);
      if(document.getElementById('rememberFamilyDevice').checked) await rememberPrivate(jwk);
      await unlockWith(jwk);
      document.getElementById('familyPw').value='';
      err.textContent='';
    }catch(e){err.textContent='パスワードが違うか、鍵を復号できません。'}
  };
  document.getElementById('familyPw').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('familyUnlock').click()});

  // Expose forget function to a button injected by details-v2.js
  window.forgetTripDevice=async function(){
    localStorage.removeItem('tripWrappedPrivate');
    try{await dbDel('deviceKey')}catch(_){}
    alert('この端末の自動解除情報を削除しました。次回はパスワード入力が必要です。');
  };

  try{
    const jwk=await autoPrivate();
    if(jwk) await unlockWith(jwk);
  }catch(e){
    localStorage.removeItem('tripWrappedPrivate');
    try{await dbDel('deviceKey')}catch(_){}
  }
})();