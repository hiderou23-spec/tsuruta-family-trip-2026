
(function(){
  const photos = {
    d23: {
      src: "https://assets.princess.com/is/image/princesscruises/honolulu-hawaii--shoreline-beach-hotels-mountain%3A16x9?ts=1710361271010",
      alt: "Waikiki Beach and Diamond Head",
      caption: "Honolulu / Waikīkī"
    },
    d27: {
      src: "https://res.klook.com/klook-sr-genai/image/upload/fl_lossy.progressive%2Cw_1200%2Ch_630%2Cc_fill%2Cq_85/v1777655607/test/poi/generated_images/poi_auto_372a36_Canada_Place.png",
      alt: "Canada Place on Vancouver waterfront",
      caption: "Vancouver / Canada Place"
    },
    d28: {
      src: "https://ik.warmlyyours.com/img/victoria-bc-inner-harbor-skyline-at-dusk-de1f2c.jpeg?ik-sdk-version=ruby-1.0.10",
      alt: "Victoria Inner Harbour",
      caption: "Victoria / Inner Harbour"
    },
    d29: {
      src: "https://www.u-tokai.ac.jp/tachyon/2022/02/britishcolumbia.jpg",
      alt: "UBC Vancouver campus",
      caption: "UBC Vancouver"
    },
    d31: {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/%E8%B2%A1%E8%B3%80%E5%AF%BA%E9%90%98%E6%A5%BC.jpg/1280px-%E8%B2%A1%E8%B3%80%E5%AF%BA%E9%90%98%E6%A5%BC.jpg",
      alt: "除夜の鐘の鐘楼",
      caption: "大晦日 / 除夜の鐘 · Wikimedia Commons (CC BY-SA 4.0)"
    }
  };

  const style=document.createElement("style");
  style.textContent=`
    .trip-photo{
      position:relative;
      margin:18px 6px 22px;
      padding:9px 9px 0;
      border-radius:6px;
      overflow:visible;
      border:1px solid #e8e1ee;
      background:#fff;
      box-shadow:0 10px 24px rgba(85,72,105,.12);
      transform:rotate(-.35deg);
    }
    .trip-photo::before{
      content:"";
      position:absolute;
      width:78px;height:22px;
      left:50%;top:-12px;
      transform:translateX(-50%) rotate(-2deg);
      background:rgba(255,224,168,.78);
      border:1px solid rgba(225,192,126,.28);
      z-index:2;
    }
    .trip-photo img{
      display:block;
      width:100%;
      aspect-ratio:16/7;
      object-fit:cover;
    }
    .trip-photo .trip-photo-caption{
      padding:7px 11px 8px;
      font-size:12px;
      color:#6d7472;
      background:#fff;
    }
    @media(max-width:640px){
      .trip-photo{margin:12px 0 16px;border-radius:14px}
      .trip-photo img{aspect-ratio:16/8}
    }
  `;
  document.head.appendChild(style);

  Object.entries(photos).forEach(([id,p])=>{
    const section=document.getElementById(id);
    if(!section || section.querySelector(".trip-photo")) return;
    const photo=document.createElement("figure");
    photo.className="trip-photo";
    photo.innerHTML='<img loading="lazy" decoding="async" src="'+p.src+'" alt="'+p.alt+'"><figcaption class="trip-photo-caption">'+p.caption+'</figcaption>';
    const sub=section.querySelector(".sub");
    if(sub) sub.insertAdjacentElement("afterend",photo);
    else section.insertBefore(photo,section.querySelector(".timeline"));
  });
})();