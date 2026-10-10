/* DT-01 unified authenticated member avatar renderer (droid, private upload or emoji). */
(()=>{'use strict';
const cache=new Map();
// Supabase Storage allows replacing an upload at the same path. Revalidate the signed URL
// and image URL periodically so an old browser-cached avatar does not stay forever.
async function render(holder,value,db,alt='Profilbild'){
 if(!holder)return;
 holder.replaceChildren();
 if(/^droid:[A-Za-z0-9_-]+\.webp$/.test(value||'')){
  const img=document.createElement('img');img.alt=alt;img.loading='lazy';
  img.src='./assets/droid-default/'+value.slice(6);
  img.onerror=()=>{if(img.isConnected){holder.textContent='🤖'}};holder.append(img);return;
 }
 if(/^upload:[a-f0-9-]{36}\/avatar\.(png|jpg|webp)$/.test(value||'')&&db){
  const path=value.slice(7);
  const img=document.createElement('img');img.alt=alt;img.loading='lazy';
  img.onerror=()=>{if(holder.contains(img))holder.textContent='🤖'};
  // IMPORTANT: render() is called while a chat message is still detached from the DOM.
  // Insert the image immediately, not after the asynchronous Storage request.
  holder.append(img);
  try{
   const cached=cache.get(path), now=Date.now();
   let url=cached&&cached.until>now?cached.url:null;
   if(!url){
    const {data,error}=await db.storage.from('dt01-profile-avatars').createSignedUrl(path,600);
    if(error||!data?.signedUrl)throw error||new Error('Avatar-Link fehlt');
    url=data.signedUrl;cache.set(path,{url,until:now+60*1000});
   }
   // Don't touch a reused holder after its avatar has changed.
   if(!holder.contains(img))return;
   // Cache-busting query does not modify the signed token.
   img.src=url+(url.includes('?')?'&':'?')+'dt01avatar='+Math.floor(now/60000);
  }catch(e){if(holder.contains(img))holder.textContent='🤖';console.warn('DT-01 Profilbild konnte nicht geladen werden',e)}
  return;
 }
 holder.textContent=typeof value==='string'&&value&&!value.startsWith('upload:')?value:'🤖';
}
window.DT01Avatar={render,invalidate:()=>cache.clear()};
window.addEventListener('dt01:profile-updated',()=>cache.clear());
})();
