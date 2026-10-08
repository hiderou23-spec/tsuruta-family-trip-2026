
(function(){
  const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);

  const icon = '<svg class="gmap-icon" viewBox="0 0 24 24" aria-hidden="true">'+
    '<path fill="#34A853" d="M12 1.8a7.4 7.4 0 0 0-7.4 7.4c0 5.5 7.4 13 7.4 13s7.4-7.5 7.4-13A7.4 7.4 0 0 0 12 1.8z"/>'+
    '<path fill="#4285F4" d="M4.9 7.2A7.4 7.4 0 0 1 12 1.8v5.1a2.5 2.5 0 0 0-2.3 1.5z"/>'+
    '<path fill="#FBBC04" d="M9.7 8.4A2.5 2.5 0 0 0 12 11.8v10.4S4.6 14.7 4.6 9.2c0-.7.1-1.4.3-2z"/>'+
    '<path fill="#EA4335" d="M12 6.9V1.8a7.4 7.4 0 0 1 7.1 5.4l-4.8 1.7A2.5 2.5 0 0 0 12 6.9z"/>'+
    '<circle cx="12" cy="9.2" r="2.2" fill="#fff"/></svg>';

  function extractQuery(a){
    if(a.dataset.gmapQuery) return a.dataset.gmapQuery;
    try{
      const u=new URL(a.href,location.href);
      return u.searchParams.get('query') || u.searchParams.get('q') || '';
    }catch(_){return ''}
  }

  function isMapAnchor(a){
    const h=a.getAttribute('href')||'';
    return !!a.dataset.gmapQuery || h.includes('google.com/maps') || h.includes('maps.google.');
  }

  function decorate(a){
    if(!isMapAnchor(a)) return;
    const q=extractQuery(a);
    if(!q) return;
    a.dataset.gmapQuery=q;
    a.classList.add('gmap-link');
    const raw=(a.textContent||'').replace(/[📍🗺️]/g,'').replace(/\bMaps?\b/ig,'').trim();
    const prefix=raw ? '<span class="gmap-prefix">'+raw+'</span><span class="gmap-sep"> · </span>' : '';
    a.innerHTML=prefix+'<span class="gmap-label">Map</span>';
    a.setAttribute('aria-label',(raw?raw+' - ':'')+'Google Mapsで開く');
    a.removeAttribute('target');
  }

  function decorateAll(root){
    const scope=root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('a').forEach(decorate);
  }

  document.addEventListener('click',function(e){
    const a=e.target.closest && e.target.closest('a.gmap-link');
    if(!a) return;
    const q=a.dataset.gmapQuery;
    if(!q) return;
    e.preventDefault();
    e.stopPropagation();
    const enc=encodeURIComponent(q);
    if(isIOS){
      window.location.href='comgooglemaps://?q='+enc;
    }else{
      window.location.href='https://www.google.com/maps/search/?api=1&query='+enc;
    }
  },true);

  const style=document.createElement('style');
  style.textContent=
    '.gmap-link{display:inline-flex!important;align-items:center!important;gap:4px!important;text-decoration:none!important}'+
    '.gmap-label{font-weight:800;white-space:nowrap}'+
    '.gmap-prefix{min-width:0}.gmap-sep{color:#a0a5b1}'+
    '.btn.gmap-link{min-height:34px;padding:5px 8px!important}';
  document.head.appendChild(style);

  decorateAll(document);
  const mo=new MutationObserver(ms=>{
    for(const m of ms){
      m.addedNodes.forEach(n=>{
        if(n.nodeType!==1)return;
        if(n.matches && n.matches('a')) decorate(n);
        decorateAll(n);
      });
    }
  });
  mo.observe(document.body,{childList:true,subtree:true});
})();