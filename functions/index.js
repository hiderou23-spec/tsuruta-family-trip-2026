const crypto=require('crypto');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {onRequest,onCall,HttpsError}=require('firebase-functions/v2/https');
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
  let hasUnlinkedRecipient=false;
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
    if(!x.lineUserId)hasUnlinkedRecipient=true;
  });
  await batch.commit();
  // Group notifications are opt-in and are never echoed for LINE-originated comments.
  const group=(await db.doc('line_settings/group').get()).data()||{};
  if(group.enabled&&group.groupId&&d.origin!=='line'){
    const delivery=db.doc('line_delivery/'+itemId+'__'+commentId);
    const reserved=await db.runTransaction(async tx=>{
      const old=await tx.get(delivery);
      if(old.exists)return false;
      tx.create(delivery,{status:'reserved',createdAt:FieldValue.serverTimestamp()});
      return true;
    });
    if(reserved){
      const url=SITE_URL+'?familyItem='+encodeURIComponent(itemId)+'&comment='+encodeURIComponent(commentId);
      const author=clip(d.label||'家族',40);
      const quote=clip(d.text||'コメントが投稿されました',650);
      try{
        await lineCall('/v2/bot/message/push',{to:group.groupId,messages:[{
          type:'flex',
          altText:clip(author+'：'+quote,400),
          contents:{
            type:'bubble',size:'mega',
            body:{type:'box',layout:'vertical',spacing:'md',paddingAll:'14px',contents:[
              {type:'text',text:clip(d.itemTitle||'家族旅行',80),size:'md',weight:'bold',color:'#242424',wrap:true},
              {type:'text',text:author+' のコメント',size:'xs',color:'#777777',weight:'bold'},
              {type:'box',layout:'horizontal',spacing:'sm',contents:[
                {type:'box',layout:'vertical',width:'3px',backgroundColor:'#B9C8DC',contents:[{type:'filler'}]},
                {type:'text',text:quote,size:'md',color:'#242424',wrap:true,flex:1}
              ]},
              {type:'box',layout:'horizontal',spacing:'sm',contents:[
                {type:'button',style:'link',height:'sm',flex:1,action:{type:'uri',label:'旅行サイトを見る',uri:url}},
                {type:'button',style:'link',height:'sm',flex:1,action:{type:'postback',label:'返信する',data:'reply:'+itemId+':'+commentId,inputOption:'openKeyboard'}}
              ]}
            ]}
          }
        }]},LINE_CHANNEL_ACCESS_TOKEN.value());
        await delivery.update({status:'sent',sentAt:FieldValue.serverTimestamp()});
      }catch(err){
        await delivery.update({status:'failed',error:clip(err.message,300)});
        throw err;
      }
    }
    return;
  }
  if(d.origin==='line')return;
  if(group.enabled)return; // Do not also send personal notifications while group mode is enabled.
  const token=LINE_CHANNEL_ACCESS_TOKEN.value();
  await Promise.allSettled(targets.map(userId=>pushComment(userId,{
    sourceLabel:d.label||'家族',itemTitle:d.itemTitle||'家族旅行',text:d.text||'',itemId,commentId
  },token)));
});

exports.lineWebhook=onRequest({
  region:'asia-northeast1',
  maxInstances:1,
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
    const userId=e.source?.userId;
    if(e.source?.type==='group'&&e.source.groupId){
      const groupId=e.source.groupId;
      if(e.type==='join'){
        await db.doc('line_settings/pending_group').set({groupId,joinedAt:FieldValue.serverTimestamp()});
        await replyLine(e.replyToken,'旅行サイトBotが参加しました。管理者による有効化後に通知を開始します。',token);
        continue;
      }
      if(e.type==='leave'){
        const ref=db.doc('line_settings/group'),current=(await ref.get()).data();
        if(current?.groupId===groupId)await ref.set({enabled:false},{merge:true});
        continue;
      }
      const settings=(await db.doc('line_settings/group').get()).data()||{};
      if(!settings.enabled||settings.groupId!==groupId)continue;
      const linked=async()=>{
        if(!userId)return null;
        const users=await db.collection('family_users').where('lineUserId','==',userId).limit(2).get();
        const member=users.docs.find(x=>x.data().active!==false&&['member','admin'].includes(x.data().role));
        return member||null;
      };
      const draftRef=userId?db.doc('line_reply_drafts/'+crypto.createHash('sha256').update(groupId+':'+userId).digest('hex')):null;
      if(e.type==='postback'){
        const match=String(e.postback?.data||'').match(/^reply:([A-Za-z0-9_-]{1,200})(?::([A-Za-z0-9_-]{1,200}))?$/);
        if(!match)continue;
        const member=await linked();
        if(!member){await replyLine(e.replyToken,'先にBotとの個別トークで8文字の連携コードを送信してください。',token);continue}
        const itemRef=db.doc('trip_items/'+match[1]);
        if((await itemRef.collection('comments').limit(1).get()).empty){
          await replyLine(e.replyToken,'対象の予定が見つかりません。',token);continue;
        }
        const original=match[2]?await itemRef.collection('comments').doc(match[2]).get():null;
        if(match[2]&&!original.exists){await replyLine(e.replyToken,'元のコメントが見つかりません。',token);continue}
        const source=original?.data()||{};
        await draftRef.set({itemId:match[1],commentId:match[2]||null,groupId,userId,expiresAt:Date.now()+10*60*1000,createdAt:FieldValue.serverTimestamp()});
        await replyLine(e.replyToken,(match[2]?'↩ '+clip(source.label||'家族',30)+'のコメント：\\n「'+clip(source.text||'',180)+'」\\n':'')+'このまま返信を入力して送信してください（10分以内）。取り消す場合は「キャンセル」。',token);
        continue;
      }
      if(e.type!=='message'||e.message?.type!=='text')continue;
      const rawText=String(e.message.text||'').trim();
      let m=rawText.match(/^返信\s+([^\s]+)\s+([\s\S]{1,300})$/);
      let draft=null;
      if(!m&&draftRef){
        const snap=await draftRef.get();
        if(snap.exists){
          draft=snap.data();
          if(draft.groupId===groupId&&draft.expiresAt>Date.now()){
            if(rawText==='キャンセル'){
              await draftRef.delete();
              await replyLine(e.replyToken,'返信を取り消しました。',token);
              continue;
            }
            if(rawText&&rawText.length<=300)m=[rawText,draft.itemId,rawText];
          }else await draftRef.delete();
        }
      }
      if(!m)continue;
      if(!userId){await replyLine(e.replyToken,'先に個別トークでアカウント連携を行ってください。',token);continue}
      const member=await linked();
      if(!member){await replyLine(e.replyToken,'先にBotとの個別トークで8文字の連携コードを送信してください。',token);continue}
      const itemId=m[1],body=m[2].trim();
      if(!/^[A-Za-z0-9_-]{1,200}$/.test(itemId))continue;
      const eventId=String(e.webhookEventId||e.message.id||'').replace(/[^A-Za-z0-9_-]/g,'');
      if(!eventId)continue;
      const itemRef=db.doc('trip_items/'+itemId);
      const commentSnap=await itemRef.collection('comments').limit(1).get();
      if(commentSnap.empty){await replyLine(e.replyToken,'指定された予定のコメントが見つかりません。サイトから対象の予定を確認してください。',token);continue}
      const itemData=commentSnap.docs[0].data()||{};
      const ref=itemRef.collection('comments').doc('line_'+eventId);
      const data=member.data();
      await db.runTransaction(async tx=>{
        if((await tx.get(ref)).exists)return;
        tx.create(ref,{uid:member.id,memberId:data.memberId||'',label:data.label||'家族',
          text:body,itemTitle:itemData.itemTitle||itemId,itemKey:itemData.itemKey||'',parentCommentId:draft?.commentId||null,quickReply:!!draft?.commentId,
          origin:'line',lineEventId:eventId,createdAt:FieldValue.serverTimestamp()});
      });
      if(draft&&draftRef)await draftRef.delete();
      await replyLine(e.replyToken,'旅行サイトにコメントを反映しました。',token);
      continue;
    }
    if(e.source?.type!=='user'||!userId)continue;
    if(e.type==='follow'){
      await replyLine(e.replyToken,'旅行サイトの「アカウント → LINE通知」で連携コードを発行し、その8文字コードをこのトークに送ってください。',token);
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
      await replyLine(e.replyToken,'旅行サイトのアカウント画面で発行した8文字の連携コードを送ってください。',token);
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

exports.activateLineGroup=onCall({region:'asia-northeast1'},async request=>{
  if(!request.auth)throw new HttpsError('unauthenticated','ログインが必要です');
  const user=(await db.doc('family_users/'+request.auth.uid).get()).data();
  if(!user||user.active===false||user.role!=='admin')throw new HttpsError('permission-denied','管理者のみ操作できます');
  const pending=(await db.doc('line_settings/pending_group').get()).data();
  if(!pending?.groupId)throw new HttpsError('failed-precondition','Botをグループに招待してください');
  await db.doc('line_settings/group').set({groupId:pending.groupId,enabled:true,activatedBy:request.auth.uid,updatedAt:FieldValue.serverTimestamp()});
  return {enabled:true};
});
exports.disableLineGroup=onCall({region:'asia-northeast1'},async request=>{
  if(!request.auth)throw new HttpsError('unauthenticated','ログインが必要です');
  const user=(await db.doc('family_users/'+request.auth.uid).get()).data();
  if(!user||user.active===false||user.role!=='admin')throw new HttpsError('permission-denied','管理者のみ操作できます');
  await db.doc('line_settings/group').set({enabled:false,updatedAt:FieldValue.serverTimestamp()},{merge:true});
  return {enabled:false};
});

// Verified LINE access tokens are required; no client-supplied user ID is trusted.
exports.submitLineReply=onCall({region:'asia-northeast1',maxInstances:3},async request=>{
  const input=request.data||{};
  const token=String(input.lineAccessToken||'');
  const itemId=String(input.itemId||'');
  const commentId=String(input.commentId||'');
  const body=String(input.text||'').trim();
  if(!token||token.length>4096||!(/^[A-Za-z0-9_-]{1,200}$/.test(itemId))||!(/^[A-Za-z0-9_-]{1,200}$/.test(commentId))||!body||body.length>300)
    throw new HttpsError('invalid-argument','返信内容または対象が正しくありません');
  const response=await fetch('https://api.line.me/v2/profile',{headers:{Authorization:'Bearer '+token}});
  if(!response.ok)throw new HttpsError('unauthenticated','LINEの認証を確認できませんでした');
  const profile=await response.json();
  if(!profile.userId)throw new HttpsError('unauthenticated','LINEのユーザーを確認できませんでした');
  const matches=await db.collection('family_users').where('lineUserId','==',profile.userId).limit(3).get();
  const member=matches.docs.find(doc=>doc.data().active!==false&&['member','admin'].includes(doc.data().role));
  if(!member)throw new HttpsError('permission-denied','家族アカウントとLINEを連携してください');
  const parent=await db.doc('trip_items/'+itemId+'/comments/'+commentId).get();
  if(!parent.exists)throw new HttpsError('not-found','元のコメントが見つかりません');
  const parentData=parent.data()||{};
  const newRef=db.collection('trip_items').doc(itemId).collection('comments').doc();
  const data=member.data();
  await newRef.create({uid:member.id,memberId:data.memberId||'',label:data.label||'家族',text:body,
    itemTitle:parentData.itemTitle||'家族旅行',itemKey:parentData.itemKey||'',
    parentCommentId:commentId,quickReply:true,origin:'line',createdAt:FieldValue.serverTimestamp()});
  return {ok:true,commentId:newRef.id};
});

exports.getLineReplyContext=onCall({region:'asia-northeast1'},async request=>{
  const input=request.data||{},token=String(input.lineAccessToken||''),itemId=String(input.itemId||''),commentId=String(input.commentId||'');
  if(!token||token.length>4096||!/^[A-Za-z0-9_-]{1,200}$/.test(itemId)||!/^[A-Za-z0-9_-]{1,200}$/.test(commentId))throw new HttpsError('invalid-argument','返信先が不正です');
  const response=await fetch('https://api.line.me/v2/profile',{headers:{Authorization:'Bearer '+token}});
  if(!response.ok)throw new HttpsError('unauthenticated','LINEの認証が必要です');
  const profile=await response.json();
  const users=await db.collection('family_users').where('lineUserId','==',profile.userId).limit(3).get();
  if(!users.docs.some(doc=>doc.data().active!==false&&['member','admin'].includes(doc.data().role)))throw new HttpsError('permission-denied','家族アカウントとLINEを連携してください');
  const snap=await db.doc('trip_items/'+itemId+'/comments/'+commentId).get();
  if(!snap.exists)throw new HttpsError('not-found','コメントが見つかりません');
  const d=snap.data()||{};return {label:clip(d.label||'家族',50),text:clip(d.text||'',3000)};
});
