from pathlib import Path
p=Path('/mnt/data/work/common.js')
s=p.read_text()
# replace renderTracker query init to support q param
s=s.replace("  const search=document.getElementById('search'), type=document.getElementById('type'), rarity=document.getElementById('rarity');", "  const search=document.getElementById('search'), type=document.getElementById('type'), rarity=document.getElementById('rarity');\n  const urlQ=new URLSearchParams(location.search).get('q');\n  if(search && urlQ) search.value=urlQ;")
# Replace renderIcons function fully
start=s.index('function renderIcons(items){')
end=s.index('\nfunction renderRecipes(recipes){', start)
new_icons=r'''function renderIcons(items){
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
}'''
s=s[:start]+new_icons+s[end:]
# Add row ids in tracker
s=s.replace('<tr class="${done?\'row-complete\':\'\'}">', '<tr id="row-${slug(it.name)}" class="${done?\'row-complete\':\'\'}">')
# Replace activity time english ago
s=s.replace("Math.floor(diff/60000)+' Min. ago'", "Math.floor(diff/60000)+' Min. vor'")
# Append new functions
s += r'''

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
  function tick(){const now=new Date(); root.querySelectorAll('[data-drop]').forEach(card=>{const key=card.dataset.drop,t=nextFor(schedules[key],now),ms=t-now,live=ms<=1200; card.querySelector('.drop-count').textContent=fmt(ms); card.querySelector('.drop-next').textContent=`NÄCHSTER ${labels[key]} DROP // ${t.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`; card.classList.toggle('drop-live',live); if(live && lastDrop[key]!==t.getTime()){lastDrop[key]=t.getTime();triggerDrop(labels[key]);}});}
  function triggerDrop(name){const notice=document.getElementById('dropNotice'); if(notice){notice.textContent=`⚡ ${name} DROP JETZT AKTIV // SYSTEM SIGNAL`;notice.classList.add('show');setTimeout(()=>notice.classList.remove('show'),8000);} document.title=`⚡ ${name} DROP // WalFischBaby`; setTimeout(()=>{document.title='Droid Command | WalFischBaby'},5000); if('Notification' in window && Notification.permission==='granted'){try{new Notification(`${name} Drop ist da!`,{body:`Der ${name} Blueprint Drop ist jetzt aktiv.`})}catch{}} try{const C=window.AudioContext||window.webkitAudioContext;if(C){const c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.setValueAtTime(.0001,c.currentTime);g.gain.exponentialRampToValueAtTime(.12,c.currentTime+.02);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.5);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.5)}}catch{}}
  const bell=document.getElementById('enableAlerts'); if(bell) bell.addEventListener('click',async()=>{if('Notification' in window){try{const p=await Notification.requestPermission();bell.textContent=p==='granted'?'🔔 ALARME AKTIV':'🔕 ALARM NUR AUF SEITE'}}catch{bell.textContent='🔕 ALARM NUR AUF SEITE'}}else bell.textContent='🔕 BROWSER-ALARM NICHT VERFÜGBAR';});
  tick();setInterval(tick,1000);
}
function showSecret(){const el=document.getElementById('secretMessage');if(!el)return;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),5000)}
'''
p.write_text(s)
