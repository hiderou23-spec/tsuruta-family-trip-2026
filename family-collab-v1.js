(function(){
  const labels={family_01:'パパ',family_02:'Emi',family_03:'Saki',family_04:'Takeru'};
  let api=null,currentKey='',unsubReads=null,unsubComments=null;
  const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const docId=k=>encodeURIComponent(k).replace(/%/g,'_');

  const style=document.createElement('style');
  style.textContent=`
   .fc-entry{margin-top:5px}.fc-open{border:0;background:transparent;color:#75819a;font-size:10.5px;font-weight:700;padding:2px 0}
   .fc-modal{position:fixed;inset:0;z-index:5100;background:#fffaf6;display:none;overflow:auto}.fc-modal.show{display:block}
   .fc-shell{max-width:760px;margin:0 auto;min-height:100%;background:linear-gradient(180deg,#fffaf6,#f9fbff 65%,#fff)}
   .fc-head{position:sticky;top:0;z-index:2;background:rgba(255,250,246,.96);backdrop-filter:blur(8px);border-bottom:1px solid #e9e2ed;padding:12px 16px;display:flex;gap:12px;align-items:center}
   .fc-back{width:44px;height:44px;border-radius:50%;border:1px solid #e1dbea;background:#f5f1fb;color:#5f6d85;font-size:28px}
   .fc-card{background:#fff;border:1px solid #e8e1eb;border-radius:16px;padding:14px;margin:10px 0}.fc-comment{padding:10px 0;border-top:1px solid #f0ebf3}.fc-comment:first-child{border-top:0}
   .fc-input{display:flex;gap:7px;margin-top:10px}.fc-input input{flex:1;min-width:0;border:1px solid #ddd7e8;border-radius:11px;padding:10px;font:inherit}.fc-input button,.fc-read{border:0;border-radius:11px;padding:9px 11px;background:#eef4ff;color:#526b92;font-weight:800}
  `;
  document.head.appendChild(style);

  const modal=document.createElement('div');modal.className='fc-modal';
  modal.innerHTML='<div class="fc-shell"><div class="fc-head"><button class="fc-back">‹</button><div><div id="fcTitle" style="font-weight:800;font-size:18px">家族メモ</div><div id="fcAuth" style="font-size:11px;color:#8b8295"></div></div></div><div style="padding:14px"><div class="fc-card"><div style="font-weight:800">既読</div><div id="fcReads" style="font-size:13px;color:#737c8f;margin:7px 0">—</div><button id="fcReadBtn" class="fc-read" type="button">✓ 既読にする</button></div><div class="fc-card"><div style="font-weight:800">コメント</div><div id="fcComments"></div><div class="fc-input"><input id="fcText" maxlength="300" placeholder="家族にコメント"><button id="fcSend" type="button">送信</button></div></div></div></div>';
  document.body.appendChild(modal);
  modal.querySelector('.fc-back').onclick=close;

  function itemKey(item){
    const sec=item.closest('.section')?.id||'';
    const title=(item.querySelector('.title')?.childNodes[0]?.textContent||item.querySelector('.title')?.textContent||'').trim();
    return sec+'|'+title;
  }
  function close(){
    modal.classList.remove('show');document.body.style.overflow='';
    if(unsubReads){unsubReads();unsubReads=null} if(unsubComments){unsubComments();unsubComments=null}
  }
  function decorate(){
    document.querySelectorAll('.item').forEach(item=>{
      if(item.querySelector('.fc-entry'))return;
      const t=item.querySelector('.title');if(!t)return;
      const box=document.createElement('div');box.className='fc-entry';
      box.innerHTML='<button class="fc-open" type="button">✓ 既読・コメント</button>';
      (t.parentElement||item).appendChild(box);
      box.querySelector('button').onclick=e=>{e.stopPropagation();open(item)};
    });
  }
  async function open(item){
    api=window.tripFamilyAuthApi;
    currentKey=itemKey(item);
    document.getElementById('fcTitle').textContent=(item.querySelector('.title')?.childNodes[0]?.textContent||'予定').trim();
    const p=window.tripFamilyAuth;
    document.getElementById('fcAuth').textContent=p?.authenticated?p.label+'として参加中':'ログインすると既読・コメントできます';
    document.getElementById('fcReadBtn').disabled=!p?.authenticated||p.role==='viewer';
    document.getElementById('fcSend').disabled=!p?.authenticated||p.role==='viewer';
    document.getElementById('fcText').disabled=!p?.authenticated||p.role==='viewer';
    modal.classList.add('show');document.body.style.overflow='hidden';
    if(!api?.db||!api?.fs){document.getElementById('fcComments').innerHTML='<div style="font-size:13px;color:#8b8295;margin-top:8px">家族ログインの設定後に利用できます。</div>';return}
    subscribe();
  }
  function subscribe(){
    const {db,fs}=api,base=fs.doc(db,'trip_items',docId(currentKey));
    unsubReads=fs.onSnapshot(fs.collection(base,'reads'),snap=>{
      const got={};snap.forEach(x=>{const d=x.data()||{};got[d.memberId]=true});
      document.getElementById('fcReads').textContent=Object.keys(labels).map(k=>(got[k]?'✓ ':'○ ')+labels[k]).join(' · ');
    });
    const q=fs.query(fs.collection(base,'comments'),fs.orderBy('createdAt','asc'));
    unsubComments=fs.onSnapshot(q,snap=>{
      let h='';snap.forEach(x=>{const d=x.data()||{};h+='<div class="fc-comment"><b>'+esc(d.label||labels[d.memberId]||'家族')+'</b><div style="font-size:13px;color:#5f687a;margin-top:2px">'+esc(d.text)+'</div></div>'});
      document.getElementById('fcComments').innerHTML=h||'<div style="font-size:13px;color:#8b8295;margin-top:8px">まだコメントはありません。</div>';
    },()=>{});
  }
  document.getElementById('fcReadBtn').onclick=async()=>{
    const p=window.tripFamilyAuth;if(!p?.authenticated||p.role==='viewer')return;
    const {db,fs}=api,base=fs.doc(db,'trip_items',docId(currentKey));
    await fs.setDoc(fs.doc(base,'reads',p.uid),{uid:p.uid,memberId:p.memberId,label:p.label,readAt:fs.serverTimestamp()},{merge:true});
  };
  document.getElementById('fcSend').onclick=async()=>{
    const p=window.tripFamilyAuth,text=document.getElementById('fcText').value.trim();
    if(!p?.authenticated||p.role==='viewer'||!text)return;
    const {db,fs}=api,base=fs.doc(db,'trip_items',docId(currentKey));
    await fs.addDoc(fs.collection(base,'comments'),{uid:p.uid,memberId:p.memberId,label:p.label,text,createdAt:fs.serverTimestamp()});
    document.getElementById('fcText').value='';
  };
  document.addEventListener('tripFamilyAuthReady',decorate);
  setTimeout(decorate,800);
})();