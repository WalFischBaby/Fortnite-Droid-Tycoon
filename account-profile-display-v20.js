/* DT-01: show private member's public username and avatar, never login email in side card. */
(()=>{'use strict';
const card=()=>document.getElementById('dtAccountCard');
let currentId='', token=0, client=null;
function initials(){const box=card()?.querySelector('.dt-account-avatar');if(box){box.replaceChildren();box.textContent='🤖';}}
async function load(){const request=++token;const panel=card();if(!panel)return;
  try{
    client=window.DT01Cloud?.client?.()||null;
    if(!client)return;
    const {data:{session},error:authError}=await client.auth.getSession();
    if(request!==token)return;
    const user=authError?null:session?.user;
    const name=panel.querySelector('[data-account-name]');
    if(!user){currentId='';initials();if(name)name.textContent='Noch nicht angemeldet';return;}
    currentId=user.id;
    if(name)name.textContent='Profil wird geladen …';
    const {data,error}=await client.from('dt01_member_profiles').select('username,avatar').eq('user_id',user.id).maybeSingle();
    if(request!==token||currentId!==user.id)return;
    if(error){if(name)name.textContent='Spielerprofil';initials();return;}
    if(name)name.textContent=data?.username||'Spielerprofil anlegen';
    const holder=panel.querySelector('.dt-account-avatar');if(!holder)return;holder.replaceChildren();
    const v=data?.avatar||'';let src='';
    if(/^droid:[A-Za-z0-9_-]+\.webp$/.test(v))src='./assets/droid-default/'+v.slice(6);
    else if(/^upload:[a-f0-9-]{36}\/avatar\.(png|jpg|webp)$/.test(v)){
      const {data:signed,error:signError}=await client.storage.from('dt01-profile-avatars').createSignedUrl(v.slice(7),600);
      if(request!==token||currentId!==user.id)return;
      if(!signError)src=signed?.signedUrl||'';
    }
    if(src){const img=document.createElement('img');img.alt='Dein Profilbild';img.src=src+(src.includes('?')?'&':'?')+'dt01avatar='+Math.floor(Date.now()/60000);img.onerror=()=>{img.remove();holder.textContent='🤖'};holder.append(img)}
    else holder.textContent='🤖';
  }catch(e){console.warn('Account-Profil konnte nicht geladen werden.',e);const n=card()?.querySelector('[data-account-name]');if(n)n.textContent='Spielerprofil';initials()}
}
async function init(){for(let i=0;i<40&&!window.DT01Cloud;i++)await new Promise(r=>setTimeout(r,150));await load();
  if(client)client.auth.onAuthStateChange(()=>setTimeout(load,0));
  window.addEventListener('focus',load);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});
  window.addEventListener('dt01:profile-updated',load);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
