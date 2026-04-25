const roomsList = document.getElementById("roomsList");
const reservationsList = document.getElementById("reservationsList");

const rooms = [
  {
    name: "Sala de Estudos 01",
    code: "S01",
    type: "Estudo individual",
    capacity: 2,
    location: "Biblioteca - Piso 1",
    status: "Disponível"
  },
  {
    name: "Sala de Estudos 02",
    code: "S02",
    type: "Grupo",
    capacity: 6,
    location: "Biblioteca - Piso 2",
    status: "Disponível"
  },
  {
    name: "Sala de Reunião 03",
    code: "R03",
    type: "Reunião",
    capacity: 8,
    location: "Bloco Acadêmico",
    status: "Disponível"
  }
];

const reservations = [
  {
    room: "Sala de Estudos 01",
    date: "18/04/2026",
    time: "14:00 - 15:00",
    status: "Aprovada"
  },
  {
    room: "Sala de Estudos 02",
    date: "20/04/2026",
    time: "09:00 - 10:30",
    status: "Aprovada"
  }
];

function renderRooms() {
  roomsList.innerHTML = rooms.map(room => `
    <article class="room-card">
      <div class="room-info">
        <h3>${room.name}</h3>

        <div class="room-meta">
          <span><i class="fa-solid fa-hashtag"></i>${room.code}</span>
          <span><i class="fa-solid fa-users"></i>${room.capacity} pessoas</span>
          <span><i class="fa-solid fa-location-dot"></i>${room.location}</span>
          <span><i class="fa-solid fa-layer-group"></i>${room.type}</span>
        </div>

        <div class="status">
          <i class="fa-solid fa-circle-check"></i>
          ${room.status}
        </div>
      </div>

      <button class="reserve-btn">
        Reservar
      </button>
    </article>
  `).join("");
}

function renderReservations() {
  reservationsList.innerHTML = reservations.map(reservation => `
    <article class="reservation-card">
      <strong>${reservation.room}</strong>

      <span>
        <i class="fa-solid fa-calendar"></i>
        ${reservation.date}
      </span>

      <span>
        <i class="fa-solid fa-clock"></i>
        ${reservation.time}
      </span>

      <span>
        <i class="fa-solid fa-circle-check"></i>
        ${reservation.status}
      </span>
    </article>
  `).join("");
}

renderRooms();
renderReservations();