/* DT-01 Assistant 2.0: deterministic local tracker assistant, no remote AI or DB writes */
(()=>{'use strict';
const form=document.getElementById('assistantQueryForm'),input=document.getElementById('assistantQuery'),out=document.getElementById('assistantAnswer');if(!form||!input||!out)return;
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s||'').toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const link=(url,label)=>`<a class="assistant-result-link" href="${safe(url)}">${safe(label)} →</a>`;
const goals=()=>typeof getOpenGoals==='function'?getOpenGoals():[];
const renderGoals=(items,headline)=>`<strong>${safe(headline)}</strong>${items.length?'<ul class="assistant-result-list">'+items.slice(0,6).map(g=>`<li>${safe(g.icon)} <b>${safe(g.name)}</b><small>${g.missing===1?'1 Eintrag offen':g.missing+' Varianten offen'} · ${safe(g.label)}</small>${link(g.url+'?q='+encodeURIComponent(g.name),'Ansehen')}</li>`).join('')+'</ul>':'<p>In diesem Bereich ist aktuell kein offenes Ziel vorhanden.</p>'}`;
const routes={droiden:['droids.html','Droiden-Archiv'],fusionen:['fusionen.html','Fusionslabor'],ikonen:['ikonen.html','Ikonen'],rebirth:['rebirth.html','Rebirth Cycles 1–5'],upgrade:['upgrade.html','Upgrade-Rechner'],missionen:['missionen.html','Mission Control'],profil:['profil.html','Spielerprofil']};
function reply(raw){const q=normalize(raw),g=goals(),ranked=typeof scoreGoals==='function'?scoreGoals(g):g;const stats=typeof getAreaStats==='function'?getAreaStats():[];
if(!q)return 'Stell mir eine Frage zu deinem Tracker.';
if(/^(hallo|hi|hey|hilfe|was kannst du)/.test(q))return '<b>Ich kann deinen Sammelfortschritt analysieren.</b><p>Frag z. B. „Welche Droiden fehlen?“, „Was ist fast fertig?“, „Mein Fortschritt“, „Nächster Drop“, „Rebirth“ oder nach einem Droidennamen.</p>';
if(/fortschritt|prozent|statistik|ubersicht|wie weit/.test(q))return '<b>Dein Sammlungsstatus</b><ul class="assistant-result-list">'+stats.map(x=>`<li>${safe(x.icon)} <b>${safe(x.label)}: ${safe(x.pct)} %</b> ${link(x.url,'Öffnen')}</li>`).join('')+'</ul>';
if(/drop|event|mythic|kyber|stellar|wann/.test(q)){const d=typeof getNextDropInfo==='function'?getNextDropInfo():null;return d?`<b>Nächster berechneter Drop:</b> ${safe(d.icon)} ${safe(d.name)} in ${safe(formatShortCountdown(d.ms))}.<p>Die Zeiten stammen aus dem vorhandenen Tracker-Zeitplan und sind keine Live-Bestätigung des Spiels.</p>`:'Aktuell sind keine Drop-Zeiten verfügbar.'}
if(/heute|geschafft|aktivitat/.test(q)){const a=typeof todayActivity==='function'?todayActivity():[];return `<b>Heute erfasste Einträge: ${a.length}</b>`+(a.length?'<p>'+a.slice(0,5).map(x=>safe(x.label)).join(' · ')+'</p>':'<p>Heute wurde lokal noch kein Eintrag erfasst.</p>')}
if(/route|empfehl|nachste|als nachstes|priorit|schnell|fast fertig/.test(q))return renderGoals(ranked.filter(x=>/route|empfehl|nachste|als nachstes|priorit/.test(q)||x.missing<=2).slice(0,6),'Deine nächsten Sammelziele');
if(/favorit/.test(q))return renderGoals(ranked.filter(x=>x.favorite),'Deine offenen Favoriten');
if(/rebirth|cycle|zyklus|cyclen/.test(q))return '<b>Rebirth-Guides</b><p>Alle fünf Cycles findest du im Rebirth-Bereich. Ich kann hier die vorhandenen Guides öffnen, aber keine unbekannten Spielanforderungen erfinden.</p>'+link('rebirth.html','Rebirth öffnen');
if(/upgrade|chip|kosten|stufe/.test(q))return '<b>Upgrade-Rechner</b><p>Berechne die benötigten Chips für deinen gewünschten Stufenbereich direkt im Upgrade-Terminal.</p>'+link('upgrade.html','Upgrade-Rechner öffnen');
if(/mission|aufgabe/.test(q))return '<b>Mission Control</b><p>Deine persönlichen Missionen findest du im Missionsbereich.</p>'+link('missionen.html','Missionen öffnen');
const kind=/fusion/.test(q)?'fusionen':/ikon/.test(q)?'icons':/droid/.test(q)?'droids':null;
if(kind){const list=ranked.filter(x=>x.kind===kind);return renderGoals(list,kind==='droids'?'Offene Droiden':kind==='fusionen'?'Offene Fusionen':'Offene Ikonen')}
const terms=q.split(' ').filter(t=>t.length>=3&&!['welche','fehlt','fehlen','zeige','suche','finde','meine','einen','einem','nach','noch','habe','nicht','alle'].includes(t));
const matches=ranked.filter(x=>{const name=normalize(x.name);return terms.length&&terms.every(t=>name.includes(t))});
if(matches.length)return renderGoals(matches,'Passende offene Sammlungsziele');
const all=[...(typeof D!=='undefined'&&D.droids||[]).map(x=>({name:x.name,url:'droids.html'})),...(typeof D!=='undefined'&&D.fusionDroids||[]).map(x=>({name:x.name,url:'fusionen.html'})),...(typeof D!=='undefined'&&D.icons||[]).map(x=>({name:x.name,url:'ikonen.html'}))];
const found=all.filter(x=>terms.length&&terms.every(t=>normalize(x.name).includes(t))).slice(0,5);
if(found.length)return '<b>Im Archiv gefunden</b><p>Diese Einträge stehen nicht in deiner aktuellen Liste offener Ziele:</p>'+found.map(x=>'<p>'+safe(x.name)+' '+link(x.url+'?q='+encodeURIComponent(x.name),'Öffnen')+'</p>').join('');
return '<b>Dazu habe ich keine verlässliche Antwort im lokalen Tracker.</b><p>Versuche einen Droidennamen oder frage nach Fortschritt, fehlenden Varianten, Events, Rebirth oder Upgrades. Externe Spieldaten werden nicht automatisch recherchiert.</p>';
}
// DT-01 3.2: local advisor is free and does not call Gemini.
const advisor=document.createElement('section');advisor.className='assistant-advisor';advisor.innerHTML='<div class="advisor-title">🎯 PERSÖNLICHER DROIDEN-BERATER <small>Lokale Analyse · keine KI-Frage</small></div><div class="advisor-buttons"><button type="button" data-advisor="targets">Meine nächsten Ziele</button><button type="button" data-advisor="fusion">Offene Fusionen</button><button type="button" data-advisor="favorites">Favoriten zuerst</button></div>';
form.parentElement.insertBefore(advisor,form);
advisor.addEventListener('click',e=>{const b=e.target.closest('button[data-advisor]');if(!b)return;const raw=goals(),ranked=typeof scoreGoals==='function'?scoreGoals(raw):raw;const mode=b.dataset.advisor;const selected=mode==='fusion'?ranked.filter(g=>g.kind==='fusionen'):mode==='favorites'?ranked.filter(g=>g.favorite):ranked;out.innerHTML=renderGoals(selected,mode==='fusion'?'Deine offenen Fusionen':mode==='favorites'?'Deine offenen Favoriten':'Deine empfohlenen Sammelziele')+'<p class="advisor-disclaimer">Priorisiert nach den im Tracker vorhandenen Daten; keine Aussage über unbekannte Spielanforderungen.</p>';});
const history=[];
const endpoint='https://mmitxiaidgvifxzqqrae.supabase.co/functions/v1/dt01-assistant';
const client=()=>window.DT01Cloud?.client?.();
const quotaBox=document.getElementById('assistantQuota'),quotaText=document.getElementById('assistantQuotaText'),quotaBar=document.getElementById('assistantQuotaBar'),quotaHint=document.getElementById('assistantQuotaHint');
const showQuota=(used,limit=10)=>{if(!quotaBox)return;const n=Math.max(0,Math.min(limit,Number(used)||0));quotaText.textContent=n+' / '+limit;quotaBar.style.width=(n/limit*100)+'%';quotaBox.classList.toggle('exhausted',n>=limit);quotaHint.textContent=n>=limit?'Tageslimit erreicht · lokale Hilfe bleibt verfügbar':(limit-n)+' KI-Fragen verbleibend · Reset um 00:00 UTC';};
async function refreshQuota(){const c=client();if(!c)return;try{const {data:{session}}=await c.auth.getSession();if(!session?.access_token){if(quotaText)quotaText.textContent='Anmeldung nötig';if(quotaHint)quotaHint.textContent='Melde dich an, um KI-Fragen zu nutzen.';return;}const r=await fetch(endpoint,{method:'GET',headers:{'Authorization':'Bearer '+session.access_token,'apikey':'sb_publishable_LPRZBZLoQsPm_P2olo7ESA_EYK3f_Cu'}});if(!r.ok)throw Error('nicht verfügbar');const data=await r.json();showQuota(data.used,data.limit||10);}catch(e){if(quotaText)quotaText.textContent='– / 10';if(quotaHint)quotaHint.textContent='Zähler nicht verfügbar · KI-Funktion bleibt erhalten';}}
setTimeout(refreshQuota,400);document.getElementById('assistantToggle')?.addEventListener('click',()=>setTimeout(refreshQuota,150));

const askAI=async(question)=>{
 const c=client();if(!c)throw Error('Cloud-Verbindung nicht bereit');
 const {data:{session}}=await c.auth.getSession();if(!session?.access_token)throw Error('Bitte melde dich an, um die KI zu nutzen.');
 const stats=typeof getAreaStats==='function'?getAreaStats().map(x=>({bereich:x.label,prozent:x.pct})):[];
 const goals=(typeof scoreGoals==='function'&&typeof getOpenGoals==='function'?scoreGoals(getOpenGoals()):typeof getOpenGoals==='function'?getOpenGoals():[]).slice(0,12).map(g=>({name:g.name,bereich:g.label,offen:g.missing,typ:g.kind||"",favorit:!!g.favorite}));
 const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+session.access_token,'apikey':'sb_publishable_LPRZBZLoQsPm_P2olo7ESA_EYK3f_Cu'},body:JSON.stringify({question,history:history.slice(-6),context:{stats,goals}})});
 const payload=await r.json().catch(()=>({}));if(!r.ok)throw Error(payload.error||'KI vorübergehend nicht erreichbar');
 history.push({role:'user',text:question},{role:'assistant',text:payload.answer});if(history.length>12)history.splice(0,history.length-12);
 return payload.answer;
};
form.addEventListener('submit',async e=>{e.preventDefault();const q=input.value.trim();if(!q)return;
 const btn=form.querySelector('button[type="submit"]');btn.disabled=true;out.textContent='🤖 DT-01 denkt nach …';
 try{const answer=await askAI(q);out.textContent=answer;}catch(err){const limit=String(err.message).includes('Tageslimit');out.innerHTML=limit?'<p><b>🐳 Deine 10 KI-Fragen für heute sind aufgebraucht.</b> Morgen kannst du wieder fragen. Bis dahin hilft dir der lokale Assistent:</p>'+reply(q):'<p><b>KI vorübergehend nicht erreichbar:</b> '+safe(err.message)+'</p><p>Lokale Hilfe:</p>'+reply(q);}finally{btn.disabled=false;refreshQuota();}
});
})();
