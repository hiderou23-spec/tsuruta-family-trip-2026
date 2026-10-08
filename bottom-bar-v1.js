(function(){
  if(document.getElementById('tripBottomBar'))return;

  const icon=(body)=>'<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+body+'</svg>';
  const icons={
    schedule:icon('<rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M16 3v4M8 3v4M3 10h18"></path><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"></path>'),
    todo:icon('<path d="M9 6h11M9 12h11M9 18h11"></path><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5"></path>'),
    family:icon('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path><path d="M15.5 11.5h5l1.5 1.5v-4.5"></path>'),
    account:icon('<circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path>')
  };

  const style=document.createElement('style');
  style.textContent=`
    body{padding-bottom:calc(84px + env(safe-area-inset-bottom))}
    #familyPlanOverlay,#familySummaryOverlay,#todoOverlay,.fc-modal{padding-bottom:calc(78px + env(safe-area-inset-bottom))!important}
    .trip-bottom{position:fixed;left:0;right:0;bottom:0;z-index:2000;background:rgba(255,255,255,.965);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid #e5e0e9;padding:6px max(8px,env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) max(8px,env(safe-area-inset-left));box-shadow:0 -7px 22px rgba(56,54,72,.07)}
    .trip-bottom-inner{max-width:760px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:3px}
    .trip-bottom button{appearance:none;border:0;background:transparent;min-height:56px;border-radius:13px;color:#7a8090;font:inherit;padding:5px 2px 4px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;transition:background .16s ease,color .16s ease,transform .12s ease}
    .trip-bottom button:active{transform:scale(.97);background:#f4f0f9}
    .trip-bottom button.active{color:#665887;background:#f3eef9}
    .trip-bottom .tb-icon{width:23px;height:23px;display:grid;place-items:center;line-height:1}
    .trip-bottom .tb-icon svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.85;stroke-linecap:round;stroke-linejoin:round}
    .trip-bottom button.active .tb-icon svg{stroke-width:2.15}
    .trip-bottom .tb-label{font-size:10.5px;line-height:1.1;font-weight:800;white-space:nowrap;letter-spacing:.01em}
    .trip-bottom .tb-todo-wrap{position:relative;display:grid;place-items:center}
    .trip-bottom .tb-count{display:none;position:absolute;top:-6px;right:-10px;min-width:17px;height:17px;border-radius:9px;padding:0 4px;background:#bd665c;color:#fff;border:2px solid rgba(255,255,255,.96);font-size:9px;font-weight:800;line-height:13px;text-align:center}
    @media(min-width:800px){.trip-bottom{left:50%;right:auto;transform:translateX(-50%);width:min(760px,100%);border:1px solid #e4dfe8;border-bottom:0;border-radius:18px 18px 0 0}}
  `;
  document.head.appendChild(style);

  const bar=document.createElement('nav');
  bar.id='tripBottomBar';
  bar.className='trip-bottom';
  bar.setAttribute('aria-label','主要メニュー');
  bar.innerHTML=`<div class="trip-bottom-inner">
    <button type="button" id="tbSchedule"><span class="tb-icon">${icons.schedule}</span><span class="tb-label" id="tbScheduleLabel">予定</span></button>
    <button type="button" id="tbTodo"><span class="tb-todo-wrap"><span class="tb-icon">${icons.todo}</span><span class="tb-count" id="tbTodoCount"></span></span><span class="tb-label">TODO</span></button>
    <button type="button" id="tbFamily"><span class="tb-icon">${icons.family}</span><span class="tb-label">家族で相談</span></button>
    <button type="button" id="tbAccount"><span class="tb-icon">${icons.account}</span><span class="tb-label">アカウント</span></button>
  </div>`;
  document.body.appendChild(bar);

  const buttons={
    schedule:document.getElementById('tbSchedule'),
    todo:document.getElementById('tbTodo'),
    family:document.getElementById('tbFamily'),
    account:document.getElementById('tbAccount')
  };

  function tokyoYmd(){
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const m={};p.forEach(x=>m[x.type]=x.value);
    return m.year+'-'+m.month+'-'+m.day;
  }
  function inTrip(){const d=tokyoYmd();return d>='2026-12-23'&&d<='2026-12-31'}
  function updateScheduleLabel(){
    const el=document.getElementById('tbScheduleLabel');
    if(el)el.textContent=inTrip()?'今日':'予定';
  }

  function isVisible(el){
    if(!el)return false;
    return getComputedStyle(el).display!=='none';
  }
  function setActive(name){
    Object.entries(buttons).forEach(([k,b])=>b?.classList.toggle('active',k===name));
  }
  function syncActive(){
    const account=document.querySelector('.fa-modal.show');
    const familyPlan=document.getElementById('familyPlanOverlay');
    const familySummary=document.getElementById('familySummaryOverlay');
    const todo=document.getElementById('todoOverlay');
    const collab=document.querySelector('.fc-modal.show');
    if(account){setActive('account');return}
    if(collab||isVisible(familyPlan)||isVisible(familySummary)){setActive('family');return}
    if(isVisible(todo)){setActive('todo');return}
    setActive('schedule');
  }
  function closeNavigationOverlays(except){
    const todo=document.getElementById('todoOverlay');
    const familyPlan=document.getElementById('familyPlanOverlay');
    const familySummary=document.getElementById('familySummaryOverlay');
    const collab=document.querySelector('.fc-modal.show');
    if(except!=='todo'&&todo)todo.style.display='none';
    if(except!=='family'){
      if(familyPlan)familyPlan.style.display='none';
      if(familySummary)familySummary.style.display='none';
      if(collab)collab.classList.remove('show');
    }
    if(except!=='account'){
      const account=document.querySelector('.fa-modal.show');
      if(account)account.classList.remove('show');
    }
    document.body.style.overflow='';
  }

  updateScheduleLabel();

  buttons.schedule.onclick=()=>{
    closeNavigationOverlays('schedule');
    setActive('schedule');
    requestAnimationFrame(()=>{
      if(inTrip()){
        const card=document.getElementById('todayCard');
        if(card&&getComputedStyle(card).display!=='none'){card.scrollIntoView({behavior:'smooth',block:'start'});return}
        const today=document.querySelector('.section.today');
        if(today){today.scrollIntoView({behavior:'smooth',block:'start'});return}
      }
      const nav=document.querySelector('.navwrap')||document.querySelector('.wrap');
      nav?.scrollIntoView({behavior:'smooth',block:'start'});
    });
  };

  buttons.todo.onclick=()=>{
    closeNavigationOverlays('todo');
    document.getElementById('todoOpen')?.click();
    setActive('todo');
  };

  buttons.family.onclick=()=>{
    closeNavigationOverlays('family');
    if(window.tripFamilyLine?.openLatestUnread?.()){setActive('family');return}
    if(window.tripFamilyPlanning?.openHub)window.tripFamilyPlanning.openHub();
    else document.getElementById('familyPlanningHome')?.scrollIntoView({behavior:'smooth',block:'center'});
    setActive('family');
  };

  buttons.account.onclick=()=>{
    closeNavigationOverlays('account');
    window.openTripFamilyAccount?.();
    setActive('account');
  };

  function syncTodo(){
    const src=(document.getElementById('todoCount')?.textContent||'').replace(/[^0-9]/g,'');
    const out=document.getElementById('tbTodoCount');
    if(!out)return;
    if(src){out.textContent=src;out.style.display='block'}else{out.style.display='none'}
  }
  syncTodo();
  syncActive();

  const tc=document.getElementById('todoCount');
  if(tc)new MutationObserver(syncTodo).observe(tc,{childList:true,subtree:true,characterData:true});

  const watchTargets=[
    document.getElementById('todoOverlay'),
    document.getElementById('familyPlanOverlay'),
    document.getElementById('familySummaryOverlay'),
    document.querySelector('.fa-modal'),
    document.querySelector('.fc-modal')
  ].filter(Boolean);
  const mo=new MutationObserver(()=>setTimeout(syncActive,0));
  watchTargets.forEach(el=>mo.observe(el,{attributes:true,attributeFilter:['style','class']}));

  document.getElementById('todoBack')?.addEventListener('click',()=>setTimeout(syncActive,0));
  document.querySelector('#familyPlanOverlay .fp-back')?.addEventListener('click',()=>setTimeout(syncActive,0));
  document.getElementById('fpsBack')?.addEventListener('click',()=>setTimeout(syncActive,0));
  document.getElementById('faClose')?.addEventListener('click',()=>setTimeout(syncActive,0));
  document.querySelector('.fc-modal .fc-back')?.addEventListener('click',()=>setTimeout(syncActive,0));

  setInterval(updateScheduleLabel,60000);
})();