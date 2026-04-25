const reservationsList = document.getElementById("reservationsList");
const filterButtons = document.querySelectorAll(".filter-btn");

const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");
const cancelledCount = document.getElementById("cancelledCount");

let reservations = [
  {
    id: 1,
    room: "Sala de Estudos 01",
    code: "S01",
    date: "18/04/2026",
    time: "14:00 - 15:00",
    location: "Biblioteca - Piso 1",
    status: "active"
  },
  {
    id: 2,
    room: "Sala de Estudos 02",
    code: "S02",
    date: "20/04/2026",
    time: "09:00 - 10:30",
    location: "Biblioteca - Piso 2",
    status: "active"
  },
  {
    id: 3,
    room: "Sala de Reunião 03",
    code: "R03",
    date: "10/04/2026",
    time: "13:00 - 14:00",
    location: "Bloco Acadêmico",
    status: "completed"
  },
  {
    id: 4,
    room: "Sala de Estudos 04",
    code: "S04",
    date: "08/04/2026",
    time: "16:00 - 17:00",
    location: "Biblioteca - Piso 1",
    status: "cancelled"
  }
];

const statusConfig = {
  active: {
    label: "Ativa",
    icon: "fa-clock",
    className: "active"
  },
  completed: {
    label: "Concluída",
    icon: "fa-circle-check",
    className: "completed"
  },
  cancelled: {
    label: "Cancelada",
    icon: "fa-ban",
    className: "cancelled"
  }
};

function updateSummary() {
  activeCount.textContent = reservations.filter(item => item.status === "active").length;
  completedCount.textContent = reservations.filter(item => item.status === "completed").length;
  cancelledCount.textContent = reservations.filter(item => item.status === "cancelled").length;
}

function renderReservations(filter = "all") {
  const filteredReservations = filter === "all"
    ? reservations
    : reservations.filter(item => item.status === filter);

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

  reservationsList.innerHTML = filteredReservations.map(item => {
    const status = statusConfig[item.status];

    return `
      <article class="reservation-card">
        <div>
          <h3>${item.room}</h3>

          <div class="reservation-meta">
            <span><i class="fa-solid fa-hashtag"></i>${item.code}</span>
            <span><i class="fa-solid fa-calendar"></i>${item.date}</span>
            <span><i class="fa-solid fa-clock"></i>${item.time}</span>
            <span><i class="fa-solid fa-location-dot"></i>${item.location}</span>
          </div>

          <div class="status-badge ${status.className}">
            <i class="fa-solid ${status.icon}"></i>
            ${status.label}
          </div>
        </div>

        <button 
          class="cancel-btn" 
          data-id="${item.id}"
          ${item.status !== "active" ? "disabled" : ""}
        >
          Cancelar
        </button>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".cancel-btn").forEach(button => {
    button.addEventListener("click", () => {
      const reservationId = Number(button.dataset.id);

      reservations = reservations.map(item => {
        if (item.id === reservationId) {
          return {
            ...item,
            status: "cancelled"
          };
        }

        return item;
      });

      updateSummary();

      const activeFilter = document.querySelector(".filter-btn.active").dataset.filter;
      renderReservations(activeFilter);
    });
  });
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    renderReservations(button.dataset.filter);
  });
});

updateSummary();
renderReservations();