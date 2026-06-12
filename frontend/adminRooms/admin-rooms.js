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

let rooms = [];

const typeLabels = {
  study: "Estudo",
  group: "Grupo",
  meeting: "Reunião",
  teacher: "Professor",
};

const statusLabels = {
  available: "Disponível",
  maintenance: "Manutenção",
  inactive: "Inativa",
};

function renderRooms() {
  if (rooms.length === 0) {
    roomsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-door-open"></i>
        <strong>Nenhuma sala cadastrada</strong>
        <p>Use o formulário ao lado para cadastrar a primeira sala.</p>
      </div>
    `;
    return;
  }

  roomsList.innerHTML = rooms.map((room) => `
    <article class="room-card">
      <div>
        <h3>${room.name}</h3>

        <div class="room-meta">
          <span><i class="fa-solid fa-hashtag"></i>${room.code}</span>
          <span><i class="fa-solid fa-layer-group"></i>${typeLabels[room.room_type]}</span>
          <span><i class="fa-solid fa-users"></i>${room.capacity} pessoas</span>
          <span><i class="fa-solid fa-location-dot"></i>${room.location || "—"}</span>
        </div>

        <div class="status-badge ${room.status}">
          <i class="fa-solid fa-circle-info"></i>
          ${statusLabels[room.status]}
        </div>
      </div>

      <div class="room-actions">
        <button class="edit-btn" type="button" data-id="${room.id}">
          Editar
        </button>

        <button class="disable-btn" type="button" data-id="${room.id}" ${room.status === "inactive" ? "disabled" : ""}>
          Desativar
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", () => editRoom(Number(button.dataset.id)));
  });

  document.querySelectorAll(".disable-btn").forEach((button) => {
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
  const room = rooms.find((item) => item.id === id);
  if (!room) return;

  roomIdInput.value = room.id;
  roomNameInput.value = room.name;
  roomCodeInput.value = room.code;
  roomTypeInput.value = room.room_type;
  roomCapacityInput.value = room.capacity;
  roomLocationInput.value = room.location || "";
  roomStatusInput.value = room.status;

  formTitle.textContent = "Editar sala";
  submitButton.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar alterações';
  cancelEditButton.classList.add("show");
}

async function disableRoom(id) {
  try {
    const response = await fetch(`${API_BASE}/salas/${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ status: "inactive" }),
    });

    if (!response.ok) {
      throw new Error("Não foi possível desativar a sala.");
    }

    await loadRooms();
    formMessage.textContent = "Sala desativada com sucesso.";
    formMessage.className = "form-message success";
  } catch (error) {
    console.error(error);
    formMessage.textContent = error.message;
    formMessage.className = "form-message error";
  }
}

async function loadRooms() {
  try {
    const response = await fetch(`${API_BASE}/salas/`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error("Não foi possível carregar as salas.");
    }

    rooms = await response.json();
    renderRooms();
  } catch (error) {
    console.error(error);
    roomsList.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <strong>Erro ao carregar salas</strong>
        <p>Verifique se você está logado como admin.</p>
      </div>
    `;
  }
}

roomForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const roomData = {
    name: roomNameInput.value.trim(),
    code: roomCodeInput.value.trim(),
    room_type: roomTypeInput.value,
    capacity: Number(roomCapacityInput.value),
    location: roomLocationInput.value.trim(),
    status: roomStatusInput.value,
  };

  if (
    !roomData.name ||
    !roomData.code ||
    !roomData.room_type ||
    !roomData.capacity ||
    !roomData.location
  ) {
    formMessage.textContent = "Preencha todos os campos obrigatórios.";
    formMessage.className = "form-message error";
    return;
  }

  const isEditing = Boolean(roomIdInput.value);
  const url = isEditing
    ? `${API_BASE}/salas/${roomIdInput.value}/`
    : `${API_BASE}/salas/`;

  try {
    const response = await fetch(url, {
      method: isEditing ? "PUT" : "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(roomData),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorText = formatApiError(data);
      throw new Error(errorText || "Não foi possível salvar a sala.");
    }

    formMessage.textContent = isEditing
      ? "Sala atualizada com sucesso."
      : "Sala cadastrada com sucesso.";
    formMessage.className = "form-message success";

    resetForm();
    await loadRooms();
  } catch (error) {
    console.error(error);
    formMessage.textContent = error.message;
    formMessage.className = "form-message error";
  }
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
  formMessage.textContent = "";
  formMessage.className = "form-message";
});

loadRooms();
