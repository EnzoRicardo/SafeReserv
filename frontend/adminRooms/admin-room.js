const roomForm = document.getElementById("roomForm");
const roomsList = document.getElementById("roomsList");
const roomIdInput = document.getElementById("roomId");
const roomNameInput = document.getElementById("roomName");
const roomCodeInput = document.getElementById("roomCode");
const roomTypeInput = document.getElementById("roomType");
const roomCapacityInput = document.getElementById("roomCapacity");
const roomLocationInput = document.getElementById("roomLocation");
const roomStatusInput = document.getElementById("roomStatus");
const formMessage = document.getElementById("formMessage");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");

let rooms = [
  {
    id: 1,
    name: "Sala de Estudos 01",
    code: "S01",
    type: "study",
    capacity: 2,
    location: "Biblioteca - Piso 1",
    status: "available"
  },
  {
    id: 2,
    name: "Sala de Reunião Docente",
    code: "P01",
    type: "teacher",
    capacity: 8,
    location: "Bloco dos Professores",
    status: "available"
  }
];

const typeLabels = {
  study: "Estudo",
  group: "Grupo",
  meeting: "Reunião",
  teacher: "Professor"
};

const statusLabels = {
  available: "Disponível",
  maintenance: "Manutenção",
  inactive: "Inativa"
};

function renderRooms() {
  roomsList.innerHTML = rooms.map(room => `
    <article class="room-card">
      <div>
        <h3>${room.name}</h3>

        <div class="room-meta">
          <span><i class="fa-solid fa-hashtag"></i>${room.code}</span>
          <span><i class="fa-solid fa-layer-group"></i>${typeLabels[room.type]}</span>
          <span><i class="fa-solid fa-users"></i>${room.capacity} pessoas</span>
          <span><i class="fa-solid fa-location-dot"></i>${room.location}</span>
        </div>

        <div class="status-badge ${room.status}">
          <i class="fa-solid fa-circle-info"></i>
          ${statusLabels[room.status]}
        </div>
      </div>

      <div class="room-actions">
        <button class="edit-btn" data-id="${room.id}">
          Editar
        </button>

        <button class="disable-btn" data-id="${room.id}">
          Desativar
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".edit-btn").forEach(button => {
    button.addEventListener("click", () => editRoom(Number(button.dataset.id)));
  });

  document.querySelectorAll(".disable-btn").forEach(button => {
    button.addEventListener("click", () => disableRoom(Number(button.dataset.id)));
  });
}

function resetForm() {
  roomForm.reset();
  roomIdInput.value = "";
  formTitle.textContent = "Cadastrar sala";
  submitButton.innerHTML = '<i class="fa-solid fa-plus"></i> Cadastrar sala';
  cancelEditButton.classList.remove("show");
}

function editRoom(id) {
  const room = rooms.find(item => item.id === id);

  if (!room) return;

  roomIdInput.value = room.id;
  roomNameInput.value = room.name;
  roomCodeInput.value = room.code;
  roomTypeInput.value = room.type;
  roomCapacityInput.value = room.capacity;
  roomLocationInput.value = room.location;
  roomStatusInput.value = room.status;

  formTitle.textContent = "Editar sala";
  submitButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
  cancelEditButton.classList.add("show");
}

function disableRoom(id) {
  rooms = rooms.map(room => {
    if (room.id === id) {
      return {
        ...room,
        status: "inactive"
      };
    }

    return room;
  });

  renderRooms();
}

roomForm.addEventListener("submit", event => {
  event.preventDefault();

  const roomData = {
    id: roomIdInput.value ? Number(roomIdInput.value) : Date.now(),
    name: roomNameInput.value.trim(),
    code: roomCodeInput.value.trim(),
    type: roomTypeInput.value,
    capacity: Number(roomCapacityInput.value),
    location: roomLocationInput.value.trim(),
    status: roomStatusInput.value
  };

  if (!roomData.name || !roomData.code || !roomData.type || !roomData.capacity || !roomData.location) {
    formMessage.textContent = "Preencha todos os campos obrigatórios.";
    formMessage.className = "form-message error";
    return;
  }

  if (roomIdInput.value) {
    rooms = rooms.map(room => room.id === roomData.id ? roomData : room);
    formMessage.textContent = "Sala atualizada com sucesso.";
  } else {
    rooms.push(roomData);
    formMessage.textContent = "Sala cadastrada com sucesso.";
  }

  formMessage.className = "form-message success";

  resetForm();
  renderRooms();
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
  formMessage.textContent = "";
  formMessage.className = "form-message";
});

renderRooms();