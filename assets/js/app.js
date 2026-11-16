let MEMBERS = [];
let EVENTS = [];
let DOCS = [];
let NEWS = [];

// =========================================================================
  // PHP BACKEND CONFIGURATION & API
  // =========================================================================
  
  const apiBase = 'api'; // Đường dẫn thư mục chứa code PHP
  
  window.apiCall = async function(endpoint, data = {}, method = 'POST') {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      
      // Prevent caching on GET requests
      const urlSuffix = method === 'GET' ? (endpoint.includes('?') ? '&_=' : '?_=') + Date.now() : '';
      
      try {
        const response = await fetch(`${apiBase}/${endpoint}${urlSuffix}`, {
          method: method,
          body: method === 'POST' ? formData : null,
          cache: 'no-store'
        });
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          return {
            success: false,
            staticHost: true,
            message: "Chức năng đăng nhập/quản trị cần máy chủ PHP & MySQL (bản GitHub Pages chỉ hỗ trợ xem nội dung tĩnh)."
          };
        }
      } catch (err) {
        return { success: false, message: "Lỗi kết nối máy chủ." };
      }
  };

const ARTICLE_CATEGORY_MAP = {
  'tin-caa': { cat: 'chi-hoi', label: 'Tin Chi hội' },
  'chi-hoi': { cat: 'chi-hoi', label: 'Tin Chi hội' },
  'su-kien': { cat: 'chi-hoi', label: 'Sự kiện' },
  'kien-thuc': { cat: 'kien-thuc', label: 'Kiến thức' },
  'tin-nganh': { cat: 'kien-thuc', label: 'Tin ngành' },
  'phap-ly': { cat: 'phap-ly', label: 'Pháp lý' },
  'the-thao': { cat: 'the-thao', label: 'Thể thao' },
  'hoi-vien': { cat: 'hoi-vien', label: 'Hội viên' }
};

function mapDirectoryRow(d) {
  return {
    id: String(d.id),
    short: d.short_name || (d.name || '').slice(0, 2).toUpperCase(),
    category: d.category || '',
    name: d.name || '',
    tags: d.category ? [d.category] : [],
    summary: d.summary || ((d.category ? d.category + ' - ' : '') + (d.name || '')),
    contact: d.contact_email || '',
    phone: d.phone || '',
    status: d.status || 'active',
    statusLabel: (d.status === 'active' || d.status === 'approved') ? 'Đã xác minh' : '',
    capabilities: d.capabilities || d.category || '',
    website: d.website || '',
    logo: d.logo_url || ''
  };
}

function mapEventRow(d) {
  const isPast = ['ended', 'completed', 'past'].includes(d.status);
  const status = isPast ? 'past' : (d.status || 'upcoming');
  const statusLabel = status === 'upcoming' ? 'Sắp diễn ra' : (status === 'past' ? 'Đã diễn ra' : 'Mở đăng ký');
  const parts = (d.date || '').split('-');
  const desc = (d.description || '').trim();
  return {
    id: String(d.id),
    title: d.title || '',
    date: d.date || '',
    time: d.time || '',
    location: d.location || '',
    type: d.type || 'Hội thảo',
    status: status,
    image: 'assets/img/launch-event.jpg',
    link: d.registration_link || '',
    day: parts[2] || '',
    month: parts[1] || '',
    year: parts[0] || '',
    statusLabel: statusLabel,
    summary: desc ? (desc.length > 130 ? desc.slice(0, 130) + '...' : desc) : (d.title || ''),
    capacity: d.capacity,
    registered: d.registered || 0,
    detail: desc || d.title || ''
  };
}

function mapDocRow(d) {
  const access = d.access_level || 'public';
  const accessLabel = access === 'public' ? 'Công khai' : (access === 'admin' ? 'Nội bộ' : 'Thành viên');
  return {
    id: String(d.id),
    name: d.title || '',
    category: d.category || '',
    date: (d.created_at || '').split(' ')[0] || '',
    access: access,
    accessLabel: accessLabel,
    size: '1.2 MB',
    type: 'PDF',
    url: d.file_url || '#'
  };
}

function extractArticleExcerpt(html) {
  if (!html) return '';
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const sapo = tmp.querySelector('.sc-longform-header-sapo, .block-sc-sapo');
    if (sapo && sapo.textContent.trim()) {
      const s = sapo.textContent.replace(/\s+/g, ' ').trim();
      return s.length > 120 ? s.substring(0, 120) + '...' : s;
    }
    tmp.querySelectorAll('.lwptoc, .sc-longform-header, .c-article-relation, script, style').forEach(el => el.remove());
    const clean = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
    return clean ? (clean.length > 120 ? clean.substring(0, 120) + '...' : clean) : '';
  }
  const rawText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return rawText ? rawText.substring(0, 120) + '...' : '';
}

function mapArticleRow(d) {
  const mapped = ARTICLE_CATEGORY_MAP[d.category] || { cat: d.category || 'hoi-vien', label: 'Hội viên' };
  return {
    id: String(d.id),
    cat: mapped.cat,
    catLabel: mapped.label,
    date: (d.created_at || '').split(' ')[0] || '2026-09-24',
    title: d.title || '',
    excerpt: extractArticleExcerpt(d.content),
    artBg: 'var(--c-bg-2)',
    img: d.image_url || ''
  };
}

async function fetchStaticFallback() {
  try {
    const res = await fetch(`assets/data/db.json?_=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

async function fetchData() {
    try {
        const [dirRes, evRes, docRes, artRes] = await Promise.all([
            window.apiCall('public.php?action=get_directory', {}, 'GET'),
            window.apiCall('public.php?action=get_events', {}, 'GET'),
            window.apiCall('public.php?action=get_docs', {}, 'GET'),
            window.apiCall('public.php?action=get_articles', {}, 'GET')
        ]);

        const needsStatic = !(dirRes?.success && evRes?.success && docRes?.success && artRes?.success);
        const staticData = needsStatic ? await fetchStaticFallback() : null;

        const dirRows = dirRes?.success ? dirRes.data : staticData?.directory;
        const evRows = evRes?.success ? evRes.data : staticData?.events;
        const docRows = docRes?.success ? docRes.data : staticData?.documents;
        const artRows = artRes?.success ? artRes.data : staticData?.articles;

        if (Array.isArray(dirRows)) MEMBERS = dirRows.map(mapDirectoryRow);
        if (Array.isArray(evRows)) EVENTS = evRows.map(mapEventRow);
        if (Array.isArray(docRows)) DOCS = docRows.map(mapDocRow);
        if (Array.isArray(artRows)) {
            NEWS = artRows.map(mapArticleRow);
        } else if (typeof ARTICLES !== 'undefined' && Array.isArray(ARTICLES)) {
            NEWS = ARTICLES.map(a => ({
                id: a.id,
                cat: 'chi-hoi',
                catLabel: 'Tin Chi hội',
                date: '2026-09-16',
                title: a.title,
                excerpt: a.description || '',
                artBg: 'var(--c-bg-2)',
                img: a.image || ''
            }));
        }

        if (typeof refreshSearchIndex === 'function') refreshSearchIndex();
    } catch(e) {
        console.error('Lỗi tải dữ liệu', e);
    }
}


const STATIC_SEARCH_PAGES = [
  { label: "Trang chủ", href: "index.html", type: "Trang" },
  { label: "Giới thiệu CAA", href: "about.html", type: "Trang" },
  { label: "Ban Chấp hành", href: "about.html#leadership", type: "Trang" },
  { label: "Sứ mệnh & Tầm nhìn", href: "about.html#mission", type: "Trang" },
  { label: "Danh bạ B2B", href: "directory.html", type: "Tính năng" },
  { label: "Sự kiện", href: "events.html", type: "Trang" },
  { label: "Tin tức", href: "news.html", type: "Trang" },
  { label: "Gia nhập CAA", href: "join.html", type: "Tính năng" },
  { label: "Quyền lợi hội viên", href: "join.html#benefits", type: "Trang" },
  { label: "Khu hội viên", href: "portal.html", type: "Tính năng" },
  { label: "Tài liệu", href: "docs.html", type: "Trang" },
  { label: "QR Check-in", href: "events.html#checkin", type: "Tính năng" },
  { label: "Admin CMS", href: "admin.html", type: "Tính năng" },
  { label: "Liên hệ", href: "contact.html", type: "Trang" }
];
let SEARCH_INDEX = [...STATIC_SEARCH_PAGES];
function refreshSearchIndex() {
  SEARCH_INDEX = [
    ...STATIC_SEARCH_PAGES,
    ...MEMBERS.map(m => ({ label: m.name, href: "directory.html", type: m.category || "Hội viên" })),
    ...EVENTS.map(e => ({ label: e.title, href: "events.html", type: "Sự kiện" })),
    ...NEWS.map(n => ({ label: n.title, href: `news-detail.html?id=${n.id}`, type: "Tin tức" }))
  ];
}

const QR_CODES = {
  "CAA-2026-001": { valid: true, name: "Nguyễn Văn A · Táo Đỏ", event: "Hội thảo Thuế & Pháp lý 2026" },
  "CAA-2026-002": { valid: false, used: true, name: "Trần Thị B · DT Group", event: "Hội thảo Thuế & Pháp lý 2026" },
  "CAA-2026-003": { valid: true, name: "Lê Văn C · Bắc Hà Print", event: "Hội thảo Thuế & Pháp lý 2026" },
};

// ── STATE ─────────────────────────────────────────────────

let state = {
  role: "guest",
  dirCategory: "all",
  dirQuery: "",
  eventFilter: "all",
  newsCat: "all",
  docsCat: "all",
  joinStep: 0,
  joinData: {},
  checkedInCodes: new Set(),
  portalTab: "dashboard",
  adminTab: "overview",
};

// ── DOM refs ──────────────────────────────────────────────

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── UTILITIES ─────────────────────────────────────────────

function toast(msg, tone = "info") {
  const region = $("toast-region");
  if (!region) return;
  const el = document.createElement("div");
  el.className = `toast toast--${tone}`;
  el.setAttribute("role", "status");
  el.textContent = msg;
  region.append(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    setTimeout(() => el.remove(), 300);
  }, 4500);
}

function openDialog(id) {
  const el = $(id);
  if (!el) return;
  if (el.showModal) el.showModal();
  else el.setAttribute("open", "");
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isPrivileged() {
  return ["member", "admin"].includes(state.role);
}

function isAdmin() {
  return state.role === "admin";
}

function roleName(role) {
  return { guest: "Khách", member: "Hội viên", admin: "Hội viên" }[role] ?? role;
}

// ── ROLE / AUTH ───────────────────────────────────────────

function setRole(role) {
  state.role = role;
  localStorage.setItem("caa-role", role);
  document.body.dataset.role = role;

  const isLoggedIn = role !== 'guest';

  // Update login button label
  $$("[data-login-label]").forEach(el => { el.textContent = role === "guest" ? "Đăng nhập" : (localStorage.getItem("caa-email") || roleName(role)); });
  $$(".login-btn").forEach(el => { el.textContent = role === "guest" ? "Đăng nhập" : roleName(role); });

  // Ẩn/hiện nút Đăng xuất
  $$("[data-logout]").forEach(el => { el.style.display = isLoggedIn ? 'inline-flex' : 'none'; });

  // Re-render role-gated elements
  renderRoleGates();
  renderDirectory();
  renderDirectoryInner();
  toast(isLoggedIn ? `Chào mừng! Đang xem với vai trò: ${roleName(role)}.` : "Đã đăng xuất.", "success");
}

function renderRoleGates() {
  // Member portal
  const guestLock = $("portal-guest-lock");
  const memberContent = $("portal-member-content");
  if (guestLock) guestLock.hidden = isPrivileged();
  if (memberContent) memberContent.hidden = !isPrivileged();

  // Admin panel
  const adminLock = $("admin-guest-lock");
  const adminContent = $("admin-content");
  if (adminLock) adminLock.hidden = isAdmin();
  if (adminContent) adminContent.hidden = !isAdmin();
}

// ── MEGA MENU ─────────────────────────────────────────────

function setupMegaMenu() {
  let closeTimer;
  const scrim = document.querySelector("[data-scrim]");

  function openMega(key) {
    clearTimeout(closeTimer);
    $$("[data-mega-panel]").forEach(p => {
      p.hidden = p.dataset.megaPanel !== key;
    });
    $$("[data-mega]").forEach(b => {
      b.setAttribute("aria-expanded", String(b.dataset.mega === key));
    });
    if (scrim) { scrim.hidden = false; void scrim.offsetWidth; scrim.classList.add("active"); }
  }

  function closeMega() {
    $$("[data-mega-panel]").forEach(p => { p.hidden = true; });
    $$("[data-mega]").forEach(b => b.setAttribute("aria-expanded", "false"));
    if (scrim) { scrim.classList.remove("active"); setTimeout(() => { scrim.hidden = true; }, 220); }
  }

  $$("[data-mega]").forEach(btn => {
    btn.addEventListener("pointerenter", () => openMega(btn.dataset.mega));
    btn.addEventListener("click", () => {
      btn.getAttribute("aria-expanded") === "true" ? closeMega() : openMega(btn.dataset.mega);
    });
  });

  $$("[data-mega-panel]").forEach(panel => {
    panel.addEventListener("pointerenter", () => clearTimeout(closeTimer));
    panel.addEventListener("pointerleave", () => { closeTimer = setTimeout(closeMega, 150); });
  });

  const nav = document.querySelector(".nav");
  if (nav) nav.addEventListener("pointerleave", () => { closeTimer = setTimeout(closeMega, 150); });
  if (scrim) scrim.addEventListener("click", closeMega);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeMega(); });
}

// ── MOBILE MENU ───────────────────────────────────────────

function setupMobileMenu() {
  const toggle = document.querySelector(".mobile-toggle");
  const drawer = $("mobile-drawer");
  if (!toggle || !drawer) return;

  toggle.addEventListener("click", () => {
    const open = drawer.hidden === false;
    drawer.hidden = open;
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.textContent = open ? "☰" : "✕";
  });
  drawer.addEventListener("click", e => {
    if (e.target.tagName === "A" || e.target.closest("[data-open-login]")) {
      drawer.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.textContent = "☰";
    }
  });
}

// ── SCROLL REVEAL ─────────────────────────────────────────

function setupScrollReveal() {
  if (!("IntersectionObserver" in window)) {
    $$("[data-reveal]").forEach(el => el.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  $$("[data-reveal]").forEach(el => obs.observe(el));
}

// ── DIRECTORY ─────────────────────────────────────────────

function renderMemberCard(m, showFull = false) {
  const contactHtml = showFull
    ? `<div class="member-contact-full">
        <a href="mailto:${escapeHtml(m.contact)}">${escapeHtml(m.contact)}</a>
        <span>${escapeHtml(m.phone)}</span>
       </div>`
    : `<p class="member-contact-locked">
        <span>Đăng nhập hội viên để xem thông tin liên hệ nội bộ.</span>
       </p>`;

  const statusBadge = (m.status === "approved" || m.status === "active")
    ? `<span class="badge badge-green">${escapeHtml(m.statusLabel)}</span>`
    : m.status === "pending"
      ? `<span class="badge badge-yellow">${escapeHtml(m.statusLabel)}</span>`
      : `<span class="badge badge-blue">${escapeHtml(m.statusLabel)}</span>`;

  return `
    <article class="member-card" data-member-id="${m.id}">
      <header class="member-card-header">
        ${m.logo ? `<img src="${escapeHtml(m.logo)}" class="member-logo" alt="${escapeHtml(m.name)}" style="object-fit:contain;padding:4px;background:#fff;">` : `<span class="member-logo" aria-hidden="true">${escapeHtml(m.short)}</span>`}
        <div class="member-header-info">
          <h3 class="member-name">${escapeHtml(m.name)}</h3>
          <span class="badge badge-default">${escapeHtml(m.category)}</span>
        </div>
      </header>
      <p class="member-desc">${escapeHtml(m.summary)}</p>
      <div class="member-tags">
        ${m.tags.map(t => `<span class="badge badge-default">${escapeHtml(t)}</span>`).join("")}
      </div>
      ${contactHtml}
      ${statusBadge}
      <footer class="member-actions">
        <button class="btn btn-secondary btn-sm" type="button" data-view-profile="${m.id}">Xem hồ sơ</button>
        <button class="btn btn-primary btn-sm" type="button" data-connect="${m.id}">Kết nối đối tác</button>
      </footer>
    </article>`;
}

function getFilteredMembers() {
  const q = state.dirQuery.trim().toLocaleLowerCase("vi");
  return MEMBERS.filter(m => {
    const haystack = `${m.name} ${m.category} ${m.tags.join(" ")} ${m.summary}`.toLocaleLowerCase("vi");
    const catOk = state.dirCategory === "all" || m.category === state.dirCategory || m.tags.includes(state.dirCategory);
    return catOk && (!q || haystack.includes(q));
  });
}

function renderDirectory() {
  const grid = $("dir-grid");
  if (!grid) return;
  let filtered = getFilteredMembers();
  if (grid.dataset.limit) filtered = filtered.slice(0, parseInt(grid.dataset.limit, 10));
  if (!filtered.length) {
    grid.innerHTML = `<div class="dir-empty"><p>Không có kết quả phù hợp.</p><p>Thử bỏ bộ lọc hoặc tìm từ khóa khác.</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(m => renderMemberCard(m, isPrivileged())).join("");
}

function renderDirectoryInner() {
  const grid = $("dir-grid-inner");
  if (!grid) return;
  grid.innerHTML = MEMBERS.slice(0, 6).map(m => renderMemberCard(m, true)).join("");
}

function setupDirectory() {
  const searchInput = $("dir-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.dirQuery = searchInput.value;
      renderDirectory();
    });
  }

  $$("[data-cat]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.dirCategory = btn.dataset.cat;
      $$("[data-cat]").forEach(b => b.classList.toggle("active", b.dataset.cat === state.dirCategory));
      renderDirectory();
    });
  });

  // Delegation for member cards (public grid + inner grid)
  document.addEventListener("click", e => {
    const profileBtn = e.target.closest("[data-view-profile]");
    const connectBtn = e.target.closest("[data-connect]");

    if (profileBtn) {
      const m = MEMBERS.find(x => x.id === profileBtn.dataset.viewProfile);
      if (m) openProfileDialog(m);
    }
    if (connectBtn) {
      if (!isPrivileged()) {
        toast("Cần đăng nhập hội viên để gửi yêu cầu kết nối.", "error");
        openDialog("login-dialog");
        return;
      }
      const m = MEMBERS.find(x => x.id === connectBtn.dataset.connect);
      toast(`Đã ghi nhận yêu cầu kết nối với ${m?.name ?? "hội viên"}.`, "success");
    }
  });
}

function openProfileDialog(m) {
  const content = $("profile-dialog-content");
  if (!content) return;
  const full = isPrivileged();
  const webHref = m.website
    ? (/^https?:\/\//i.test(m.website) ? m.website : (m.website.includes('.') ? 'https://' + m.website : m.website))
    : "";
  content.innerHTML = `
    <div class="profile-dialog-body">
      <div class="profile-dialog-top">
        ${m.logo ? `<img src="${escapeHtml(m.logo)}" class="member-logo large" alt="${escapeHtml(m.name)}" style="object-fit:contain;padding:4px;background:#fff;">` : `<span class="member-logo large" aria-hidden="true">${escapeHtml(m.short)}</span>`}
        <div>
          <h3>${escapeHtml(m.name)}</h3>
          <span class="badge badge-default">${escapeHtml(m.category)}</span>
          <span class="badge ${(m.status === "approved" || m.status === "active") ? "badge-green" : "badge-yellow"}">${escapeHtml(m.statusLabel)}</span>
        </div>
      </div>
      <p>${escapeHtml(m.summary)}</p>
      <dl class="profile-dl">
        <div><dt>Lĩnh vực</dt><dd>${escapeHtml(m.category)}</dd></div>
        <div><dt>Tags</dt><dd>${m.tags.map(t => `<span class="badge badge-default">${escapeHtml(t)}</span>`).join(" ")}</dd></div>
        <div><dt>Năng lực</dt><dd>${escapeHtml(m.capabilities)}</dd></div>
        <div><dt>Email</dt><dd>${full ? `<a href="mailto:${escapeHtml(m.contact)}">${escapeHtml(m.contact)}</a>` : "<em>Chỉ hiện với hội viên</em>"}</dd></div>
        <div><dt>Điện thoại</dt><dd>${full ? escapeHtml(m.phone) : "<em>Chỉ hiện với hội viên</em>"}</dd></div>
        ${m.website ? `<div><dt>Website</dt><dd><a href="${escapeHtml(webHref)}" target="_blank" rel="noopener">${escapeHtml(m.website)}</a></dd></div>` : ""}
      </dl>
      ${full ? `<button class="btn btn-primary" type="button" data-connect="${m.id}">Gửi yêu cầu kết nối</button>` : `<button class="btn btn-secondary" type="button" data-open-login>Đăng nhập để kết nối</button>`}
    </div>`;
  openDialog("profile-dialog");
}

// ── EVENTS ────────────────────────────────────────────────

function eventStatusMeta(ev) {
  const isPast = ev.status === "ended" || ev.status === "past";
  const statusClass = ev.status === "open"
    ? "badge-green"
    : (ev.status === "upcoming" || ev.status === "coming")
      ? "badge-yellow"
      : "badge-default";
  return { isPast, statusClass };
}

function renderEventCard(ev) {
  const regPct = ev.capacity ? Math.round((ev.registered / ev.capacity) * 100) : 0;
  const { isPast, statusClass } = eventStatusMeta(ev);

  return `
    <article class="event-card" data-event-id="${ev.id}">
      <div class="event-card-top">
        <div class="event-date-chip tnum">
          <span class="event-day">${ev.day}</span>
          <span class="event-month">${ev.month}</span>
          <span class="event-year">${ev.year}</span>
        </div>
        <span class="badge ${statusClass}">${escapeHtml(ev.statusLabel)}</span>
      </div>
      <div class="event-card-body">
        <h3>${escapeHtml(ev.title)}</h3>
        <p class="event-meta">${escapeHtml(ev.location)}</p>
        <p>${escapeHtml(ev.summary)}</p>
        ${ev.capacity ? `
        <div class="event-reg-bar">
          <div class="event-reg-fill" style="width:${regPct}%"></div>
        </div>
        <p class="event-reg-label tnum">${ev.registered} / ${ev.capacity} đăng ký</p>` : ""}
      </div>
      <footer class="event-card-footer">
        <button class="btn btn-primary btn-sm" type="button" data-register-event="${ev.id}">
          ${isPast ? "Xem chi tiết" : "Đăng ký tham dự"}
        </button>
        <button class="btn btn-ghost btn-sm" type="button" data-event-detail="${ev.id}">Chi tiết</button>
      </footer>
    </article>`;
}

function renderEvents() {
    const grid = $("event-grid");
    if (!grid) return;
    let filtered = state.eventFilter === "all" ? EVENTS : EVENTS.filter(e => e.status === state.eventFilter);
    if (grid.dataset.limit) filtered = filtered.slice(0, parseInt(grid.dataset.limit, 10));
    
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="dir-empty"><p>Không có sự kiện nào.</p></div>';
    } else {
        grid.innerHTML = filtered.map(e => renderEventCard(e)).join("");
    }
  }

function setupEvents() {
  $$("[data-event-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.eventFilter = btn.dataset.eventFilter;
      $$("[data-event-filter]").forEach(b => b.classList.toggle("active", b.dataset.eventFilter === state.eventFilter));
      renderEvents();
    });
  });

  document.addEventListener("click", e => {
    const regBtn = e.target.closest("[data-register-event]");
    const detailBtn = e.target.closest("[data-event-detail]");

    if (regBtn) {
      const ev = EVENTS.find(x => x.id === regBtn.dataset.registerEvent);
      if (!ev) return;
      if (eventStatusMeta(ev).isPast) {
        openEventDetail(ev);
        return;
      }
      toast(`Đã tạo đăng ký mẫu cho: ${ev.title}. QR check-in sẽ gửi qua email.`, "success");
      if (!isPrivileged()) openDialog("login-dialog");
    }

    if (detailBtn) {
      const ev = EVENTS.find(x => x.id === detailBtn.dataset.eventDetail);
      if (ev) openEventDetail(ev);
    }
  });
}

function openEventDetail(ev) {
  const content = $("event-dialog-content");
  if (!content) return;
  const { isPast, statusClass } = eventStatusMeta(ev);
  content.innerHTML = `
    <div class="event-detail-body">
      <div class="event-detail-top">
        <div class="event-date-chip tnum large">
          <span class="event-day">${ev.day}</span>
          <span class="event-month">${ev.month}</span>
          <span class="event-year">${ev.year}</span>
        </div>
        <div>
          <h3>${escapeHtml(ev.title)}</h3>
          <p>${escapeHtml(ev.location)}</p>
          <span class="badge ${statusClass}">${escapeHtml(ev.statusLabel)}</span>
        </div>
      </div>
      <p>${escapeHtml(ev.detail)}</p>
      ${ev.capacity ? `<p class="tnum">Số chỗ: ${ev.registered} / ${ev.capacity}</p>` : ""}
      ${!isPast ? `<button class="btn btn-primary" type="button" data-register-event="${ev.id}">Đăng ký tham dự</button>` : ""}
    </div>`;
  openDialog("event-dialog");
}

// ── NEWS ──────────────────────────────────────────────────

function renderNewsCard(n) {
  return `
    <article class="news-card" onclick="window.location.href='news-detail.html?id=${n.id}'" style="cursor: pointer;">
      <div class="news-card-img" style="background:${n.img ? 'url(' + n.img + ') center/cover' : n.artBg}" aria-hidden="true">
        <span class="news-cat-overlay">${escapeHtml(n.catLabel)}</span>
      </div>
      <div class="news-card-body">
        <time class="news-time tnum" datetime="${n.date}">${n.date.split("-").reverse().join("/")}</time>
        <h3 class="news-card-title">${escapeHtml(n.title)}</h3>
        <p class="news-card-excerpt">${escapeHtml(n.excerpt)}</p>
        <a href="news-detail.html?id=${n.id}" class="btn btn-ghost btn-sm">Xem thêm →</a>
      </div>
    </article>`;
}

function renderNews() {
  const grid = $("news-grid");
  if (!grid) return;
  let filtered = state.newsCat === "all" ? NEWS : NEWS.filter(n => n.cat === state.newsCat);
  if (grid.dataset.limit) filtered = filtered.slice(0, parseInt(grid.dataset.limit, 10));
  grid.innerHTML = filtered.length
    ? filtered.map(n => renderNewsCard(n)).join("")
    : `<div class="dir-empty"><p>Chưa có tin tức trong danh mục này.</p></div>`;
}

function setupNews() {
  $$("[data-news-cat]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.newsCat = btn.dataset.newsCat;
      $$("[data-news-cat]").forEach(b => b.classList.toggle("active", b.dataset.newsCat === state.newsCat));
      renderNews();
    });
  });
}

// ── DOCUMENTS ─────────────────────────────────────────────

function renderDocs() {
  const main = $("docs-main");
  if (!main) return;
  const filtered = state.docsCat === "all" ? DOCS : DOCS.filter(d => d.access === state.docsCat);
  const canDownload = doc => {
    if (doc.access === "public") return true;
    if (doc.access === "member") return isPrivileged();
    if (doc.access === "admin") return isAdmin();
    return false;
  };
  main.innerHTML = filtered.map(d => `
    <div class="doc-item">
      <span class="doc-icon">${escapeHtml(d.type)}</span>
      <div class="doc-info">
        <strong>${escapeHtml(d.name)}</strong>
        <small class="tnum">${d.date.split("-").reverse().join("/")}</small>
      </div>
      <span class="badge ${d.access === "public" ? "badge-green" : d.access === "admin" ? "badge-red" : "badge-blue"}">${escapeHtml(d.accessLabel)}</span>
      ${canDownload(d)
        ? `<button class="btn btn-primary btn-sm" type="button" data-download-doc="${d.id}">Tải xuống</button>`
        : `<button class="btn btn-ghost btn-sm" type="button" data-open-login>Đăng nhập</button>`}
    </div>`).join("") || `<div class="dir-empty"><p>Không có tài liệu trong danh mục này.</p></div>`;
}

function setupDocs() {
  $$("[data-docs-cat]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.docsCat = btn.dataset.docsCat;
      $$("[data-docs-cat]").forEach(b => b.classList.toggle("active", b.dataset.docsCat === state.docsCat));
      renderDocs();
    });
  });

  document.addEventListener("click", e => {
    const dlBtn = e.target.closest("[data-download-doc]");
    if (!dlBtn) return;
    const id = dlBtn.dataset.downloadDoc;
    const doc = DOCS.find(d => d.id === id);
    if (!doc) {
      toast("Đã ghi audit log tải tài liệu mẫu.", "success");
      return;
    }
    if (doc.access === "member" && !isPrivileged()) {
      toast("Tài liệu này yêu cầu tài khoản hội viên.", "error");
      openDialog("login-dialog");
      return;
    }
    if (doc.access === "admin" && !isAdmin()) {
      toast("Tài liệu này chỉ dành cho Admin.", "error");
      openDialog("login-dialog");
      return;
    }
    toast(`Đã ghi audit log: Tải "${doc.name}".`, "success");
    if (doc.url && doc.url !== '#') {
      window.open(doc.url, '_blank', 'noopener');
    }
  });
}

// ── JOIN FORM ─────────────────────────────────────────────

function setupJoinForm() {
  const form = $("join-form");
  if (!form) return;

  const steps = Array.from($$(".form-step"));
  const dots = Array.from($$("[data-step-indicator]"));
  const statusEl = $("join-status");
  const prevBtn = $("btn-prev");
  const nextBtn = $("btn-next");
  const draftBtn = $("btn-draft");
  const review = $("review-panel");
  let proceedTimer;

  // Save hint texts
  $$(".field-hint").forEach(h => { h.dataset.orig = h.textContent; });

  function goToStep(n) {
    state.joinStep = Math.max(0, Math.min(n, steps.length - 1));
    steps.forEach((s, i) => s.classList.toggle("active", i === state.joinStep));
    dots.forEach((d, i) => {
      d.classList.toggle("active", i === state.joinStep);
      d.classList.toggle("done", i < state.joinStep);
    });
    prevBtn.disabled = state.joinStep === 0;
    nextBtn.textContent = state.joinStep === steps.length - 1 ? "Gửi hồ sơ" : "Tiếp theo →";
    if (statusEl) statusEl.textContent = state.joinStep === steps.length - 1 ? "Kiểm tra lại thông tin trước khi gửi." : "";
    updateReview();
    steps[state.joinStep]?.querySelector("input, select, textarea")?.focus();
  }

  function validateField(field) {
    const wrap = field.closest(".field");
    if (!wrap) return true;
    const hint = wrap.querySelector(".field-hint");
    wrap.classList.remove("has-error", "has-success");
    field.removeAttribute("aria-invalid");
    if (field.value && !field.checkValidity()) {
      wrap.classList.add("has-error");
      field.setAttribute("aria-invalid", "true");
      if (hint) hint.textContent = "Thông tin chưa hợp lệ — kiểm tra định dạng.";
      return false;
    } else if (field.value && field.checkValidity()) {
      wrap.classList.add("has-success");
      if (hint && hint.dataset.orig) hint.textContent = hint.dataset.orig;
      return true;
    }
    if (hint && hint.dataset.orig) hint.textContent = hint.dataset.orig;
    return true;
  }

  function currentStepFields() {
    return Array.from(form.querySelectorAll(`.form-step[data-step="${state.joinStep}"] input, .form-step[data-step="${state.joinStep}"] select, .form-step[data-step="${state.joinStep}"] textarea`));
  }

  function currentStepValid() {
    return currentStepFields().every(f => f.checkValidity());
  }

  function maybeAutoProceed() {
    clearTimeout(proceedTimer);
    if (currentStepValid() && state.joinStep < steps.length - 1) {
      if (statusEl) statusEl.textContent = "Dữ liệu hợp lệ — chuyển bước tiếp theo…";
      proceedTimer = setTimeout(() => goToStep(state.joinStep + 1), 600);
    }
  }

  function updateReview() {
    if (!review || state.joinStep !== steps.length - 1) return;
    const fd = new FormData(form);
    const get = k => fd.get(k) || "—";
    review.innerHTML = `
      <dl class="review-dl">
        <div><dt>Tên công ty</dt><dd>${escapeHtml(get("company"))}</dd></div>
        <div><dt>Mã số thuế</dt><dd>${escapeHtml(get("tax"))}</dd></div>
        <div><dt>Địa chỉ</dt><dd>${escapeHtml(get("address") || "—")}</dd></div>
        <div><dt>Người đại diện</dt><dd>${escapeHtml(get("representative"))}</dd></div>
        <div><dt>Email</dt><dd>${escapeHtml(get("email"))}</dd></div>
        <div><dt>Điện thoại</dt><dd>${escapeHtml(get("phone"))}</dd></div>
        <div><dt>Lĩnh vực</dt><dd>${escapeHtml(get("category"))}</dd></div>
        <div><dt>Năng lực</dt><dd>${escapeHtml(get("capability"))}</dd></div>
      </dl>`;
  }

  form.addEventListener("input", e => {
    if (e.target.matches("input, select, textarea")) {
      validateField(e.target);
      maybeAutoProceed();
      updateReview();
    }
  });
  form.addEventListener("blur", e => {
    if (e.target.matches("input, select, textarea")) validateField(e.target);
  }, true);

  if (prevBtn) prevBtn.addEventListener("click", () => goToStep(state.joinStep - 1));
  if (draftBtn) draftBtn.addEventListener("click", () => toast("Bản nháp đã được lưu trong trình duyệt mẫu.", "success"));

  form.addEventListener("submit", e => {
      e.preventDefault();
      currentStepFields().forEach(validateField);
      if (!form.checkValidity()) {
        if (statusEl) statusEl.textContent = "⚠ Các trường chưa hợp lệ. Kiểm tra lại.";
        toast("Hồ sơ chưa đủ thông tin để gửi.", "error");
        return;
      }
      sendWithEmailJS(form, () => {
        if (statusEl) statusEl.textContent = "✔ Hồ sơ đã được gửi tới Ban thư ký CAA.";
        toast("Đã gửi hồ sơ hội viên. Ban thư ký sẽ liên hệ sớm.", "success");
        form.reset();
        $(".field").forEach(f => f.classList.remove("has-error", "has-success"));
        goToStep(0);
      });
    });

  goToStep(0);
}

// ── MEMBER PORTAL TABS ────────────────────────────────────

function setupPortalTabs() {
  $$("[data-portal-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.portalTab = btn.dataset.portalTab;
      $$("[data-portal-tab]").forEach(b => {
        b.classList.toggle("active", b.dataset.portalTab === state.portalTab);
        b.setAttribute("aria-selected", String(b.dataset.portalTab === state.portalTab));
      });
      $$("[data-portal-panel]").forEach(p => {
        p.classList.toggle("active", p.dataset.portalPanel === state.portalTab);
      });
      if (state.portalTab === "directory-inner") renderDirectoryInner();
    });
  });

  const profileAction = document.querySelector("[data-profile-action]");
  if (profileAction) profileAction.addEventListener("click", () => toast("Mở trình cập nhật hồ sơ doanh nghiệp mẫu.", "success"));
}

// ── ADMIN TABS ────────────────────────────────────────────

function setupAdminTabs() {
  $$("[data-admin-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.adminTab = btn.dataset.adminTab;
      $$("[data-admin-tab]").forEach(b => b.classList.toggle("active", b.dataset.adminTab === state.adminTab));
      $$("[data-admin-panel]").forEach(p => p.classList.toggle("active", p.dataset.adminPanel === state.adminTab));
    });
  });

  $$("[data-approve]").forEach(btn => {
    btn.addEventListener("click", () => {
      const row = btn.closest("tr");
      const badge = row?.querySelector(".badge");
      if (badge) { badge.textContent = "Đã duyệt"; badge.className = "badge badge-green"; }
      btn.disabled = true; btn.textContent = "Đã xử lý";
      toast("Hồ sơ mẫu đã được phê duyệt.", "success");
    });
  });

  $$("[data-request-info]").forEach(btn => {
    btn.addEventListener("click", () => toast("Đã gửi email yêu cầu bổ sung hồ sơ mẫu.", "success"));
  });

  // Media pipeline
  const mediaUpload = document.querySelector("[data-media-upload]");
  const pipelineSteps = Array.from($$("[data-pipeline-step]"));
  if (mediaUpload) {
    mediaUpload.addEventListener("change", () => {
      pipelineSteps.forEach(s => s.classList.remove("done", "active"));
      if (!mediaUpload.files.length) return;
      const filename = mediaUpload.files[0].name;
      pipelineSteps.forEach((step, i) => {
        setTimeout(() => {
          pipelineSteps.forEach(s => s.classList.remove("active"));
          step.classList.add("active");
          if (i === 0) step.textContent = `✔ Đã nhận file: ${filename}`;
          if (i > 0) step.classList.add("done");
          if (i === pipelineSteps.length - 1) {
            step.classList.add("done");
            toast("Media đã qua pipeline xử lý mẫu.", "success");
          }
        }, 400 * (i + 1));
      });
    });
  }

  // Quick actions
  $$(".quick-actions-grid .btn").forEach(btn => {
    btn.addEventListener("click", () => toast(`${btn.textContent} — tính năng sẽ có trong CMS thực.`, "info"));
  });
}

// ── QR CHECK-IN ───────────────────────────────────────────

function setupCheckin() {
  const form = $("checkin-form");
  const result = $("checkin-result");
  const resetBtn = $("checkin-reset");
  if (!form || !result) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const code = new FormData(form).get("qr")?.trim().toUpperCase() ?? "";
    result.className = "checkin-result";

    if (!code) {
      result.textContent = "Vui lòng nhập mã QR.";
      result.classList.add("result-invalid");
      return;
    }

    const entry = QR_CODES[code];
    if (!entry) {
      result.textContent = `✗ Mã "${code}" không tìm thấy trong danh sách sự kiện.`;
      result.classList.add("result-invalid");
      toast("Không tìm thấy mã QR trong hệ thống.", "error");
      return;
    }

    if (!entry.valid || state.checkedInCodes.has(code)) {
      result.textContent = `✗ Mã "${code}" đã được check-in trước đó. (${entry.name} · ${entry.event})`;
      result.classList.add("result-used");
      toast("Mã QR này đã được sử dụng.", "error");
      return;
    }

    state.checkedInCodes.add(code);
    result.textContent = `✔ Check-in thành công! ${entry.name} · ${entry.event}`;
    result.classList.add("result-valid");
    toast("Check-in thành công.", "success");
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.checkedInCodes.clear();
      form.reset();
      result.textContent = "";
      result.className = "checkin-result";
      toast("Demo QR check-in đã được reset.", "info");
    });
  }
}

// ── CONTACT FORM ──────────────────────────────────────────

function setupContactForm() {
  const form = $("contact-form");
  const statusEl = $("contact-status");
  if (!form) return;

  $$(".field-hint").forEach(h => { if (!h.dataset.orig) h.dataset.orig = h.textContent; });

  form.addEventListener("blur", e => {
    if (!e.target.matches("input, select, textarea")) return;
    const wrap = e.target.closest(".field");
    if (!wrap) return;
    const hint = wrap.querySelector(".field-hint");
    wrap.classList.remove("has-error", "has-success");
    if (e.target.value && !e.target.checkValidity()) {
      wrap.classList.add("has-error");
      if (hint) hint.textContent = "Thông tin chưa hợp lệ.";
    } else if (e.target.value) {
      wrap.classList.add("has-success");
      if (hint?.dataset.orig) hint.textContent = hint.dataset.orig;
    }
  }, true);

  
}

// ── NEWSLETTER ────────────────────────────────────────────

function setupNewsletter() {
  const form = $("newsletter-form");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const emailInput = $("nl-email");
    if (!emailInput?.checkValidity()) {
      toast("Email chưa hợp lệ.", "error");
      return;
    }
    toast("Đã ghi nhận email nhận bản tin mẫu.", "success");
    form.reset();
  });
}

// ── SEARCH ────────────────────────────────────────────────

function renderSearch(q = "") {
  const results = $("search-results");
  if (!results) return;
  const query = q.trim().toLocaleLowerCase("vi");
  const matches = SEARCH_INDEX
    .filter(item => !query || `${item.label} ${item.type}`.toLocaleLowerCase("vi").includes(query))
    .slice(0, 8);
  results.innerHTML = matches.map(item => `
    <a class="search-result-item" href="${item.href}">
      <strong>${escapeHtml(item.label)}</strong>
      <span class="badge badge-default">${escapeHtml(item.type)}</span>
    </a>`).join("") || `<p class="search-empty">Không tìm thấy kết quả.</p>`;
}

function setupSearch() {
  $$("[data-open-search]").forEach(btn => {
    btn.addEventListener("click", () => {
      renderSearch();
      openDialog("search-dialog");
      setTimeout(() => $("search-input")?.focus(), 50);
    });
  });

  document.addEventListener("keydown", e => {
    if (e.key === "/" && !e.target.matches("input, textarea, select")) {
      e.preventDefault();
      renderSearch();
      openDialog("search-dialog");
      setTimeout(() => $("search-input")?.focus(), 50);
    }
  });

  $("search-input")?.addEventListener("input", () => renderSearch($("search-input").value));

  $("search-results")?.addEventListener("click", e => {
    if (e.target.closest("a")) $("search-dialog")?.close?.();
  });
}

// ── LOGIN / ROLE ───────────────────────────────────────────

function setupRoleControls() {
  // Tự động kiểm tra session khi load trang
  (async () => {
    const res = await window.apiCall('auth.php', { action: 'check_session' });
    if (res && res.success) {
      setRole(res.role);
    }
  })();

  // =========================================================================
  // MULTI-VIEW AUTHENTICATION FLOW
  // =========================================================================
  const loginDialog = $("login-dialog");
  if (loginDialog) {
    const views = {
      login: $("view-login"),
      register: $("view-register"),
      forgot: $("view-forgot"),
      otp: $("view-otp")
    };
    const authLabel = $("auth-label");

    function switchAuthView(viewId, label) {
      Object.values(views).forEach(v => { if (v) v.style.display = 'none'; });
      if (views[viewId]) views[viewId].style.display = 'block';
      if (authLabel) authLabel.textContent = label;
    }

    loginDialog.querySelectorAll(".auth-link").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        const target = e.target.dataset.goto;
        if (target === 'login') switchAuthView('login', 'Đăng nhập');
        if (target === 'register') switchAuthView('register', 'Đăng ký');
        if (target === 'forgot') switchAuthView('forgot', 'Quên mật khẩu');
      });
    });

    // ĐĂNG KÝ
    if (views.register) {
      views.register.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = $("reg-email").value;
        const pass = views.register.querySelector("input[type='password']").value;
        const btn = views.register.querySelector("button[type='submit']");
        
        btn.disabled = true;
        btn.textContent = "Đang xử lý...";
        
        const res = await window.apiCall('auth.php', { action: 'register', email, password: pass });
        if (res.success) {
          sendOTPWithEmailJS(email, res.otp, (sent) => {
            toast(sent ? "Đã gửi mã! Nếu không nhận được, vui lòng kiểm tra xem có gõ sai email không." : "Lỗi gửi OTP, vui lòng thử lại.", sent ? "success" : "error");
            $("otp-target-email").textContent = email;
            views.otp.dataset.otpMode = 'register';
            switchAuthView('otp', 'Xác minh Email');
          });
        } else if (res.action === 'redirect_login') {
          let msgEl = views.register.querySelector('.auth-error-msg');
          if (!msgEl) {
            msgEl = document.createElement('p');
            msgEl.className = 'auth-error-msg';
            msgEl.style.cssText = 'color:var(--c-red);font-size:var(--t-sm);margin-top:0.5rem;text-align:center;';
            views.register.querySelector("button[type='submit']").after(msgEl);
          }
          msgEl.innerHTML = `${res.message} <a href="#" style="font-weight:700;color:var(--c-red);text-decoration:underline;">Đăng nhập ngay →</a>`;
          msgEl.querySelector('a').onclick = (ev) => { ev.preventDefault(); switchAuthView('login', 'Đăng nhập'); };
        } else {
          toast(res.message, "error");
        }
        btn.disabled = false;
        btn.textContent = "Đăng ký";
      });
    }

    // OTP (dùng chung cho Đăng ký và Quên mật khẩu)
    if (views.otp) {
      views.otp.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = $("otp-target-email").textContent;
        const otp = $("otp-code").value;
        const btn = views.otp.querySelector("button[type='submit']");
        const mode = views.otp.dataset.otpMode || 'register';
        const newPass = $("reset-pass")?.value || '';
        
        btn.disabled = true;
        btn.textContent = "Đang xác thực...";

        let res;
        if (mode === 'forgot') {
          res = await window.apiCall('auth.php', { action: 'reset_password', email, otp, new_password: newPass });
        } else {
          res = await window.apiCall('auth.php', { action: 'verify_otp', email, otp });
        }

        if (res.success) {
          toast(res.message, "success");
          if ($("reset-password-fields")) $("reset-password-fields").style.display = 'none';
          if ($("reset-pass")) $("reset-pass").required = false;
          views.otp.dataset.otpMode = 'register';
          switchAuthView('login', 'Đăng nhập');
        } else {
          toast(res.message, "error");
        }
        btn.disabled = false;
        btn.textContent = "Xác nhận";
      });
    }

    // QUÊN MẬT KHẨU
    if (views.forgot) {
      views.forgot.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = $("forgot-email").value;
        const btn = views.forgot.querySelector("button[type='submit']");
        
        btn.disabled = true;
        btn.textContent = "Đang kiểm tra...";

        const res = await window.apiCall('auth.php', { action: 'forgot_password', email });
        if (res.success) {
          sendOTPWithEmailJS(email, res.otp, (sent) => {
            toast(sent ? "Đã gửi mã! Nếu không nhận được, vui lòng kiểm tra xem có gõ sai email không." : "Lỗi gửi email.", sent ? "success" : "error");
            $("otp-target-email").textContent = email;
            const resetFields = $("reset-password-fields");
            if (resetFields) resetFields.style.display = 'flex';
            if ($("reset-pass")) $("reset-pass").required = true;
            views.otp.dataset.otpMode = 'forgot';
            switchAuthView('otp', 'Đặt lại mật khẩu');
          });
        } else {
          toast(res.message, "error");
        }
        btn.disabled = false;
        btn.textContent = "Gửi mã khôi phục";
      });
    }

    // ĐĂNG NHẬP
    if (views.login) {
      views.login.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = $("login-email").value;
        const pass = $("login-pass").value;
        const btn = views.login.querySelector("button[type='submit']");
        
        btn.disabled = true;
        btn.textContent = "Đang kết nối...";

        const res = await window.apiCall('auth.php', { action: 'login', email, password: pass });
        if (res.success) {
          toast(res.message, "success");
          setRole(res.role);
          localStorage.setItem("caa-email", res.email);
          $$("[data-login-label]").forEach(el => el.textContent = res.email);
          loginDialog.close();
        } else {
          toast(res.message, "error");
        }
        btn.disabled = false;
        btn.textContent = "Đăng nhập";
      });
    }

    const closeBtn = loginDialog.querySelector('.dialog-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        loginDialog.close();
        setTimeout(() => switchAuthView('login', 'Đăng nhập'), 300);
      });
    }
  }

  // ĐĂNG XUẤT
  document.body.addEventListener("click", async (e) => {
    if (e.target.closest("[data-logout]")) {
      const res = await window.apiCall('auth.php', { action: 'logout' });
      if (res.success) {
        localStorage.removeItem("caa-role");
        localStorage.removeItem("caa-email");
        setRole("guest");
        toast("Đã đăng xuất thành công.", "success");
      }
    }
  });

  const saved = localStorage.getItem("caa-role");
  if (saved && ["guest", "member", "admin"].includes(saved)) { setRole(saved === "admin" ? "member" : saved); }

  document.body.addEventListener("click", e => {
    if (e.target.closest("[data-open-login]")) {
      openDialog("login-dialog");
    }
  });
}

// ── NAV SCROLL BEHAVIOR ───────────────────────────────────

function setupNavScroll() {
  const nav = document.querySelector(".nav");
  if (!nav) return;
  let lastY = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("nav--scrolled", y > 48);
    nav.classList.toggle("nav--hidden", y > lastY + 4 && y > 200);
    nav.classList.remove("nav--hidden");  // keep visible for simplicity
    lastY = y;
  }, { passive: true });
}

// ── INIT ──────────────────────────────────────────────────


  

  // =========================================================================
  // DATABASE & CMS API (PHP BACKEND SKELETON)
  // =========================================================================
  const dbAPI = {
    submitApplication: async (data) => {
      data.action = 'submit_application';
      return await window.apiCall('public.php', data);
    },
    getApplications: async () => {
      const res = await window.apiCall('admin.php?action=get_applications', {}, 'GET');
      return res.data || [];
    },
    submitContact: async (data) => {
      data.action = 'submit_contact';
      return await window.apiCall('public.php', data);
    },
    getContacts: async () => {
      const res = await window.apiCall('admin.php?action=get_contacts', {}, 'GET');
      return res.data || [];
    },
    getUsers: async () => {
      const res = await window.apiCall('admin.php?action=get_users', {}, 'GET');
      return res.data || [];
    },
    updateUserRole: async (uid, role) => {
      return await window.apiCall('admin.php', { action: 'update_user_role', id: uid, role: role });
    },
    createArticle: async (data) => {
      data.action = 'create_article';
      return await window.apiCall('admin.php', data);
    },
    getArticles: async () => {
      const res = await window.apiCall('public.php?action=get_articles', {}, 'GET');
      return res.data || [];
    }
  };

  // Cập nhật Submit Form Liên hệ để lưu vào Database
  const contactForm = $("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        toast("Vui lòng điền đầy đủ thông tin.", "error");
        return;
      }
      
      const formData = {
        name: $("c-name").value,
        email: $("c-email").value,
        subject: $("c-subject").value,
        message: $("c-msg").value
      };

      try {
        await dbAPI.submitContact(formData); // Lưu vào DB
        sendWithEmailJS(contactForm, () => {
          const statusEl = $("contact-status");
          if (statusEl) statusEl.textContent = "✔ Đã ghi nhận. Ban thư ký sẽ phản hồi trong 1-2 ngày làm việc.";
          toast("Gửi liên hệ thành công.", "success");
          contactForm.reset();
        });
      } catch (err) {
        toast("Lỗi gửi liên hệ: " + err.message, "error");
      }
    });
  }

  // Cập nhật Submit Form Gia nhập để lưu vào Database
  const joinForm = $("join-form");
  if (joinForm) {
    joinForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!joinForm.checkValidity()) {
        toast("Hồ sơ chưa đủ thông tin để gửi.", "error");
        return;
      }

      const formData = {
        company: $("f-company").value,
        tax: $("f-tax").value,
        email: $("f-email").value,
        phone: $("f-phone").value,
        website: $("f-website").value,
        category: $("f-cat").value
      };

      try {
        await dbAPI.submitApplication(formData); // Lưu vào DB
        sendWithEmailJS(joinForm, () => {
          toast("Đã gửi hồ sơ hội viên thành công.", "success");
          joinForm.reset();
          goToStep(0);
        });
      } catch (err) {
        toast("Lỗi gửi hồ sơ: " + err.message, "error");
      }
    });
  }


async function init() {
  await fetchData();


  // Floating Contact Toggle
  document.addEventListener("click", e => {
    const fcToggle = e.target.closest(".fc-toggle");
    const widget = document.getElementById("floating-contact");
    if (fcToggle) {
      widget.classList.toggle("is-active");
    } else if (widget && !e.target.closest(".floating-contact")) {
      widget.classList.remove("is-active");
    }
  });

  document.body.dataset.role = "guest";

  setupRoleControls();
  setupMegaMenu();
  setupMobileMenu();
  setupNavScroll();
  setupScrollReveal();
  setupDirectory();
  setupEvents();
  setupNews();
  setupDocs();
  setupJoinForm();
  setupPortalTabs();
  setupAdminTabs();
  setupCheckin();
  setupContactForm();
  setupNewsletter();
  setupSearch();

  // Initial renders
  renderDirectory();
  renderEvents();
  renderNews();
  renderDocs();
  renderRoleGates();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Autocomplete
const HANOI_UNITS = [
  "Phường Ba Đình",
  "Phường Ngọc Hà",
  "Phường Giảng Võ",
  "Phường Hoàn Kiếm",
  "Phường Cửa Nam",
  "Phường Phú Thượng",
  "Phường Hồng Hà",
  "Phường Tây Hồ",
  "Phường Bồ Đề",
  "Phường Việt Hưng",
  "Phường Phúc Lợi",
  "Phường Long Biên",
  "Phường Nghĩa Đô",
  "Phường Cầu Giấy",
  "Phường Yên Hoà",
  "Phường Ô Chợ Dừa",
  "Phường Láng",
  "Phường Văn Miếu - Quốc Tử Giám",
  "Phường Kim Liên",
  "Phường Đống Đa",
  "Phường Hai Bà Trưng",
  "Phường Vĩnh Tuy",
  "Phường Bạch Mai",
  "Phường Vĩnh Hưng",
  "Phường Định Công",
  "Phường Tương Mai",
  "Phường Lĩnh Nam",
  "Phường Hoàng Mai",
  "Phường Hoàng Liệt",
  "Phường Yên Sở",
  "Phường Phương Liệt",
  "Phường Khương Đình",
  "Phường Thanh Xuân",
  "Xã Sóc Sơn",
  "Xã Kim Anh",
  "Xã Trung Giã",
  "Xã Đa Phúc",
  "Xã Nội Bài",
  "Xã Đông Anh",
  "Xã Phúc Thịnh",
  "Xã Thư Lâm",
  "Xã Thiên Lộc",
  "Xã Vĩnh Thanh",
  "Xã Phù Đổng",
  "Xã Thuận An",
  "Xã Gia Lâm",
  "Xã Bát Tràng",
  "Phường Từ Liêm",
  "Phường Thượng Cát",
  "Phường Đông Ngạc",
  "Phường Xuân Đỉnh",
  "Phường Tây Tựu",
  "Phường Phú Diễn",
  "Phường Xuân Phương",
  "Phường Tây Mỗ",
  "Phường Đại Mỗ",
  "Xã Thanh Trì",
  "Phường Thanh Liệt",
  "Xã Đại Thanh",
  "Xã Ngọc Hồi",
  "Xã Nam Phù",
  "Xã Yên Xuân",
  "Xã Quang Minh",
  "Xã Yên Lãng",
  "Xã Tiến Thắng",
  "Xã Mê Linh",
  "Phường Kiến Hưng",
  "Phường Hà Đông",
  "Phường Yên Nghĩa",
  "Phường Phú Lương",
  "Phường Sơn Tây",
  "Phường Tùng Thiện",
  "Xã Đoài Phương",
  "Xã Quảng Oai",
  "Xã Cổ Đô",
  "Xã Minh Châu",
  "Xã Vật Lại",
  "Xã Bất Bạt",
  "Xã Suối Hai",
  "Xã Ba Vì",
  "Xã Yên Bài",
  "Xã Phúc Thọ",
  "Xã Phúc Lộc",
  "Xã Hát Môn",
  "Xã Đan Phượng",
  "Xã Liên Minh",
  "Xã Ô Diên",
  "Xã Hoài Đức",
  "Xã Dương Hoà",
  "Xã Sơn Đồng",
  "Xã An Khánh",
  "Phường Dương Nội",
  "Xã Quốc Oai",
  "Xã Kiều Phú",
  "Xã Hưng Đạo",
  "Xã Phú Cát",
  "Xã Thạch Thất",
  "Xã Hạ Bằng",
  "Xã Hoà Lạc",
  "Xã Tây Phương",
  "Phường Chương Mỹ",
  "Xã Phú Nghĩa",
  "Xã Xuân Mai",
  "Xã Quảng Bị",
  "Xã Trần Phú",
  "Xã Hoà Phú",
  "Xã Thanh Oai",
  "Xã Bình Minh",
  "Xã Tam Hưng",
  "Xã Dân Hoà",
  "Xã Thường Tín",
  "Xã Hồng Vân",
  "Xã Thượng Phúc",
  "Xã Chương Dương",
  "Xã Phú Xuyên",
  "Xã Phượng Dực",
  "Xã Chuyên Mỹ",
  "Xã Đại Xuyên",
  "Xã Vân Đình",
  "Xã Ứng Thiên",
  "Xã Ứng Hoà",
  "Xã Hoà Xá",
  "Xã Mỹ Đức",
  "Xã Phúc Sơn",
  "Xã Hồng Sơn",
  "Xã Hương Sơn"
];
function initAutocomplete() {
  const input = document.getElementById('f-address');
  const list = document.getElementById('address-list');
  if (!input || !list) return;
  function renderList(query) {
    list.innerHTML = '';
    const filtered = HANOI_UNITS.filter(u => u.toLowerCase().includes(query.toLowerCase()));
    if (filtered.length === 0) { list.hidden = true; return; }
    list.hidden = false;
    filtered.forEach(u => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.textContent = u;
      div.onclick = () => { input.value = u; list.hidden = true; };
      list.appendChild(div);
    });
  }
  input.addEventListener('input', (e) => renderList(e.target.value));
  input.addEventListener('focus', () => renderList(input.value));
  document.addEventListener('click', (e) => { if (e.target !== input && e.target !== list) list.hidden = true; });
}
initAutocomplete();

// ==========================================
// CINEMATIC SCROLL TRIGGER & COUNTER
// ==========================================
function initCinematic() {
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          
          // Trigger count up for stats
          const stats = entry.target.querySelectorAll('.stat-anim');
          stats.forEach((stat, index) => {
             // Delay the count to match the CSS animation delay (1.6s, 1.7s, 1.8s)
             setTimeout(() => {
                const target = parseInt(stat.getAttribute('data-count'), 10);
                const suffix = stat.getAttribute('data-suffix') || '';
                let current = 0;
                // Count up over 1.5 seconds
                const duration = 1500;
                const frameRate = 1000 / 60;
                const totalFrames = Math.round(duration / frameRate);
                const increment = target / totalFrames;
                
                const counter = setInterval(() => {
                   current += increment;
                   if (current >= target) {
                      stat.textContent = target + suffix;
                      clearInterval(counter);
                   } else {
                      stat.textContent = Math.round(current) + suffix;
                   }
                }, frameRate);
             }, 1600 + (index * 100));
          });
          
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 }); // Trigger when 30% is visible
    
    observer.observe(heroVisual);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCinematic);
} else {
  initCinematic();
}

// Handle dialog close buttons natively in JS
document.addEventListener('click', e => {
  const closeBtn = e.target.closest('.dialog-close');
  if (closeBtn) {
    const dialog = closeBtn.closest('dialog');
    if (dialog) dialog.close();
  }
});


  // =========================================================================
  // EmailJS Integration
  // =========================================================================
  if (typeof emailjs !== 'undefined') {
    emailjs.init("DiC2iLy_ckysl-RP0");
  }

  function sendWithEmailJS(formElement, onSuccess) {
    if (typeof emailjs === 'undefined') {
      onSuccess();
      return;
    }
    const btn = formElement.querySelector("button[type='submit']");
    const originalText = btn.textContent;
    btn.textContent = "Đang gửi...";
    btn.disabled = true;

    emailjs.sendForm("service_r6zoijc", "template_wkk2q2n", formElement)
      .then(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        onSuccess();
      })
      .catch((err) => {
        btn.textContent = originalText;
        btn.disabled = false;
        toast("Lỗi gửi EmailJS: " + JSON.stringify(err), "error");
        onSuccess(); // Still succeed locally
      });
  }

  function sendOTPWithEmailJS(email, otp, onSuccess) {
    if (typeof emailjs === 'undefined') {
      onSuccess();
      return;
    }
    const templateParams = {
      email: email,
      otp_code: otp,
      message: "Đây là mã xác thực OTP của bạn."
    };
    
    emailjs.send("service_r6zoijc", "template_9trgqe3", templateParams)
      .then(() => {
        onSuccess(true);
      })
      .catch((err) => {
        toast("Lỗi gửi OTP qua EmailJS: " + JSON.stringify(err), "error");
        onSuccess(false);
      });
  }
