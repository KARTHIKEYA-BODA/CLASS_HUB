/**
 * ClassHub Public Layout
 * Injects the shared navbar + footer into any public page.
 * Usage: <div id="chNavbar"></div> ... <div id="chFooter"></div>
 * Then call ChLayout.init('home'|'about'|'contact'|'login'|'register')
 */
const ChLayout = (() => {

  const navbarHTML = (active) => `
    <nav class="navbar navbar-expand-lg ch-navbar">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <span class="ch-logo-badge"><i class="bi bi-mortarboard-fill"></i></span>
          ClassHub
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#chNavCollapse">
          <i class="bi bi-list fs-2"></i>
        </button>
        <div class="collapse navbar-collapse" id="chNavCollapse">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item"><a class="nav-link ${active==='home'?'active':''}" href="index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link ${active==='about'?'active':''}" href="about.html">About</a></li>
            <li class="nav-item"><a class="nav-link ${active==='contact'?'active':''}" href="contact.html">Contact Us</a></li>
          </ul>
          <div class="d-flex align-items-center gap-2 mt-3 mt-lg-0">
            <button class="ch-theme-toggle" title="Toggle theme"><i class="ch-theme-icon bi bi-moon-stars-fill"></i></button>
            <a href="login.html" class="btn btn-ch-outline btn-sm px-3">Login</a>
            <a href="register.html" class="btn btn-ch-primary btn-sm px-3">Register</a>
          </div>
        </div>
      </div>
    </nav>`;

  const footerHTML = `
    <footer class="ch-footer">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4 col-md-6">
            <a class="navbar-brand mb-3 d-inline-flex align-items-center" href="index.html" style="color:var(--ch-text)!important; text-decoration:none;">
              <span class="ch-logo-badge me-2"><i class="bi bi-mortarboard-fill"></i></span>
              <span style="font-weight:800; font-size:1.25rem; color:var(--ch-text);">ClassHub</span>
            </a>
            <p class="ch-footer-desc mb-3" style="color:var(--ch-text-muted)!important; font-size:0.92rem; line-height:1.65; max-width:360px;">
              A smart classroom management system built to simplify attendance, notes,
              assignments, and communication between students, class representatives, and faculty.
            </p>
            <div class="ch-social-links d-flex align-items-center gap-2 mt-3" style="display:flex!important; align-items:center!important; gap:0.65rem!important; margin-top:1rem!important;">
              <a href="#" class="ch-social-icon" aria-label="Facebook" title="Facebook" style="display:inline-flex!important; align-items:center!important; justify-content:center!important; width:40px!important; height:40px!important; border-radius:50%!important; margin-bottom:0!important;"><i class="bi bi-facebook" style="display:flex!important; align-items:center!important; justify-content:center!important; line-height:1!important; margin:0!important;"></i></a>
              <a href="#" class="ch-social-icon" aria-label="X (Twitter)" title="X" style="display:inline-flex!important; align-items:center!important; justify-content:center!important; width:40px!important; height:40px!important; border-radius:50%!important; margin-bottom:0!important;"><i class="bi bi-twitter-x" style="display:flex!important; align-items:center!important; justify-content:center!important; line-height:1!important; margin:0!important;"></i></a>
              <a href="#" class="ch-social-icon" aria-label="LinkedIn" title="LinkedIn" style="display:inline-flex!important; align-items:center!important; justify-content:center!important; width:40px!important; height:40px!important; border-radius:50%!important; margin-bottom:0!important;"><i class="bi bi-linkedin" style="display:flex!important; align-items:center!important; justify-content:center!important; line-height:1!important; margin:0!important;"></i></a>
              <a href="#" class="ch-social-icon" aria-label="Instagram" title="Instagram" style="display:inline-flex!important; align-items:center!important; justify-content:center!important; width:40px!important; height:40px!important; border-radius:50%!important; margin-bottom:0!important;"><i class="bi bi-instagram" style="display:flex!important; align-items:center!important; justify-content:center!important; line-height:1!important; margin:0!important;"></i></a>
            </div>
          </div>
          <div class="col-lg-2 col-md-6 col-6">
            <h6>Quick Links</h6>
            <a href="index.html">Home</a>
            <a href="about.html">About</a>
            <a href="contact.html">Contact Us</a>
            <a href="login.html">Login</a>
          </div>
          <div class="col-lg-3 col-md-6 col-6">
            <h6>Portals</h6>
            <a href="login.html">Student Login</a>
            <a href="login.html">CR Login</a>
            <a href="login.html">Admin Login</a>
            <a href="register.html">Student Registration</a>
          </div>
          <div class="col-lg-3 col-md-6">
            <h6>Get in Touch</h6>
            <a href="#" id="chFooterEmail"><i class="bi bi-envelope me-2"></i>admin@classhub.edu</a>
            <a href="#" id="chFooterPhone"><i class="bi bi-telephone me-2"></i>+91 99999 99999</a>
            <a href="#" id="chFooterAddress"><i class="bi bi-geo-alt me-2"></i>Knowledge City, India</a>
          </div>
        </div>
        <div class="ch-footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
          <span>© ${new Date().getFullYear()} ClassHub. All rights reserved.</span>
          <span>Built with <i class="bi bi-heart-fill text-danger"></i> for smarter classrooms — v1.0.0</span>
        </div>
      </div>
    </footer>`;

  const init = (activePage) => {
    const navEl = document.getElementById('chNavbar');
    const footEl = document.getElementById('chFooter');
    if (navEl) navEl.innerHTML = navbarHTML(activePage);
    if (footEl) footEl.innerHTML = footerHTML;

    // Re-init theme toggle listeners since navbar was injected after theme.js ran
    document.querySelectorAll('.ch-theme-toggle').forEach(btn => btn.addEventListener('click', ChTheme.toggle));
    const savedTheme = document.documentElement.getAttribute('data-theme') || 'light';
    document.querySelectorAll('.ch-theme-icon').forEach(icon => {
      icon.className = `ch-theme-icon bi ${savedTheme === 'dark' ? 'bi-sun-fill' : 'bi-moon-stars-fill'}`;
    });

    // Populate footer contact info from API
    ChAPI.get('/contact').then(res => {
      if (res.contact) {
        const { email, phone, address } = res.contact;
        const e = document.getElementById('chFooterEmail');
        const p = document.getElementById('chFooterPhone');
        const a = document.getElementById('chFooterAddress');
        if (e) e.innerHTML = `<i class="bi bi-envelope me-2"></i>${email}`;
        if (p) p.innerHTML = `<i class="bi bi-telephone me-2"></i>${phone}`;
        if (a && address) a.innerHTML = `<i class="bi bi-geo-alt me-2"></i>${address}`;
      }
    }).catch(() => {});
  };

  return { init };
})();
