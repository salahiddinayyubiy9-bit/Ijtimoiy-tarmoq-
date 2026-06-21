const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const authSection = document.getElementById('authSection');
const loggedInSection = document.getElementById('loggedInSection');
const logoutBtn = document.getElementById('logoutBtn');
const phoneForm = document.getElementById('phoneForm');
const codeForm = document.getElementById('codeForm');
const phoneInput = document.getElementById('phoneInput');
const codeInput = document.getElementById('codeInput');
const testCodeDisplay = document.getElementById('testCodeDisplay');
const message = document.getElementById('message');
const profilePhone = document.getElementById('profilePhone');
const profileDiamonds = document.getElementById('profileDiamonds');
const profileRank = document.getElementById('profileRank');
const homeSection = document.getElementById('homeSection');
const roomDetailSection = document.getElementById('roomDetailSection');
const roomDetailName = document.getElementById('roomDetailName');
const messageList = document.getElementById('messageList');
const sendMessageForm = document.getElementById('sendMessageForm');
const messageInput = document.getElementById('messageInput');
const backToRoomListBtn = document.getElementById('backToRoomListBtn');

let currentPhone = '';
let currentUser = null;
let currentRoomSection = null;
let currentRoomId = null;

function showLoggedIn(user) {
  authSection.classList.add('hidden');
  loggedInSection.classList.remove('hidden');
  profilePhone.textContent = user.phone;
  profileDiamonds.textContent = user.diamonds;
  profileRank.textContent = user.rank;
  currentUser = user;
}

const savedUser = localStorage.getItem('user');
if (savedUser) {
  showLoggedIn(JSON.parse(savedUser));
}

phoneForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const phone = phoneInput.value;

  try {
    const response = await fetch('/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone })
    });

    const data = await response.json();

    if (data.success) {
      currentPhone = phone;
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      testCodeDisplay.textContent = `Test kodi: ${data.testCode}`;
      message.textContent = '';
    } else {
      message.textContent = data.error;
      message.style.color = '#f87171';
    }
  } catch (error) {
    message.textContent = 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.';
    message.style.color = '#f87171';
  }
});

codeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = codeInput.value;

  try {
    const response = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, code: code })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      codeForm.reset();
      showLoggedIn(data.user);
    } else {
      message.textContent = data.error;
      message.style.color = '#f87171';
    }
  } catch (error) {
    message.textContent = 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.';
    message.style.color = '#f87171';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  loggedInSection.classList.add('hidden');
  authSection.classList.remove('hidden');
  step1.classList.remove('hidden');
  step2.classList.add('hidden');
  phoneForm.reset();
});

const categoryToSection = {
  tanishuv: 'tanishuvSection',
  talabalar: 'talabalarSection',
  oqituvchilar: 'oqituvchilarSection',
  taqdimotlar: 'taqdimotlarSection',
  ilmiyishlar: 'ilmiyishlarSection',
  bepuldarslar: 'lessonsSection',
  qonun: 'qonunSection',
  doktorlar: 'doktorlarSection'
};

function renderRooms(rooms, listElement, sectionElement) {
  listElement.innerHTML = '';

  if (rooms.length === 0) {
    listElement.innerHTML = '<p class="emptyRoomsText">Hali xonalar yo\'q. Birinchi bo\'lib yarating!</p>';
    return;
  }

  rooms.forEach((room) => {
    const item = document.createElement('div');
    item.className = 'roomItem';
    item.innerHTML = `
      <span class="roomName">${room.name}</span>
      <span class="roomCreator">${room.createdBy}</span>
    `;
    item.addEventListener('click', () => {
      openRoom(room.id, sectionElement);
    });
    listElement.appendChild(item);
  });
}

async function loadRooms(category, sectionElement) {
  const listElement = sectionElement.querySelector('.roomList');

  try {
    const response = await fetch(`/api/rooms/${category}`);
    const data = await response.json();

    if (data.success) {
      renderRooms(data.rooms, listElement, sectionElement);
    }
  } catch (error) {
    listElement.innerHTML = '<p class="emptyRoomsText">Xonalarni yuklashda xatolik yuz berdi.</p>';
  }
}

function renderMessages(messages) {
  messageList.innerHTML = '';

  if (messages.length === 0) {
    messageList.innerHTML = '<p class="emptyMessagesText">Hali xabarlar yo\'q. Birinchi bo\'lib yozing!</p>';
    return;
  }

  messages.forEach((msg) => {
    const bubble = document.createElement('div');
    const isOwn = msg.sender === currentUser.phone;
    bubble.className = isOwn ? 'messageBubble own' : 'messageBubble';
    bubble.innerHTML = `
      <p class="messageSender">${msg.sender}</p>
      <p class="messageText">${msg.text}</p>
    `;
    messageList.appendChild(bubble);
  });

  messageList.scrollTop = messageList.scrollHeight;
}

async function openRoom(roomId, sectionElement) {
  currentRoomSection = sectionElement;
  currentRoomId = roomId;

  try {
    const response = await fetch(`/api/rooms/single/${roomId}`);
    const data = await response.json();

    if (data.success) {
      sectionElement.classList.add('hidden');
      roomDetailSection.classList.remove('hidden');
      roomDetailName.textContent = data.room.name;
      renderMessages(data.room.messages);
    }
  } catch (error) {
    alert('Xonani yuklashda xatolik yuz berdi.');
  }
}

backToRoomListBtn.addEventListener('click', () => {
  roomDetailSection.classList.add('hidden');
  if (currentRoomSection) {
    currentRoomSection.classList.remove('hidden');
  }
});

sendMessageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageInput.value;

  try {
    const response = await fetch(`/api/rooms/${currentRoomId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, phone: currentUser.phone })
    });

    const data = await response.json();

    if (data.success) {
      messageInput.value = '';
      const roomResponse = await fetch(`/api/rooms/single/${currentRoomId}`);
      const roomData = await roomResponse.json();
      if (roomData.success) {
        renderMessages(roomData.room.messages);
      }
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Xabar yuborishda xatolik yuz berdi.');
  }
});

const categoryCards = document.querySelectorAll('.categoryCard');

categoryCards.forEach((card) => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    const sectionId = categoryToSection[category];
    const targetSection = document.getElementById(sectionId);

    homeSection.classList.add('hidden');
    targetSection.classList.remove('hidden');
    loadRooms(category, targetSection);
  });
});

const backButtons = document.querySelectorAll('.backBtn');

backButtons.forEach((btn) => {
  if (btn.id === 'backToRoomListBtn') return;

  btn.addEventListener('click', () => {
    const category = btn.dataset.back;
    const sectionId = categoryToSection[category];
    const targetSection = document.getElementById(sectionId);

    targetSection.classList.add('hidden');
    homeSection.classList.remove('hidden');
  });
});

const createRoomForms = document.querySelectorAll('.createRoomForm');

createRoomForms.forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const sectionElement = form.closest('.roomSection');
    const category = sectionElement.dataset.category;
    const nameInput = form.querySelector('.roomNameInput');
    const roomName = nameInput.value;

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          category: category,
          phone: currentUser.phone
        })
      });

      const data = await response.json();

      if (data.success) {
        nameInput.value = '';
        loadRooms(category, sectionElement);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  });
});