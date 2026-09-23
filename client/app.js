const state = {
    user: getCurrentUser(),
    members: [],
    packages: [],
    trainers: [],
    equipment: [],
    classes: []
};

const roleNames = { ADMIN: "Quản trị viên", TRAINER: "Huấn luyện viên", MEMBER: "Hội viên" };
const api = (path, options = {}) => fetch(`${API_BASE}${path}`, { ...options, headers: { ...getHeaders(), ...(options.headers || {}) } });
const unwrapPage = data => Array.isArray(data) ? data : (data && Array.isArray(data.content) ? data.content : []);
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
const initials = value => String(value || "?").split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
const formatMoney = value => value == null ? "--" : new Intl.NumberFormat("vi-VN").format(value) + " đ";

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3000);
}

function userName(user) {
    return user?.fullName || user?.username || "Người dùng";
}

function memberName(member) {
    return userName(member?.user) || `Hội viên #${member?.id || "--"}`;
}

function statusLabel(status) {
    return { OK: "Đang tốt", REPAIRING: "Đang sửa", BROKEN: "Hỏng" }[status] || status || "Chưa rõ";
}

function statusClass(status) {
    return status === "REPAIRING" ? "repair" : status === "BROKEN" ? "broken" : "";
}

async function request(path, options = {}) {
    const response = await api(path, options);
    if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `HTTP ${response.status}`);
    }
    return response.status === 204 ? null : response.json();
}

async function loadData() {
    const [membersResult, packagesResult, trainersResult, equipmentResult, classesResult] = await Promise.allSettled([
        request("/members?page=0&size=100"), request("/packages?page=0&size=100"), request("/trainers"), request("/equipments"), request("/classes")
    ]);
    state.members = membersResult.status === "fulfilled" ? unwrapPage(membersResult.value) : [];
    state.packages = packagesResult.status === "fulfilled" ? unwrapPage(packagesResult.value) : [];
    state.trainers = trainersResult.status === "fulfilled" ? trainersResult.value : [];
    state.equipment = equipmentResult.status === "fulfilled" ? unwrapPage(equipmentResult.value) : [];
    state.classes = classesResult.status === "fulfilled" ? classesResult.value : [];
    renderAll();
    const failed = [membersResult, packagesResult, trainersResult, equipmentResult, classesResult].filter(result => result.status === "rejected");
    if (failed.length) showToast("Một số dữ liệu chưa tải được. Kiểm tra backend và API key.");
}

function renderAll() {
    document.getElementById("memberCount").textContent = state.members.length;
    document.getElementById("packageCount").textContent = state.packages.length;
    document.getElementById("trainerCount").textContent = state.trainers.length;
    document.getElementById("equipmentCount").textContent = state.equipment.reduce((total, item) => total + Number(item.quantity || 0), 0);
    document.getElementById("equipmentAlert").textContent = state.equipment.filter(item => item.status !== "OK").length;
    renderClasses(); renderEquipmentSummary(); renderMembers(); renderPackages(); renderTrainers(); renderEquipmentTable();
}

function renderClasses() {
    const list = document.getElementById("classList");
    if (!state.classes.length) { list.innerHTML = '<div class="empty-state">Chưa có lịch lớp trong hệ thống.</div>'; return; }
    list.innerHTML = state.classes.slice(0, 4).map(item => `<div class="class-row"><span class="class-time">${escapeHtml(item.startTime || "--")}</span><span class="class-tag">${escapeHtml(initials(item.name))}</span><div class="class-info"><strong>${escapeHtml(item.name || "Lớp tập")}</strong><small>${escapeHtml(item.dayOfWeek || "Lịch chưa cập nhật")}</small></div><span class="capacity">${item.maxCapacity || "--"} chỗ</span></div>`).join("");
}

function renderEquipmentSummary() {
    const summary = document.getElementById("equipmentSummary");
    const total = state.equipment.length || 1;
    const groups = ["OK", "REPAIRING", "BROKEN"];
    const colors = { OK: "fill-green", REPAIRING: "fill-orange", BROKEN: "fill-red" };
    summary.innerHTML = groups.map(status => {
        const count = state.equipment.filter(item => item.status === status).length;
        return `<div class="status-bar"><div class="status-bar-head"><span>${statusLabel(status)}</span><strong>${count}</strong></div><div class="progress-track"><div class="progress-fill ${colors[status]}" style="width:${Math.max(count / total * 100, count ? 8 : 0)}%"></div></div></div>`;
    }).join("");
}

function renderMembers() {
    const query = document.getElementById("memberSearch").value.toLowerCase().trim();
    const members = state.members.filter(item => memberName(item).toLowerCase().includes(query));
    document.getElementById("memberResult").textContent = `${members.length} hồ sơ`;
    document.getElementById("memberTable").innerHTML = members.length ? members.map(member => `<tr><td><div class="person-cell"><span class="mini-avatar">${escapeHtml(initials(memberName(member)))}</span>${escapeHtml(memberName(member))}</div></td><td>${escapeHtml(member.gender || "--")}</td><td>${escapeHtml(member.joinDate || "--")}</td><td>${escapeHtml(member.address || "--")}</td><td><button class="row-action" title="Xem chi tiết">···</button></td></tr>`).join("") : '<tr><td colspan="5"><div class="empty-state">Không tìm thấy hội viên phù hợp.</div></td></tr>';
}

function renderPackages() {
    document.getElementById("packageGrid").innerHTML = state.packages.length ? state.packages.map(item => `<article class="package-card"><p class="eyebrow">MEMBERSHIP PLAN</p><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || "Gói tập linh hoạt cho hành trình khỏe mạnh hơn.")}</p><div class="package-price">${formatMoney(item.price)} <small>/ ${item.durationMonths || "--"} tháng</small></div><div class="card-meta"><span>Thời hạn</span><strong>${item.durationMonths || "--"} tháng</strong></div></article>`).join("") : '<div class="empty-state">Chưa có gói tập.</div>';
}

function renderTrainers() {
    document.getElementById("trainerGrid").innerHTML = state.trainers.length ? state.trainers.map(item => `<article class="trainer-card"><span class="trainer-avatar">${escapeHtml(initials(userName(item.user)))}</span><div><h3>${escapeHtml(userName(item.user))}</h3><p>${escapeHtml(item.specialty || "Huấn luyện viên")}</p><small>${item.experienceYears || 0} năm kinh nghiệm</small></div></article>`).join("") : '<div class="empty-state">Chưa có huấn luyện viên.</div>';
}

function renderEquipmentTable() {
    const query = document.getElementById("equipmentSearch").value.toLowerCase().trim();
    const filter = document.getElementById("equipmentFilter").value;
    const items = state.equipment.filter(item => (!query || String(item.name || "").toLowerCase().includes(query)) && (!filter || item.status === filter));
    document.getElementById("equipmentTable").innerHTML = items.length ? items.map(item => `<tr><td>${escapeHtml(item.name || "Thiết bị #" + item.id)}</td><td>${escapeHtml(item.quantity || 0)}</td><td><span class="badge-status ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span></td><td>${item.imageUrl ? "Có ảnh" : "--"}</td><td><button class="row-action" title="Xem chi tiết">···</button></td></tr>`).join("") : '<tr><td colspan="5"><div class="empty-state">Không tìm thấy thiết bị phù hợp.</div></td></tr>';
}

function openDashboard(user = state.user) {
    state.user = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    document.getElementById("loginView").classList.add("hidden");
    document.getElementById("appView").classList.remove("hidden");
    document.getElementById("profileName").textContent = userName(user);
    document.getElementById("profileRole").textContent = roleNames[user.role] || user.role || "Thành viên";
    document.getElementById("profileAvatar").textContent = initials(userName(user));
    loadData();
}

function switchSection(section) {
    if (section === "classes") section = "overview";
    document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.section === section));
    document.querySelectorAll(".page-section").forEach(item => item.classList.toggle("active-section", item.id === `${section}Section`));
    const titles = { overview: "Tổng quan vận hành", members: "Quản lý hội viên", packages: "Danh mục gói tập", trainers: "Đội ngũ huấn luyện viên", equipment: "Theo dõi thiết bị" };
    document.getElementById("pageTitle").textContent = titles[section] || titles.overview;
    document.querySelector(".sidebar").classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nav-item").forEach(item => item.addEventListener("click", () => switchSection(item.dataset.section)));
    document.querySelectorAll("[data-section-link]").forEach(item => item.addEventListener("click", () => switchSection(item.dataset.sectionLink)));
    document.getElementById("memberSearch").addEventListener("input", renderMembers);
    document.getElementById("equipmentSearch").addEventListener("input", renderEquipmentTable);
    document.getElementById("equipmentFilter").addEventListener("change", renderEquipmentTable);
    document.getElementById("refreshBtn").addEventListener("click", loadData);
    document.getElementById("mobileMenuBtn").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
    document.getElementById("logoutBtn").addEventListener("click", logout);
    window.addEventListener("gym:login", event => openDashboard(event.detail));
    if (state.user) openDashboard();
});
