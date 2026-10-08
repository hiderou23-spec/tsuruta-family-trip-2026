
(function(){
  const host=document.querySelector('.wrap');
  if(!host)return;

  const detailStyle=document.createElement('style');
  detailStyle.textContent=`
    #tripDetailOverlay,#tripFullInfoOverlay{
      background:
        radial-gradient(circle at 18px 18px,rgba(169,145,220,.06) 1.5px,transparent 1.6px) 0 0/28px 28px,
        linear-gradient(180deg,#fffaf6 0%,#f9fbff 58%,#fff 100%) !important;
      color:#273247;
    }
    #tripDetailOverlay>div,#tripFullInfoOverlay>div{
      max-width:760px !important;
      background:transparent !important;
    }
    #tripDetailOverlay>div>div:first-child,
    #tripFullInfoOverlay>div>div:first-child{
      background:rgba(255,250,246,.94) !important;
      border-bottom:1px solid #e9e2ed !important;
      box-shadow:0 5px 18px rgba(83,76,110,.06);
    }
    #tripDetailBack,#tripFullInfoBack{
      background:#f5f1fb !important;
      color:#5f6d85 !important;
      border:1px solid #e1dbea !important;
      box-shadow:0 2px 7px rgba(76,68,104,.06);
    }
    #tripDetailBody,#tripFullInfoBody{
      padding-bottom:28px;
    }
    #tripDetailBody>div:first-child,
    #tripFullInfoBody>div:first-child{
      position:relative;
      margin:16px 14px 0;
      padding:28px 20px 18px !important;
      border:1px solid #e8e1eb;
      border-radius:18px 18px 0 0;
      background:linear-gradient(135deg,#e8f5ff 0%,#f1eaff 52%,#fff0e4 100%);
      box-shadow:0 10px 24px rgba(82,76,110,.08);
    }
    #tripDetailBody>div:first-child::before,
    #tripFullInfoBody>div:first-child::before{
      content:"";
      position:absolute;
      left:24px;top:-9px;
      width:70px;height:18px;
      transform:rotate(-4deg);
      background:rgba(255,228,159,.78);
      border:1px solid rgba(220,188,118,.25);
    }
    #tripDetailBody h1,#tripFullInfoBody h1{
      color:#273247 !important;
      letter-spacing:-.025em;
    }
    #tripDetailBody>div[style*="background:#f1f1f4"],
    #tripFullInfoBody>div[style*="background:#f1f1f4"]{
      margin:0 14px !important;
      padding:9px 20px !important;
      background:#f7f3fb !important;
      color:#766d86 !important;
      border-left:1px solid #e8e1eb;
      border-right:1px solid #e8e1eb;
      letter-spacing:.05em;
    }
    #tripDetailBody figure{
      margin:0 22px 20px !important;
      padding:9px 9px 0 !important;
      border-radius:6px !important;
      overflow:visible !important;
      border:1px solid #e8e1ee !important;
      background:#fff !important;
      box-shadow:0 10px 24px rgba(85,72,105,.12);
      transform:rotate(-.25deg);
      position:relative;
    }
    #tripDetailBody figure::before{
      content:"";
      position:absolute;
      width:72px;height:20px;
      left:50%;top:-11px;
      transform:translateX(-50%) rotate(-2deg);
      background:rgba(255,224,168,.78);
      border:1px solid rgba(225,192,126,.28);
      z-index:2;
    }
    #tripDetailBody figure img{border-radius:2px}
    #tripDetailBody .btn,#tripFullInfoBody .btn{
      min-height:42px;
      display:inline-flex;
      align-items:center;
      justify-content:center;
      border-radius:12px !important;
      border:1px solid #ddd8e8 !important;
      background:#fff !important;
      color:#526077 !important;
      box-shadow:0 3px 8px rgba(80,72,102,.05);
      padding:8px 11px !important;
      font-size:13px !important;
    }
    #tripDetailBody a[style*="color:#1683c5"]{
      color:#607bb5 !important;
      text-decoration:none !important;
      font-weight:700;
    }
    #tripFullInfoBody>div:last-child{
      margin:0 14px;
      background:#fff;
      border:1px solid #e8e1eb;
      border-top:0;
      border-radius:0 0 18px 18px;
      box-shadow:0 10px 24px rgba(82,76,110,.06);
    }
    @media(max-width:640px){
      #tripDetailBody>div:first-child,
      #tripFullInfoBody>div:first-child{
        margin:10px 10px 0;
        padding:26px 16px 16px !important;
      }
      #tripDetailBody>div[style*="background:#f1f1f4"],
      #tripFullInfoBody>div[style*="background:#f1f1f4"]{
        margin:0 10px !important;
        padding:8px 16px !important;
      }
      #tripDetailBody figure{margin:0 16px 18px !important}
      #tripFullInfoBody>div:last-child{margin:0 10px}
    }
  `;
  document.head.appendChild(detailStyle);

  // Hide old aggregate sections if present
  const old=document.getElementById('reservations'); if(old) old.style.display='none';
  const oldModal=document.getElementById('modal'); if(oldModal) oldModal.style.display='none';
  const oldDetails=document.getElementById('travel-details-v2'); if(oldDetails) oldDetails.style.display='none';

  // Trip detail modal
  const overlay=document.createElement('div');
  overlay.id='tripDetailOverlay';
  overlay.style.cssText='position:fixed;inset:0;z-index:1000;background:#fffaf6;display:none;overflow:auto';
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
  fullOverlay.style.cssText='position:fixed;inset:0;z-index:1100;background:#fffaf6;display:none;overflow:auto';
  fullOverlay.innerHTML=`
    <div style="max-width:760px;margin:0 auto;min-height:100%;background:#fff">
      <div style="position:sticky;top:0;z-index:3;background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-bottom:1px solid #e5e5e5;padding:12px 16px;display:flex;align-items:center;gap:12px">
        <button id="tripFullInfoBack" aria-label="戻る" style="width:44px;height:44px;border-radius:50%;border:0;background:#f1f2f2;font-size:28px;line-height:1;cursor:pointer">‹</button>
        <div style="font-weight:700">予約メール詳細</div>
      </div>
      <div id="tripFullInfoBody"></div>
    </div>`;
  document.body.appendChild(fullOverlay);

  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function showFullInfo(key){
    const x=(window.tripFullInfo||{})[key];
    const body=document.getElementById('tripFullInfoBody');
    if(!x){
      body.innerHTML='<div style="padding:24px">予約メール詳細を読み込めませんでした。ページを再読み込みしてください。</div>';
    }else{
      body.innerHTML=
        '<div style="padding:24px 22px 12px"><h1 style="font-size:30px;margin:0 0 6px">'+esc(x.title)+'</h1><div style="color:#6b6f72;font-size:14px">Source: '+esc(x.source)+'</div></div>'+
        '<div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px">予約メール詳細</div>'+
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
      dateLabel:"WED, DEC 23",depCity:"Vancouver",depTime:"9:10 AM",depZone:"PCT",
      arrCity:"Honolulu",arrTime:"12:45 PM",arrZone:"HST",duration:"6時間35分",
      terminalDep:"YVR Terminal M",terminalArr:"HNL Terminal 2",fare:"Economy Latitude / Economy Class (B)",
      seats:"座席情報は未表示",baggage:"Air Canada運航便の手荷物規定に準拠",
      notes:"変更手数料なし。税・運賃差額は適用。",
      depMap:"https://www.google.com/maps/search/?api=1&query=Vancouver+International+Airport+International+Terminal",arrMap:"https://www.google.com/maps/search/?api=1&query=Daniel+K+Inouye+International+Airport+Terminal+2"
    },
    "Air Canada AC1782":{
      type:"flight",title:"HNL → YVR",subtitle:"AC1782 (Air Canada Rouge)",booking:"Air Canada AC1782",
      dateLabel:"SUN, DEC 27",depCity:"Honolulu",depTime:"2:00 PM",depZone:"HST",
      arrCity:"Vancouver",arrTime:"10:54 PM",arrZone:"PCT",duration:"5時間54分",
      terminalDep:"HNL Terminal 2",terminalArr:"YVR Terminal M",fare:"Economy Standard / Economy Class (T)",
      seats:"25D（通路）・25E（中央）・25F（窓側）の確認あり",baggage:"Air Canada運航便の手荷物規定に準拠",
      notes:"変更は1人・片道 ¥15,800＋税・運賃差額。",
      depMap:"https://www.google.com/maps/search/?api=1&query=Daniel+K+Inouye+International+Airport+Terminal+2",arrMap:"https://www.google.com/maps/search/?api=1&query=Vancouver+International+Airport+International+Terminal"
    },
    "ZIPAIR ZG21":{
      type:"flight",title:"YVR → NRT",subtitle:"ZG21 (ZIPAIR Tokyo)",booking:"ZIPAIR ZG21",
      dateLabel:"WED, DEC 30 – THU, DEC 31",depCity:"Vancouver",depTime:"9:30 AM",depZone:"PCT",
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
      phone:"+1 808 922 3871",email:"wsr@outrigger.com",
      map:"https://www.google.com/maps/search/?api=1&query=Waikiki+Shore+by+OUTRIGGER+2161+Kalia+Rd+Honolulu"
    },
    "Coast Coal Harbour Vancouver Hotel by APA":{
      type:"hotel",title:"Coast Coal Harbour Vancouver Hotel by APA",booking:"Coast Coal Harbour",
      dateLabel:"DEC 27 – DEC 28",address:"1180 West Hastings Street, Vancouver, BC V6E 4R5",
      photo:"https://image-tc.galaxy.tf/wijpeg-34x0rffxc7v5obaj074nntjl/coast-coal-harbour-vancouver-hotel-exterior.jpg?width=1280",
      photoCaption:"Coast Coal Harbour Vancouver Hotel by APA / official",
      gallery:"https://www.coasthotels.com/coast-coal-harbour-vancouver-hotel-by-apa/gallery",
      checkin:"到着後",checkout:"12:00 PM",room:"Coast Two Queens",
      guests:"予約メール：3 guests（4名利用予定なら要確認）",cancel:"予約時の選択レート条件に従う",
      phone:"+1 604 697 0202",email:"cccinfo@coasthotels.com",
      notes:"チェックイン時：写真付きID＋同名義クレジットカード",
      map:"https://www.google.com/maps/search/?api=1&query=Coast+Coal+Harbour+Vancouver+Hotel+by+APA"
    },
    "Chateau Victoria Hotel & Suites":{
      type:"hotel",title:"Chateau Victoria Hotel & Suites",booking:"Chateau Victoria / Expedia",
      dateLabel:"DEC 28 – DEC 29",address:"740 Burdett Ave, Victoria, BC V8W1B2",
      photo:"https://ik.warmlyyours.com/img/victoria-bc-inner-harbor-skyline-at-dusk-de1f2c.jpeg?ik-sdk-version=ruby-1.0.10",
      photoCaption:"Victoria Inner Harbour / hotel is in downtown Victoria",
      gallery:"https://chateauvictoria.com/",
      checkin:"4:00 PM – 12:00 AM",checkout:"11:00 AM",room:"Traditional Room / 2 Queen Beds",
      guests:"大人3名＋子ども1名",cancel:"12/27 11:59（現地）までキャンセル無料",
      phone:"+1 250 382 4221",email:"reservations@chateauvictoria.com",
      map:"https://www.google.com/maps/search/?api=1&query=Chateau+Victoria+Hotel+Suites+740+Burdett+Ave+Victoria+BC"
    },
    "West Coast Suites":{
      type:"hotel",title:"West Coast Suites at UBC",booking:"West Coast Suites",
      dateLabel:"DEC 29 – DEC 30",address:"5959 Student Union Blvd., Vancouver, BC V6T 1Z1",
      photo:"",
      photoCaption:"West Coast Suites at UBC",
      gallery:"https://suitesatubc.com/west-coast-suites-vancouver/",
      checkin:"4:00 PM",checkout:"11:00 AM",room:"Suite with Kitchen / King Bed & Queen Sofa Bed",
      guests:"家族4名",cancel:"到着前日16:00 PSTまでキャンセル無料、その後は初泊100%",
      phone:"+1 604 822 1000",email:"reservations@housing.ubc.ca",
      map:"https://www.google.com/maps/search/?api=1&query=West+Coast+Suites+UBC"
    },
    "Diamond Head Lookout":{
      type:"spot",title:"Diamond Head Lookout",dateLabel:"THU, DEC 24",location:"Diamond Head Road / South Shore",
      highlight:"ワイキキと海岸線を見渡せる、ドライブ途中に寄りやすい展望ポイント。",
      time:"約20〜30分",reservation:"Lookout立ち寄りだけなら不要。山頂トレイルへ入る場合は非居住者向け事前予約制度あり。",
      tips:"今回は登山ではなく展望立ち寄り。翌日の予定もあるので短時間で十分。",
      official:"https://dlnr.hawaii.gov/dsp/parks/oahu/diamond-head-state-monument/",
      map:"https://www.google.com/maps/search/?api=1&query=Diamond+Head+Lookout+Honolulu"
    },
    "Halona Blowhole":{
      type:"spot",title:"Halona Blowhole Lookout",dateLabel:"THU, DEC 24",location:"Kalanianaʻole Hwy / East Oʻahu",
      highlight:"溶岩海岸と潮吹き穴を眺める東海岸ドライブの定番ストップ。",
      time:"約15〜25分",reservation:"不要",
      tips:"波の状況で見え方が変わる。展望エリアから安全に見る。Sandy Beachも近いのでセットで短時間立ち寄り。",
      official:"https://www.honolulu.gov/parks/",
      map:"https://www.google.com/maps/search/?api=1&query=Halona+Blowhole+Lookout"
    },
    "Makapuu Lookout":{
      type:"spot",title:"Makapuʻu Lookout",dateLabel:"THU, DEC 24",location:"East Oʻahu",
      highlight:"青い海と沖の島々を一望できる、24日のドライブで特におすすめの展望ポイント。",
      time:"約20〜30分",reservation:"不要",
      tips:"トレイルを歩く計画ではなくLookout中心。風が強いことがあるので帽子などに注意。",
      official:"https://dlnr.hawaii.gov/dsp/",
      map:"https://www.google.com/maps/search/?api=1&query=Makapuu+Lookout+Oahu"
    },
    "Kailua Beach":{
      type:"spot",title:"Kailua Beach",dateLabel:"THU, DEC 24",location:"Kailua, Oʻahu",
      highlight:"白砂と穏やかな海で、東海岸ドライブの昼休憩にちょうど良いビーチ。",
      time:"昼食込み 約1.5〜2時間",reservation:"不要",
      tips:"Kailuaで昼食＋ビーチ散歩を基本に。Lanikaiは住宅街の駐車が難しいため無理に車で入らない。",
      official:"https://www.honolulu.gov/parks/",
      map:"https://www.google.com/maps/search/?api=1&query=Kailua+Beach+Park+Hawaii"
    },
    "Nuuanu Pali Lookout":{
      type:"spot",title:"Nuʻuanu Pali Lookout",dateLabel:"THU, DEC 24",location:"Nuʻuanu Pali State Wayside",
      highlight:"コオラウ山脈とWindward側を一望でき、オアフ島の地形がよく分かる展望台。",
      time:"約30〜45分",reservation:"予約不要。非居住者は駐車料金あり。",
      tips:"KailuaからWaikikiへ戻る途中に組み込むと効率的。風が非常に強い日がある。",
      official:"https://dlnr.hawaii.gov/dsp/parks/oahu/nuuanu-pali-state-wayside/",
      map:"https://www.google.com/maps/search/?api=1&query=Nuuanu+Pali+Lookout"
    },
    "Kualoa Ranch UTV":{
      type:"spot",title:"Kualoa Ranch UTV Raptor Tour",dateLabel:"FRI, DEC 25",location:"Kualoa Ranch",
      highlight:"映画ロケ地として知られる渓谷や未舗装路を、自分でUTVを運転して巡る人気アクティビティ。",
      time:"約2時間（安全説明・練習を含む）",reservation:"事前予約推奨。人気ツアーのためクリスマス週は早めに確保。",
      tips:"運転者は21歳以上＋有効な運転免許証。1台につき最大2人まで運転交代可。汚れやすいので汚れてもよい服・靴、サングラス推奨。",
      official:"https://www.kualoa.com/tours-and-activities/utv-raptor-tour",
      map:"https://www.google.com/maps/search/?api=1&query=Kualoa+Ranch+Hawaii"
    },
    "Waikiki Beach":{
      type:"spot",title:"Waikiki Beach",dateLabel:"SAT, DEC 26",location:"Waikīkī, Honolulu",
      highlight:"旅行最終フルデーは予定を詰めず、ビーチ散歩・海・カフェでゆっくり過ごす。",
      time:"約1〜1.5時間",reservation:"不要",
      tips:"泳ぐ場合は当日の海況を確認。散歩だけでもDiamond Headを望む景色を楽しめる。",
      official:"https://www.gohawaii.com/islands/oahu/things-to-do/beaches/waikiki-beach",
      map:"https://www.google.com/maps/search/?api=1&query=Waikiki+Beach+Honolulu"
    },
    "Ala Moana Center":{
      type:"spot",title:"Ala Moana Center",dateLabel:"SAT, DEC 26",location:"1450 Ala Moana Blvd, Honolulu",
      highlight:"ハワイ最後の買い物と昼食をまとめて済ませやすい大型オープンエア・ショッピングセンター。",
      time:"約2.5〜3時間",reservation:"不要",
      tips:"350店超のショップ・レストランがあるため、買いたい物を先に決めておくと効率的。店舗ごとに営業時間は異なる。",
      official:"https://www.alamoanacenter.com/en/",
      map:"https://www.google.com/maps/search/?api=1&query=Ala+Moana+Center+Honolulu"
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
  function fullInfoButton(key){return '<button type="button" class="btn" onclick="showTripFullInfo(\''+key.replace(/'/g,"\\'")+'\')">📄 予約メール詳細</button>'}
  function heroPhotoHtml(d){
    if(!d.photo){
      if(!d.gallery)return '';
      return '<div style="margin:14px 22px 20px;padding:16px 18px;border:1px solid #e8e1ee;border-radius:14px;background:#fff;box-shadow:0 6px 16px rgba(85,72,105,.07)">'+
        '<div style="font-size:14px;color:#6d7472;margin-bottom:8px">写真は公式ページで確認できます。</div>'+
        '<a href="'+d.gallery+'" target="_blank" rel="noopener" class="btn" style="text-decoration:none">📷 公式写真を見る</a>'+
        '</div>';
    }
    return '<figure style="margin:0 22px 18px;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;background:#fff">'+
      '<img src="'+d.photo+'" alt="'+(d.photoCaption||d.title)+'" loading="lazy" decoding="async" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" style="display:block;width:100%;aspect-ratio:16/9;object-fit:cover">'+
      '<div style="display:none;min-height:140px;align-items:center;justify-content:center;padding:20px;color:#737b8f;background:#f7f7fa;text-align:center">写真を表示できません。下の「写真を見る」から公式ページをご確認ください。</div>'+
      '<figcaption style="padding:7px 10px;font-size:12px;color:#6d7472">'+(d.photoCaption||'')+
      (d.gallery?' · <a href="'+d.gallery+'" target="_blank" rel="noopener" style="color:#1683c5">写真を見る</a>':'')+
      '</figcaption></figure>';
  }

  function flightHtml(d){
    return `
      <div style="padding:24px 22px 10px">
        <h1 style="font-size:34px;margin:4px 0 4px">${d.title}</h1>
        <div style="font-size:20px;margin-bottom:4px">${d.subtitle}</div>
        <div style="font-size:18px">予約番号 <b>${reservation(d.booking)}</b></div>
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
        <div><b>運賃タイプ</b><br>${d.fare}</div>
        <div style="margin-top:12px"><b>座席</b><br>${d.seats}</div>
        <div style="margin-top:12px"><b>手荷物</b><br>${d.baggage}</div>
        <div style="margin-top:12px"><b>メモ</b><br>${d.notes}</div>
        <div style="margin-top:18px">${fullInfoButton(d.booking)}</div>
        
      </div>`;
  }

  function hotelHtml(d){
    return `
      <div style="padding:24px 22px 10px">
        <h1 style="font-size:32px;margin:4px 0 4px">${d.title}</h1>
        <div style="font-size:18px">予約番号 <b>${reservation(d.booking)}</b></div>
      </div>
      <div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px">${d.dateLabel}</div>
      ${heroPhotoHtml(d)}
      <div style="padding:22px;font-size:18px;line-height:1.7">
        <div><b>住所</b><br>${d.address}</div>
        <div style="margin-top:16px"><b>連絡先</b><br>
          <a href="tel:${(d.phone||'').replace(/[^+\d]/g,'')}" style="color:#607bb5;text-decoration:none;font-weight:700">☎ ${d.phone||'—'}</a><br>
          <a href="mailto:${d.email||''}" style="color:#607bb5;text-decoration:none;font-weight:700">✉ ${d.email||'—'}</a>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px">
          <div><b>チェックイン</b><br>${d.checkin}</div>
          <div><b>チェックアウト</b><br>${d.checkout}</div>
        </div>
        <div style="margin-top:18px"><b>客室</b><br>${d.room}</div>
        <div style="margin-top:12px"><b>宿泊人数</b><br>${d.guests}</div>
        <div style="margin-top:12px"><b>キャンセル条件</b><br>${d.cancel}</div>
        ${d.notes?'<div style="margin-top:12px"><b>メモ</b><br>'+d.notes+'</div>':''}
        <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap"><a href="${d.map}" target="_blank" class="btn">📍 Maps</a>${fullInfoButton(d.booking)}</div>
      </div>`;
  }

  function spotHtml(d){
    return `
      <div style="padding:24px 22px 10px">
        <div style="font-size:11px;color:#9a8eaa;font-weight:800;letter-spacing:.12em">HIGHLIGHT</div>
        <h1 style="font-size:32px;margin:4px 0 4px">${d.title}</h1>
        <div style="font-size:16px;color:#70798c">${d.location}</div>
      </div>
      <div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px">${d.dateLabel}</div>
      <div style="padding:22px;font-size:17px;line-height:1.7">
        <div style="background:linear-gradient(135deg,#f4fbff,#f7f3ff);border:1px solid #e3deec;border-radius:16px;padding:15px"><b>見どころ</b><br>${d.highlight}</div>
        <div style="margin-top:16px"><b>滞在目安</b><br>${d.time}</div>
        <div style="margin-top:12px"><b>予約</b><br>${d.reservation}</div>
        <div style="margin-top:12px"><b>今回のポイント</b><br>${d.tips}</div>
        <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap">
          <a href="${d.official}" target="_blank" rel="noopener" class="btn">ℹ 公式情報</a>
          <a href="${d.map}" target="_blank" rel="noopener" class="btn">📍 Google Maps</a>
        </div>
      </div>`;
  }

  function activityHtml(d){
    return `
      <div style="padding:24px 22px 10px">
        <h1 style="font-size:32px;margin:4px 0 4px">${d.title}</h1>
        <div style="font-size:18px">予約番号 <b>${reservation(d.booking)}</b></div>
      </div>
      <div style="background:#f1f1f4;color:#666;font-weight:700;padding:8px 22px">${d.dateLabel}</div>
      ${heroPhotoHtml(d)}
      <div style="padding:22px;font-size:18px;line-height:1.7">
        <div><b>時間</b><br>${d.time}</div>
        <div style="margin-top:12px"><b>場所</b><br>${d.location}</div>
        <div style="margin-top:12px"><b>内容</b><br>${d.details}</div>
        <div style="margin-top:20px;display:flex;gap:8px;flex-wrap:wrap"><a href="${d.map}" target="_blank" class="btn">📍 Maps</a>${fullInfoButton(d.booking)}</div>
      </div>`;
  }

  function openDetail(key){
    const d=data[key]; if(!d)return;
    const body=document.getElementById('tripDetailBody');
    body.innerHTML=d.type==='flight'?flightHtml(d):d.type==='hotel'?hotelHtml(d):d.type==='spot'?spotHtml(d):activityHtml(d);
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
    ['Diamond Head Lookout','Diamond Head Lookout'],
    ['Halona Blowhole','Halona Blowhole'],
    ['Makapuʻu Lookout','Makapuu Lookout'],
    ['Kailua・昼食・ビーチ','Kailua Beach'],
    ['Nuʻuanu Pali Lookout','Nuuanu Pali Lookout'],
    ['Kualoa Ranch UTV Raptor Tour','Kualoa Ranch UTV'],
    ['Waikiki Beach・散歩','Waikiki Beach'],
    ['Ala Moana Center・昼食・買い物','Ala Moana Center'],
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
