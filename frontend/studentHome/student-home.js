const roomsList = document.getElementById("roomsList");
const reservationsList = document.getElementById("reservationsList");

const activeReservationsEl = document.getElementById("activeReservations");
const availableRoomsEl = document.getElementById("availableRooms");
const nextReservationEl = document.getElementById("nextReservation");

async function loadDashboard() {
  try {
    const [roomsResponse, reservationsResponse] = await Promise.all([
      fetch(`${API_BASE}/salas/`, {
        headers: getAuthHeaders(),
      }),
      fetch(`${API_BASE}/reservas/`, {
        headers: getAuthHeaders(),
      }),
    ]);

    const rooms = await roomsResponse.json();
    const reservations = await reservationsResponse.json();

    renderRooms(rooms);
    renderReservations(reservations);
    updateSummaryCards(rooms, reservations);

  } catch (error) {
    console.error("Erro ao carregar dashboard:", error);
  }
}

function renderRooms(rooms) {

  const session = getSession();

  const filteredRooms = rooms.filter(room => {

    if (
      room.room_type === "teacher" &&
      session.user.role === "student"
    ) {
      return false;
    }

    return true;
  });

  roomsList.innerHTML = rooms.map(room => `
    <article class="room-card">
      <div class="room-info">
        <h3>${room.name}</h3>

        <div class="room-meta">
          <span><i class="fa-solid fa-hashtag"></i>${room.code}</span>
          <span><i class="fa-solid fa-users"></i>${room.capacity} pessoas</span>
          <span><i class="fa-solid fa-location-dot"></i>${room.location || "-"}</span>
          <span><i class="fa-solid fa-layer-group"></i>${room.room_type}</span>
        </div>

        <div class="status">
          <i class="fa-solid fa-circle-check"></i>
          ${room.status}
        </div>
      </div>

      <button class="reserve-btn" type="button" data-reserve>
        Reservar
      </button>
    </article>
  `).join("");

  document.querySelectorAll("[data-reserve]").forEach(button => {
    button.addEventListener("click", () => {
      window.location.href = "../reservationPage/reservation.html";
    });
  });
}

function renderReservations(reservations) {
  if (!reservations.length) {
    reservationsList.innerHTML = `
      <p>Nenhuma reserva encontrada.</p>
    `;
    return;
  }

  reservationsList.innerHTML = reservations.map(reservation => `
    <article class="reservation-card">
      <strong>${reservation.room_name}</strong>

      <span>
        <i class="fa-solid fa-calendar"></i>
        ${reservation.reservation_date}
      </span>

      <span>
        <i class="fa-solid fa-clock"></i>
        ${reservation.start_time.slice(0,5)} -
        ${reservation.end_time.slice(0,5)}
      </span>

      <span>
        <i class="fa-solid fa-circle-check"></i>
        ${reservation.status}
      </span>
    </article>
  `).join("");
}

function updateSummaryCards(rooms, reservations) {

  const activeReservations =
    reservations.filter(r => r.status === "approved").length;

  const availableRooms =
    rooms.filter(r => r.status === "available").length;

  activeReservationsEl.textContent = activeReservations;
  availableRoomsEl.textContent = availableRooms;

  if (reservations.length > 0) {
    const nextReservation = reservations[0];

    nextReservationEl.textContent =
      nextReservation.start_time.slice(0, 5);
  } else {
    nextReservationEl.textContent = "--:--";
  }
}

loadDashboard();