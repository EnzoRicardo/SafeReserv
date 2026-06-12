const API_BASE = "http://127.0.0.1:8000/api";

function getSession() {
  const raw = sessionStorage.getItem("safeReservUser");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function formatApiError(data) {
  if (data?.erro) return data.erro;

  if (typeof data === "object" && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value) ? value.join(" ") : String(value);
        return `${key}: ${message}`;
      })
      .join(" ");
  }

  return "Erro desconhecido.";
}

function saveSession(data) {
  sessionStorage.setItem(
    "safeReservUser",
    JSON.stringify({
      access: data.access,
      refresh: data.refresh,
      user: data.user,
    })
  );
}

function clearSession() {
  sessionStorage.removeItem("safeReservUser");
}

function getAuthHeaders(extraHeaders = {}) {
  const session = getSession();
  const headers = { ...extraHeaders };

  if (session?.access) {
    headers.Authorization = `Bearer ${session.access}`;
  }

  return headers;
}

function redirectByRole(role) {
  const routes = {
    student: "../studentHome/student-home.html",
    teacher: "../teacherHome/teacher-home.html",
    admin: "../adminDashboard/admin-dashboard.html",
  };

  window.location.href = routes[role] || routes.student;
}

function requireAuth(allowedRoles = null) {
  const session = getSession();

  if (!session?.access) {
    window.location.href = "../loginPage/login.html";
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirectByRole(session.user.role);
    return null;
  }

  return session;
}

function getAllowedRolesFromPath() {
  const path = window.location.pathname;

  if (
    path.includes("adminDashboard") ||
    path.includes("adminRooms") ||
    path.includes("adminLogs") ||
    path.includes("adminReservations")
  ) {
    return ["admin"];
  }

  if (path.includes("teacherHome")) {
    return ["teacher"];
  }

  if (
    path.includes("studentHome") ||
    path.includes("reservationPage") ||
    path.includes("myReservations")
  ) {
    return ["student", "teacher"];
  }

  return null;
}

function initAuthGuard() {
  const path = window.location.pathname;

  if (path.includes("loginPage") || path.includes("createAccountPage")) {
    return;
  }

  const allowedRoles = getAllowedRolesFromPath();
  if (!allowedRoles) return;

  requireAuth(allowedRoles);
}

function updateUserBox() {
  const session = getSession();
  if (!session?.user) return;

  const userBox = document.querySelector(".user-box");
  if (!userBox) return;

  const nameEl = userBox.querySelector("strong");
  const emailEl = userBox.querySelector("span");

  if (nameEl) {
    nameEl.textContent = session.user.first_name || session.user.username;
  }

  if (emailEl) {
    emailEl.textContent = session.user.email;
  }
}

document.querySelectorAll(".logout-btn").forEach((button) => {
  button.addEventListener("click", () => {
    clearSession();
    window.location.href = "../loginPage/login.html";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  initAuthGuard();
  updateUserBox();
});
