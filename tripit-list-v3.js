
(function(){
  const style=document.createElement('style');
  style.textContent=`
    .item.tripit-row{grid-template-columns:62px 42px 1fr;gap:10px;padding:8px 6px;min-height:78px}
    .tripit-row .dotcol{position:relative}
    .tripit-row .dot{width:38px;height:38px;border:0;background:#1688cc;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;margin-top:0;z-index:1}
    .tripit-row .vline{width:4px;background:#1688cc;margin-top:0}
    .tripit-row .title{font-size:18px;line-height:1.2}
    .tripit-meta{font-size:13px;color:#6a6f73;line-height:1.35;margin-top:3px}
    .tripit-confirm{font-weight:700}
    @media(max-width:640px){
      .item.tripit-row{grid-template-columns:58px 40px 1fr;gap:8px}
      .tripit-row .title{font-size:17px}
      .tripit-meta{font-size:12.5px}
    }
  `;
  document.head.appendChild(style);

  const specs=[
    {needle:'Delta DL198',key:'Delta DL198',icon:'✈',summary:'HND → HNL',extra:'DL198 (Delta) · Arrive 09:03 HST'},
    {needle:'AC1783',key:'Air Canada AC1783',icon:'✈',summary:'YVR → HNL',extra:'AC1783 (Air Canada Rouge) · Arrive 12:45 HST'},
    {needle:'AC1782',key:'Air Canada AC1782',icon:'✈',summary:'HNL → YVR',extra:'AC1782 (Air Canada Rouge) · Arrive 21:54 PST'},
    {needle:'ZIPAIR ZG21',key:'ZIPAIR ZG21',icon:'✈',summary:'YVR → NRT',extra:'ZG21 (ZIPAIR Tokyo) · Arrive 12:45 JST (+1 day)'},
    {needle:'Waikiki Shore',key:'Waikiki Shore / Agoda',icon:'🛏',summary:'Waikiki Shore by OUTRIGGER',extra:'Check in 15:00 / Check out 11:00'},
    {needle:'Coast Coal Harbour',key:'Coast Coal Harbour',icon:'🛏',summary:'Coast Coal Harbour Vancouver Hotel by APA',extra:'12/27–12/28 · Coast Two Queens'},
    {needle:'Chateau Victoria',key:'Chateau Victoria / Expedia',icon:'🛏',summary:'Chateau Victoria Hotel & Suites',extra:'Check in 16:00 · 2 Queen Beds'},
    {needle:'West Coast Suites',key:'West Coast Suites',icon:'🛏',summary:'West Coast Suites at UBC',extra:'Check in 16:00 / Check out 11:00'},
    {needle:'Rock-A-Hula',key:'Rock-A-Hula / VELTRA',icon:'★',summary:'Rock-A-Hula',extra:'17:30 · Royal Hawaiian Shopping Center'}
  ];

  function confirmation(k){return (window.tripReservations||{})[k]||''}
  function decorate(){
    document.querySelectorAll('.item').forEach(item=>{
      if(item.dataset.tripitDone==='1') return;
      const title=item.querySelector('.title');
      if(!title) return;
      const spec=specs.find(s=>title.textContent.includes(s.needle));
      if(!spec) return;
      item.dataset.tripitDone='1';
      item.classList.add('tripit-row');
      const dot=item.querySelector('.dot');
      if(dot) dot.textContent=spec.icon;

      const content=title.parentElement;
      title.textContent=spec.summary;
      const meta=document.createElement('div');
      meta.className='tripit-meta';
      meta.dataset.resKey=spec.key;
      const conf=confirmation(spec.key);
      meta.innerHTML=spec.extra+(conf?'<br>Confirmation: <span class="tripit-confirm">'+conf+'</span>':'');
      content.appendChild(meta);
    });
  }

  decorate();
  document.addEventListener('tripReservationsReady',()=>{
    document.querySelectorAll('.tripit-meta[data-res-key]').forEach(meta=>{
      const k=meta.dataset.resKey;
      const spec=specs.find(s=>s.key===k);
      if(!spec) return;
      const conf=confirmation(k);
      meta.innerHTML=spec.extra+(conf?'<br>Confirmation: <span class="tripit-confirm">'+conf+'</span>':'');
    });
  });
})();