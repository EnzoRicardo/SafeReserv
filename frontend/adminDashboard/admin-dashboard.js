const roomsCount = document.getElementById("roomsCount");
const activeReservations = document.getElementById("activeReservations");
const pendingReservations = document.getElementById("pendingReservations");
const logsCount = document.getElementById("logsCount");
const reservationsList = document.getElementById("reservationsList");

const statusMap = {
  approved: "Aprovada",
  pending: "Pendente",
  cancelled: "Cancelada",
  rejected: "Rejeitada",
  completed: "Concluída",
};

function renderReservations(reservations) {
  if (!reservations.length) {
    reservationsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-calendar-xmark"></i>
        <strong>Nenhuma reserva recente</strong>
        <p>As últimas reservas aparecerão aqui.</p>
      </div>
    `;
    return;
  }

  reservationsList.innerHTML = reservations.map((item) => `
    <article class="reservation-card ${item.status}">
      <strong>${item.room}</strong>

      <span>
        <i class="fa-solid fa-user"></i>
        ${item.user}
      </span>

      <span>
        <i class="fa-solid fa-calendar"></i>
        ${item.date}
      </span>

      <span>
        <i class="fa-solid fa-clock"></i>
        ${item.time}
      </span>

      <div class="status">
        <i class="fa-solid fa-circle-check"></i>
        ${statusMap[item.status] || item.status}
      </div>
    </article>
  `).join("");
}

async function loadDashboard() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar o dashboard.");
    }

    const data = await response.json();

    roomsCount.textContent = data.rooms_count;
    activeReservations.textContent = data.active_reservations;
    pendingReservations.textContent = data.pending_reservations;
    logsCount.textContent = data.logs_today;
    renderReservations(data.recent_reservations);
  } catch (error) {
    console.error(error);
    reservationsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <strong>Erro ao carregar dashboard</strong>
        <p>Verifique se você está logado como admin.</p>
      </div>
    `;
  }
}

loadDashboard();
