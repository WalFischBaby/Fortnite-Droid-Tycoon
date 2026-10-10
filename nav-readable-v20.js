/* A clear, one-click inbox shortcut; existing inbox and permissions unchanged. */
(function(){
 function init(){
  const rail=document.querySelector('.terminal-rail');
  if(rail&&!rail.querySelector('.dt-inbox-shortcut')){
   const a=document.createElement('a');a.href='./nachrichten.html';a.className='dt-inbox-shortcut';a.setAttribute('aria-label','Posteingang öffnen');
   a.innerHTML='<span class="dt-inbox-icon" aria-hidden="true">✉</span><span class="dt-inbox-label">Posteingang</span><span class="dt-inbox-count" data-dm-prominent hidden></span>';
   const nav=rail.querySelector('nav');rail.insertBefore(a,nav);
  }
  const mobile=document.querySelector('.dt-mobile-header');
  if(mobile&&!mobile.querySelector('.dt-mobile-inbox')){
   const a=document.createElement('a');a.href='./nachrichten.html';a.className='dt-mobile-inbox';a.setAttribute('aria-label','Posteingang öffnen');a.innerHTML='<span aria-hidden="true">✉</span><span class="dt-inbox-count" data-dm-prominent hidden></span>';
   const menu=mobile.querySelector('.dt-mobile-menu-button');if(menu)mobile.insertBefore(a,menu);
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
