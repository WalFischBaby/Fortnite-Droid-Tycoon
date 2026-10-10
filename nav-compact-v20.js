/* DT-01: grouped, keyboard-accessible desktop navigation */
(function(){
 function init(){
  const rail=document.querySelector('.terminal-rail');if(!rail||rail.dataset.compactReady)return;
  const nav=rail.querySelector('nav');if(!nav)return;
  rail.dataset.compactReady='1';rail.classList.add('dt-compact-rail');
  const entries=Array.from(nav.children);
  const groups=[
   {key:'collection',label:'SAMMLUNG',icon:'▣',items:['droids.html','fusionen.html','ikonen.html','rebirth.html']},
   {key:'tools',label:'WERKZEUGE',icon:'⌁',items:['upgrade.html','missionen.html']},
   {key:'community',label:'COMMUNITY',icon:'♧',items:['mitglieder.html','marktplatz.html','nachrichten.html','profil.html']},
   {key:'service',label:'SERVICE',icon:'✦',items:['[data-release-open="openUpdates"]','[data-release-open="openFeedback"]','support-me.html']}
  ];
  const match=(entry,key)=>key.startsWith('[')?entry.matches(key):entry.getAttribute('href')==='./'+key;
  const home=entries.find(x=>match(x,'index.html'));if(home){home.classList.add('dt-rail-home');nav.appendChild(home);}
  let activeGroup='';
  groups.forEach(group=>{
   const wrap=document.createElement('section');wrap.className='dt-rail-group';wrap.dataset.group=group.key;
   const toggle=document.createElement('button');toggle.type='button';toggle.className='dt-rail-group-toggle';toggle.setAttribute('aria-expanded','false');
   const panel=document.createElement('div');panel.className='dt-rail-group-panel';panel.id='dt-rail-panel-'+group.key;panel.hidden=true;
   toggle.setAttribute('aria-controls',panel.id);toggle.innerHTML='<span class="dt-rail-group-icon" aria-hidden="true">'+group.icon+'</span><span class="dt-rail-group-title">'+group.label+'</span><span class="dt-rail-chevron" aria-hidden="true">⌄</span>';
   group.items.forEach(key=>{const entry=entries.find(x=>match(x,key));if(entry){panel.appendChild(entry);if(entry.classList.contains('active')||(entry.getAttribute('href')||'').replace('./','')===location.pathname.split('/').pop())activeGroup=group.key;}});
   wrap.append(toggle,panel);nav.appendChild(wrap);
   toggle.addEventListener('click',()=>{const next=panel.hidden;setOpen(next?group.key:null);});
  });
  function setOpen(key){nav.querySelectorAll('.dt-rail-group').forEach(w=>{const open=w.dataset.group===key;const panel=w.querySelector('.dt-rail-group-panel');panel.hidden=!open;w.querySelector('.dt-rail-group-toggle').setAttribute('aria-expanded',String(open));w.classList.toggle('is-open',open);});}
  setOpen(activeGroup||'collection');
  // Always show service actions on mobile via existing mobile drawer.
  const status=rail.querySelector('.rail-status');if(status)status.setAttribute('aria-label','Systemstatus');
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
