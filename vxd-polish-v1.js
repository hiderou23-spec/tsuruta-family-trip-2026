
(function(){
  const chapters = {
    d23:{kicker:"CHAPTER 1",title:"HONOLULU",emoji:"🌺"},
    d27:{kicker:"CHAPTER 2",title:"VANCOUVER",emoji:"🍁"},
    d28:{kicker:"SIDE TRIP",title:"VICTORIA",emoji:"⛴"},
    d29:{kicker:"CHAPTER 3",title:"UBC",emoji:"🎓"},
    d31:{kicker:"FINAL CHAPTER",title:"TOKYO · 大晦日",emoji:"🔔"}
  };

  const style=document.createElement("style");
  style.textContent=`
    .chapter-mark{
      display:flex;
      align-items:center;
      gap:10px;
      margin:0 0 12px;
      padding:0 2px 8px;
      border-bottom:1px dashed #ddd7e8;
    }
    .chapter-icon{
      width:36px;height:36px;
      display:grid;place-items:center;
      border-radius:12px;
      background:linear-gradient(135deg,#eef8ff,#f5ecff);
      border:1px solid #e3ddeb;
      font-size:18px;
      flex:0 0 auto;
    }
    .chapter-kicker{
      font-size:10px;
      letter-spacing:.15em;
      font-weight:800;
      color:#9a8eaa;
      line-height:1.1;
    }
    .chapter-title{
      font-size:14px;
      letter-spacing:.04em;
      font-weight:800;
      color:#56627a;
      margin-top:2px;
    }
    .section h2{
      color:#273247;
      font-weight:800;
    }
    .timeline .time{
      color:#33425d;
      font-size:14px;
      font-variant-numeric:tabular-nums;
    }
    .timeline .title{
      color:#273247;
      font-weight:800;
      letter-spacing:-.01em;
    }
    .timeline .note{
      color:#8991a2;
      line-height:1.45;
    }
    @media(max-width:640px){
      .chapter-mark{margin-bottom:10px}
      .chapter-icon{width:32px;height:32px;border-radius:10px;font-size:16px}
      .chapter-title{font-size:13px}
    }
  `;
  document.head.appendChild(style);

  Object.entries(chapters).forEach(([id,c])=>{
    const section=document.getElementById(id);
    const h2=section?.querySelector("h2");
    if(!section||!h2||section.querySelector(".chapter-mark")) return;
    const mark=document.createElement("div");
    mark.className="chapter-mark";
    mark.innerHTML=
      '<div class="chapter-icon" aria-hidden="true">'+c.emoji+'</div>'+
      '<div><div class="chapter-kicker">'+c.kicker+'</div><div class="chapter-title">'+c.title+'</div></div>';
    section.insertBefore(mark,h2);
  });
})();