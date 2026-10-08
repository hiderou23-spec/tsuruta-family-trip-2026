(function(){
  if(document.getElementById('tripBottomBar'))return;
  const style=document.createElement('style');
  style.textContent=`
    body{padding-bottom:calc(82px + env(safe-area-inset-bottom))}
    .trip-bottom{position:fixed;left:0;right:0;bottom:0;z-index:1300;background:rgba(255,255,255,.96);backdrop-filter:blur(14px);border-top:1px solid #e4dfe8;padding:6px max(8px,env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));box-shadow:0 -6px 20px rgba(56,54,72,.06)}
    .trip-bottom-inner{max-width:760px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:2px}
    .trip-bottom button{appearance:none;border:0;background:transparent;min-height:53px;border-radius:12px;color:#667085;font:inherit;padding:4px 2px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer}
    .trip-bottom button:active{background:#f2eef8}
    .trip-bottom .tb-icon{font-size:19px;line-height:1.15}
    .trip-bottom .tb-label{font-size:10.5px;font-weight:800;white-space:nowrap}
    .trip-bottom .tb-todo-wrap{position:relative}
    .trip-bottom .tb-count{display:none;position:absolute;top:-5px;right:-9px;min-width:16px;height:16px;border-radius:9px;padding:0 4px;background:#c56b5e;color:#fff;font-size:9px;font-weight:800;line-height:16px;text-align:center}
    @media(min-width:800px){.trip-bottom{left:50%;right:auto;transform:translateX(-50%);width:min(760px,100%);border:1px solid #e4dfe8;border-bottom:0;border-radius:18px 18px 0 0}}
  `;
  document.head.appendChild(style);

  const bar=document.createElement('nav');
  bar.id='tripBottomBar';bar.className='trip-bottom';bar.setAttribute('aria-label','主要メニュー');
  bar.innerHTML=`<div class="trip-bottom-inner">
    <button type="button" id="tbSchedule"><span class="tb-icon">▣</span><span class="tb-label" id="tbScheduleLabel">予定</span></button>
    <button type="button" id="tbTodo"><span class="tb-todo-wrap"><span class="tb-icon">✓</span><span class="tb-count" id="tbTodoCount"></span></span><span class="tb-label">TODO</span></button>
    <button type="button" id="tbFamily"><span class="tb-icon">☻</span><span class="tb-label">家族で相談</span></button>
    <button type="button" id="tbAccount"><span class="tb-icon">○</span><span class="tb-label">アカウント</span></button>
  </div>`;
  document.body.appendChild(bar);

  function tokyoYmd(){
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const m={};p.forEach(x=>m[x.type]=x.value);return m.year+'-'+m.month+'-'+m.day;
  }
  function inTrip(){const d=tokyoYmd();return d>='2026-12-23'&&d<='2026-12-31'}
  function updateScheduleLabel(){document.getElementById('tbScheduleLabel').textContent=inTrip()?'今日':'予定'}
  updateScheduleLabel();

  document.getElementById('tbSchedule').onclick=()=>{
    if(inTrip()){
      const card=document.getElementById('todayCard');
      if(card&&getComputedStyle(card).display!=='none'){card.scrollIntoView({behavior:'smooth',block:'start'});return}
      const today=document.querySelector('.section.today');
      if(today){today.scrollIntoView({behavior:'smooth',block:'start'});return}
    }
    const nav=document.querySelector('.navwrap')||document.querySelector('.wrap');
    nav?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  document.getElementById('tbTodo').onclick=()=>document.getElementById('todoOpen')?.click();
  document.getElementById('tbFamily').onclick=()=>{
    if(window.tripFamilyPlanning?.openHub){window.tripFamilyPlanning.openHub();return}
    document.getElementById('familyPlanningHome')?.scrollIntoView({behavior:'smooth',block:'center'});
  };
  document.getElementById('tbAccount').onclick=()=>window.openTripFamilyAccount?.();

  function syncTodo(){
    const src=(document.getElementById('todoCount')?.textContent||'').replace(/[^0-9]/g,'');
    const out=document.getElementById('tbTodoCount');
    if(!out)return;
    if(src){out.textContent=src;out.style.display='block'}else{out.style.display='none'}
  }
  syncTodo();
  const tc=document.getElementById('todoCount');
  if(tc)new MutationObserver(syncTodo).observe(tc,{childList:true,subtree:true,characterData:true});
  setInterval(updateScheduleLabel,60000);
})();