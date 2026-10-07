
(function(){
  const MID='G-GVDH056X0M';
  let activeId=null;
  let pageViewSent=false;

  function safeId(id){
    return /^family_0[1-4]$/.test(id||'') ? id : 'unknown';
  }
  function setIdentity(id){
    activeId=safeId(id);
    if(typeof window.gtag!=='function')return;
    window.gtag('set','user_properties',{family_member_id:activeId});
    if(!pageViewSent){
      window.gtag('event','page_view',{
        page_title:document.title,
        page_location:location.href,
        family_member_id:activeId
      });
      pageViewSent=true;
    }else{
      window.gtag('event','family_profile_changed',{family_member_id:activeId});
    }
  }
  function track(name,params){
    if(typeof window.gtag!=='function')return;
    window.gtag('event',name,Object.assign({family_member_id:activeId||'unknown'},params||{}));
  }
  function contextTitle(el){
    const item=el.closest('.item');
    if(item)return (item.querySelector('.title')?.textContent||'').trim().slice(0,100);
    const overlay=el.closest('#tripDetailOverlay');
    if(overlay)return (overlay.querySelector('h1')?.textContent||'').trim().slice(0,100);
    return '';
  }

  document.addEventListener('tripFamilyProfileReady',e=>setIdentity(e.detail?.id));
  if(window.tripFamilyProfile?.id)setIdentity(window.tripFamilyProfile.id);

  document.addEventListener('click',e=>{
    const map=e.target.closest('a.gmap-link');
    if(map)track('google_maps_open',{context:contextTitle(map)});

    const item=e.target.closest('.item[role="button"]');
    if(item && !e.target.closest('a,button,summary,details')){
      track('trip_detail_open',{item_title:(item.querySelector('.title')?.textContent||'').trim().slice(0,100)});
    }

    const btn=e.target.closest('button');
    if(btn && /予約メール詳細/.test(btn.textContent||'')){
      track('reservation_detail_open',{context:contextTitle(btn)});
    }

    const today=e.target.closest('.today-btn');
    if(today)track('today_action',{action_label:(today.textContent||'').trim().slice(0,60)});

    const nav=e.target.closest('#dateNav a');
    if(nav)track('date_nav_open',{date:nav.dataset.date||''});

    const phone=e.target.closest('a[href^="tel:"]');
    if(phone)track('hotel_phone_tap',{context:contextTitle(phone)});

    const mail=e.target.closest('a[href^="mailto:"]');
    if(mail)track('hotel_email_tap',{context:contextTitle(mail)});
  },true);

  window.tripAnalytics={track};
})();