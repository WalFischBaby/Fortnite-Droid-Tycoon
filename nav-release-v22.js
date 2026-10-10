/* V2.0 – reuse the existing update/feedback modal handlers. */
(function(){
 document.addEventListener('click',function(event){
   const action=event.target.closest('[data-release-open]');
   if(!action)return;
   const target=document.getElementById(action.dataset.releaseOpen);
   if(target)target.click();
   const drawer=document.getElementById('dt-mobile-drawer');
   if(drawer&&!drawer.hidden){drawer.hidden=true;const b=document.querySelector('.dt-mobile-menu-button');if(b)b.setAttribute('aria-expanded','false');}
 });
})();
