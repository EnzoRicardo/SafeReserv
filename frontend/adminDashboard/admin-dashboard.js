const roomsCount = document.getElementById("roomsCount");
const activeReservations = document.getElementById("activeReservations");
const pendingReservations = document.getElementById("pendingReservations");
const logsCount = document.getElementById("logsCount");
const reservationsList = document.getElementById("reservationsList");

const reservations = [
  {
    user: "Enzo Ricardo",
    room: "Sala de Estudos 01",
    date: "18/04/2026",
    time: "14:00 - 15:00",
    status: "approved"
  },
  {
    user: "Aluno Exemplo",
    room: "Sala de Reunião 03",
    date: "19/04/2026",
    time: "09:00 - 10:00",
    status: "pending"
  },
  {
    user: "Professor Exemplo",
    room: "Sala Docente 01",
    date: "20/04/2026",
    time: "13:00 - 14:00",
    status: "approved"
  }
];

const statusMap = {
  approved: "Aprovada",
  pending: "Pendente",
  cancelled: "Cancelada"
};

roomsCount.textContent = "8";
activeReservations.textContent = reservations.filter(item => item.status === "approved").length;
pendingReservations.textContent = reservations.filter(item => item.status === "pending").length;
logsCount.textContent = "12";

reservationsList.innerHTML = reservations.map(item => `
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
      ${statusMap[item.status]}
    </div>
  </article>
`).join("");