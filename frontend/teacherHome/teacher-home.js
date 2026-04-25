const roomsList = document.getElementById("roomsList");
const reservationsList = document.getElementById("reservationsList");

const rooms = [
  {
    name: "Sala de Reunião Docente",
    code: "P01",
    type: "Exclusiva professor",
    capacity: 8,
    location: "Bloco dos Professores",
    status: "Disponível"
  },
  {
    name: "Sala de Atendimento Acadêmico",
    code: "P02",
    type: "Exclusiva professor",
    capacity: 4,
    location: "Coordenação",
    status: "Disponível"
  },
  {
    name: "Sala de Reunião 03",
    code: "R03",
    type: "Reunião",
    capacity: 10,
    location: "Bloco Acadêmico",
    status: "Disponível"
  },
  {
    name: "Sala de Estudos 02",
    code: "S02",
    type: "Grupo",
    capacity: 6,
    location: "Biblioteca - Piso 2",
    status: "Disponível"
  }
];

const reservations = [
  {
    room: "Sala de Reunião Docente",
    date: "18/04/2026",
    time: "13:00 - 14:00",
    status: "Aprovada"
  },
  {
    room: "Sala de Atendimento Acadêmico",
    date: "19/04/2026",
    time: "09:00 - 10:00",
    status: "Aprovada"
  },
  {
    room: "Sala de Reunião 03",
    date: "22/04/2026",
    time: "15:00 - 16:30",
    status: "Pendente"
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