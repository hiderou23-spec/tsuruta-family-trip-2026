(function(){
  const entries=[
    {
      at:'2026/10/10 13:32 JST',
      title:'「家族で相談」とアカウント画面を再設計',
      detail:'家族で相談を開くと、全予定のコメントを新しい順で一覧表示するようにしました。未読だけの絞り込み、コメント元の日程・予定名、該当コメントへの直接リンクに対応。アカウントは小さなポップアップではなく、ボトムバーを残した全画面ページとして表示します。'
    },
    {
      at:'2026/10/10 13:24 JST',
      title:'ボトムバーを「ホーム」に変更',
      detail:'「予定」を家アイコン付きの「ホーム」に変更しました。押すと各種オーバーレイを閉じ、更新履歴ボタンのあるページ最上部へ確実に戻るように修正しました。'
    },
    {
      at:'2026/10/10 13:18 JST',
      title:'「予定」ボタンをトップ画面へ戻る動作に変更',
      detail:'ボトムバーの「予定」を押すと、旅行サイトのトップまで戻るようにしました。更新履歴やヘッダーの機能へすぐアクセスできます。'
    },
    {
      at:'2026/10/10 13:13 JST',
      title:'コメント表示と利用状況画面を改善',
      detail:'予定一覧にコメント件数を表示し、未読コメントがある予定には赤い未読バッジを表示するようにしました。管理者の利用状況ダッシュボードはアカウント画面で最初から表示し、サイト閲覧中もバックグラウンド更新します。ダッシュボードのコメント件数から該当コメントへ移動できるようにしました。'
    },
    {
      at:'2026/10/10 12:56 JST',
      title:'12/24〜26のハワイ日程を最終案に更新',
      detail:'12/24はKualoa Ranch UTV、12/25は東海岸ドライブ＋Rock-A-Hula、12/26はDiamond Head＋Ala Moana＋Takeruの射撃に整理。レンタカーは12/24朝から12/25午後まで利用し、12/25 15:15頃にパパが1人で返却する予定を追加しました。'
    },
    {
      at:'2026/10/10 12:35 JST',
      title:'更新履歴画面のスクロールを修正',
      detail:'iPhoneなどのモバイル端末でも更新履歴を上下にスクロールできるように表示処理を修正しました。'
    },
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
      at:'2026/10/08 21:22 JST',
      title:'LINE通知・コメントへの直接リンク基盤を追加',
      detail:'家族コメントの未読通知、LINE連携用の仕組み、通知から該当コメントを直接開くためのディープリンクとクイック返信を追加しました。'
    },
    {
      at:'2026/10/08 21:03 JST',
      title:'家族の利用状況ダッシュボードを追加',
      detail:'誰がサイトを見たか、直近7日の利用、相談への回答率、コメント数、よく見られている予定を管理者が確認できるようにしました。'
    },
    {
      at:'2026/10/08 20:58 JST',
      title:'家族のオンライン状況を追加',
      detail:'管理者画面から、パパ・Emi・Saki・Takeruの最終利用時刻やオンライン状況を確認できるようにしました。'
    },
    {
      at:'2026/10/08 20:51 JST',
      title:'トップ画面のデザインを整理',
      detail:'旅行サイトのヒーロー部分を簡潔にし、更新日時を見やすい位置へ移動。旅行情報を主役にした画面へ整えました。'
    },
    {
      at:'2026/10/08 20:40 JST',
      title:'予定ごとの家族メモ・参加状況を追加',
      detail:'食事・観光・アクティビティごとに、行きたい度、参加可否、既読、コメントなどを家族で共有できる機能を追加しました。'
    },
    {
      at:'2026/10/08 20:27 JST',
      title:'固定ボトムナビゲーションを追加',
      detail:'主要機能へいつでも移動できる固定ボトムバーを導入し、旅行中もスマートフォンで操作しやすい構成にしました。'
    },
    {
      at:'2026/10/08 20:15 JST',
      title:'家族アカウントのパスワード管理を追加',
      detail:'各家族アカウントでパスワード変更と再設定ができるようにし、共通パスワード方式から個別ログインへ移行しました。'
    },
    {
      at:'2026/10/08 19:58 JST',
      title:'射撃体験の比較情報を家族相談に追加',
      detail:'ハワイでの射撃体験について候補や条件を整理し、家族で優先度を相談できるようにしました。'
    },
    {
      at:'2026/10/08 15:29 JST',
      title:'家族ログイン・既読・コメント機能の基礎を構築',
      detail:'Firebaseの家族アカウント認証、家族ごとの権限、予定の既読管理、コメント機能を導入し、現在の家族共同編集サイトの基礎を作りました。'
    },
    {
      at:'2026/10/08',
      title:'家族で相談・回答できる機能を追加',
      detail:'Christmas Eve Dinner、ハワイ最後の夕食、射撃、Victoria / UBCの時間配分などを家族で相談できる仕組みを追加しました。'
    }
    ,{
      at:'2026/10/07',
      title:'旅行サイトを開設・公開',
      detail:'家族の年末旅行の予定を一か所で確認するため、GitHub Pagesの旅行専用サイトを開設しました。'
    },
    {
      at:'2026/10/07',
      title:'旅行全体のタイムラインを作成',
      detail:'東京・ホノルル・バンクーバー・ビクトリア・UBCを巡る旅行日程を、日付ごとに追える一覧として整理しました。'
    },
    {
      at:'2026/10/07',
      title:'予約・移動・観光の詳細表示を整備',
      detail:'フライト、宿泊、観光、食事などを区別し、予定を選ぶと予約情報や時刻、注意事項を確認できる構成にしました。'
    },
    {
      at:'2026/10/07',
      title:'更新確認の仕組みを導入',
      detail:'更新日時・ビルド情報と最新版の確認機能を整備し、家族が古い画面を見続けないようにする基盤を作りました。'
    }
  ];

  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  const open=document.getElementById('changeHistoryOpen');
  const overlay=document.getElementById('changeHistoryOverlay');
  const back=document.getElementById('changeHistoryBack');
  const list=document.getElementById('changeHistoryList');
  if(!open||!overlay||!back||!list)return;

  function render(){
    const groups=new Map();
    entries.slice().sort((a,b)=>b.at.localeCompare(a.at)).forEach(e=>{
      const day=e.at.slice(0,10);
      if(!groups.has(day))groups.set(day,[]);
      groups.get(day).push(e);
    });
    list.innerHTML='<div style="font-weight:800;font-size:17px;margin:4px 0 12px">開発のあゆみ</div><div style="font-size:12px;color:#7b8293;margin-bottom:14px">2026年10月7日のサイト開設から現在まで。日付をタップすると詳細を確認できます。</div>'+
      Array.from(groups,([day,items],idx)=>'<details '+(idx===0?'open':'')+' style="background:#fff;border:1px solid #e8e1eb;border-radius:16px;margin-bottom:12px;overflow:hidden"><summary style="cursor:pointer;padding:16px;font-weight:800;color:#273247;list-style-position:inside">'+esc(day)+' <span style="font-size:12px;color:#7b8293;font-weight:500">（'+items.length+'件）</span></summary><div style="padding:0 14px 14px">'+items.map((e,i)=>'<div style="border-top:1px solid #eee8f1;padding:12px 2px"><div style="font-weight:750;color:#273247">'+esc(e.title)+'</div><div style="font-size:11px;color:#9a8eaa;margin-top:3px">'+esc(e.at)+'</div><div style="font-size:13px;color:#6f788c;margin-top:7px;line-height:1.6">'+esc(e.detail)+'</div></div>').join('')+'</div></details>').join('');
  }
  open.addEventListener('click',()=>{
    render();overlay.style.display='block';overlay.scrollTop=0;
    try{window.tripAnalytics?.track('change_history_open',{})}catch(_){}
  });
  back.addEventListener('click',()=>{overlay.style.display='none'});
})();
