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
  let auth=null,db=null,authMod=null,fs=null,current=null;

  const style=document.createElement('style');
  style.textContent=`
    .fa-badge{display:none!important;position:fixed;left:12px;bottom:12px;z-index:120;border:1px solid #ddd7e8;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800;color:#5e6a80;box-shadow:0 4px 14px rgba(80,72,102,.08)}
    .fa-badge.on{color:#477566}.fa-modal{position:fixed;inset:0;z-index:5200;background:rgba(39,50,71,.45);display:none;align-items:center;justify-content:center;padding:18px;backdrop-filter:blur(5px)}.fa-modal.show{display:flex}
    .fa-box{width:min(430px,100%);background:#fffaf6;border:1px solid #e7dfeb;border-radius:20px;padding:20px;box-shadow:0 18px 50px rgba(70,62,95,.18)}
    .fa-box input{width:100%;box-sizing:border-box;padding:11px;border:1px solid #d9d3e3;border-radius:11px;margin:6px 0 10px;font:inherit}
    .fa-primary{width:100%;border:0;border-radius:11px;padding:11px;background:linear-gradient(135deg,#82b9eb,#ad93de);color:#fff;font-weight:800}
    .fa-link{border:0;background:transparent;color:#687eab;font-weight:800;padding:8px}.fa-err{font-size:12px;color:#a34c4c;min-height:18px}
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
  function render(){
    const on=current?.authenticated;
    document.getElementById('faClose').style.display=on?'inline-block':'none';
    document.getElementById('faLogin').style.display=on?'none':'block';
    const a=document.getElementById('faAccount');
    a.style.display=on?'block':'none';
    if(on){
      a.innerHTML='<div style="background:#fff;border:1px solid #e8e1eb;border-radius:14px;padding:14px"><b>'+current.label+'</b><div style="font-size:12px;color:#7d8493;margin-top:4px">'+
        (current.role==='admin'?'管理者：最終決定・家族管理が可能':current.role==='viewer'?'閲覧のみ':'家族メンバー：投票・既読・コメントが可能')+
        '</div></div>'+
        '<button id="faChangePw" class="fa-link" style="width:100%;margin-top:8px" type="button">パスワード変更</button>'+
        '<div id="faChangeArea" style="display:none;margin-top:6px">'+
          '<input id="faCurrentPw" type="password" autocomplete="current-password" placeholder="現在のパスワード">'+
          '<input id="faNewPw" type="password" autocomplete="new-password" placeholder="新しいパスワード（12文字以上推奨）">'+
          '<input id="faNewPw2" type="password" autocomplete="new-password" placeholder="新しいパスワードをもう一度">'+
          '<div id="faChangeErr" class="fa-err"></div>'+
          '<button id="faChangeSubmit" class="fa-primary" type="button">変更する</button>'+
        '</div>'+
        '<button id="faLogout" class="fa-link" style="width:100%;margin-top:8px" type="button">ログアウト</button>';
      document.getElementById('faLogout').onclick=async()=>{await authMod.signOut(auth);};
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
      });
    }catch(e){console.warn('Family Auth unavailable',e);setProfile({authenticated:false,role:'unavailable'});}
  }
  badge.onclick=()=>{modal.classList.add('show');render()};
  document.getElementById('faClose').onclick=()=>{if(current?.authenticated)modal.classList.remove('show')};
  document.getElementById('faSubmit').onclick=async()=>{
    const err=document.getElementById('faErr');err.textContent='確認しています…';
    try{
      await authMod.signInWithEmailAndPassword(auth,document.getElementById('faEmail').value.trim(),document.getElementById('faPassword').value);
      err.textContent='';modal.classList.remove('show');
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
  window.openTripFamilyAccount=()=>{modal.classList.add('show');render()};
  init();
})();