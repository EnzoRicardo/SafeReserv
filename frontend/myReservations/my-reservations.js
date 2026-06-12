const reservationsList = document.getElementById("reservationsList");
const filterButtons = document.querySelectorAll(".filter-btn");

const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const cancelledCount = document.getElementById("cancelledCount");

let reservations = [];

const statusConfig = {
  approved: {
    label: "Ativa",
    icon: "fa-clock",
    className: "active",
    filterKey: "active",
  },
  pending: {
    label: "Pendente",
    icon: "fa-hourglass-half",
    className: "active",
    filterKey: "active",
  },
  completed: {
    label: "Concluída",
    icon: "fa-circle-check",
    className: "completed",
    filterKey: "completed",
  },
  cancelled: {
    label: "Cancelada",
    icon: "fa-ban",
    className: "cancelled",
    filterKey: "cancelled",
  },
};

function mapReservationStatus(status) {
  if (status === "approved" || status === "pending") return "active";
  if (status === "completed") return "completed";
  if (status === "cancelled" || status === "rejected") return "cancelled";
  return "active";
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatTime(timeString) {
  return timeString.slice(0, 5);
}

function updateSummary() {
  activeCount.textContent = reservations.filter(
    (item) => mapReservationStatus(item.status) === "active"
  ).length;
  completedCount.textContent = reservations.filter(
    (item) => mapReservationStatus(item.status) === "completed"
  ).length;
  cancelledCount.textContent = reservations.filter(
    (item) => mapReservationStatus(item.status) === "cancelled"
  ).length;
}

function renderReservations(filter = "all") {
  const filteredReservations =
    filter === "all"
      ? reservations
      : reservations.filter(
          (item) => mapReservationStatus(item.status) === filter
        );

  if (filteredReservations.length === 0) {
    reservationsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-calendar-xmark"></i>
        <strong>Nenhuma reserva encontrada</strong>
        <p>Não existem reservas para este filtro.</p>
      </div>
    `;
    return;
  }

  reservationsList.innerHTML = filteredReservations.map((item) => {
    const mappedStatus = mapReservationStatus(item.status);
    const status = statusConfig[item.status] || statusConfig.approved;

    return `
      <article class="reservation-card">
        <div>
          <h3>${item.roomName}</h3>

          <div class="reservation-meta">
            <span><i class="fa-solid fa-hashtag"></i>${item.roomCode}</span>
            <span><i class="fa-solid fa-calendar"></i>${formatDate(item.reservation_date)}</span>
            <span><i class="fa-solid fa-clock"></i>${formatTime(item.start_time)} - ${formatTime(item.end_time)}</span>
            <span><i class="fa-solid fa-location-dot"></i>${item.location || "—"}</span>
          </div>

          <div class="status-badge ${status.className}">
            <i class="fa-solid ${status.icon}"></i>
            ${status.label}
          </div>
        </div>

        <button
          class="cancel-btn"
          data-id="${item.id}"
          ${mappedStatus !== "active" ? "disabled" : ""}
        >
          Cancelar
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".cancel-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const reservationId = Number(button.dataset.id);

      try {
        const response = await fetch(`${API_BASE}/reservas/${reservationId}/`, {
          method: "PATCH",
          headers: getAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ status: "cancelled" }),
        });

        if (!response.ok) {
          throw new Error("Não foi possível cancelar a reserva.");
        }

        await loadReservations(
          document.querySelector(".filter-btn.active")?.dataset.filter || "all"
        );
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  });
}

async function loadReservations(activeFilter = "all") {
  try {
    const [reservationsResponse, roomsResponse] = await Promise.all([
      fetch(`${API_BASE}/reservas/`, { headers: getAuthHeaders() }),
      fetch(`${API_BASE}/salas/`, { headers: getAuthHeaders() }),
    ]);

    if (!reservationsResponse.ok || !roomsResponse.ok) {
      throw new Error("Não foi possível carregar as reservas.");
    }

    const reservationsData = await reservationsResponse.json();
    const rooms = await roomsResponse.json();
    const roomMap = Object.fromEntries(rooms.map((room) => [room.id, room]));

    reservations = reservationsData.map((item) => ({
      ...item,
      roomName: roomMap[item.room]?.name || `Sala #${item.room}`,
      roomCode: roomMap[item.room]?.code || "—",
      location: roomMap[item.room]?.location || "",
    }));

    updateSummary();
    renderReservations(activeFilter);
  } catch (error) {
    console.error(error);
    reservationsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <strong>Erro ao carregar reservas</strong>
        <p>Verifique se você está logado e se o backend está rodando.</p>
      </div>
    `;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderReservations(button.dataset.filter);
  });
});

loadReservations();
