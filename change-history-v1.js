(function(){
  const entries=[
    {
      at:'2026/10/10 12:32 JST',
      title:'更新履歴を追加',
      detail:'家族全員が、旅行サイトから主な変更内容と更新日時を確認できるようにしました。'
    },
    {
      at:'2026/10/10 12:27 JST',
      title:'クリスマス周辺の予定を見直し',
      detail:'12/25はWaikikiでクリスマスを楽しむ日＋Rock-A-Hulaに変更。Kualoa Ranch UTVは12/26午前へ移動しました。'
    },
    {
      at:'2026/10/10 12:27 JST',
      title:'12/26午後を家族相談に変更',
      detail:'午後は「Ala Moanaで買い物・自由時間」または「Takeruの射撃体験を優先」の2案とし、家族で選べるようにしました。'
    },
    {
      at:'2026/10/08 21:18 JST',
      title:'家族コメント機能を強化',
      detail:'予定ごとのコメント、返信、クイック返信、未読通知、該当コメントへの直接表示に対応しました。'
    },
    {
      at:'2026/10/08',
      title:'家族で相談・回答できる機能を追加',
      detail:'Christmas Eve Dinner、ハワイ最後の夕食、射撃、Victoria / UBCの時間配分などを家族で相談できる仕組みを追加しました。'
    }
  ];

  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  const open=document.getElementById('changeHistoryOpen');
  const overlay=document.getElementById('changeHistoryOverlay');
  const back=document.getElementById('changeHistoryBack');
  const list=document.getElementById('changeHistoryList');
  if(!open||!overlay||!back||!list)return;

  function render(){
    list.innerHTML=entries.map((e,i)=>'<div style="background:#fff;border:1px solid #e8e1eb;border-radius:16px;padding:14px 15px;margin-bottom:10px;box-shadow:0 5px 14px rgba(82,76,110,.05)"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start"><div style="font-weight:800;color:#273247">'+esc(e.title)+'</div>'+(i===0?'<span style="font-size:10px;font-weight:800;background:#e7f3ff;color:#5276a3;padding:3px 7px;border-radius:999px">最新</span>':'')+'</div><div style="font-size:11px;color:#9a8eaa;margin-top:3px">'+esc(e.at)+'</div><div style="font-size:13px;color:#6f788c;margin-top:7px;line-height:1.6">'+esc(e.detail)+'</div></div>').join('');
  }
  open.addEventListener('click',()=>{
    render();overlay.style.display='block';overlay.scrollTop=0;document.body.style.overflow='hidden';
    try{window.tripAnalytics?.track('change_history_open',{})}catch(_){}
  });
  back.addEventListener('click',()=>{overlay.style.display='none';document.body.style.overflow=''});
})();
