const logsList = document.getElementById("logsList");
const filterButtons = document.querySelectorAll(".filter-btn");

const totalLogs = document.getElementById("totalLogs");
const createLogs = document.getElementById("createLogs");
const updateLogs = document.getElementById("updateLogs");
const cancelLogs = document.getElementById("cancelLogs");

const logs = [
  {
    id: 1,
    user: "Enzo Ricardo",
    action: "CREATE",
    entity: "reservation",
    entityId: 1,
    description: "Criou uma nova reserva para a Sala de Estudos 01",
    date: "24/04/2026",
    time: "14:32"
  },
  {
    id: 2,
    user: "Administrador",
    action: "CREATE",
    entity: "room",
    entityId: 2,
    description: "Cadastrou a Sala de Reunião Docente",
    date: "24/04/2026",
    time: "14:40"
  },
  {
    id: 3,
    user: "Administrador",
    action: "UPDATE",
    entity: "room",
    entityId: 2,
    description: "Atualizou o status da sala para disponível",
    date: "24/04/2026",
    time: "15:02"
  },
  {
    id: 4,
    user: "Aluno Exemplo",
    action: "CANCEL",
    entity: "reservation",
    entityId: 3,
    description: "Cancelou uma reserva agendada",
    date: "24/04/2026",
    time: "15:20"
  },
  {
    id: 5,
    user: "Professor Exemplo",
    action: "LOGIN",
    entity: "user",
    entityId: 4,
    description: "Realizou login no sistema",
    date: "24/04/2026",
    time: "15:31"
  }
];

const actionLabels = {
  CREATE: "Criação",
  UPDATE: "Atualização",
  DELETE: "Remoção",
  CANCEL: "Cancelamento",
  LOGIN: "Login"
};

const actionIcons = {
  CREATE: "fa-plus",
  UPDATE: "fa-pen",
  DELETE: "fa-trash",
  CANCEL: "fa-ban",
  LOGIN: "fa-right-to-bracket"
};

function updateSummary() {
  totalLogs.textContent = logs.length;
  createLogs.textContent = logs.filter(log => log.action === "CREATE").length;
  updateLogs.textContent = logs.filter(log => log.action === "UPDATE").length;
  cancelLogs.textContent = logs.filter(log => log.action === "CANCEL").length;
}

function renderLogs(filter = "all") {
  const filteredLogs = filter === "all"
    ? logs
    : logs.filter(log => log.action === filter);

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

  logsList.innerHTML = filteredLogs.map(log => `
    <article class="log-card">
      <div class="log-icon">
        <i class="fa-solid ${actionIcons[log.action]}"></i>
      </div>

      <div class="log-content">
        <h3>${log.description}</h3>

        <div class="log-meta">
          <span><i class="fa-solid fa-user"></i>${log.user}</span>
          <span><i class="fa-solid fa-database"></i>${log.entity} #${log.entityId}</span>
          <span><i class="fa-solid fa-calendar"></i>${log.date}</span>
          <span><i class="fa-solid fa-clock"></i>${log.time}</span>
        </div>
      </div>

      <div class="action-badge ${log.action}">
        ${actionLabels[log.action]}
      </div>
    </article>
  `).join("");
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    renderLogs(button.dataset.filter);
  });
});

updateSummary();
renderLogs();