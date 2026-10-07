
(function(){
  const host=document.querySelector('.wrap');
  if(!host)return;

  // Hide old aggregate sections if present
  const old=document.getElementById('reservations'); if(old) old.style.display='none';
  const oldModal=document.getElementById('modal'); if(oldModal) oldModal.style.display='none';
  const oldDetails=document.getElementById('travel-details-v2'); if(oldDetails) oldDetails.style.display='none';

  // Trip detail modal
  const overlay=document.createElement('div');
  overlay.id='tripDetailOverlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:1000;background:#f6f3ed;display:none;overflow:auto';
  overlay.innerHTML=`
    <div style="max-width:760px;margin:0 auto;min-height:100%;background:#fff">
      <div style="position:sticky;top:0;z-index:3;background:rgba(255,255,255,.96);backdrop-filter:blur(8px);border-bottom:1px solid #e5e5e5;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <button id="tripDetailBack" aria-label="戻る" style="width:44px;height:44px;border-radius:50%;border:0;background:#f1f2f2;font-size:28px;line-height:1;cursor:pointer">‹</button>
        <div style="font-weight:700">Tsuruta Family Trip 2026</div>
      </div>
      <div id="tripDetailBody"></div>
    </div>`;
  document.body.appendChild(overlay);
  const fullOverlay=document.createElement('div');
  fullOverlay.id='tripFullInfoOverlay';
  fullOverlay.style.cssText='position:fixed;inset:0;z-index:1100;background:#fff;display:none;overflow:auto';
  fullOverlay.innerHTML=`
    <div style="max-width:760px;margin:0 auto;min-height:100%;background:#fff">
      <div style="position:sticky;top:0;z-index:3;background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-bottom:1px solid #e5e5e5;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <button id="tripFullInfoBack" aria-label="戻る" style="width:44px;height:44px;border-radius:50%;border:0;background:#f1f2f2;font-size:28px;line-height:1;cursor:pointer">‹</button>
        <div style="font-weight:700">Full info</div>
      </div>
      <div id="tripFullInfoBody"></div>
    </div>`;
  document.body.appendChild(fullOverlay);

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function showFullInfo(key){
    const x=(window.tripFullInfo||{})[key];
    const body=document.getElementById('tripFullInfoBody');
    if(!x){
      body.innerHTML='<div style="padding:24px">Full infoを読み込めませんでした。ページを再読み込みしてください。</div>';
    }else{
      body.innerHTML=
        '<div style="padding:24px 22px 12px"><h1 style="font-size:30px;margin:0 0 6px">'+esc(x.title)+'</h1><div style="color:#6b6f72;font-size:14px">Source: '+esc(x.source)+'</div></div>'+
        '<div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px">FULL RESERVATION INFO</div>'+
        '<div style="padding:6px 22px 28px">'+
        (x.sections||[]).map(s=>'<div style="padding:15px 0;border-bottom:1px solid #eee"><div style="font-size:13px;color:#777;font-weight:700;margin-bottom:4px">'+esc(s[0])+'</div><div style="font-size:17px;line-height:1.55">'+esc(s[1])+'</div></div>').join('')+
        '<div style="margin-top:18px;font-size:12px;color:#777;line-height:1.5">元の予約メールから旅行に必要な情報を抽出して保存しています。個人Gmailへのアクセスは不要です。</div></div>';
    }
    fullOverlay.style.display='block';
    fullOverlay.scrollTop=0;
  }
  document.getElementById('tripFullInfoBack').onclick=()=>{fullOverlay.style.display='none'};
  window.showTripFullInfo=showFullInfo;


  const data={
    "Delta DL198":{
      type:"flight",title:"HND → HNL",subtitle:"DL198 (Delta)",booking:"Delta DL198",
      dateLabel:"WED, DEC 23",depCity:"Tokyo / Haneda",depTime:"9:00 PM",depZone:"JST",
      arrCity:"Honolulu",arrTime:"9:03 AM",arrZone:"HST",duration:"7時間03分",
      terminalDep:"羽田空港 Terminal 3",terminalArr:"HNL Terminal 2",fare:"Delta Main Classic (L)",
      seats:"Hidenori: 45C",baggage:"Hidenori分：受託手荷物1個・23kgまで無料の記載あり",
      notes:"家族本隊3名。変更・キャンセル条件は購入運賃規則に従う。",
      depMap:"https://www.google.com/maps/search/?api=1&query=Haneda+Airport+Terminal+3",arrMap:"https://www.google.com/maps/search/?api=1&query=Daniel+K+Inouye+International+Airport+Terminal+2"
    },
    "Air Canada AC1783":{
      type:"flight",title:"YVR → HNL",subtitle:"AC1783 (Air Canada Rouge)",booking:"Air Canada AC1783",
      dateLabel:"WED, DEC 23",depCity:"Vancouver",depTime:"8:10 AM",depZone:"PST",
      arrCity:"Honolulu",arrTime:"12:45 PM",arrZone:"HST",duration:"6時間35分",
      terminalDep:"YVR Terminal M",terminalArr:"HNL Terminal 2",fare:"Economy Latitude / Economy Class (B)",
      seats:"座席情報は未表示",baggage:"Air Canada運航便の手荷物規定に準拠",
      notes:"変更手数料なし。税・運賃差額は適用。",
      depMap:"https://www.google.com/maps/search/?api=1&query=Vancouver+International+Airport+International+Terminal",arrMap:"https://www.google.com/maps/search/?api=1&query=Daniel+K+Inouye+International+Airport+Terminal+2"
    },
    "Air Canada AC1782":{
      type:"flight",title:"HNL → YVR",subtitle:"AC1782 (Air Canada Rouge)",booking:"Air Canada AC1782",
      dateLabel:"SUN, DEC 27",depCity:"Honolulu",depTime:"2:00 PM",depZone:"HST",
      arrCity:"Vancouver",arrTime:"9:54 PM",arrZone:"PST",duration:"5時間54分",
      terminalDep:"HNL Terminal 2",terminalArr:"YVR Terminal M",fare:"Economy Standard / Economy Class (T)",
      seats:"25D（通路）・25E（中央）・25F（窓側）の確認あり",baggage:"Air Canada運航便の手荷物規定に準拠",
      notes:"変更は1人・片道 ¥15,800＋税・運賃差額。",
      depMap:"https://www.google.com/maps/search/?api=1&query=Daniel+K+Inouye+International+Airport+Terminal+2",arrMap:"https://www.google.com/maps/search/?api=1&query=Vancouver+International+Airport+International+Terminal"
    },
    "ZIPAIR ZG21":{
      type:"flight",title:"YVR → NRT",subtitle:"ZG21 (ZIPAIR Tokyo)",booking:"ZIPAIR ZG21",
      dateLabel:"WED, DEC 30 – THU, DEC 31",depCity:"Vancouver",depTime:"9:30 AM",depZone:"PST",
      arrCity:"Tokyo / Narita",arrTime:"12:45 PM",arrZone:"JST (+1 day)",duration:"10時間15分",
      terminalDep:"YVR",terminalArr:"Narita",fare:"ZIPAIR",seats:"座席詳細は未表示",
      baggage:"手荷物条件は予約内容で再確認",notes:"12/31 12:45 JST 成田到着予定。",
      depMap:"https://www.google.com/maps/search/?api=1&query=Vancouver+International+Airport+International+Terminal",arrMap:"https://www.google.com/maps/search/?api=1&query=Narita+International+Airport"
    },
    "Waikiki Shore by OUTRIGGER":{
      type:"hotel",title:"Waikiki Shore by OUTRIGGER",booking:"Waikiki Shore / Agoda",
      dateLabel:"DEC 23 – DEC 27",address:"2161 Kalia Rd, Honolulu, HI 96815",
      photo:"https://hawaiicondosource.com/wp-content/uploads/Condos/Waikiki_Shore/Waikiki_Shore_-_View_from_the_beach.jpg",
      photoCaption:"Waikiki Shore / beachfront view",
      gallery:"https://hawaiivacationcondos.outrigger.com/hawaii/oahu/waikiki-shore-by-outrigger",
      checkin:"3:00 PM以降",checkout:"11:00 AMまで",room:"One-Bedroom Park View",
      guests:"大人3名＋子ども1名",cancel:"予約メールのキャンセル条件に従う",
      map:"https://www.google.com/maps/search/?api=1&query=Waikiki+Shore+by+OUTRIGGER+2161+Kalia+Rd+Honolulu"
    },
    "Coast Coal Harbour Vancouver Hotel by APA":{
      type:"hotel",title:"Coast Coal Harbour Vancouver Hotel by APA",booking:"Coast Coal Harbour",
      dateLabel:"DEC 27 – DEC 28",address:"1180 West Hastings Street, Vancouver, BC V6E 4R5",
      photo:"https://image-tc.galaxy.tf/wijpeg-34x0rffxc7v5obaj074nntjl/coast-coal-harbour-vancouver-hotel-exterior.jpg?width=1280",
      photoCaption:"Coast Coal Harbour Vancouver Hotel by APA / official",
      gallery:"https://www.coasthotels.com/coast-coal-harbour-vancouver-hotel-by-apa/gallery",
      checkin:"到着後",checkout:"12:00 PM",room:"Coast Two Queens",
      guests:"家族4名",cancel:"予約時の選択レート条件に従う",
      notes:"チェックイン時：写真付きID＋同名義クレジットカード",
      map:"https://www.google.com/maps/search/?api=1&query=Coast+Coal+Harbour+Vancouver+Hotel+by+APA"
    },
    "Chateau Victoria Hotel & Suites":{
      type:"hotel",title:"Chateau Victoria Hotel & Suites",booking:"Chateau Victoria / Expedia",
      dateLabel:"DEC 28 – DEC 29",address:"740 Burdett Ave, Victoria, BC V8W1B2",
      photo:"https://ik.warmlyyours.com/img/victoria-bc-inner-harbor-skyline-at-dusk-de1f2c.jpeg?ik-sdk-version=ruby-1.0.10",
      photoCaption:"Victoria Inner Harbour / hotel is in downtown Victoria",
      gallery:"https://chateauvictoria.com/",
      checkin:"4:00 PM – 12:00 AM",checkout:"11:00 AM想定",room:"Traditional Room / 2 Queen Beds",
      guests:"大人3名＋子ども1名",cancel:"12/27 11:59（現地）までキャンセル無料",
      map:"https://www.google.com/maps/search/?api=1&query=Chateau+Victoria+Hotel+Suites+740+Burdett+Ave+Victoria+BC"
    },
    "West Coast Suites":{
      type:"hotel",title:"West Coast Suites at UBC",booking:"West Coast Suites",
      dateLabel:"DEC 29 – DEC 30",address:"5959 Student Union Blvd., Vancouver, BC V6T 1Z1",
      photo:"https://bm-communications-2021.sites.olt.ubc.ca/files/2021/07/MR-placeholder-1-940x897.jpg",
      photoCaption:"UBC Vancouver campus",
      gallery:"https://www.google.com/travel/hotels/entity/ChgIhInK2Izw_4OSARoLL2cvMXY5Z3Y0aGgQAQ",
      checkin:"4:00 PM",checkout:"11:00 AM",room:"Suite with Kitchen / King Bed & Queen Sofa Bed",
      guests:"家族4名",cancel:"到着前日16:00 PSTまでキャンセル無料、その後は初泊100%",
      map:"https://www.google.com/maps/search/?api=1&query=West+Coast+Suites+UBC"
    },
    "Rock-A-Hula":{
      type:"activity",title:"Rock-A-Hula",booking:"Rock-A-Hula / VELTRA",
      dateLabel:"FRI, DEC 25",time:"5:30 PM",location:"Royal Hawaiian Shopping Center",
      photo:"https://www.rockahulahawaii.com/wp-content/uploads/2.19.23-RAH-4-of-67-Edit.jpg",
      photoCaption:"Rock-A-Hula / official",
      gallery:"https://www.rockahulahawaii.com/jp/gallery",
      details:"ビュッフェ＆ショー（オリジナル席）・大人4名。バウチャーをスマホ表示または印刷。",
      map:"https://www.google.com/maps/search/?api=1&query=Royal+Hawaiian+Center+Honolulu"
    }
  };

  function reservation(name){return (window.tripReservations||{})[name]||'—'}
  function fullInfoButton(key){return '<button type="button" class="btn" onclick="showTripFullInfo(\''+key.replace(/'/g,"\\'")+'\')">📄 Full info</button>'}
  function heroPhotoHtml(d){
    if(!d.photo)return '';
    return '<figure style="margin:0 22px 18px;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;background:#fff">'+
      '<img src="'+d.photo+'" alt="'+(d.photoCaption||d.title)+'" loading="lazy" decoding="async" style="display:block;width:100%;aspect-ratio:16/9;object-fit:cover">'+
      '<figcaption style="padding:7px 10px;font-size:12px;color:#6d7472">'+(d.photoCaption||'')+
      (d.gallery?' · <a href="'+d.gallery+'" target="_blank" rel="noopener" style="color:#1683c5">写真を見る</a>':'')+
      '</figcaption></figure>';
  }

  function flightHtml(d){
    return `
      <div style="padding:24px 22px 10px">
        <h1 style="font-size:34px;margin:4px 0 4px">${d.title}</h1>
        <div style="font-size:20px;margin-bottom:4px">${d.subtitle}</div>
        <div style="font-size:18px">Confirmation <b>${reservation(d.booking)}</b></div>
      </div>
      <div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px">${d.dateLabel}</div>
      <div style="padding:24px 24px 6px">
        <div style="display:grid;grid-template-columns:28px 1fr;column-gap:18px">
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:22px;height:22px;border:3px solid #222;border-radius:50%;background:#fff"></div>
            <div style="width:3px;background:#222;flex:1;min-height:170px"></div>
            <div style="width:22px;height:22px;border:3px solid #222;border-radius:50%;background:#fff"></div>
          </div>
          <div>
            <div style="font-size:20px">Depart ${d.depCity}</div>
            <div style="font-size:38px;font-weight:700;line-height:1.15">${d.depTime} <span style="font-size:22px;font-weight:400">${d.depZone}</span></div>
            <div style="margin-top:12px;font-size:18px"><a href="${d.depMap}" target="_blank" rel="noopener" style="color:#1683c5;text-decoration:none">${d.terminalDep}　📍 Map</a></div>
            <div style="text-align:center;color:#666;margin:34px 0;font-size:20px">Duration <b style="color:#222">${d.duration}</b></div>
            <div style="font-size:20px">Arrive ${d.arrCity}</div>
            <div style="font-size:38px;font-weight:700;line-height:1.15">${d.arrTime} <span style="font-size:22px;font-weight:400">${d.arrZone}</span></div>
            <div style="margin-top:12px;font-size:18px"><a href="${d.arrMap}" target="_blank" rel="noopener" style="color:#1683c5;text-decoration:none">${d.terminalArr}　📍 Map</a></div>
          </div>
        </div>
      </div>
      <div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px;margin-top:24px">DETAILS</div>
      <div style="padding:18px 22px;font-size:17px;line-height:1.7">
        <div><b>Fare</b><br>${d.fare}</div>
        <div style="margin-top:12px"><b>Seats</b><br>${d.seats}</div>
        <div style="margin-top:12px"><b>Baggage</b><br>${d.baggage}</div>
        <div style="margin-top:12px"><b>Notes</b><br>${d.notes}</div>
        <div style="margin-top:18px">${fullInfoButton(d.booking)}</div>
        
      </div>`;
  }

  function hotelHtml(d){
    return `
      <div style="padding:24px 22px 10px">
        <h1 style="font-size:32px;margin:4px 0 4px">${d.title}</h1>
        <div style="font-size:18px">Confirmation <b>${reservation(d.booking)}</b></div>
      </div>
      <div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px">${d.dateLabel}</div>
      ${heroPhotoHtml(d)}
      <div style="padding:22px;font-size:18px;line-height:1.7">
        <div><b>Address</b><br>${d.address}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px">
          <div><b>Check in</b><br>${d.checkin}</div>
          <div><b>Check out</b><br>${d.checkout}</div>
        </div>
        <div style="margin-top:18px"><b>Room</b><br>${d.room}</div>
        <div style="margin-top:12px"><b>Guests</b><br>${d.guests}</div>
        <div style="margin-top:12px"><b>Cancellation</b><br>${d.cancel}</div>
        ${d.notes?'<div style="margin-top:12px"><b>Notes</b><br>'+d.notes+'</div>':''}
        <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap"><a href="${d.map}" target="_blank" class="btn">📍 Maps</a>${fullInfoButton(d.booking)}</div>
      </div>`;
  }

  function activityHtml(d){
    return `
      <div style="padding:24px 22px 10px">
        <h1 style="font-size:32px;margin:4px 0 4px">${d.title}</h1>
        <div style="font-size:18px">Confirmation <b>${reservation(d.booking)}</b></div>
      </div>
      <div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px">${d.dateLabel}</div>
      ${heroPhotoHtml(d)}
      <div style="padding:22px;font-size:18px;line-height:1.7">
        <div><b>Time</b><br>${d.time}</div>
        <div style="margin-top:12px"><b>Location</b><br>${d.location}</div>
        <div style="margin-top:12px"><b>Details</b><br>${d.details}</div>
        <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap"><a href="${d.map}" target="_blank" class="btn">📍 Maps</a>${fullInfoButton(d.booking)}</div>
      </div>`;
  }

  function openDetail(key){
    const d=data[key]; if(!d)return;
    const body=document.getElementById('tripDetailBody');
    body.innerHTML=d.type==='flight'?flightHtml(d):d.type==='hotel'?hotelHtml(d):activityHtml(d);
    overlay.style.display='block';
    overlay.scrollTop=0;
    document.body.style.overflow='hidden';
  }
  function closeDetail(){overlay.style.display='none';document.body.style.overflow=''}

  document.getElementById('tripDetailBack').onclick=closeDetail;

  // Make timeline events clickable
  const matchers=[
    ['Delta DL198','Delta DL198'],
    ['AC1783','Air Canada AC1783'],
    ['AC1782','Air Canada AC1782'],
    ['ZIPAIR ZG21','ZIPAIR ZG21'],
    ['Waikiki Shore','Waikiki Shore by OUTRIGGER'],
    ['Coast Coal Harbour','Coast Coal Harbour Vancouver Hotel by APA'],
    ['Chateau Victoria','Chateau Victoria Hotel & Suites'],
    ['West Coast Suites','West Coast Suites'],
    ['Rock-A-Hula','Rock-A-Hula']
  ];
  document.querySelectorAll('.item').forEach(item=>{
    const t=item.querySelector('.title')?.textContent||'';
    const hit=matchers.find(([needle])=>t.includes(needle));
    if(hit){
      item.style.cursor='pointer';
      item.setAttribute('role','button');
      item.setAttribute('tabindex','0');
      item.title='タップして詳細を見る';
      item.addEventListener('click',e=>{
        if(e.target.closest('a,button,summary,details'))return;
        openDetail(hit[1]);
      });
      item.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDetail(hit[1])}});
      const title=item.querySelector('.title');
      if(title && !title.querySelector('.detailHint')){
        const h=document.createElement('span');
        h.className='detailHint';
        h.textContent='  ›';
        h.style.color='#2b6e68';
        title.appendChild(h);
      }
    }
  });

  // Old inline DL198 details are redundant in the new modal
  document.querySelectorAll('.details').forEach(d=>d.style.display='none');
})();
