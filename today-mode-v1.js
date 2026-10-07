
(function(){
  const tripStart='2026-12-23';
  const tripEnd='2026-12-31';

  const tzBySection={
    d23:'Pacific/Honolulu',d24:'Pacific/Honolulu',d25:'Pacific/Honolulu',d26:'Pacific/Honolulu',d27:'Pacific/Honolulu',
    d28:'America/Vancouver',d29:'America/Vancouver',d30:'America/Vancouver',d31:'Asia/Tokyo'
  };

  const routeBySection={
    d23:'Tokyo / Vancouver → Honolulu',
    d24:'Honolulu',
    d25:'Honolulu',
    d26:'Honolulu',
    d27:'Honolulu → Vancouver',
    d28:'Vancouver → Victoria',
    d29:'Victoria → Vancouver / UBC',
    d30:'UBC → YVR → Tokyo',
    d31:'Tokyo · 大晦日'
  };

  function ymdInTZ(date,tz){
    const p=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);
    const m={}; p.forEach(x=>m[x.type]=x.value);
    return m.year+'-'+m.month+'-'+m.day;
  }

  function formatHM(date,tz){
    return new Intl.DateTimeFormat('ja-JP',{timeZone:tz,hour:'2-digit',minute:'2-digit',hour12:false}).format(date);
  }

  function dateIdFromYmd(ymd){
    const mm=ymd.slice(5,7),dd=ymd.slice(8,10);
    return 'd'+String(Number(dd));
  }

  function minsDiff(a,b){return Math.round((b-a)/60000)}

  function countdownText(now,next){
    const min=minsDiff(now,next);
    if(min<=0)return 'まもなく';
    if(min<60)return min+'分後';
    const h=Math.floor(min/60),m=min%60;
    return m? h+'時間'+m+'分後':h+'時間後';
  }

  const wrap=document.querySelector('.navwrap');
  if(!wrap)return;

  const card=document.createElement('section');
  card.id='todayCard';
  card.className='today-card';
  card.setAttribute('aria-live','polite');
  wrap.insertAdjacentElement('afterend',card);

  const style=document.createElement('style');
  style.textContent=
    '.today-card{display:none;position:relative;margin:12px 0 14px;padding:16px 16px 15px;border:1px solid #e5deeb;border-radius:18px;background:linear-gradient(135deg,#f8fcff 0%,#f8f2ff 55%,#fff8ee 100%);box-shadow:0 10px 24px rgba(82,76,110,.08)}'+
    '.today-card::before{content:"";position:absolute;left:20px;top:-9px;width:62px;height:17px;transform:rotate(-3deg);background:rgba(255,226,161,.78);border:1px solid rgba(221,188,117,.24)}'+
    '.today-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.today-kicker{font-size:10px;font-weight:800;letter-spacing:.14em;color:#9a8faa}.today-title{font-size:21px;font-weight:800;color:#273247;line-height:1.2;margin-top:2px}.today-date{font-size:12px;color:#7e8799;white-space:nowrap}.today-next{padding:12px 13px;border-radius:14px;background:#fff4ca;border:1px solid #ead99c;margin-bottom:10px}.today-next-label{font-size:10px;letter-spacing:.12em;font-weight:800;color:#9b7c2c}.today-next-time{font-size:14px;font-weight:800;color:#536078;margin-top:3px}.today-next-title{font-size:18px;font-weight:800;color:#273247;line-height:1.25;margin-top:2px}.today-list{display:grid;gap:5px;margin-top:8px}.today-row{display:grid;grid-template-columns:58px 1fr;gap:10px;align-items:start;padding:7px 2px;border-bottom:1px dashed #e6e0eb}.today-row:last-child{border-bottom:0}.today-row.past{opacity:.42}.today-row.current{font-weight:800}.today-time{font-weight:800;color:#4f5d76;font-variant-numeric:tabular-nums}.today-event{color:#3a465d}.today-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.today-btn{min-height:40px;display:inline-flex;align-items:center;gap:6px;padding:7px 10px;border-radius:11px;border:1px solid #ddd8e8;background:#fff;color:#526077;text-decoration:none;font-weight:800;font-size:12px;box-shadow:0 2px 6px rgba(80,72,102,.04)}.today-complete{font-size:13px;color:#7a8496}'+
    '@media(max-width:640px){.today-card{margin:10px 0 13px;padding:15px 13px 13px;border-radius:16px}.today-title{font-size:19px}.today-date{font-size:11px}.today-row{grid-template-columns:54px 1fr}.today-next-title{font-size:17px}.today-actions{gap:6px}.today-btn{font-size:11.5px}}';
  document.head.appendChild(style);

  function render(){
    const now=new Date();
    let activeId=null,activeYmd=null;

    for(const [id,tz] of Object.entries(tzBySection)){
      const ymd=ymdInTZ(now,tz);
      const secDate='2026-12-'+id.slice(1).padStart(2,'0');
      if(ymd===secDate){activeId=id;activeYmd=ymd;break;}
    }

    const tokyoToday=ymdInTZ(now,'Asia/Tokyo');
    if(!activeId){
      if(tokyoToday<tripStart || tokyoToday>tripEnd){
        card.style.display='none';
        return;
      }
      // fallback to Tokyo date mapping during transition edge cases
      const id=dateIdFromYmd(tokyoToday);
      if(document.getElementById(id)){activeId=id;activeYmd=tokyoToday;}
      else {card.style.display='none';return;}
    }

    const section=document.getElementById(activeId);
    const tz=tzBySection[activeId];
    if(!section){card.style.display='none';return;}

    const events=[...section.querySelectorAll('.item')].map(item=>{
      const title=item.querySelector('.title')?.textContent.trim()||'';
      const timeText=item.querySelector('.time')?.textContent.trim()||'';
      const ts=item.dataset.ts ? new Date(item.dataset.ts) : null;
      return {item,title,timeText,ts};
    }).filter(x=>x.title);

    const timed=events.filter(x=>x.ts && !Number.isNaN(x.ts.getTime())).sort((a,b)=>a.ts-b.ts);
    const next=timed.find(x=>x.ts>=now);
    const rows=events.slice(0,6).map(x=>{
      const cls=x.ts && x.ts<now ? ' past' : (next&&x.item===next.item?' current':'');
      const shownTime=x.ts?formatHM(x.ts,tz):x.timeText;
      return '<div class="today-row'+cls+'"><div class="today-time">'+shownTime+'</div><div class="today-event">'+x.title+'</div></div>';
    }).join('');

    const mm=activeYmd.slice(5,7),dd=activeYmd.slice(8,10);
    const dateLabel=Number(mm)+'/'+Number(dd);
    const nextHtml=next
      ? '<div class="today-next"><div class="today-next-label">NEXT · '+countdownText(now,next.ts)+'</div><div class="today-next-time">'+formatHM(next.ts,tz)+'</div><div class="today-next-title">'+next.title+'</div></div>'
      : '<div class="today-next"><div class="today-next-label">TODAY</div><div class="today-complete">今日の予定はすべて終了しました。</div></div>';

    const hasMaps=!!section.querySelector('a.gmap-link, a[href*="google.com/maps"], a[href*="maps.google"]');
    const hasDetail=[...section.querySelectorAll('.item')].some(i=>i.getAttribute('role')==='button');

    card.innerHTML=
      '<div class="today-head"><div><div class="today-kicker">TODAY</div><div class="today-title">'+routeBySection[activeId]+'</div></div><div class="today-date">'+dateLabel+'</div></div>'+
      nextHtml+
      '<div class="today-list">'+rows+'</div>'+
      '<div class="today-actions">'+
        (hasMaps?'<button type="button" class="today-btn" id="todayMapBtn">Google Maps</button>':'')+
        (hasDetail?'<button type="button" class="today-btn" id="todayDetailBtn">予約・詳細</button>':'')+
        '<button type="button" class="today-btn" id="todayAllBtn">今日の全予定を見る</button>'+
      '</div>';

    card.style.display='block';

    const mapBtn=document.getElementById('todayMapBtn');
    if(mapBtn){
      mapBtn.onclick=()=>{
        const a=section.querySelector('a.gmap-link, a[href*="google.com/maps"], a[href*="maps.google"]');
        if(a)a.click();
      };
    }
    const detailBtn=document.getElementById('todayDetailBtn');
    if(detailBtn){
      detailBtn.onclick=()=>{
        const clickable=[...section.querySelectorAll('.item')].find(i=>i.getAttribute('role')==='button' && !i.classList.contains('past'));
        if(clickable)clickable.click();
        else{
          const any=[...section.querySelectorAll('.item')].find(i=>i.getAttribute('role')==='button');
          if(any)any.click();
        }
      };
    }
    document.getElementById('todayAllBtn').onclick=()=>section.scrollIntoView({behavior:'smooth',block:'start'});
  }

  render();
  setInterval(render,300000);
})();