const reservationsList = document.getElementById("reservationsList");
const pageMessage = document.getElementById("pageMessage");
const totalCount = document.getElementById("totalCount");
const approvedCount = document.getElementById("approvedCount");
const pendingCount = document.getElementById("pendingCount");
const cancelledCount = document.getElementById("cancelledCount");

const statusMap = {
  approved: "Aprovada",
  pending: "Pendente",
  rejected: "Rejeitada",
  cancelled: "Cancelada",
  completed: "Concluída"
};

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatTime(timeString) {
  return timeString.slice(0, 5);
}

function updateSummary(reservations) {
  totalCount.textContent = reservations.length;
  approvedCount.textContent = reservations.filter((item) => item.status === "approved").length;
  pendingCount.textContent = reservations.filter((item) => item.status === "pending").length;
  cancelledCount.textContent = reservations.filter((item) => item.status === "cancelled").length;
}

function renderReservations(reservations, roomMap) {
  if (reservations.length === 0) {
    reservationsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-calendar-xmark"></i>
        <strong>Nenhuma reserva encontrada</strong>
        <p>Crie uma reserva pela tela do aluno para ver os dados aqui.</p>
      </div>
    `;
    return;
  }

  reservationsList.innerHTML = reservations.map((item) => `
    <article class="reservation-card ${item.status}">
      <strong>${roomMap[item.room] || `Sala #${item.room}`}</strong>

      <span>
        <i class="fa-solid fa-user"></i>
        Usuário #${item.user}
      </span>

      <span>
        <i class="fa-solid fa-calendar"></i>
        ${formatDate(item.reservation_date)}
      </span>

      <span>
        <i class="fa-solid fa-clock"></i>
        ${formatTime(item.start_time)} - ${formatTime(item.end_time)}
      </span>

      <div class="status">
        <i class="fa-solid fa-circle-check"></i>
        ${statusMap[item.status] || item.status}
      </div>
    </article>
  `).join("");
}

async function loadReservations() {
  pageMessage.textContent = "Carregando reservas...";
  pageMessage.className = "form-message";

  try {
    const [reservationsResponse, roomsResponse] = await Promise.all([
      fetch(`${API_BASE}/reservas/`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/salas/`, { headers: getAuthHeaders() }),
    ]);

    if (!reservationsResponse.ok || !roomsResponse.ok) {
      throw new Error("Não foi possível carregar os dados da API.");
    }

    const reservations = await reservationsResponse.json();
    const rooms = await roomsResponse.json();
    const roomMap = Object.fromEntries(rooms.map((room) => [room.id, room.name]));

    updateSummary(reservations);
    renderReservations(reservations, roomMap);
    pageMessage.textContent = "";
  } catch (error) {
    console.error(error);
    pageMessage.textContent = "Erro ao conectar com a API. Verifique se o backend está rodando.";
    pageMessage.className = "form-message error";
    reservationsList.innerHTML = "";
  }
}

loadReservations();
