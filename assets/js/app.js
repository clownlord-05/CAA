/* =========================================================
   CAA Website v2 · app.js
   Static prototype — simulates RBAC, B2B directory,
   events, join form, member portal, admin CMS, QR check-in
   ========================================================= */

"use strict";

// ── DATA ──────────────────────────────────────────────────

const MEMBERS = [
  {
    id: "tao-do", short: "TĐ", category: "OOH",
    name: "Công ty CP Đầu tư và Thương mại Táo Đỏ",
    tags: ["OOH", "Media booking", "Sản xuất"],
    summary: "Đơn vị hội viên tiêu biểu trong hệ sinh thái quảng cáo ngoài trời, media booking và nhận diện thương hiệu.",
    contact: "banthuky@taodo.example.vn", phone: "024 0000 0001",
    status: "approved", statusLabel: "Đã xác minh",
    capabilities: "Biển bảng OOH, media booking, sản xuất nhận diện ngoài trời, triển khai chuỗi.",
    website: "https://taodo.example.vn",
  },
  {
    id: "3t", short: "3T", category: "In ấn",
    name: "Công ty Tân Tiến Thành 3T",
    tags: ["In ấn", "POSM", "Vật tư", "Thi công"],
    summary: "Nhà cung cấp in ấn, POSM và vật tư quảng cáo cho chiến dịch quy mô lớn tại Hà Nội.",
    contact: "partner@3t.example.vn", phone: "024 0000 0002",
    status: "approved", statusLabel: "Đã xác minh",
    capabilities: "In khổ lớn, POSM, thi công, vật tư quảng cáo, hỗ trợ triển khai chuỗi.",
    website: "https://3t.example.vn",
  },
  {
    id: "dt-group", short: "DT", category: "Digital",
    name: "DT Group",
    tags: ["Digital", "Media", "Performance", "Social"],
    summary: "Nhóm dịch vụ digital marketing, chiến dịch truyền thông tích hợp và quản trị dữ liệu.",
    contact: "hello@dtgroup.example.vn", phone: "024 0000 0003",
    status: "approved", statusLabel: "Đã xác minh",
    capabilities: "Chiến lược digital, performance marketing, social content, media planning & buying.",
    website: "https://dtgroup.example.vn",
  },
  {
    id: "minh-an", short: "MA", category: "Digital",
    name: "Truyền thông Minh An",
    tags: ["Digital", "Nội dung", "Social", "Branding"],
    summary: "Chuyên sản xuất nội dung số, chiến dịch social và landing page truyền thông cho thương hiệu.",
    contact: "contact@minhan.example.vn", phone: "024 0000 0004",
    status: "pending", statusLabel: "Chờ duyệt",
    capabilities: "Sản xuất nội dung, social campaign, landing page, branding digital.",
  },
  {
    id: "dong-do", short: "ĐĐ", category: "Sự kiện",
    name: "Đông Đô Event",
    tags: ["Sự kiện", "Gala", "Hội thảo", "Check-in"],
    summary: "Tổ chức sự kiện chuyên nghiệp: Gala, hội thảo, triển lãm và vận hành check-in quy mô lớn.",
    contact: "event@dongdo.example.vn", phone: "024 0000 0005",
    status: "need-info", statusLabel: "Cần bổ sung",
    capabilities: "Sản xuất sự kiện, sân khấu, vận hành check-in, hậu cần và media sự kiện.",
  },
  {
    id: "bac-ha", short: "BH", category: "In ấn",
    name: "Bắc Hà Print",
    tags: ["In ấn", "POSM", "Thi công", "Vật tư"],
    summary: "In ấn chất lượng cao, POSM và giải pháp triển khai thành phẩm cho chuỗi bán lẻ và sự kiện.",
    contact: "print@bachaprint.example.vn", phone: "024 0000 0006",
    status: "approved", statusLabel: "Đã xác minh",
    capabilities: "POSM, in nhanh, thành phẩm, thi công, hỗ trợ triển khai chuỗi cửa hàng.",
  },
  {
    id: "ha-thanh-media", short: "HT", category: "Media",
    name: "Hà Thành Media",
    tags: ["Media", "OOH", "Booking", "Kế hoạch"],
    summary: "Media booking và lập kế hoạch truyền thông tích hợp, chuyên OOH và digital Hà Nội.",
    contact: "media@hathanh.example.vn", phone: "024 0000 0007",
    status: "approved", statusLabel: "Đã xác minh",
    capabilities: "Media planning, OOH booking, digital placement, báo cáo hiệu quả chiến dịch.",
  },
  {
    id: "viet-nam-promo", short: "VN", category: "Sản xuất",
    name: "Việt Nam Promo",
    tags: ["Sản xuất", "TVC", "AV", "Nội dung"],
    summary: "Sản xuất TVC, video nội dung và tư liệu truyền thông chất lượng cao cho thương hiệu lớn.",
    contact: "produce@vnpromo.example.vn", phone: "024 0000 0008",
    status: "approved", statusLabel: "Đã xác minh",
    capabilities: "TVC, viral video, motion graphic, phim tài liệu thương hiệu, live streaming.",
  },
];

const EVENTS = [
  {
    id: "tax-workshop-2026",
    title: "Hội thảo Thuế & Pháp lý Quảng cáo 2026",
    date: "2026-09-18", day: "18", month: "09", year: "2026",
    location: "Hà Nội · Trung tâm Hội nghị",
    type: "upcoming",
    status: "open", statusLabel: "Mở đăng ký",
    summary: "Cập nhật quy định thuế mới nhất, hợp đồng quảng cáo và hồ sơ pháp lý cho doanh nghiệp ngành quảng cáo.",
    capacity: 80, registered: 24,
    detail: "Diễn giả gồm chuyên gia thuế và luật sư chuyên ngành truyền thông. Hội viên CAA ưu tiên đăng ký và được giảm phí tham dự.",
  },
  {
    id: "b2b-networking-oct",
    title: "Giao lưu B2B Hội viên CAA — Tháng 10",
    date: "2026-10-15", day: "15", month: "10", year: "2026",
    location: "Hà Nội · Địa điểm sẽ thông báo",
    type: "upcoming",
    status: "coming", statusLabel: "Sắp mở ĐK",
    summary: "Sự kiện kết nối hội viên theo nhóm lĩnh vực: OOH gặp Digital, In ấn gặp Event. Tìm đối tác mới trong nội khối.",
    capacity: 60, registered: 0,
    detail: "Định dạng speed-networking theo bàn lĩnh vực. Mỗi hội viên có 3 phút giới thiệu và 10 phút kết nối 1-1.",
  },
  {
    id: "pickleball-2026",
    title: "Giải Pickleball CAA Mở rộng 2026",
    date: "2026-03-28", day: "28", month: "03", year: "2026",
    location: "Hà Nội · Sân Pickleball",
    type: "past",
    status: "ended", statusLabel: "Đã diễn ra",
    summary: "Không gian giao lưu thể thao cho hội viên, đối tác và cộng đồng ngành quảng cáo ngoài phòng họp.",
    capacity: 60, registered: 56,
    detail: "Giải đấu đơn và đôi, có phần thưởng và networking sau trận đấu. Hơn 50 hội viên và đối tác tham dự.",
  },
  {
    id: "gala-2026",
    title: "Gala Kết nạp Hội viên mới & Ra mắt CLB Pickleball",
    date: "2026-06-30", day: "30", month: "06", year: "2026",
    location: "Hà Nội · Khách sạn 5 sao",
    type: "past",
    status: "ended", statusLabel: "Đã diễn ra",
    summary: "Sự kiện kết nối cộng đồng, chào đón hội viên mới và ra mắt Câu lạc bộ Pickleball CAA.",
    capacity: 120, registered: 118,
    detail: "Lễ kết nạp hội viên chính thức, trao thẻ hội viên, ra mắt CLB Pickleball và giao lưu ẩm thực.",
  },
];

const NEWS = [];

const DOCS = [
  { id: "doc-1", name: "Thông báo hoạt động Chi hội Q3/2026", type: "PDF", access: "public", accessLabel: "Công khai", date: "2026-09-01" },
  { id: "doc-2", name: "Quy định biển bảng OOH Hà Nội 2026", type: "PDF", access: "member", accessLabel: "Hội viên", date: "2026-08-20" },
  { id: "doc-3", name: "Tài liệu Hội thảo Thuế & Pháp lý 2026", type: "PDF", access: "member", accessLabel: "Hội viên", date: "2026-09-18" },
  { id: "doc-4", name: "Mẫu hợp đồng quảng cáo ngoài trời", type: "DOCX", access: "member", accessLabel: "Hội viên", date: "2026-07-15" },
  { id: "doc-5", name: "Điều lệ Chi hội Quảng cáo Thủ đô", type: "PDF", access: "public", accessLabel: "Công khai", date: "2026-03-28" },
];

const SEARCH_INDEX = [
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
  { label: "Liên hệ", href: "contact.html", type: "Trang" },
  ...MEMBERS.map(m => ({ label: m.name, href: "directory.html", type: m.category })),
  ...EVENTS.map(e => ({ label: e.title, href: "events.html", type: "Sự kiện" })),
  ...NEWS.map(n => ({ label: n.title, href: "news.html", type: "Tin tức" })),
];

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

  // Update login button label
  $$("[data-login-label]").forEach(el => { el.textContent = role === "guest" ? "Đăng nhập" : roleName(role); });
  $$(".login-btn").forEach(el => { el.textContent = role === "guest" ? "Đăng nhập" : roleName(role); });

  // Re-render role-gated elements
  renderRoleGates();
  renderDirectory();
  renderDirectoryInner();
  toast(`Đang xem bằng vai trò: ${roleName(role)}.`, "success");
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

  const statusBadge = m.status === "approved"
    ? `<span class="badge badge-green">${escapeHtml(m.statusLabel)}</span>`
    : m.status === "pending"
      ? `<span class="badge badge-yellow">${escapeHtml(m.statusLabel)}</span>`
      : `<span class="badge badge-blue">${escapeHtml(m.statusLabel)}</span>`;

  return `
    <article class="member-card" data-member-id="${m.id}">
      <header class="member-card-header">
        <span class="member-logo" aria-hidden="true">${escapeHtml(m.short)}</span>
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
  content.innerHTML = `
    <div class="profile-dialog-body">
      <div class="profile-dialog-top">
        <span class="member-logo large" aria-hidden="true">${escapeHtml(m.short)}</span>
        <div>
          <h3>${escapeHtml(m.name)}</h3>
          <span class="badge badge-default">${escapeHtml(m.category)}</span>
          <span class="badge ${m.status === "approved" ? "badge-green" : "badge-yellow"}">${escapeHtml(m.statusLabel)}</span>
        </div>
      </div>
      <p>${escapeHtml(m.summary)}</p>
      <dl class="profile-dl">
        <div><dt>Lĩnh vực</dt><dd>${escapeHtml(m.category)}</dd></div>
        <div><dt>Tags</dt><dd>${m.tags.map(t => `<span class="badge badge-default">${escapeHtml(t)}</span>`).join(" ")}</dd></div>
        <div><dt>Năng lực</dt><dd>${escapeHtml(m.capabilities)}</dd></div>
        <div><dt>Email</dt><dd>${full ? `<a href="mailto:${escapeHtml(m.contact)}">${escapeHtml(m.contact)}</a>` : "<em>Chỉ hiện với hội viên</em>"}</dd></div>
        <div><dt>Điện thoại</dt><dd>${full ? escapeHtml(m.phone) : "<em>Chỉ hiện với hội viên</em>"}</dd></div>
        ${m.website ? `<div><dt>Website</dt><dd><a href="${escapeHtml(m.website)}" target="_blank" rel="noopener">${escapeHtml(m.website)}</a></dd></div>` : ""}
      </dl>
      ${full ? `<button class="btn btn-primary" type="button" data-connect="${m.id}">Gửi yêu cầu kết nối</button>` : `<button class="btn btn-secondary" type="button" data-open-login>Đăng nhập để kết nối</button>`}
    </div>`;
  openDialog("profile-dialog");
}

// ── EVENTS ────────────────────────────────────────────────

function renderEventCard(ev) {
  const regPct = ev.capacity ? Math.round((ev.registered / ev.capacity) * 100) : 0;
  const statusClass = ev.status === "open" ? "badge-green" : ev.status === "coming" ? "badge-yellow" : "badge-default";

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
          ${ev.status === "ended" ? "Xem chi tiết" : "Đăng ký tham dự"}
        </button>
        <button class="btn btn-ghost btn-sm" type="button" data-event-detail="${ev.id}">Chi tiết</button>
      </footer>
    </article>`;
}

function renderEvents() {
  const grid = $("event-grid");
  if (!grid) return;
  let filtered = state.eventFilter === "all" ? EVENTS : EVENTS.filter(e => e.type === state.eventFilter);
  if (grid.dataset.limit) filtered = filtered.slice(0, parseInt(grid.dataset.limit, 10));
  grid.innerHTML = filtered.map(e => renderEventCard(e)).join("");
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
      if (ev.status === "ended") {
        toast(`Sự kiện "${ev.title}" đã kết thúc. Xem album và tài liệu trong mục Tin tức.`, "info");
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
  const statusClass = ev.status === "open" ? "badge-green" : ev.status === "coming" ? "badge-yellow" : "badge-default";
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
      ${ev.status !== "ended" ? `<button class="btn btn-primary" type="button" data-register-event="${ev.id}">Đăng ký tham dự</button>` : ""}
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

    // =========================================================================
    // FIREBASE BACKEND CONFIGURATION
    // =========================================================================
    // BƯỚC 1: Tạo dự án tại console.firebase.google.com
    // BƯỚC 2: Bật Authentication (Email/Password)
    // BƯỚC 3: Lấy Web Config và dán vào đây:
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    let auth, db;
    const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

    if (isFirebaseConfigured && typeof firebase !== "undefined") {
      firebase.initializeApp(firebaseConfig);
      auth = firebase.auth();
      db = firebase.firestore();

      // Theo dõi trạng thái đăng nhập tự động
      auth.onAuthStateChanged(user => {
        if (user) {
          if (user.emailVerified) {
            setRole("member"); // Đăng nhập thành công và đã xác thực
            $("login-dialog")?.close?.();
          } else {
            auth.signOut();
            toast("Tài khoản chưa xác thực. Vui lòng kiểm tra email và bấm vào link kích hoạt.", "error");
          }
        } else {
          setRole("guest"); // Đã đăng xuất
        }
      });
    }

    

  // =========================================================================
  
    
    const saved = localStorage.getItem("caa-role");
  if (saved && ["guest", "member", "admin"].includes(saved)) { setRole(saved === "admin" ? "member" : saved); }

    document.body.addEventListener("click", e => {
    if (e.target.closest("[data-open-login]")) {
      openDialog("login-dialog");
    }
  });

  $$("[data-set-role]").forEach(btn => {
    btn.addEventListener("click", () => {
      setRole(btn.dataset.setRole);
      $("login-dialog")?.close?.();
    });
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
  // DATABASE & CMS API (FIREBASE FIRESTORE SKELETON)
  // =========================================================================
  const dbAPI = {
    // 1. Quản lý Yêu cầu gia nhập
    submitApplication: async (data) => {
      if (typeof db !== "undefined") {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.status = 'pending';
        return await db.collection("applications").add(data);
      }
    },
    getApplications: async () => {
      if (typeof db !== "undefined") {
        const snapshot = await db.collection("applications").orderBy("createdAt", "desc").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return [];
    },

    // 2. Quản lý Liên hệ (Hộp thư)
    submitContact: async (data) => {
      if (typeof db !== "undefined") {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        data.status = 'unread';
        return await db.collection("contacts").add(data);
      }
    },
    getContacts: async () => {
      if (typeof db !== "undefined") {
        const snapshot = await db.collection("contacts").orderBy("createdAt", "desc").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return [];
    },

    // 3. Quản lý Người dùng & Phân quyền
    getUsers: async () => {
      if (typeof db !== "undefined") {
        const snapshot = await db.collection("users").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return [];
    },
    updateUserRole: async (uid, role) => {
      if (typeof db !== "undefined") {
        return await db.collection("users").doc(uid).update({ role: role });
      }
    },

    // 4. Quản lý Nội dung (CMS - Bài viết, Sự kiện)
    createArticle: async (data) => {
      if (typeof db !== "undefined") {
        data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        return await db.collection("articles").add(data);
      }
    },
    getArticles: async () => {
      if (typeof db !== "undefined") {
        const snapshot = await db.collection("articles").orderBy("createdAt", "desc").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      return [];
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
        await dbAPI.submitContact(formData); // Lưu vào DB nếu có
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
        category: $("f-cat").value
        // Thêm các trường khác...
      };

      try {
        await dbAPI.submitApplication(formData); // Lưu vào DB nếu có
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


function init() {

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

// Inject fetched articles into NEWS
if (typeof ARTICLES !== 'undefined') {
  ARTICLES.forEach(a => {
    // Only add if not already present to avoid duplicates during hot reloads
    if (!NEWS.find(n => n.id === a.id)) {
      NEWS.unshift({
        id: a.id,
        cat: 'chi-hoi',
        catLabel: 'Tin Chi hội',
        date: '2026-09-16',
        title: a.title,
        excerpt: a.description,
        artBg: 'var(--c-bg-2)', // Optional background, or we could use the image
        img: a.image
      });
    }
  });
  // Re-render if already rendered
  if (typeof renderNews === 'function') renderNews();
}

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
