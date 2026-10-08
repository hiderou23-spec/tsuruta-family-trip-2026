const crypto=require('crypto');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {onRequest}=require('firebase-functions/v2/https');
const {defineSecret}=require('firebase-functions/params');

initializeApp();
const db=getFirestore();
const LINE_CHANNEL_ACCESS_TOKEN=defineSecret('LINE_CHANNEL_ACCESS_TOKEN');
const LINE_CHANNEL_SECRET=defineSecret('LINE_CHANNEL_SECRET');
const SITE_URL='https://hiderou23-spec.github.io/tsuruta-family-trip-2026/';

function clip(s,n){s=String(s||'');return s.length>n?s.slice(0,n-1)+'…':s}
async function lineCall(path,body,token){
  const r=await fetch('https://api.line.me'+path,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(body)});
  if(!r.ok)throw new Error('LINE '+r.status+' '+await r.text());
}
async function pushComment(userId,data,token){
  const url=SITE_URL+'?familyItem='+encodeURIComponent(data.itemId)+'&comment='+encodeURIComponent(data.commentId);
  const text=clip(data.text,120);
  return lineCall('/v2/bot/message/push',{
    to:userId,
    messages:[{
      type:'template',
      altText:clip(data.sourceLabel+'が「'+data.itemTitle+'」にコメントしました',400),
      template:{
        type:'buttons',
        text:clip(data.sourceLabel+'：'+text,160),
        title:clip(data.itemTitle||'家族旅行',40),
        actions:[{type:'uri',label:'コメントを見る',uri:url}]
      }
    }]
  },token);
}
async function replyLine(replyToken,text,token){
  if(!replyToken)return;
  return lineCall('/v2/bot/message/reply',{replyToken,messages:[{type:'text',text:clip(text,5000)}]},token);
}

exports.notifyFamilyComment=onDocumentCreated({
  document:'trip_items/{itemId}/comments/{commentId}',
  region:'asia-northeast1',
  secrets:[LINE_CHANNEL_ACCESS_TOKEN]
},async event=>{
  const snap=event.data;if(!snap)return;
  const d=snap.data()||{},itemId=event.params.itemId,commentId=event.params.commentId;
  const users=await db.collection('family_users').get();
  const batch=db.batch(),targets=[];
  const url=SITE_URL+'?familyItem='+encodeURIComponent(itemId)+'&comment='+encodeURIComponent(commentId);
  users.forEach(u=>{
    const x=u.data()||{};
    if(x.active===false||u.id===d.uid)return;
    const ref=db.collection('family_notifications').doc(u.id).collection('items').doc(itemId+'__'+commentId);
    batch.set(ref,{
      recipientUid:u.id,recipientMemberId:x.memberId||'',
      sourceUid:d.uid||'',sourceMemberId:d.memberId||'',sourceLabel:d.label||'家族',
      itemId,itemKey:d.itemKey||'',itemTitle:d.itemTitle||'家族旅行',
      commentId,text:clip(d.text,300),parentCommentId:d.parentCommentId||null,quickReply:!!d.quickReply,
      url,read:false,createdAt:FieldValue.serverTimestamp()
    });
    if(x.lineUserId&&x.lineNotifications!==false)targets.push(x.lineUserId);
  });
  await batch.commit();
  const token=LINE_CHANNEL_ACCESS_TOKEN.value();
  await Promise.allSettled(targets.map(userId=>pushComment(userId,{
    sourceLabel:d.label||'家族',itemTitle:d.itemTitle||'家族旅行',text:d.text||'',itemId,commentId
  },token)));
});

exports.lineWebhook=onRequest({
  region:'asia-northeast1',
  secrets:[LINE_CHANNEL_SECRET,LINE_CHANNEL_ACCESS_TOKEN]
},async(req,res)=>{
  const raw=req.rawBody||Buffer.from(JSON.stringify(req.body||{}));
  const expected=crypto.createHmac('sha256',LINE_CHANNEL_SECRET.value()).update(raw).digest('base64');
  const received=req.get('x-line-signature')||'';
  const a=Buffer.from(expected),b=Buffer.from(received);
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b)){res.status(401).send('invalid signature');return}
  const token=LINE_CHANNEL_ACCESS_TOKEN.value();
  const events=Array.isArray(req.body?.events)?req.body.events:[];
  for(const e of events){
    const userId=e.source?.userId;if(!userId)continue;
    if(e.type==='follow'){
      await replyLine(e.replyToken,'旅行サイトの「アカウント → LINE通知」で連携コードを発行し、その8桁コードをこのトークに送ってください。',token);
      continue;
    }
    if(e.type!=='message'||e.message?.type!=='text')continue;
    const text=String(e.message.text||'').trim().toUpperCase();
    if(text==='解除'){
      const q=await db.collection('family_users').where('lineUserId','==',userId).get();
      const batch=db.batch();q.forEach(s=>batch.update(s.ref,{lineUserId:FieldValue.delete(),lineNotifications:false,lineUnlinkedAt:FieldValue.serverTimestamp()}));
      await batch.commit();
      await replyLine(e.replyToken,'LINE連携を解除しました。再連携は旅行サイトのアカウント画面からできます。',token);
      continue;
    }
    const m=text.match(/^(?:LINK\s*)?([A-HJ-NP-Z2-9]{8})$/);
    if(!m){
      await replyLine(e.replyToken,'旅行サイトのアカウント画面で発行した8桁の連携コードを送ってください。',token);
      continue;
    }
    const code=m[1],ref=db.collection('line_link_codes').doc(code),snap=await ref.get();
    if(!snap.exists){
      await replyLine(e.replyToken,'この連携コードは見つかりません。サイトで新しいコードを発行してください。',token);continue;
    }
    const d=snap.data()||{},expires=d.expiresAt?.toMillis?.()||0;
    if(!d.uid||expires<Date.now()){
      await ref.delete().catch(()=>{});
      await replyLine(e.replyToken,'この連携コードは期限切れです。サイトで新しいコードを発行してください。',token);continue;
    }
    await db.collection('family_users').doc(d.uid).update({
      lineUserId:userId,lineNotifications:true,lineLinkedAt:FieldValue.serverTimestamp()
    });
    await ref.delete();
    await replyLine(e.replyToken,(d.label||'家族')+'としてLINE通知を連携しました。家族コメントが入るとここに通知します。\n解除する場合は「解除」と送ってください。',token);
  }
  res.status(200).send('ok');
});
