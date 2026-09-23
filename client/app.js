const state = {
    user: getCurrentUser(),
    members: [],
    inactiveMembers: [],
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
const formatDate = date => new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date).toUpperCase();
const canManage = () => state.user?.role === "ADMIN";
const entityState = type => state[{ member: "members", package: "packages", trainer: "trainers", equipment: "equipment", class: "classes" }[type]] || [];
const endpointFor = type => ({ member: "members", package: "packages", trainer: "trainers", equipment: "equipments", class: "classes" }[type]);

function actionMarkup(type, id) {
    const editButton = `<button class="row-action edit-action" data-entity-action="edit" data-entity-type="${type}" data-entity-id="${id}" title="Sửa">Sửa</button>`;
    return `<div class="card-actions"><button class="row-action" data-entity-action="view" data-entity-type="${type}" data-entity-id="${id}" title="Xem chi tiết">Xem</button>${canManage() ? `${editButton}<button class="row-action delete-action" data-entity-action="delete" data-entity-type="${type}" data-entity-id="${id}" title="Xóa">Xóa</button>` : ""}</div>`;
}

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
    return member?.user?.fullName || member?.user?.username || `Hội viên #${member?.id || "--"}`;
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
    if (response.status === 204) return null;
    const body = await response.text();
    return body ? JSON.parse(body) : null;
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
    if (canManage()) {
        try { state.inactiveMembers = unwrapPage(await request("/members/inactive?role=ADMIN&page=0&size=100")); } catch { state.inactiveMembers = []; }
    }
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
    document.getElementById("healthyEquipmentCount").textContent = state.equipment.filter(item => item.status === "OK").length;
    document.getElementById("classCount").textContent = state.classes.length;
    document.getElementById("activePackageCount").textContent = state.packages.length;
    document.getElementById("classSectionCount").textContent = state.classes.length;
    renderClasses(); renderEquipmentSummary(); renderMembers(); renderPackages(); renderTrainers(); renderEquipmentTable();
    renderClassBoard();
}

function renderClasses() {
    const list = document.getElementById("classList");
    if (!state.classes.length) { list.innerHTML = '<div class="empty-state">Chưa có lịch lớp trong hệ thống.</div>'; return; }
    list.innerHTML = state.classes.slice(0, 4).map(item => `<div class="class-row"><span class="class-time">${escapeHtml(item.startTime || "--")}</span><span class="class-tag">${escapeHtml(initials(item.name))}</span><div class="class-info"><strong>${escapeHtml(item.name || "Lớp tập")}</strong><small>${escapeHtml(item.dayOfWeek || "Lịch chưa cập nhật")}</small></div><span class="capacity">${item.maxCapacity || "--"} chỗ</span></div>`).join("");
}

function renderClassBoard() {
    const board = document.getElementById("classBoard");
    if (!state.classes.length) { board.innerHTML = '<div class="panel empty-state">Chưa có lớp học trong lịch.</div>'; return; }
    board.innerHTML = state.classes.map(item => `<div class="class-row"><span class="class-time">${escapeHtml(item.startTime || "--")}</span><span class="class-tag">${escapeHtml(initials(item.name))}</span><div class="class-info"><strong>${escapeHtml(item.name || "Lớp tập")}</strong><small>${escapeHtml(item.dayOfWeek || "Lịch chưa cập nhật")} · HLV đang phân công</small></div><span class="capacity">${item.maxCapacity || "--"} chỗ</span>${actionMarkup("class", item.id)}</div>`).join("");
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
    document.getElementById("memberTable").innerHTML = members.length ? members.map(member => `<tr><td><div class="person-cell"><span class="mini-avatar">${escapeHtml(initials(memberName(member)))}</span>${escapeHtml(memberName(member))}</div></td><td>${escapeHtml(member.gender || "--")}</td><td>${escapeHtml(member.joinDate || "--")}</td><td>${escapeHtml(member.address || "--")}</td><td>${actionMarkup("member", member.id)}</td></tr>`).join("") : '<tr><td colspan="5"><div class="empty-state">Không tìm thấy hội viên phù hợp.</div></td></tr>';
}

function renderInactiveMembers() {
    const query = document.getElementById("memberSearch").value.toLowerCase().trim();
    const members = state.inactiveMembers.filter(item => memberName(item).toLowerCase().includes(query));
    document.getElementById("memberResult").textContent = `${members.length} hồ sơ đã vô hiệu hóa`;
    document.getElementById("memberTable").innerHTML = members.length ? members.map(member => `<tr><td><div class="person-cell"><span class="mini-avatar">${escapeHtml(initials(memberName(member)))}</span>${escapeHtml(memberName(member))}</div></td><td>${escapeHtml(member.gender || "--")}</td><td>${escapeHtml(member.joinDate || "--")}</td><td>${escapeHtml(member.address || "--")}</td><td><div class="card-actions"><button class="row-action" data-entity-action="view" data-entity-type="member" data-entity-id="${member.id}">Xem</button><button class="row-action restore-action" data-entity-action="restore" data-entity-type="member" data-entity-id="${member.id}">Khôi phục</button></div></td></tr>`).join("") : '<tr><td colspan="5"><div class="empty-state">Không có hội viên bị vô hiệu hóa.</div></td></tr>';
}

function renderPackages() {
    document.getElementById("packageGrid").innerHTML = state.packages.length ? state.packages.map(item => `<article class="package-card"><p class="eyebrow">MEMBERSHIP PLAN</p><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || "Gói tập linh hoạt cho hành trình khỏe mạnh hơn.")}</p><div class="package-price">${formatMoney(item.price)} <small>/ ${item.durationMonths || "--"} tháng</small></div><div class="card-meta"><span>Thời hạn</span><strong>${item.durationMonths || "--"} tháng</strong></div>${actionMarkup("package", item.id)}</article>`).join("") : '<div class="empty-state">Chưa có gói tập.</div>';
}

function renderTrainers() {
    document.getElementById("trainerGrid").innerHTML = state.trainers.length ? state.trainers.map(item => `<article class="trainer-card"><span class="trainer-avatar">${escapeHtml(initials(userName(item.user)))}</span><div><h3>${escapeHtml(userName(item.user))}</h3><p>${escapeHtml(item.specialty || "Huấn luyện viên")}</p><small>${item.experienceYears || 0} năm kinh nghiệm</small>${actionMarkup("trainer", item.id)}</div></article>`).join("") : '<div class="empty-state">Chưa có huấn luyện viên.</div>';
}

function renderEquipmentTable() {
    const query = document.getElementById("equipmentSearch").value.toLowerCase().trim();
    const filter = document.getElementById("equipmentFilter").value;
    const items = state.equipment.filter(item => (!query || String(item.name || "").toLowerCase().includes(query)) && (!filter || item.status === filter));
    document.getElementById("equipmentTable").innerHTML = items.length ? items.map(item => `<tr><td>${escapeHtml(item.name || "Thiết bị #" + item.id)}</td><td>${escapeHtml(item.quantity || 0)}</td><td><span class="badge-status ${statusClass(item.status)}">${escapeHtml(statusLabel(item.status))}</span></td><td>${item.imageUrl ? "Có ảnh" : "--"}</td><td>${actionMarkup("equipment", item.id)}</td></tr>`).join("") : '<tr><td colspan="5"><div class="empty-state">Không tìm thấy thiết bị phù hợp.</div></td></tr>';
}

function openDashboard(user = state.user) {
    state.user = user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    document.getElementById("loginView").classList.add("hidden");
    document.getElementById("appView").classList.remove("hidden");
    document.getElementById("profileName").textContent = userName(user);
    document.getElementById("profileRole").textContent = roleNames[user.role] || user.role || "Thành viên";
    document.getElementById("profileAvatar").textContent = initials(userName(user));
    applyRoleAccess(user.role);
    loadData();
}

function applyRoleAccess(role = "MEMBER") {
    const access = {
        ADMIN: ["overview", "members", "packages", "trainers", "equipment", "classes"],
        TRAINER: ["overview", "members", "classes"],
        MEMBER: ["overview", "packages", "classes"]
    }[role] || ["overview", "classes"];
    document.getElementById("appView").className = `app-view role-${String(role).toLowerCase()}`;
    document.querySelectorAll(".nav-item").forEach(item => { item.classList.toggle("hidden", !access.includes(item.dataset.section)); });
    document.querySelectorAll(".page-section").forEach(section => { section.classList.toggle("role-hidden", !access.includes(section.id.replace("Section", ""))); });
    const adminOnly = ["addMemberBtn", "addPackageBtn", "addTrainerBtn", "addEquipmentBtn", "addClassBtn", "quickPanel"];
    adminOnly.forEach(id => document.getElementById(id)?.classList.toggle("hidden", role !== "ADMIN"));
    const titles = {
        ADMIN: ["Giữ nhịp phòng tập,", "từng dữ liệu một.", "Dưới đây là bức tranh nhanh về Pulse Gym hôm nay."],
        TRAINER: ["Đồng hành cùng", "từng buổi tập.", "Theo dõi lịch lớp và hội viên bạn đang phụ trách."],
        MEMBER: ["Bắt đầu hành trình", "khỏe hơn mỗi ngày.", "Khám phá lịch lớp và các lựa chọn tập luyện tại Pulse Gym."]
    }[role] || [];
    if (titles.length) {
        document.getElementById("welcomeTitle").innerHTML = `${titles[0]}<br><em>${titles[1]}</em>`;
        document.getElementById("welcomeDescription").textContent = titles[2];
    }
}

function switchSection(section) {
    const role = state.user?.role || "MEMBER";
    const allowed = {
        ADMIN: ["overview", "members", "packages", "trainers", "equipment", "classes"],
        TRAINER: ["overview", "members", "classes"],
        MEMBER: ["overview", "packages", "classes"]
    }[role] || ["overview", "classes"];
    if (!allowed.includes(section)) section = "overview";
    document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.section === section));
    document.querySelectorAll(".page-section").forEach(item => item.classList.toggle("active-section", item.id === `${section}Section`));
    const titles = { overview: "Tổng quan vận hành", members: "Quản lý hội viên", packages: "Danh mục gói tập", trainers: "Đội ngũ huấn luyện viên", equipment: "Theo dõi thiết bị", classes: "Lịch lớp tập" };
    document.getElementById("pageTitle").textContent = titles[section] || titles.overview;
    document.querySelector(".sidebar").classList.remove("open");
}

function fieldMarkup(name, label, type = "text", required = true, options = "") {
    const control = type === "textarea" ? `<textarea name="${name}" ${required ? "required" : ""}></textarea>` : type === "select" ? `<select name="${name}" ${required ? "required" : ""}>${options}</select>` : `<input name="${name}" type="${type}" ${required ? "required" : ""}>`;
    return `<div class="modal-field"><label>${label}</label>${control}</div>`;
}

function openCreateModal(type) {
    if (state.user?.role !== "ADMIN") {
        showToast("Chỉ tài khoản ADMIN mới được tạo dữ liệu quản trị.");
        return;
    }
    const backdrop = document.getElementById("modalBackdrop");
    const form = document.getElementById("entityForm");
    const configs = {
        member: { eyebrow: "MEMBERS / API POST", title: "Thêm hội viên mới", description: "Tạo tài khoản đăng nhập và hồ sơ hội viên liên kết.", endpoint: "/members", entityType: "member", fields: fieldMarkup("username", "Tên đăng nhập") + fieldMarkup("password", "Mật khẩu", "password") + fieldMarkup("fullName", "Họ và tên") + fieldMarkup("email", "Email", "email", false) + fieldMarkup("phone", "Số điện thoại", "tel", false) + fieldMarkup("dob", "Ngày sinh", "date", false) + fieldMarkup("gender", "Giới tính", "select", false, '<option value="">Chưa cập nhật</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option>') + fieldMarkup("address", "Địa chỉ", "text", false) + fieldMarkup("joinDate", "Ngày tham gia", "date", false) },
        package: { eyebrow: "PACKAGES / API POST", title: "Tạo gói tập mới", description: "Đưa một lựa chọn mới vào danh mục hội viên.", endpoint: "/packages", fields: fieldMarkup("name", "Tên gói") + fieldMarkup("price", "Giá bán (VNĐ)", "number") + fieldMarkup("durationMonths", "Thời hạn (tháng)", "number") + fieldMarkup("description", "Mô tả", "textarea", false) },
        equipment: { eyebrow: "EQUIPMENT / API POST", title: "Ghi nhận thiết bị", description: "Cập nhật tài sản mới vào kho vận hành.", endpoint: "/equipments", fields: fieldMarkup("name", "Tên thiết bị") + fieldMarkup("quantity", "Số lượng", "number") + fieldMarkup("status", "Trạng thái", "select", true, '<option value="OK">Đang tốt</option><option value="REPAIRING">Đang sửa</option><option value="BROKEN">Hỏng</option>') },
        class: { eyebrow: "CLASSES / API POST", title: "Tạo lớp học mới", description: "Tạo lịch lớp và phân công huấn luyện viên phụ trách.", endpoint: "/classes", entityType: "class", fields: fieldMarkup("name", "Tên lớp") + fieldMarkup("dayOfWeek", "Ngày trong tuần") + fieldMarkup("startTime", "Giờ bắt đầu", "time") + fieldMarkup("endTime", "Giờ kết thúc", "time") + fieldMarkup("maxCapacity", "Sức chứa", "number") + fieldMarkup("trainerId", "Huấn luyện viên", "select", true, state.trainers.map(trainer => `<option value="${trainer.id}">${escapeHtml(userName(trainer.user) || `HLV #${trainer.id}`)}</option>`).join("")) }
    };
    const config = configs[type];
    if (!config) { switchSection("members"); return; }
    document.getElementById("modalEyebrow").textContent = config.eyebrow;
    document.getElementById("modalTitle").textContent = config.title;
    document.getElementById("modalDescription").textContent = config.description;
    form.innerHTML = config.fields + '<div id="modalError" class="modal-error" role="alert"></div><div class="modal-actions"><button type="button" class="secondary-btn" id="cancelModalBtn">Hủy</button><button type="submit" class="primary-btn compact">Lưu dữ liệu</button></div>';
    form.dataset.endpoint = config.endpoint;
    form.dataset.entityType = config.entityType || type;
    form.dataset.method = "POST";
    backdrop.classList.remove("hidden");
    form.querySelector("input")?.focus();
    document.getElementById("cancelModalBtn").addEventListener("click", closeCreateModal);
}

function closeCreateModal() { document.getElementById("modalBackdrop").classList.add("hidden"); }

function editFields(type) {
    const fields = {
        member: fieldMarkup("dob", "Ngày sinh", "date", false) + fieldMarkup("gender", "Giới tính", "select", false, '<option value="">Chưa cập nhật</option><option value="MALE">Nam</option><option value="FEMALE">Nữ</option>') + fieldMarkup("address", "Địa chỉ", "text", false) + fieldMarkup("avatarUrl", "URL ảnh đại diện", "text", false) + fieldMarkup("joinDate", "Ngày tham gia", "date", false),
        package: fieldMarkup("name", "Tên gói") + fieldMarkup("price", "Giá bán (VNĐ)", "number") + fieldMarkup("durationMonths", "Thời hạn (tháng)", "number") + fieldMarkup("description", "Mô tả", "textarea", false),
        trainer: fieldMarkup("specialty", "Chuyên môn", "text", false) + fieldMarkup("experienceYears", "Số năm kinh nghiệm", "number", false) + fieldMarkup("salary", "Mức lương", "number", false),
        equipment: fieldMarkup("name", "Tên thiết bị") + fieldMarkup("quantity", "Số lượng", "number") + fieldMarkup("status", "Trạng thái", "select", true, '<option value="OK">Đang tốt</option><option value="REPAIRING">Đang sửa</option><option value="BROKEN">Hỏng</option>'),
        class: fieldMarkup("name", "Tên lớp") + fieldMarkup("dayOfWeek", "Ngày trong tuần") + fieldMarkup("startTime", "Giờ bắt đầu", "time") + fieldMarkup("endTime", "Giờ kết thúc", "time") + fieldMarkup("maxCapacity", "Sức chứa", "number") + fieldMarkup("trainerId", "Huấn luyện viên", "select", true, state.trainers.map(trainer => `<option value="${trainer.id}">${escapeHtml(userName(trainer.user))}</option>`).join("")),
        class: fieldMarkup("name", "Tên lớp") + fieldMarkup("dayOfWeek", "Ngày trong tuần") + fieldMarkup("startTime", "Giờ bắt đầu", "time") + fieldMarkup("endTime", "Giờ kết thúc", "time") + fieldMarkup("maxCapacity", "Sức chứa", "number")
    };
    return fields[type];
}

function openEditModal(type, id) {
    if (!canManage()) { showToast("Chỉ tài khoản ADMIN mới có quyền sửa dữ liệu."); return; }
    const item = entityState(type).find(entry => String(entry.id) === String(id));
    const fields = editFields(type);
    if (!item || !fields) return;
    const form = document.getElementById("entityForm");
    form.innerHTML = `${fields}<div id="modalError" class="modal-error" role="alert"></div><div class="modal-actions"><button type="button" class="secondary-btn" id="cancelModalBtn">Hủy</button><button type="submit" class="primary-btn compact">Cập nhật</button></div>`;
    form.dataset.endpoint = `/${endpointFor(type)}/${id}`;
    form.dataset.method = "PUT";
    Object.keys(item).forEach(key => { const input = form.elements.namedItem(key); if (input && typeof item[key] !== "object") input.value = item[key] ?? ""; });
    document.getElementById("modalEyebrow").textContent = `${type.toUpperCase()} / API PUT`;
    document.getElementById("modalTitle").textContent = "Chỉnh sửa dữ liệu";
    document.getElementById("modalDescription").textContent = "Cập nhật thông tin và lưu thay đổi vào hệ thống.";
    document.getElementById("modalBackdrop").classList.remove("hidden");
    document.getElementById("cancelModalBtn").addEventListener("click", closeCreateModal);
}

function detailValue(value) { return escapeHtml(value == null || value === "" ? "--" : value); }

function showDetails(type, id) {
    const item = entityState(type).find(entry => String(entry.id) === String(id));
    if (!item) return;
    const title = type === "member" ? memberName(item) : type === "trainer" ? userName(item.user) : item.name || `${type} #${id}`;
    const values = type === "member" ? [["ID", item.id], ["Giới tính", item.gender], ["Ngày sinh", item.dob], ["Ngày tham gia", item.joinDate], ["Địa chỉ", item.address]] : type === "trainer" ? [["ID", item.id], ["Chuyên môn", item.specialty], ["Kinh nghiệm", `${item.experienceYears || 0} năm`], ["Mức lương", formatMoney(item.salary)]] : type === "package" ? [["ID", item.id], ["Giá", formatMoney(item.price)], ["Thời hạn", `${item.durationMonths || "--"} tháng`], ["Mô tả", item.description]] : type === "equipment" ? [["ID", item.id], ["Số lượng", item.quantity], ["Trạng thái", statusLabel(item.status)], ["Ảnh", item.imageUrl || "--"]] : [["ID", item.id], ["Ngày", item.dayOfWeek], ["Bắt đầu", item.startTime], ["Kết thúc", item.endTime], ["Sức chứa", item.maxCapacity]];
    document.getElementById("modalEyebrow").textContent = "DETAILS / READ ONLY";
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalDescription").textContent = "Thông tin chi tiết đang được lưu trong hệ thống.";
    const form = document.getElementById("entityForm");
    const detailActions = canManage() ? `<button type="button" class="secondary-btn" data-entity-action="edit" data-entity-type="${type}" data-entity-id="${id}">Sửa chi tiết</button><button type="button" class="danger-btn" data-entity-action="delete" data-entity-type="${type}" data-entity-id="${id}">Xóa</button>` : "";
    form.innerHTML = `<div class="detail-grid">${values.map(([label, value]) => `<div><small>${label}</small><strong>${detailValue(value)}</strong></div>`).join("")}</div><div class="modal-actions">${detailActions}<button type="button" class="primary-btn compact" id="detailCloseBtn">Đóng</button></div>`;
    form.dataset.method = "NONE";
    document.getElementById("modalBackdrop").classList.remove("hidden");
    document.getElementById("detailCloseBtn").addEventListener("click", closeCreateModal);
}

async function deleteEntity(type, id) {
    if (!canManage()) { showToast("Chỉ tài khoản ADMIN mới có quyền xóa dữ liệu."); return; }
    const item = entityState(type).find(entry => String(entry.id) === String(id));
    const label = type === "member" ? memberName(item) : item?.name || `#${id}`;
    if (!window.confirm(`Bạn chắc chắn muốn xóa ${label}? Thao tác này không thể hoàn tác.`)) return;
    closeCreateModal();
    try {
        const endpoint = endpointFor(type);
        await request(`/${endpoint}/${id}?role=ADMIN`, { method: "DELETE" });
        showToast(type === "member" ? "Đã vô hiệu hóa hội viên và khóa tài khoản." : "Đã xóa dữ liệu thành công.");
        await loadData();
    } catch (error) { showToast(`Không thể xóa dữ liệu: ${error.message}`); }
}

async function restoreMember(id) {
    if (!canManage()) return;
    try {
        await request(`/members/${id}/restore?role=ADMIN`, { method: "PUT" });
        showToast("Đã khôi phục hội viên và mở lại tài khoản.");
        await loadData();
        renderMembers();
    } catch (error) { showToast(`Không thể khôi phục: ${error.message}`); }
}

function handleEntityAction(event) {
    const button = event.target.closest("[data-entity-action]");
    if (!button) return;
    const { entityAction, entityType, entityId } = button.dataset;
    if (entityAction === "view") showDetails(entityType, entityId);
    if (entityAction === "edit") openEditModal(entityType, entityId);
    if (entityAction === "delete") deleteEntity(entityType, entityId);
    if (entityAction === "restore") restoreMember(entityId);
}

async function submitEntity(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const errorBox = document.getElementById("modalError");
    errorBox.textContent = "";
    const payload = Object.fromEntries(new FormData(form).entries());
    if (payload.price) payload.price = Number(payload.price);
    if (payload.durationMonths) payload.durationMonths = Number(payload.durationMonths);
    if (payload.quantity) payload.quantity = Number(payload.quantity);
    if (payload.experienceYears) payload.experienceYears = Number(payload.experienceYears);
    if (payload.salary) payload.salary = Number(payload.salary);
    if (payload.maxCapacity) payload.maxCapacity = Number(payload.maxCapacity);
    if (!state.user || state.user.role !== "ADMIN") {
        errorBox.textContent = "Phiên đăng nhập hiện tại không có quyền quản trị. Hãy đăng xuất và đăng nhập lại bằng admin.";
        return;
    }
    try {
        if (form.dataset.entityType === "member" && form.dataset.method === "POST") {
            const user = await request("/users?role=ADMIN", { method: "POST", body: JSON.stringify({ username: payload.username, password: payload.password, role: "MEMBER", fullName: payload.fullName, email: payload.email, phone: payload.phone }) });
            await request("/members?role=ADMIN", { method: "POST", body: JSON.stringify({ user: { id: user.id }, dob: payload.dob || null, gender: payload.gender || null, address: payload.address || null, avatarUrl: payload.avatarUrl || null, joinDate: payload.joinDate || null }) });
            closeCreateModal();
            showToast("Đã tạo tài khoản và hồ sơ hội viên.");
            await loadData();
            return;
        }
        if (form.dataset.entityType === "class") {
            const classPayload = { name: payload.name, dayOfWeek: payload.dayOfWeek, startTime: payload.startTime, endTime: payload.endTime, maxCapacity: payload.maxCapacity ? Number(payload.maxCapacity) : null, trainer: { id: Number(payload.trainerId) } };
            if (form.dataset.method === "PUT") delete classPayload.trainer;
            await request(`${form.dataset.endpoint}?role=ADMIN`, { method: form.dataset.method || "POST", body: JSON.stringify(classPayload) });
            closeCreateModal();
            showToast("Đã tạo lớp học và phân công huấn luyện viên.");
            await loadData();
            return;
        }
        await request(`${form.dataset.endpoint}?role=${encodeURIComponent(state.user?.role || "ADMIN")}`, { method: form.dataset.method || "POST", body: JSON.stringify(payload) });
        closeCreateModal();
        showToast("Đã lưu dữ liệu thành công.");
        await loadData();
    } catch (error) {
        errorBox.textContent = error.message || "Không thể lưu dữ liệu.";
        showToast("Không thể tạo dữ liệu. Kiểm tra thông tin trong biểu mẫu.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("currentDate").textContent = formatDate(new Date());
    document.addEventListener("click", handleEntityAction);
    document.querySelectorAll(".nav-item").forEach(item => item.addEventListener("click", () => switchSection(item.dataset.section)));
    document.querySelectorAll("[data-section-link]").forEach(item => item.addEventListener("click", () => switchSection(item.dataset.sectionLink)));
    document.getElementById("memberSearch").addEventListener("input", renderMembers);
    document.getElementById("inactiveMembersBtn").addEventListener("click", () => {
        const button = document.getElementById("inactiveMembersBtn");
        const showingInactive = button.dataset.showing === "true";
        button.dataset.showing = String(!showingInactive);
        button.textContent = showingInactive ? "Đã vô hiệu hóa" : "Hội viên đang hoạt động";
        if (showingInactive) renderMembers(); else renderInactiveMembers();
    });
    document.getElementById("equipmentSearch").addEventListener("input", renderEquipmentTable);
    document.getElementById("equipmentFilter").addEventListener("change", renderEquipmentTable);
    document.getElementById("refreshBtn").addEventListener("click", loadData);
    document.getElementById("mobileMenuBtn").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));
    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("addPackageBtn").addEventListener("click", () => openCreateModal("package"));
    document.getElementById("addEquipmentBtn").addEventListener("click", () => openCreateModal("equipment"));
    document.getElementById("addClassBtn").addEventListener("click", () => {
        if (canManage()) openCreateModal("class");
        else showToast("Chỉ tài khoản ADMIN mới được tạo lớp học.");
    });
    document.getElementById("addMemberBtn").addEventListener("click", () => openCreateModal("member"));
    document.querySelectorAll("[data-quick-action]").forEach(button => button.addEventListener("click", () => openCreateModal(button.dataset.quickAction)));
    document.getElementById("entityForm").addEventListener("submit", submitEntity);
    document.getElementById("closeModalBtn").addEventListener("click", closeCreateModal);
    document.getElementById("modalBackdrop").addEventListener("click", event => { if (event.target.id === "modalBackdrop") closeCreateModal(); });
    window.addEventListener("gym:login", event => openDashboard(event.detail));
    if (state.user) openDashboard();
});
