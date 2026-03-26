// Shared layout: injects navbar + footer into every page
// All links point to scribemedia.com (absolute) since this app is hosted separately
(function() {
  var SITE = 'https://scribemedia.com';
  var LOGO = 'https://scribemedia.com/hubfs/raw_assets/public/scribe-theme/images/logo-sm-on-dark.svg';

  // Inject navbar at top of body
  var nav = document.createElement('div');
  nav.innerHTML = ''
    + '<header class="site-header" role="banner">'
    + '<nav class="navbar" role="navigation" aria-label="Main navigation">'
    + '  <div class="navbar__container">'
    + '    <a href="' + SITE + '" class="navbar__logo" aria-label="Scribe Media Home">'
    + '      <img class="navbar__brand-image" src="' + LOGO + '" alt="Scribe Media" width="215" height="69">'
    + '    </a>'
    + '    <ul class="navbar__links" role="menubar">'
    + '      <li class="navbar__links-item navbar__dropdown" role="none">'
    + '        <button class="navbar__link navbar__dropdown-toggle" aria-expanded="false" aria-haspopup="true" type="button">'
    + '          Why Scribe? <i class="ph ph-caret-down navbar__dropdown-icon"></i>'
    + '        </button>'
    + '        <ul class="navbar__dropdown-menu" role="menu">'
    + '          <li role="none"><a href="' + SITE + '/why-scribe" class="navbar__dropdown-link" role="menuitem">Why Scribe</a></li>'
    + '          <li role="none"><a href="' + SITE + '/scribe-team" class="navbar__dropdown-link" role="menuitem">Our Team</a></li>'
    + '          <li role="none"><a href="' + SITE + '/reviews" class="navbar__dropdown-link" role="menuitem">Reviews</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li class="navbar__links-item navbar__dropdown" role="none">'
    + '        <button class="navbar__link navbar__dropdown-toggle" aria-expanded="false" aria-haspopup="true" type="button">'
    + '          Services <i class="ph ph-caret-down navbar__dropdown-icon"></i>'
    + '        </button>'
    + '        <ul class="navbar__dropdown-menu navbar__dropdown-menu--wide" role="menu">'
    + '          <li role="none"><a href="' + SITE + '/services" class="navbar__dropdown-link navbar__dropdown-link--highlight" role="menuitem">Compare All Services &rarr;</a></li>'
    + '          <li class="navbar__dropdown-divider" role="separator"></li>'
    + '          <li class="navbar__dropdown-group-label" role="presentation">Core Services</li>'
    + '          <li role="none"><a href="' + SITE + '/service/ghostwriting" class="navbar__dropdown-link" role="menuitem">Scribe Elite</a></li>'
    + '          <li role="none"><a href="' + SITE + '/service/professional-book-writers" class="navbar__dropdown-link" role="menuitem">Scribe Professional</a></li>'
    + '          <li role="none"><a href="' + SITE + '/service/guided-author" class="navbar__dropdown-link" role="menuitem">Guided Author</a></li>'
    + '          <li role="none"><a href="' + SITE + '/service/publishing" class="navbar__dropdown-link" role="menuitem">Scribe Publishing</a></li>'
    + '          <li class="navbar__dropdown-divider" role="separator"></li>'
    + '          <li class="navbar__dropdown-group-label" role="presentation">Add-Ons</li>'
    + '          <li role="none"><a href="' + SITE + '/service/scribe-compass" class="navbar__dropdown-link" role="menuitem">Scribe Compass</a></li>'
    + '          <li role="none"><a href="' + SITE + '/service/audiobook" class="navbar__dropdown-link" role="menuitem">Audiobook</a></li>'
    + '          <li role="none"><a href="' + SITE + '/service/book-marketing" class="navbar__dropdown-link" role="menuitem">Book Marketing</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li class="navbar__links-item navbar__dropdown" role="none">'
    + '        <button class="navbar__link navbar__dropdown-toggle" aria-expanded="false" aria-haspopup="true" type="button">'
    + '          Free Resources <i class="ph ph-caret-down navbar__dropdown-icon"></i>'
    + '        </button>'
    + '        <ul class="navbar__dropdown-menu" role="menu">'
    + '          <li role="none"><a href="' + SITE + '/blog" class="navbar__dropdown-link" role="menuitem">Blog</a></li>'
    + '          <li role="none"><a href="' + SITE + '/scribe-method-book" class="navbar__dropdown-link" role="menuitem">The Scribe Method Book</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li class="navbar__links-item navbar__dropdown" role="none">'
    + '        <button class="navbar__link navbar__dropdown-toggle" aria-expanded="false" aria-haspopup="true" type="button">'
    + '          Books &amp; Authors <i class="ph ph-caret-down navbar__dropdown-icon"></i>'
    + '        </button>'
    + '        <ul class="navbar__dropdown-menu" role="menu">'
    + '          <li role="none"><a href="' + SITE + '/authors" class="navbar__dropdown-link" role="menuitem">Our Authors</a></li>'
    + '          <li role="none"><a href="' + SITE + '/published-books" class="navbar__dropdown-link" role="menuitem">Published Books</a></li>'
    + '          <li role="none"><a href="' + SITE + '/success-stories" class="navbar__dropdown-link" role="menuitem">Success Stories</a></li>'
    + '          <li role="none"><a href="' + SITE + '/faq" class="navbar__dropdown-link" role="menuitem">FAQs</a></li>'
    + '        </ul>'
    + '      </li>'
    + '      <li class="navbar__links-item" role="none">'
    + '        <a href="https://scribemedia.com/pricing" class="navbar__link" role="menuitem">Pricing</a>'
    + '      </li>'
    + '    </ul>'
    + '    <div class="navbar__actions">'
    + '      <a href="' + SITE + '/consult" class="btn-glow navbar__cta navbar__cta--desktop">'
    + '        <span class="navbar__cta-label">Schedule a Consult</span>'
    + '      </a>'
    + '      <button class="navbar__mobile-toggle" aria-label="Toggle mobile menu" aria-expanded="false" type="button">'
    + '        <i class="ph-fill ph-list navbar__mobile-toggle-icon"></i>'
    + '      </button>'
    + '    </div>'
    + '  </div>'
    + '  <div class="navbar__mobile-menu" id="navbar-mobile-menu" aria-hidden="true">'
    + '    <ul class="navbar__mobile-links" role="menu">'
    + '      <li class="navbar__mobile-links-item" role="none"><a href="' + SITE + '/why-scribe" class="navbar__mobile-link" role="menuitem">Why Scribe</a></li>'
    + '      <li class="navbar__mobile-links-item" role="none"><a href="' + SITE + '/services" class="navbar__mobile-link" role="menuitem">Services</a></li>'
    + '      <li class="navbar__mobile-links-item" role="none"><a href="' + SITE + '/blog" class="navbar__mobile-link" role="menuitem">Blog</a></li>'
    + '      <li class="navbar__mobile-links-item" role="none"><a href="' + SITE + '/published-books" class="navbar__mobile-link" role="menuitem">Books & Authors</a></li>'
    + '      <li class="navbar__mobile-links-item" role="none"><a href="https://scribemedia.com/pricing" class="navbar__mobile-link" role="menuitem">Pricing</a></li>'
    + '    </ul>'
    + '    <a href="' + SITE + '/consult" class="btn-glow navbar__mobile-cta">Schedule a Consult</a>'
    + '  </div>'
    + '</nav>'
    + '</header>';

  document.body.insertBefore(nav.firstElementChild, document.body.firstChild);

  // Mobile toggle
  var toggle = document.querySelector('.navbar__mobile-toggle');
  var menu = document.getElementById('navbar-mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function() {
      var open = menu.getAttribute('aria-hidden') === 'false';
      menu.setAttribute('aria-hidden', open ? 'true' : 'false');
      toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      var icon = toggle.querySelector('.navbar__mobile-toggle-icon');
      if (icon) icon.className = open ? 'ph-fill ph-list navbar__mobile-toggle-icon' : 'ph-fill ph-x navbar__mobile-toggle-icon';
    });
  }

  // Desktop dropdowns
  document.querySelectorAll('.navbar__dropdown').forEach(function(dropdown) {
    var btn = dropdown.querySelector('.navbar__dropdown-toggle');
    var ddMenu = dropdown.querySelector('.navbar__dropdown-menu');
    if (!btn || !ddMenu) return;
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var open = ddMenu.classList.contains('is-open');
      document.querySelectorAll('.navbar__dropdown-menu').forEach(function(m) { m.classList.remove('is-open'); });
      document.querySelectorAll('.navbar__dropdown-toggle').forEach(function(t) { t.setAttribute('aria-expanded', 'false'); });
      if (!open) {
        ddMenu.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
  document.addEventListener('click', function() {
    document.querySelectorAll('.navbar__dropdown-menu').forEach(function(m) { m.classList.remove('is-open'); });
    document.querySelectorAll('.navbar__dropdown-toggle').forEach(function(t) { t.setAttribute('aria-expanded', 'false'); });
  });
})();
