
(function(){
  const old=document.getElementById('reservations');
  if(old) old.style.display='none';
  const oldModal=document.getElementById('modal');
  if(oldModal) oldModal.style.display='none';

  const host=document.querySelector('.wrap');
  if(!host)return;

  const sec=document.createElement('section');
  sec.className='section';
  sec.id='travel-details-v2';
  sec.innerHTML=`
    <h2>フライト・ホテル詳細</h2>
    <div class="sub">ロック解除後は、予約番号を含む詳細をこのまま確認できます。</div>

    <h3 style="margin:18px 0 8px">✈️ フライト</h3>
    <div class="cardgrid">
      <div class="secret"><b>Delta DL198</b><div class="note">12/23 HND 21:00 → HNL 09:03</div><div class="detailbody">Delta Main Classic (L)<br>家族本隊3名<br>Hidenori: Seat 45C<br>Hidenori分：受託手荷物1個・23kgまで無料の記載あり<br>予約番号：<span class="code" data-r="Delta DL198">—</span></div></div>
      <div class="secret"><b>Air Canada AC1783</b><div class="note">12/23 YVR 08:10 → HNL 12:45</div><div class="detailbody">Air Canada Rouge<br>YVR Terminal M → HNL Terminal 2<br>Economy Latitude / Economy Class (B)<br>変更手数料なし（税・運賃差額は適用）<br>予約番号：<span class="code" data-r="Air Canada AC1783">—</span></div></div>
      <div class="secret"><b>Air Canada AC1782</b><div class="note">12/27 HNL 14:00 → YVR 21:54</div><div class="detailbody">Air Canada Rouge<br>HNL Terminal 2 → YVR Terminal M<br>Economy Standard / Economy Class (T)<br>座席：25D（通路）・25E（中央）・25F（窓側）の確認あり<br>変更：1人・片道 ¥15,800＋税・運賃差額<br>予約番号：<span class="code" data-r="Air Canada AC1782">—</span></div></div>
      <div class="secret"><b>ZIPAIR ZG21</b><div class="note">12/30 YVR 09:30 → 12/31 NRT 12:45</div><div class="detailbody">YVR → NRT<br>成田到着 12/31 12:45 JST<br>予約番号：<span class="code" data-r="ZIPAIR ZG21">—</span></div></div>
    </div>

    <h3 style="margin:20px 0 8px">🏨 ホテル</h3>
    <div class="cardgrid">
      <div class="secret"><b>Waikiki Shore by OUTRIGGER</b><div class="note">12/23–12/27・4泊</div><div class="detailbody">2161 Kalia Rd, Honolulu, HI 96815<br>One-Bedroom Park View<br>大人3名＋子ども1名<br>Check-in 15:00以降 / Check-out 11:00まで<br>予約番号：<span class="code" data-r="Waikiki Shore / Agoda">—</span></div></div>
      <div class="secret"><b>Coast Coal Harbour Vancouver Hotel by APA</b><div class="note">12/27–12/28・1泊</div><div class="detailbody">1180 West Hastings Street, Vancouver, BC V6E 4R5<br>Coast Two Queens<br>Check-out 12:00<br>チェックイン時：写真付きID＋同名義クレジットカード<br>予約番号：<span class="code" data-r="Coast Coal Harbour">—</span></div></div>
      <div class="secret"><b>Chateau Victoria Hotel & Suites</b><div class="note">12/28–12/29・1泊</div><div class="detailbody">740 Burdett Ave, Victoria, BC V8W1B2<br>Traditional Room / 2 Queen Beds<br>大人3名＋子ども1名<br>Check-in 16:00–24:00<br>12/27 11:59（現地）までキャンセル無料<br>予約番号：<span class="code" data-r="Chateau Victoria / Expedia">—</span></div></div>
      <div class="secret"><b>West Coast Suites at UBC</b><div class="note">12/29–12/30・1泊</div><div class="detailbody">5959 Student Union Blvd., Vancouver, BC V6T 1Z1<br>Suite with Kitchen / King Bed & Queen Sofa Bed<br>Check-in 16:00 / Check-out 11:00<br>到着前日16:00 PSTまでキャンセル無料、その後は初泊100%<br>予約番号：<span class="code" data-r="West Coast Suites">—</span></div></div>
    </div>

    <h3 style="margin:20px 0 8px">🎟️ その他</h3>
    <div class="cardgrid"><div class="secret"><b>Rock-A-Hula</b><div class="detailbody">12/25 17:30 / Royal Hawaiian Shopping Center<br>ビュッフェ＆ショー（オリジナル席）・大人4名<br>予約番号：<span class="code" data-r="Rock-A-Hula / VELTRA">—</span></div></div></div>

    <div class="alert"><b>要確認</b><br>① 12/28 Harbour Airの正確な便時刻　② 12/29 BC Ferries Connectorの正確な便時刻</div>
    <div class="actions" style="margin-top:14px"><button class="btn" id="forgetTripDeviceBtn">この端末の記憶を削除</button></div>
  `;

  const footer=host.querySelector('.footer');
  if(footer) host.insertBefore(sec,footer); else host.appendChild(sec);

  function fill(data){
    sec.querySelectorAll('[data-r]').forEach(el=>{
      const v=data[el.dataset.r]||'—';
      el.textContent=v;
      el.title='クリックしてコピー';
      el.style.cursor='pointer';
      el.onclick=async()=>{try{await navigator.clipboard.writeText(v);const old=v;el.textContent='コピー済み';setTimeout(()=>el.textContent=old,900)}catch(_){}};
    });
  }
  if(window.tripReservations) fill(window.tripReservations);
  document.addEventListener('tripReservationsReady',e=>fill(e.detail));
  document.getElementById('forgetTripDeviceBtn').onclick=()=>window.forgetTripDevice&&window.forgetTripDevice();
})();