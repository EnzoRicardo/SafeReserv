const logsList = document.getElementById("logsList");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalLogs = document.getElementById("totalLogs");
const createLogs = document.getElementById("createLogs");
const updateLogs = document.getElementById("updateLogs");
const cancelLogs = document.getElementById("cancelLogs");

let logs = [];

const actionLabels = {
  REGISTER: "Registro",
  CREATE: "Criação",
  UPDATE: "Atualização",
  DELETE: "Remoção",
  CANCEL: "Cancelamento",
  LOGIN_SUCCESS: "Login",
  LOGIN_FAILED: "Login falhou",
  LOGIN_LOCKED: "Conta bloqueada",
};

const actionIcons = {
  REGISTER: "fa-user-plus",
  CREATE: "fa-plus",
  UPDATE: "fa-pen",
  DELETE: "fa-trash",
  CANCEL: "fa-ban",
  LOGIN_SUCCESS: "fa-right-to-bracket",
  LOGIN_FAILED: "fa-triangle-exclamation",
  LOGIN_LOCKED: "fa-lock",
};

function getBadgeClass(action) {
  if (action.startsWith("LOGIN")) return "LOGIN";
  if (action === "REGISTER") return "CREATE";
  return action;
}

function matchesFilter(log, filter) {
  if (filter === "all") return true;
  if (filter === "CREATE") return ["CREATE", "REGISTER"].includes(log.action);
  if (filter === "LOGIN") return log.action.startsWith("LOGIN");
  return log.action === filter;
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return {
    date: date.toLocaleDateString("pt-BR"),
    time: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function updateSummary() {
  totalLogs.textContent = logs.length;
  createLogs.textContent = logs.filter((log) =>
    ["CREATE", "REGISTER"].includes(log.action)
  ).length;
  updateLogs.textContent = logs.filter((log) => log.action === "UPDATE").length;
  cancelLogs.textContent = logs.filter((log) => log.action === "CANCEL").length;
}

function renderLogs(filter = "all") {
  const filteredLogs = logs.filter((log) => matchesFilter(log, filter));

  if (filteredLogs.length === 0) {
    logsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-file-circle-xmark"></i>
        <strong>Nenhum log encontrado</strong>
        <p>Não existem eventos para este filtro.</p>
      </div>
    `;
    return;
  }

  logsList.innerHTML = filteredLogs.map((log) => {
    const { date, time } = formatDateTime(log.created_at);
    const badgeClass = getBadgeClass(log.action);

    return `
      <article class="log-card">
        <div class="log-icon">
          <i class="fa-solid ${actionIcons[log.action] || "fa-file-shield"}"></i>
        </div>

        <div class="log-content">
          <h3>${log.description}</h3>

          <div class="log-meta">
            <span><i class="fa-solid fa-user"></i>${log.user_name}</span>
            <span><i class="fa-solid fa-database"></i>${log.entity} #${log.entity_id ?? "—"}</span>
            <span><i class="fa-solid fa-calendar"></i>${date}</span>
            <span><i class="fa-solid fa-clock"></i>${time}</span>
          </div>
        </div>

        <div class="action-badge ${badgeClass}">
          ${actionLabels[log.action] || log.action}
        </div>
      </article>
    `;
  }).join("");
}

async function loadLogs(activeFilter = "all") {
  try {
    const response = await fetch(`${API_BASE}/logs/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar os logs.");
    }

    logs = await response.json();
    updateSummary();
    renderLogs(activeFilter);
  } catch (error) {
    console.error(error);
    logsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <strong>Erro ao carregar logs</strong>
        <p>Verifique se você está logado como admin e se o backend está rodando.</p>
      </div>
    `;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderLogs(button.dataset.filter);
  });
});

loadLogs();
