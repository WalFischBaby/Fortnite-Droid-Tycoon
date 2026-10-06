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
function stateSave(key,s){localStorage.setItem(STORE+'-'+key,JSON.stringify(s))}
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
}

function renderTracker(kind,items,variants){
  const body=document.getElementById('trackerBody'), state=stateLoad(kind);
  const search=document.getElementById('search'), type=document.getElementById('type'), rarity=document.getElementById('rarity');
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
      return `<tr class="${done?'row-complete':''}">
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
  const body=document.getElementById('iconBody'), state=stateLoad('icons');
  function render(){
    body.innerHTML=items.map((it,idx)=>{
      const key=it.name+'#'+idx, checked=!!state[key];
      return `<tr class="${checked?'row-complete':''}">
        <td class="sticky droidcell"><div class="name">${esc(it.name)}</div><div class="badges">${badge(it.type,getTypeColor(it.type),'type-box')}</div></td>
        <td class="check-cell"><input aria-label="${esc(it.name)} vorhanden" class="check" style="--vcolor:#11e8ff" type="checkbox" data-key="${esc(key)}" ${checked?'checked':''}><span class="check-label">VORHANDEN</span></td>
      </tr>`;
    }).join('');
    body.querySelectorAll('.check').forEach(cb=>cb.addEventListener('change',()=>{
      state[cb.dataset.key]=cb.checked; stateSave('icons',state); update(); render();
    }));
    update();
  }
  function update(){
    const done=items.filter((it,idx)=>state[it.name+'#'+idx]).length, total=items.length, pct=total?Math.round(done/total*100):0;
    document.getElementById('done').textContent=`${done}/${total}`;
    document.getElementById('pct').textContent=pct+'%';
    document.getElementById('bar').style.width=pct+'%';
  }
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
