/* DT-01: Progress-derived public member stats, refreshed after cloud merges. */
(()=>{'use strict';
const PREFIX='wfb-droid-tycoon-v3-';
const ranks=[{at:0,name:'Rekrut'},{at:10,name:'Droiden-Scout'},{at:25,name:'Galaktischer Sammler'},{at:50,name:'Archiv-Meister'},{at:75,name:'Legende der Galaxis'},{at:100,name:'Vollständiger Kodex'}];
let catalogPromise=null,timer=null,lastSignature='',busy=false;
const parse=s=>{try{return JSON.parse(s||'{}')||{}}catch{return {}}};
function catalog(){return catalogPromise??=fetch('./profile-catalog-v20.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Droiden-Katalog nicht verfügbar');return r.json()})}
function compute(){const counts=window.DT01Progress.calculate();const {total,max,percent}=counts;
const earned=[['first',total>=1],['ten',total>=10],['quarter',percent>=25],['half',percent>=50],['droids',counts.droids===counts.maxdroids&&counts.maxdroids>0],['fusions',counts.fusions===counts.maxfusions&&counts.maxfusions>0],['icons',counts.icons===counts.maxicons&&counts.maxicons>0],['all',percent===100&&max>0]].filter(x=>x[1]).map(x=>x[0]);
return {rank_name:[...ranks].reverse().find(x=>percent>=x.at).name,rank_percent:percent,achievement_ids:earned};}
async function refresh(){if(busy)return;const cloud=window.DT01Cloud,client=cloud?.client(),user=cloud?.user();if(!client||!user||!navigator.onLine)return;
 busy=true;try{if(cloud.user()?.id!==user.id)return;const stats=compute(),signature=user.id+':'+JSON.stringify(stats);if(signature===lastSignature)return;
 // Do not create a profile: usernames are always chosen by the member. Only derived fields are changed.
 const {data:existing,error:readError}=await client.from('dt01_member_profiles').select('rank_name,rank_percent,achievement_ids').eq('user_id',user.id).maybeSingle();
 if(readError)throw readError;if(!existing)return;
 if(existing.rank_name!==stats.rank_name||existing.rank_percent!==stats.rank_percent||JSON.stringify(existing.achievement_ids||[])!==JSON.stringify(stats.achievement_ids)){
  const {error}=await client.from('dt01_member_profiles').update({...stats,updated_at:new Date().toISOString()}).eq('user_id',user.id);if(error)throw error;
 }lastSignature=signature;window.dispatchEvent(new CustomEvent('dt01:profile-progress-updated',{detail:stats}));
 }catch(e){console.warn('DT-01 Abzeichen-Synchronisierung:',e)}finally{busy=false}}
function schedule(){clearTimeout(timer);timer=setTimeout(refresh,350)}
window.addEventListener('dt01:tracker-synced',schedule);
window.addEventListener('dt01:tracker-changed',schedule);
window.addEventListener('focus',schedule);
window.addEventListener('online',schedule);
// Cloud initialization may finish after this script loads.
let attempts=0;const boot=setInterval(()=>{if(window.DT01Cloud?.user()){clearInterval(boot);schedule()}else if(++attempts>60)clearInterval(boot)},500);
})();
