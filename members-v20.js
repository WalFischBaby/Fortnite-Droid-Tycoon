(()=>{
'use strict';
const $=id=>document.getElementById(id);
const bucket='dt01-profile-avatars';
let client,user,all=[],lastFocus=null;
const title={first:'Erster Fund',ten:'Auf Entdeckung',quarter:'Viertel der Galaxis',half:'Halbe Galaxis',droids:'Droiden-Archiv',fusions:'Fusions-Experte',icons:'Ikonen-Jäger',all:'Kodex komplett'};
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node};
function roleLabel(r){return r==='admin'?'Administrator':r==='moderator'?'Moderator':null}
function chip(r){const n=roleLabel(r);return n?el('span','member-role-chip '+(r==='admin'?'admin':'mod'),'✦ '+n):null}
function pct(p){return Math.max(0,Math.min(100,Number(p.rank_percent)||0))}
function achievementCount(p){return (p.achievement_ids||[]).filter(a=>title[a]).length}
function rarity(p){
  if(p.role==='admin')return 'mythic';
  if(p.role==='moderator')return 'epic';
  const value=pct(p);
  if(value>=85)return 'legendary';
  if(value>=55)return 'epic';
  if(value>=25)return 'rare';
  return 'default';
}
function rarityLabel(key){return ({default:'Default',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic'})[key]||'Default'}
function typeLabel(p){return roleLabel(p.role)||'Mitglied'}
async function avatar(root,value){
  root.textContent='🤖';
  if(/^droid:[A-Za-z0-9_-]+\.webp$/.test(value||'')){
    const i=el('img');i.alt='Droiden-Avatar';i.src='./assets/droid-default/'+value.slice(6);root.replaceChildren(i);
  }else if(/^upload:[a-f0-9-]{36}\/avatar\.(png|jpg|webp)$/.test(value||'')){
    const {data,error}=await client.storage.from(bucket).createSignedUrl(value.slice(7),600);
    if(!error&&root.isConnected){const i=el('img');i.alt='Profilbild';i.src=data.signedUrl;root.replaceChildren(i)}
  }else if(['🤖','🚀','🌌','⭐','🐋'].includes(value)){
    root.textContent=value;
  }
}
function buildBlueprint(p,{detail=false}={}){
  const rarityKey=rarity(p);
  const wrapper=el(detail?'div':'button','member-blueprint member-rarity-'+rarityKey);
  if(!detail){wrapper.type='button';wrapper.setAttribute('aria-label','Spielerkarte von '+p.username+' ansehen')}
  const inner=el('div','member-blueprint-inner');
  const corner=el('div','member-blueprint-corner',rarityLabel(rarityKey));
  inner.append(corner);
  const roleText=typeLabel(p);
  const roleBadge=el('div','member-blueprint-role',roleText);
  inner.append(roleBadge);

  const art=el('div','member-blueprint-art');
  const pic=el('div','member-blueprint-avatar');
  avatar(pic,p.avatar);
  art.append(pic);
  inner.append(art);

  const nameplate=el('div','member-blueprint-nameplate');
  nameplate.append(el('span','member-blueprint-name',p.username),el('span','member-blueprint-sub',(p.rank_name||'Rekrut')+' // SPIELERKARTE'));
  inner.append(nameplate);

  const meta=el('div','member-blueprint-meta');
  meta.append(el('span','member-blueprint-rank',p.rank_name||'Rekrut'),el('span','member-blueprint-type','DT-01 COMMUNITY'));
  inner.append(meta);

  const progress=el('div','member-blueprint-progress');
  const fill=el('span');
  fill.style.width=pct(p)+'%';
  progress.append(fill);
  inner.append(progress);

  const footer=el('div','member-blueprint-footer');
  const statA=el('div','member-blueprint-stat');
  statA.append(el('strong','',pct(p)+' %'),el('span','','Sammlerfortschritt'));
  const statB=el('div','member-blueprint-stat');
  statB.append(el('strong','',String(achievementCount(p))),el('span','','Erfolge'));
  footer.append(statA,statB);
  inner.append(footer);

  const tip=el('div','member-blueprint-tip');
  tip.append(el('span','', 'DROID TYCOON MEMBER'),el('small','', roleText+' · '+pct(p)+' %'));
  inner.append(tip);

  wrapper.append(inner);
  return wrapper;
}
function show(p){
  lastFocus=document.activeElement;
  const modal=$('memberModal'),root=$('memberDetail');
  root.replaceChildren();

  const layout=el('div','member-detail-layout');
  const display=el('section','member-display-card');
  display.append(buildBlueprint(p,{detail:true}));

  const dossier=el('section','member-dossier');
  const head=el('div','member-dossier-head');
  const headText=el('div');
  headText.append(el('div','member-dossier-overline','DT-01 // PILOTENAKTE'));
  const h=el('h2','',p.username);h.id='memberTitle';
  headText.append(h);
  headText.append(el('p','member-dossier-rank',(p.rank_name||'Rekrut')+' · '+pct(p)+' % Sammlerfortschritt'));
  head.append(headText);
  const roleChip=chip(p.role);
  if(roleChip)head.append(roleChip);
  dossier.append(head);

  if(p.bio)dossier.append(el('p','member-dossier-bio',p.bio));

  const stats=el('div','member-dossier-grid');
  for(const [label,val] of [['Sammlerfortschritt',pct(p)+' %'],['Erfolge',achievementCount(p)],['Kartentyp',rarityLabel(rarity(p))],['Status',typeLabel(p)]]){
    const box=el('div','member-dossier-box');
    box.append(el('strong','',String(val)),el('small','',label));
    stats.append(box);
  }
  dossier.append(stats);

  dossier.append(el('h3','member-card-heading','Freigeschaltete Erfolge'));
  const achievements=el('div','member-card-achievements');
  for(const key of p.achievement_ids||[])if(title[key])achievements.append(el('span','','✦ '+title[key]));
  if(!achievements.children.length)achievements.append(el('p','member-card-caption','Noch keine Erfolge freigeschaltet.'));
  dossier.append(achievements);

  dossier.append(el('h3','member-card-heading','Gaming-Identität'));
  const socials=el('div','member-card-socials');
  for(const [key,label] of [['fortnite_name','Fortnite'],['discord_name','Discord'],['twitch_name','Twitch'],['tiktok_name','TikTok']]){
    if(!p[key])continue;
    const box=el('div');
    box.append(el('small','',label),el('strong','',p[key]));
    socials.append(box);
  }
  if(!socials.children.length)socials.append(el('p','member-card-caption','Keine Gaming-Namen hinterlegt.'));
  dossier.append(socials);

  const dm=el('a','mission-btn','✉ PRIVATE NACHRICHT');dm.href='./nachrichten.html?to='+encodeURIComponent(p.user_id);if(user?.id!==p.user_id)dossier.append(dm);
  layout.append(display,dossier);
  root.append(layout);
  modal.hidden=false;
  document.body.style.overflow='hidden';
  $('memberClose').focus();
}
function close(){if($('memberModal').hidden)return;$('memberModal').hidden=true;document.body.style.overflow='';lastFocus?.focus()}
function draw(){
  const q=$('memberSearch').value.trim().toLocaleLowerCase('de');
  let rows=all.filter(p=>p.username.toLocaleLowerCase('de').includes(q));
  const mode=$('memberSort').value;
  rows.sort((a,b)=>mode==='rank'?pct(b)-pct(a)||a.username.localeCompare(b.username):mode==='role'?({admin:0,moderator:1}[a.role]??2)-({admin:0,moderator:1}[b.role]??2)||a.username.localeCompare(b.username):a.username.localeCompare(b.username));
  $('directoryStatus').textContent=rows.length+' Mitglieder gefunden';
  const root=$('memberList');
  root.replaceChildren();
  if(!rows.length){root.append(el('p','member-empty','Keine passenden Mitglieder gefunden.'));return}
  for(const p of rows){
    const card=buildBlueprint(p);
    card.addEventListener('click',()=>show(p));
    root.append(card);
  }
}
async function load(){
  if(!user)return;
  $('directoryStatus').textContent='Mitglieder werden geladen …';
  const {data,error}=await client.from('dt01_member_profiles').select('user_id,username,avatar,bio,fortnite_name,discord_name,twitch_name,tiktok_name,rank_name,rank_percent,achievement_ids');
  if(error){$('directoryStatus').textContent='Mitgliederverzeichnis derzeit nicht verfügbar.';return}
  let roles=[];const ids=(data||[]).map(x=>x.user_id);
  if(ids.length){const result=await client.from('dt01_member_roles').select('user_id,role').in('user_id',ids);if(!result.error)roles=result.data||[]}
  const rm=new Map(roles.map(x=>[x.user_id,x.role]));
  all=(data||[]).map(x=>({...x,role:rm.get(x.user_id)}));
  draw();
}
async function init(){
  for(let i=0;i<60&&!window.DT01Cloud;i++)await new Promise(r=>setTimeout(r,100));
  client=window.DT01Cloud?.client();
  if(!client){$('directoryStatus').textContent='Cloud-Verbindung fehlt.';return}
  const {data:{session}}=await client.auth.getSession();
  user=session?.user;
  if(!user){$('directoryStatus').textContent='Anmeldung erforderlich';$('memberGate').hidden=false;return}
  $('memberSearch').addEventListener('input',draw);
  $('memberSort').addEventListener('change',draw);
  $('memberRefresh').addEventListener('click',load);
  $('memberClose').addEventListener('click',close);
  $('memberModal').querySelector('[data-close]').addEventListener('click',close);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')close();
    if(e.key==='Tab'&&!$('memberModal').hidden){
      const buttons=[$('memberClose')];
      if(!buttons.includes(document.activeElement)){$('memberClose').focus();e.preventDefault()}
    }
  });
  client.auth.onAuthStateChange((_event,session)=>{
    if(!session?.user){user=null;all=[];$('memberList').replaceChildren();close();$('memberGate').hidden=false;$('directoryStatus').textContent='Anmeldung erforderlich'}
  });
  await load();
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
