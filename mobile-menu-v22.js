(function(){
  function init(){
    if(document.querySelector('.dt-mobile-header'))return;
    const pages=[['index.html','◉','Übersicht'],['droids.html','▣','Droiden'],['fusionen.html','◇','Fusionen'],['ikonen.html','★','Ikonen'],['rebirth.html','↻','Rebirth'],['upgrade.html','⌁','Upgrade-Rechner'],['missionen.html','◎','Mission Control'],['marktplatz.html','⇄','Marktplatz'],['nachrichten.html','✉','Private Nachrichten'],['mitglieder.html','♧','Mitglieder'],['profil.html','♙','Mein Spielerprofil'],['index.html#dtChatCard','☏','Community-Chat']];
    const current=location.pathname.split('/').pop()||'index.html';
    const bar=document.createElement('div');bar.className='dt-mobile-header';
    bar.innerHTML='<a class="dt-mobile-brand" href="./index.html" aria-label="DT-01 Startseite"><span class="dt-mobile-logo">DT<span>01</span></span><span class="dt-mobile-brand-name">DT-01 <small>COMMAND CENTER</small></span></a><button class="dt-mobile-menu-button" type="button" aria-label="Navigation öffnen" aria-expanded="false" aria-controls="dt-mobile-drawer"><span aria-hidden="true">☰</span><span>Menü</span></button>';
    const panel=document.createElement('nav');panel.id='dt-mobile-drawer';panel.className='dt-mobile-drawer';panel.setAttribute('aria-label','Mobile Hauptnavigation');panel.hidden=true;
    panel.innerHTML='<div class="dt-mobile-drawer-heading">NAVIGATION</div>'+pages.map(([url,ico,name])=>'<a href="./'+url+'" '+(current===url?'class="active" aria-current="page"':'')+'><span class="dt-drawer-icon">'+ico+'</span><span>'+name+'</span>'+(current===url?'<span class="dt-current-dot" aria-hidden="true">●</span>':'')+'</a>').join('');
    panel.insertAdjacentHTML('beforeend','<div class="dt-mobile-drawer-heading dt-mobile-tools-heading">SERVICE</div><button type="button" class="dt-mobile-tool" data-release-open="openUpdates"><span class="dt-drawer-icon">✦</span><span>Updates</span></button><button type="button" class="dt-mobile-tool" data-release-open="openFeedback"><span class="dt-drawer-icon">💬</span><span>Feedback</span></button><a href="./support-me.html" class="dt-mobile-tool"><span class="dt-drawer-icon">💜</span><span>Support Me</span></a>');
    document.body.prepend(bar);bar.after(panel);
    const button=bar.querySelector('button');
    function close(){panel.hidden=true;button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Navigation öffnen');}
    button.addEventListener('click',()=>{const show=panel.hidden;panel.hidden=!show;button.setAttribute('aria-expanded',String(show));button.setAttribute('aria-label',show?'Navigation schließen':'Navigation öffnen');});
    document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!bar.contains(e.target))close();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){close();button.focus();}});
    window.addEventListener('resize',()=>{if(window.innerWidth>850)close();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
