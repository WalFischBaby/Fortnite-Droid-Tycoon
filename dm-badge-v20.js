(()=>{'use strict';
 let running=false;
 async function refresh(){
  if(running)return;running=true;
  try{
   const db=window.DT01Cloud?.client();if(!db)return;
   const {data:{session}}=await db.auth.getSession();
   let count=0;
   if(session?.user){const r=await db.from('dt01_dm_messages').select('id',{count:'exact',head:true}).eq('recipient_id',session.user.id).is('read_at',null).is('hidden_for_recipient_at',null);if(r.error)return;count=r.count||0;}
   document.querySelectorAll('[data-dm-count]').forEach(n=>{n.textContent=count?String(count):'';n.setAttribute('aria-label',count?count+' ungelesene Nachrichten':'Keine ungelesenen Nachrichten')});
   document.querySelectorAll('[data-dm-prominent]').forEach(n=>{n.textContent=count?count>99?'99+':String(count):'';n.hidden=count===0;});
   document.querySelectorAll('.dt-inbox-shortcut,.dt-mobile-inbox').forEach(n=>n.setAttribute('aria-label',count?`Posteingang öffnen – ${count} ungelesene Nachrichten`:'Posteingang öffnen'));
  }catch(e){console.warn('DT-01 Inbox counter',e)}finally{running=false}
 }
 document.addEventListener('DOMContentLoaded',()=>{setTimeout(refresh,900);setInterval(()=>{if(!document.hidden)refresh()},15000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('focus',refresh)});
})();
