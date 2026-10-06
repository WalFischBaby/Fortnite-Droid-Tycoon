const STORE='wfb-droid-tycoon-v3';
const D=window.TRACKER_DATA;

const RARITY_COLORS={
  'GEWÖHNLICH':'#D9F2D0','SELTEN':'#C1E4F5','EPISCH':'#CC99FF',
  'LEGENDÄR':'#FF9933','MYTISCH':'#FF66CC'
};
const TYPE_COLORS={
  'Arbeiter':'#8ED873','Astromech':'#9966FF','Kampf':'#FF0000','Protokoll':'#FFFF00'
};
const VARIANT_COLORS={
  'BASIS':'#F2F2F2','GOLD':'#FFFF99','DIAMANT':'#CAEDFB','RAINBOW':'#FFCCFF',
  'BESKAR':'#AEAEAE','GALAKTISCH':'#9966FF','STELLAR':'#FFFF00',
  'KYBER INAKT':'#7F7F7F','KYBER GRÜN':'#84E291','KYBER BLAU':'#83CAEB',
  'KYBER LILA':'#D76DCC','MAKELLOS':'#EAEAEA'
};

const slug=s=>String(s).toUpperCase().replaceAll(' ','-').replaceAll('Ä','AE').replaceAll('Ö','OE').replaceAll('Ü','UE');
function setupNav(page){
  document.querySelectorAll('[data-page]').forEach(a=>a.classList.toggle('active',a.dataset.page===page));
}
function stateLoad(key){
  try{return JSON.parse(localStorage.getItem(STORE+'-'+key)||'{}')}catch{return {}}
}
function stateSave(key,s){
  localStorage.setItem(STORE+'-'+key,JSON.stringify(s));
}
function recordActivity(category,label,checked){
  if(!checked) return;
  try{
    const key=STORE+'-activity', list=JSON.parse(localStorage.getItem(key)||'[]');
    list.unshift({category,label,time:Date.now()});
    localStorage.setItem(key,JSON.stringify(list.slice(0,20)));
  }catch{}
}
function exportProgress(){
  const keys=['droids','fusionen','icons','rebirth'];
  const payload={version:STORE,exportedAt:new Date().toISOString(),data:{}};
  keys.forEach(k=>payload.data[k]=stateLoad(k));
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='walfischbaby-droid-tycoon-progress.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importProgress(file){
  return new Promise((resolve,reject)=>{
    const r=new FileReader();
    r.onload=()=>{try{
      const p=JSON.parse(r.result); if(!p||!p.data) throw new Error('Ungültige Datei');
      ['droids','fusionen','icons','rebirth'].forEach(k=>{if(p.data[k]&&typeof p.data[k]==='object')stateSave(k,p.data[k])});
      resolve(true);
    }catch(e){reject(e)}};
    r.onerror=()=>reject(r.error); r.readAsText(file);
  });
}
function formatActivityTime(ts){
  const d=new Date(ts), now=new Date(), diff=now-ts;
  if(diff<60000)return 'gerade eben'; if(diff<3600000)return Math.floor(diff/60000)+' Min. vor'; if(d.toDateString()===now.toDateString())return 'heute, '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}); return d.toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function safeColor(c){return /^#[0-9A-F]{6}$/i.test(c)?c:'#ffffff'}
function badge(label,color,extra=''){
  if(!label)return '';
  return `<span class="color-badge ${extra}" style="--badge:${safeColor(color)}">${esc(label)}</span>`;
}
function getRarityColor(r){return RARITY_COLORS[String(r||'').toUpperCase()]||'#60758f'}
function getTypeColor(t){return TYPE_COLORS[t]||'#60758f'}
function getVariantColor(v){return VARIANT_COLORS[v]||'#60758f'}


function getTrackerProgress(key,items,variants){
  const state=stateLoad(key); let done=0;
  items.forEach((it,idx)=>variants.forEach(v=>{if(state[it.name+'#'+idx+'|'+v])done++;}));
  const total=items.length*variants.length, pct=total?Math.round(done/total*100):0;
  return {done,total,pct};
}

function getIconProgress(items){
  const state=stateLoad('icons');
  const done=items.filter((it,idx)=>state[it.name+'#'+idx]).length, total=items.length, pct=total?Math.round(done/total*100):0;
  return {done,total,pct};
}

function getRebirthProgress(){
  const state=stateLoad('rebirth'), total=35, done=Object.values(state).filter(Boolean).length, pct=Math.round(done/total*100);
  return {done,total,pct};
}

function setHomeProgress(prefix,p){
  const done=document.getElementById(prefix+'Done'), pct=document.getElementById(prefix+'Pct'), bar=document.getElementById(prefix+'Bar');
  if(done) done.textContent=`${p.done}/${p.total} ${prefix==='homeIkonen'?'Ikonen':prefix==='homeRebirth'?'Rebirths':'Varianten'}`;
  if(pct) pct.textContent=p.pct+'%';
  if(bar) bar.style.width=p.pct+'%';
}

function renderHomeProgress(){
  if(!document.getElementById('homeDroidsPct')) return;
  setHomeProgress('homeDroids',getTrackerProgress('droids',D.droids,D.variants));
  setHomeProgress('homeFusionen',getTrackerProgress('fusionen',D.fusionDroids,D.variants));
  setHomeProgress('homeIkonen',getIconProgress(D.icons));
  const ps=[getTrackerProgress('droids',D.droids,D.variants),getTrackerProgress('fusionen',D.fusionDroids,D.variants),getIconProgress(D.icons)];
  const done=ps.reduce((a,p)=>a+p.done,0), total=ps.reduce((a,p)=>a+p.total,0), pct=total?Math.round(done/total*100):0;
  const overallDone=document.getElementById('homeOverallDone'),overallPct=document.getElementById('homeOverallPct'),overallBar=document.getElementById('homeOverallBar');
  if(overallDone) overallDone.textContent=`${done}/${total} Einträge abgeschlossen`;
  if(overallPct) overallPct.textContent=pct+'%'; if(overallBar) overallBar.style.width=pct+'%';
  const open=document.getElementById('homeOverallOpen'); if(open) open.textContent=`Noch offen: ${total-done}`;
  renderAchievements(ps); renderActivity();
}
function renderAchievements(ps){
  const el=document.getElementById('achievements'); if(!el)return;
  const [d,f,i]=ps; const allDone=p=>p.total>0&&p.done===p.total;
  const ach=[
    ['🏅','Erster Schritt','Den ersten Eintrag abgeschlossen',d.done+f.done+i.done>0],
    ['🤖','Droidensammler','50 Droid-Varianten abgeschlossen',d.done>=50],
    ['⚡','Fusion Master','Alle Fusionen abgeschlossen',allDone(f)],
    ['⭐','Ikonenjäger','Alle Ikonen gefunden',allDone(i)],
    ['🏆','Galaktischer Meister','Droids, Fusionen und Ikonen zu 100 %',allDone(d)&&allDone(f)&&allDone(i)]
  ];
  el.innerHTML=ach.map(a=>`<article class="achievement ${a[3]?'unlocked':''}"><span>${a[0]}</span><div><b>${a[1]}</b><small>${a[2]}</small></div>${a[3]?'<strong>✓</strong>':''}</article>`).join('');
}
function renderActivity(){
  const el=document.getElementById('recentActivity'); if(!el)return;
  try{const list=JSON.parse(localStorage.getItem(STORE+'-activity')||'[]');
    el.innerHTML=list.length?list.slice(0,6).map(x=>`<li><span>${esc(x.category)}</span><b>${esc(x.label)}</b><small>${formatActivityTime(x.time)}</small></li>`).join(''):'<li class="empty-activity">Noch keine neuen Abschlüsse in diesem Browser.</li>';
  }catch{el.innerHTML='<li class="empty-activity">Noch keine neuen Abschlüsse in diesem Browser.</li>'}
}

function renderTracker(kind,items,variants){
  const body=document.getElementById('trackerBody'), state=stateLoad(kind);
  const search=document.getElementById('search'), type=document.getElementById('type'), rarity=document.getElementById('rarity');
  const urlQ=new URLSearchParams(location.search).get('q');
  if(search && urlQ) search.value=urlQ;
  const hideComplete=document.getElementById('hideComplete');
  const hideMakellosOnly=document.getElementById('hideMakellosOnly');

  [...new Set(items.map(x=>x.type))].filter(Boolean).sort().forEach(x=>type.insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));
  [...new Set(items.map(x=>x.rarity))].filter(Boolean).forEach(x=>rarity.insertAdjacentHTML('beforeend',`<option>${esc(x)}</option>`));

  function isComplete(it,idx){
    const key=it.name+'#'+idx;
    return variants.every(v=>state[key+'|'+v]);
  }
  function onlyMakellosMissing(it,idx){
    const key=it.name+'#'+idx;
    return variants.filter(v=>!state[key+'|'+v]).length===1 && !state[key+'|MAKELLOS'];
  }

  function render(){
    const q=search.value.toLowerCase().trim(), tv=type.value, rv=rarity.value;
    const shown=items.map((it,idx)=>({...it,idx})).filter(it=>{
      if(q && !it.name.toLowerCase().includes(q)) return false;
      if(tv!=='all' && it.type!==tv) return false;
      if(rv!=='all' && it.rarity!==rv) return false;
      if(hideComplete?.checked && isComplete(it,it.idx)) return false;
      if(hideMakellosOnly?.checked && onlyMakellosMissing(it,it.idx)) return false;
      return true;
    });

    body.innerHTML=shown.map(it=>{
      const key=it.name+'#'+it.idx;
      const done=isComplete(it,it.idx);
      return `<tr id="row-${slug(it.name)}" class="${done?'row-complete':''}">
        <td class="sticky droidcell">
          <div class="name">${esc(it.name)}</div>
          <div class="badges">
            ${badge(it.rarity,getRarityColor(it.rarity),'rarity-box')}
            ${badge(it.type,getTypeColor(it.type),'type-box')}
          </div>
        </td>
        ${variants.map(v=>`<td class="check-cell">
          <input aria-label="${esc(it.name)} ${esc(v)}" class="check" style="--vcolor:${getVariantColor(v)}" type="checkbox"
            data-key="${esc(key)}" data-v="${esc(v)}" ${state[key+'|'+v]?'checked':''}>
          <span class="check-label" style="--labelcolor:${getVariantColor(v)}">${esc(v)}</span>
        </td>`).join('')}
      </tr>`;
    }).join('');

    body.querySelectorAll('.check').forEach(cb=>cb.addEventListener('change',()=>{
      state[cb.dataset.key+'|'+cb.dataset.v]=cb.checked;
      if(cb.checked) recordActivity(kind==='droids'?'Droid':'Fusion',cb.dataset.key.split('#')[0]+' – '+cb.dataset.v,true);
      stateSave(kind,state); update(); render();
    }));
    update();
  }

  function update(){
    let total=items.length*variants.length, done=0;
    items.forEach((it,idx)=>variants.forEach(v=>{
      if(state[it.name+'#'+idx+'|'+v])done++;
    }));
    const pct=total?Math.round(done/total*100):0;
    document.getElementById('done').textContent=`${done}/${total}`;
    document.getElementById('pct').textContent=pct+'%';
    document.getElementById('bar').style.width=pct+'%';
    const visible=body.querySelectorAll('tr').length;
    const counter=document.getElementById('visibleCount');
    if(counter) counter.textContent=`${visible} von ${items.length} Droiden angezeigt`;
  }

  [search,type,rarity,hideComplete,hideMakellosOnly].filter(Boolean).forEach(x=>x.addEventListener('input',render));
  document.getElementById('reset').addEventListener('click',()=>{
    if(confirm('Wirklich den gesamten Fortschritt dieser Seite löschen?')){
      localStorage.removeItem(STORE+'-'+kind); location.reload();
    }
  });
  render();
}

function renderIcons(items){
  const body=document.getElementById('iconBody'), state=stateLoad('icons'), search=document.getElementById('search');
  const urlQ=new URLSearchParams(location.search).get('q'); if(search && urlQ) search.value=urlQ;
  function render(){
    const q=(search?.value||'').toLowerCase().trim();
    const shown=items.map((it,idx)=>({...it,idx})).filter(it=>!q||it.name.toLowerCase().includes(q));
    body.innerHTML=shown.map(it=>{
      const key=it.name+'#'+it.idx, checked=!!state[key];
      return `<tr id="icon-${slug(it.name)}" class="${checked?'row-complete':''}">
        <td class="sticky droidcell"><div class="name">${esc(it.name)}</div><div class="badges">${badge(it.type,getTypeColor(it.type),'type-box')}</div></td>
        <td class="check-cell"><input aria-label="${esc(it.name)} vorhanden" class="check" style="--vcolor:#11e8ff" type="checkbox" data-key="${esc(key)}" ${checked?'checked':''}><span class="check-label">VORHANDEN</span></td>
      </tr>`;
    }).join('');
    body.querySelectorAll('.check').forEach(cb=>cb.addEventListener('change',()=>{
      state[cb.dataset.key]=cb.checked; if(cb.checked) recordActivity('Ikone',cb.dataset.key.split('#')[0],true); stateSave('icons',state); update(); render();
    }));
    update();
  }
  function update(){
    const done=items.filter((it,idx)=>state[it.name+'#'+idx]).length, total=items.length, pct=total?Math.round(done/total*100):0;
    document.getElementById('done').textContent=`${done}/${total}`;
    document.getElementById('pct').textContent=pct+'%';
    document.getElementById('bar').style.width=pct+'%';
    const vc=document.getElementById('visibleCount'); if(vc) vc.textContent=`${body.querySelectorAll('tr').length} von ${total} Ikonen angezeigt`;
  }
  if(search) search.addEventListener('input',render);
  document.getElementById('reset').addEventListener('click',()=>{
    if(confirm('Wirklich den gesamten Ikonen-Fortschritt löschen?')){localStorage.removeItem(STORE+'-icons');location.reload()}
  });
  render();
}
function renderRecipes(recipes){
  const el=document.getElementById('recipes');
  el.innerHTML=recipes.map(r=>`<article class="recipe ${slug(r.rarity)}" style="--rc:${getRarityColor(r.rarity)}">
    ${badge(r.rarity,getRarityColor(r.rarity),'rarity-box')}
    ${badge(r.type,getTypeColor(r.type),'type-box')}
    <h3>${esc(r.name)}</h3>
    <div class="ingredients">${r.ingredients.map((x,i)=>`${i?'<span class="arrow">+</span>':''}<span class="ingredient">${esc(x)}</span>`).join('')}<span class="arrow">→</span><span class="ingredient">${esc(r.name)}</span></div>
  </article>`).join('');
}

function renderRebirth(){
  const state=stateLoad('rebirth'),grid=document.getElementById('rebirthGrid');
  grid.innerHTML=Array.from({length:35},(_,i)=>{
    let n=i+1;
    return `<label class="rebirth-card"><input class="check" style="--vcolor:#8ED873" type="checkbox" data-n="${n}" ${state[n]?'checked':''}><span class="num">${n}</span><span><b>Rebirth ${n}</b><small class="type">Noch offen für deine Daten</small></span></label>`;
  }).join('');
  grid.querySelectorAll('input').forEach(c=>c.addEventListener('change',()=>{
    state[c.dataset.n]=c.checked;stateSave('rebirth',state);updateRebirth()
  }));
  updateRebirth();
  document.getElementById('resetRebirth').addEventListener('click',()=>{
    if(confirm('Rebirth-Fortschritt löschen?')){localStorage.removeItem(STORE+'-rebirth');location.reload()}
  })
}
function updateRebirth(){
  const s=stateLoad('rebirth'),done=Object.values(s).filter(Boolean).length,pct=Math.round(done/35*100);
  document.getElementById('done').textContent=`${done}/35`;
  document.getElementById('pct').textContent=pct+'%';
  document.getElementById('bar').style.width=pct+'%';
}


// v2.0 Command Center helpers
function initCommandCenter(){
  const logo=document.querySelector('.brand img'); if(logo){let taps=0,timer;logo.addEventListener('click',e=>{e.preventDefault();taps++;clearTimeout(timer);if(taps>=5){taps=0;showSecret();}timer=setTimeout(()=>taps=0,1400);});}
  const search=document.getElementById('galaxySearch');
  if(search){
    const results=document.getElementById('galaxySearchResults');
    const all=[...(D.droids||[]).map(x=>({name:x.name,cat:'Droid Archive',url:'droids.html'})),...(D.fusionDroids||[]).map(x=>({name:x.name,cat:'Fusion Lab',url:'fusionen.html'})),...(D.icons||[]).map(x=>({name:x.name,cat:'Icon Vault',url:'ikonen.html'}))];
    function doSearch(){const q=search.value.trim().toLowerCase(); if(!q){results.innerHTML='<div class="search-empty">SCAN BEREIT // Suche nach Droid, Fusion oder Ikone</div>';return;} const found=all.filter(x=>x.name.toLowerCase().includes(q)).slice(0,8); results.innerHTML=found.length?found.map(x=>`<a href="${x.url}?q=${encodeURIComponent(x.name)}"><b>${esc(x.name)}</b><small>${esc(x.cat)}</small><span>→</span></a>`).join(''):'<div class="search-empty">KEIN TREFFER // Datenbankeintrag nicht gefunden</div>';}
    search.addEventListener('input',doSearch); doSearch();
  }
  renderCommanderStatus(); renderNextMission(); initDropTimers();
}
function renderCommanderStatus(){
  const el=document.getElementById('commanderStatus'); if(!el)return;
  const ps=[getTrackerProgress('droids',D.droids,D.variants),getTrackerProgress('fusionen',D.fusionDroids,D.variants),getIconProgress(D.icons)];
  const done=ps.reduce((a,p)=>a+p.done,0), total=ps.reduce((a,p)=>a+p.total,0), pct=total?done/total*100:0;
  const ranks=[[0,'CADET'],[10,'DROID SCOUT'],[30,'FUSION TECHNICIAN'],[50,'GALAXY COLLECTOR'],[75,'DROID TYCOON'],[100,'GALACTIC MASTER']];
  let rank=ranks[0][1]; ranks.forEach(r=>{if(pct>=r[0])rank=r[1]});
  el.innerHTML=`<span class="rank-kicker">COMMANDER STATUS</span><strong>${rank}</strong><small>${Math.round(pct)}% GALAXY SECURED // ${done}/${total}</small>`;
}
function renderNextMission(){
  const el=document.getElementById('nextMission'); if(!el)return;
  const d=getTrackerProgress('droids',D.droids,D.variants), f=getTrackerProgress('fusionen',D.fusionDroids,D.variants), i=getIconProgress(D.icons);
  let m;
  if(d.pct<100)m={tag:'DROID ARCHIVE',title:`Noch ${d.total-d.done} Varianten warten`,desc:'Scanne das Archiv und sichere die nächste Droiden-Variante.',url:'droids.html'};
  else if(f.pct<100)m={tag:'FUSION LAB',title:`Noch ${f.total-f.done} Varianten offen`,desc:'Die nächste Fusion wartet bereits auf ihre Zutaten.',url:'fusionen.html'};
  else if(i.pct<100)m={tag:'ICON VAULT',title:`Noch ${i.total-i.done} Ikonen fehlen`,desc:'Nur noch wenige Einträge bis zum vollständigen Tresor.',url:'ikonen.html'};
  else m={tag:'GALACTIC MASTER',title:'Das Archiv ist vollständig gesichert',desc:'100 % erreicht. Die Galaxie gehört dir.',url:'index.html'};
  el.innerHTML=`<span class="mission-tag">${m.tag}</span><h3>${m.title}</h3><p>${m.desc}</p><a class="mission-btn" href="${m.url}">MISSION STARTEN →</a>`;
}
function initDropTimers(){
  const root=document.getElementById('dropTimers'); if(!root)return;
  const schedules={kyber:[15],mythic:[55],stellar:[5,35]};
  const labels={kyber:'KYBER',mythic:'MYTHIC',stellar:'STELLAR'};
  const colors={kyber:'#69d7ff',mythic:'#ff4fd8',stellar:'#ffd84d'};
  let lastDrop={};
  function nextFor(mins,now){
    const y=now.getFullYear(),mo=now.getMonth(),d=now.getDate(),h=now.getHours();
    for(let hour=0;hour<3;hour++)for(const m of mins){const t=new Date(y,mo,d,h+hour,m,0,0);if(t>now)return t;}
    return new Date(y,mo,d,h+3,mins[0],0,0);
  }
  function fmt(ms){const s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');}
  function tick(){const now=new Date(); root.querySelectorAll('[data-drop]').forEach(card=>{const key=card.dataset.drop,t=nextFor(schedules[key],now),ms=t-now,mins=schedules[key],due=mins.includes(now.getMinutes())&&now.getSeconds()<2,dueStamp=new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),now.getMinutes(),0,0).getTime(); card.querySelector('.drop-count').textContent=fmt(ms); card.querySelector('.drop-next').textContent=`NÄCHSTER ${labels[key]} DROP // ${t.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`; card.classList.toggle('drop-live',due); if(due && lastDrop[key]!==dueStamp){lastDrop[key]=dueStamp;triggerDrop(labels[key]);}});}
  function triggerDrop(name){const notice=document.getElementById('dropNotice'); if(notice){notice.textContent=`⚡ ${name} DROP JETZT AKTIV // SYSTEM SIGNAL`;notice.classList.add('show');setTimeout(()=>notice.classList.remove('show'),8000);} document.title=`⚡ ${name} DROP // WalFischBaby`; setTimeout(()=>{document.title='Droid Command | WalFischBaby'},5000); if('Notification' in window && Notification.permission==='granted'){try{new Notification(`${name} Drop ist da!`,{body:`Der ${name} Blueprint Drop ist jetzt aktiv.`})}catch{}} try{const C=window.AudioContext||window.webkitAudioContext;if(C){const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.12,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.5);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.5)}}catch{}}
  const bell=document.getElementById('enableAlerts'); if(bell) bell.addEventListener('click',async()=>{if('Notification' in window){try{const permission=await Notification.requestPermission();bell.textContent=permission==='granted'?'🔔 ALARME AKTIV':'🔕 ALARM NUR AUF SEITE'}catch{bell.textContent='🔕 ALARM NUR AUF SEITE'}}else bell.textContent='🔕 BROWSER-ALARM NICHT VERFÜGBAR';});
  tick();setInterval(tick,1000);
}
function showSecret(){const el=document.getElementById('secretMessage');if(!el)return;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),5000)}
