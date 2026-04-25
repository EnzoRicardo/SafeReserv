const reservationForm = document.getElementById("reservationForm");
const formMessage = document.getElementById("formMessage");
const occupiedList = document.getElementById("occupiedList");

const occupiedTimes = [
  {
    room: "Sala de Estudos 01",
    date: "18/04/2026",
    time: "10:00 - 11:00",
    user: "Reserva já existente"
  },
  {
    room: "Sala de Estudos 02",
    date: "18/04/2026",
    time: "14:00 - 15:30",
    user: "Reserva já existente"
  },
  {
    room: "Sala de Reunião 03",
    date: "19/04/2026",
    time: "09:00 - 10:00",
    user: "Reserva já existente"
  }
];

function renderOccupiedTimes() {
  occupiedList.innerHTML = occupiedTimes.map(item => `
    <article class="occupied-item">
      <strong>${item.room}</strong>

      <span>
        <i class="fa-solid fa-calendar"></i>
        ${item.date}
      </span>

      <span>
        <i class="fa-solid fa-clock"></i>
        ${item.time}
      </span>

      <span>
        <i class="fa-solid fa-lock"></i>
        ${item.user}
      </span>
    </article>
  `).join("");
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

reservationForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const room = document.getElementById("room").value;
  const date = document.getElementById("date").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  formMessage.className = "form-message";
  formMessage.textContent = "";

  if (!room || !date || !startTime || !endTime) {
    formMessage.textContent = "Preencha todos os campos obrigatórios.";
    formMessage.classList.add("error");
    return;
  }

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end <= start) {
    formMessage.textContent = "O horário final deve ser maior que o horário inicial.";
    formMessage.classList.add("error");
    return;
  }

  const duration = end - start;

  if (duration > 120) {
    formMessage.textContent = "A reserva não pode passar de 2 horas.";
    formMessage.classList.add("error");
    return;
  }

  formMessage.textContent = "Reserva validada com sucesso. Integração com backend em breve.";
  formMessage.classList.add("success");

  reservationForm.reset();
});

renderOccupiedTimes();