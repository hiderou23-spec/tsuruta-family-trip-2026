
(function(){
  const photos = {
    d23: {
      src: "https://www.visiteosusa.com.br/sites/default/files/styles/hero_l/public/images/hero_media_image/2025-02/16db584d-0a2b-4d99-b37f-27a5fac23628.jpeg?h=9a3d8190&itok=nCYfPN5-",
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
      src: "https://bm-communications-2021.sites.olt.ubc.ca/files/2021/07/MR-placeholder-1-940x897.jpg",
      alt: "UBC Vancouver campus",
      caption: "UBC Vancouver"
    }
  };

  const style=document.createElement("style");
  style.textContent=`
    .trip-photo{
      margin:14px 0 18px;
      border-radius:18px;
      overflow:hidden;
      border:1px solid var(--line,#ddd);
      background:#fff;
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