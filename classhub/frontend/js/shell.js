/**
 * ClassHub Dashboard Shell
 * Builds the sidebar + topbar for Student/CR/Admin dashboards.
 * Usage: ChShell.render({ role, user, navItems, activeKey, pageTitle, pageSubtitle })
 */
const ChShell = (() => {
  const avatarHTML = (user, size = "sm") => {
    const img = user.profile_image ? ChUtils.fileUrl(user.profile_image) : null;
    const cls = size === "sm" ? "ch-avatar-sm" : "ch-profile-avatar";
    if (img) return `<img src="${img}" class="${cls}" alt="${user.name}">`;
    return `<div class="${cls}">${ChUtils.initials(user.name)}</div>`;
  };

  const sidebarHTML = (role, user, navItems, activeKey) => {
    const grouped = {};
    navItems.forEach((item) => {
      const section = item.section || "Main";
      if (!grouped[section]) grouped[section] = [];
      grouped[section].push(item);
    });

    let navHTML = "";
    Object.keys(grouped).forEach((section) => {
      navHTML += `<div class="ch-nav-section-label">${section}</div>`;
      grouped[section].forEach((item) => {
        navHTML += `
          <button type="button" class="ch-nav-link ${item.key === activeKey ? "active" : ""}" data-nav="${item.key}">
            <i class="bi ${item.icon}"></i> ${item.label}
            ${item.badge ? `<span class="badge bg-danger ms-auto" id="navBadge-${item.key}" style="display:none;">0</span>` : ""}
          </button>`;
      });
    });

    return `
      <aside class="ch-sidebar" id="chSidebar">
        <div class="ch-sidebar-brand">
          <span class="ch-logo-badge"><i class="bi bi-mortarboard-fill"></i></span>
          <span>ClassHub</span>
        </div>
        <div class="ch-sidebar-role">
          ${avatarHTML(user)}
          <div>
            <div class="name">${ChUtils.escapeHtml(user.name)}</div>
            <div class="role">${role === "cr" ? "Class Representative" : role}</div>
          </div>
        </div>
        <nav class="ch-sidebar-nav">${navHTML}</nav>
        <div class="ch-sidebar-footer">
          <button class="ch-nav-link text-danger" onclick="ChAuth.logout()">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </aside>
      <div class="ch-sidebar-overlay" id="chSidebarOverlay" onclick="ChShell.closeSidebar()"></div>`;
  };

  const topbarHTML = (pageTitle, pageSubtitle) => `
    <div class="ch-topbar">
      <div class="d-flex align-items-center gap-3">
        <button class="ch-hamburger" onclick="ChShell.openSidebar()"><i class="bi bi-list"></i></button>
        <div class="ch-topbar-title">
          ${pageTitle}
          ${pageSubtitle ? `<span class="subtitle">${pageSubtitle}</span>` : ""}
        </div>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="ch-theme-toggle"><i class="ch-theme-icon bi bi-moon-stars-fill"></i></button>
      </div>
    </div>`;

  const render = ({
    role,
    user,
    navItems,
    activeKey,
    pageTitle,
    pageSubtitle,
    contentId = "chContent",
  }) => {
    const root = document.getElementById("chDashboardRoot");
    root.innerHTML = `
      <div class="ch-app">
        ${sidebarHTML(role, user, navItems, activeKey)}
        <div class="ch-main">
          ${topbarHTML(pageTitle, pageSubtitle)}
          <div class="ch-content" id="${contentId}"></div>
        </div>
      </div>`;

    root.querySelectorAll(".ch-nav-link[data-nav]").forEach((button) => {
      button.addEventListener("click", () => {
        const item = navItems.find(({ key }) => key === button.dataset.nav);
        if (item?.href) window.location.href = item.href;
        else if (typeof window.loadSection === "function") {
          window.loadSection(button.dataset.nav);
        }
      });
    });

    // Wire theme toggle (re-bind since injected dynamically)
    document
      .querySelectorAll(".ch-theme-toggle")
      .forEach((btn) => btn.addEventListener("click", ChTheme.toggle));
    const savedTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    document.querySelectorAll(".ch-theme-icon").forEach((icon) => {
      icon.className = `ch-theme-icon bi ${savedTheme === "dark" ? "bi-sun-fill" : "bi-moon-stars-fill"}`;
    });
  };

  const openSidebar = () => {
    document.getElementById("chSidebar").classList.add("show");
    document.getElementById("chSidebarOverlay").classList.add("show");
  };
  const closeSidebar = () => {
    document.getElementById("chSidebar").classList.remove("show");
    document.getElementById("chSidebarOverlay").classList.remove("show");
  };

  const setBadge = (key, count) => {
    const el = document.getElementById(`navBadge-${key}`);
    if (el) {
      if (count > 0) {
        el.textContent = count;
        el.style.display = "inline-block";
      } else {
        el.style.display = "none";
      }
    }
  };

  return {
    render,
    openSidebar,
    closeSidebar,
    setBadge,
    avatarHTML,
  };
})();
