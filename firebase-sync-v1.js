(function(){
  const CONFIG={
    apiKey:"AIzaSyD0uKs2_O_--BwWg7a5PJWRIwOLaPe6Puk",
    authDomain:"tsuruta-family-trip-2026.firebaseapp.com",
    projectId:"tsuruta-family-trip-2026",
    storageBucket:"tsuruta-family-trip-2026.firebasestorage.app",
    messagingSenderId:"687129835506",
    appId:"1:687129835506:web:778b20db9500c92a9b1d6b"
  };
  const STORE='tsuruta_family_planning_v1';
  let api=null, db=null, ready=false, unsub=null;

  function localRead(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch(_){return {}}}
  function localWrite(s){localStorage.setItem(STORE,JSON.stringify(s||{}))}
  function docId(key){return encodeURIComponent(key)}
  function setStatus(text,ok){
    document.querySelectorAll('#fpSyncState,.fp-sync-note').forEach(el=>{
      el.textContent=text;
      el.style.color=ok?'#4f7d6d':'#8b8295';
    });
  }
  function emit(){document.dispatchEvent(new CustomEvent('tripSharedPlanningUpdated'))}

  async function init(){
    try{
      const appMod=await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js');
      const fsMod=await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
      const app=appMod.initializeApp(CONFIG);
      db=fsMod.getFirestore(app);
      api=fsMod;
      ready=true;
      setStatus('家族と同期中',true);
      subscribe();
      window.dispatchEvent(new CustomEvent('tripFirebaseReady'));
    }catch(e){
      ready=false;
      setStatus('この端末に保存中',false);
      console.warn('Firebase unavailable; local fallback active',e);
    }
  }

  function subscribe(){
    if(!ready||unsub)return;
    const col=api.collection(db,'family_planning');
    unsub=api.onSnapshot(col,snap=>{
      const state=localRead();
      snap.forEach(ds=>{
        const x=ds.data()||{};
        if(x.key)state[x.key]=Object.assign({},state[x.key]||{},x);
      });
      localWrite(state);
      setStatus('家族と同期済み',true);
      emit();
    },err=>{
      console.warn('Firestore sync unavailable',err);
      setStatus('この端末に保存中',false);
    });
  }

  async function saveVote(key,uid,vote){
    const state=localRead(), e=state[key]||{votes:{},decision:null};
    e.votes=e.votes||{};e.votes[uid]=vote;state[key]=e;localWrite(state);emit();
    if(!ready)return false;
    try{
      const ref=api.doc(db,'family_planning',docId(key));
      await api.setDoc(ref,{key:key},{merge:true});
      await api.updateDoc(ref,{['votes.'+uid]:vote,updatedAt:api.serverTimestamp()});
      setStatus('家族と同期済み',true);
      return true;
    }catch(err){console.warn('Vote sync failed',err);setStatus('この端末に保存中',false);return false}
  }

  async function saveDecision(key,choice){
    const state=localRead(), e=state[key]||{votes:{},decision:null};
    e.decision=choice;e.decidedBy='family_01';e.decidedAt=Date.now();state[key]=e;localWrite(state);emit();
    if(!ready)return false;
    try{
      const ref=api.doc(db,'family_planning',docId(key));
      await api.setDoc(ref,{key:key},{merge:true});
      await api.updateDoc(ref,{decision:choice,decidedBy:'family_01',decidedAt:api.serverTimestamp(),updatedAt:api.serverTimestamp()});
      setStatus('家族と同期済み',true);
      return true;
    }catch(err){console.warn('Decision sync failed',err);setStatus('この端末に保存中',false);return false}
  }

  window.tripSharedPlanning={
    read:localRead,
    saveVote,
    saveDecision,
    isReady:()=>ready
  };
  init();
})();