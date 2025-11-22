// Logo Redirect basierend auf Referrer
(function() {
  'use strict';
  
  function updateLogoLink() {
    // Verschiedene mögliche Selektoren für das Mintlify Logo
    const logoSelectors = [
      'a[href="/"]', // Standard Logo Link
      '.logo a',
      'header a[href="/"]',
      'nav a[href="/"]',
      '[data-testid="logo"]',
      '.navbar-logo a'
    ];
    
    let logoLink = null;
    
    // Versuche verschiedene Selektoren
    for (const selector of logoSelectors) {
      logoLink = document.querySelector(selector);
      if (logoLink && logoLink.closest('header, nav, .navbar')) {
        break;
      }
    }
    
    if (!logoLink) {
      // Fallback: Suche nach dem ersten Link im Header, der auf "/" zeigt
      const header = document.querySelector('header, nav, .navbar');
      if (header) {
        logoLink = header.querySelector('a[href="/"]');
      }
    }
    
    if (!logoLink) {
      return; // Logo nicht gefunden
    }
    
    // Referrer prüfen
    const referrer = document.referrer;
    let targetUrl = '/'; // Standard: docs.genseo.co Home
    
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        const referrerHost = referrerUrl.hostname;
        
        // Prüfe ob Referrer von app.genseo.co kommt
        if (referrerHost === 'app.genseo.co') {
          targetUrl = 'https://app.genseo.co';
        }
        // Prüfe ob Referrer von genseo.co oder www.genseo.co kommt (aber nicht app oder docs)
        else if (referrerHost === 'genseo.co' || referrerHost === 'www.genseo.co') {
          targetUrl = 'https://genseo.co';
        }
        // Für alle anderen Quellen (Google, etc.) bleibt targetUrl = '/' (docs.genseo.co)
      } catch (e) {
        // Falls URL-Parsing fehlschlägt, verwende String-Matching als Fallback
        if (referrer.includes('app.genseo.co')) {
          targetUrl = 'https://app.genseo.co';
        } else if (referrer.includes('genseo.co') && !referrer.includes('app.genseo.co') && !referrer.includes('docs.genseo.co')) {
          targetUrl = 'https://genseo.co';
        }
      }
    }
    // Wenn kein Referrer: bleibt auf docs.genseo.co (targetUrl bleibt '/')
    
    // Setze den neuen Link
    logoLink.setAttribute('href', targetUrl);
    
    // Event Listener für Klick hinzufügen (falls nötig)
    logoLink.addEventListener('click', function(e) {
      // Wenn es eine externe URL ist, normale Navigation erlauben
      if (targetUrl.startsWith('http')) {
        // Navigation wird normal durchgeführt
        return true;
      }
      // Für interne Links wird die normale Navigation verwendet
    });
  }
  
  // Warte bis DOM geladen ist
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateLogoLink);
  } else {
    // DOM ist bereits geladen
    updateLogoLink();
  }
  
  // Auch nach Navigation (SPA) prüfen
  // Mintlify verwendet möglicherweise Client-Side Routing
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      setTimeout(updateLogoLink, 100);
    }
  }).observe(document, { subtree: true, childList: true });
})();

