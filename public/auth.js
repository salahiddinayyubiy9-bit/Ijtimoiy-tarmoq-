const socket = io();

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
const dailyClaimBtn = document.getElementById('dailyClaimBtn');
const mediaPanel = document.getElementById('mediaPanel');
const emojiPanel = document.getElementById('emojiPanel');
const stickerPanel = document.getElementById('stickerPanel');
const gifPanel = document.getElementById('gifPanel');
const emojiBtn = document.getElementById('emojiBtn');
const stickerBtn = document.getElementById('stickerBtn');
const gifBtn = document.getElementById('gifBtn');

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

dailyClaimBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('/api/daily-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentUser.phone })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      profileDiamonds.textContent = data.user.diamonds;
      alert('Tabriklaymiz! Sizga 15 olmos qo\'shildi!');
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
  }
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

function renderRooms(rooms, listElement, sectionElement, category) {
  listElement.innerHTML = '';

  if (rooms.length === 0) {
    listElement.innerHTML = '<p class="emptyRoomsText">Hali xonalar yo\'q. Birinchi bo\'lib yarating!</p>';
    return;
  }

  rooms.forEach((room) => {
    const item = document.createElement('div');
    item.className = 'roomItem';

    const isOwner = currentUser && room.createdBy === currentUser.phone;
    const deleteBtnHtml = isOwner ? `<span class="deleteRoomBtn">🗑️</span>` : '';

    item.innerHTML = `
      <span class="roomName">${room.name}</span>
      <span class="roomCreator">${room.createdBy}</span>
      ${deleteBtnHtml}
    `;

    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('deleteRoomBtn')) {
        return;
      }
      openRoom(room.id, sectionElement);
    });

    if (isOwner) {
      const deleteBtn = item.querySelector('.deleteRoomBtn');
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteRoom(room.id, category, sectionElement);
      });
    }

    listElement.appendChild(item);
  });
}

async function deleteRoom(roomId, category, sectionElement) {
  const confirmed = confirm('Rostdan ham bu xonani o\'chirmoqchimisiz?');
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/rooms/${roomId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentUser.phone })
    });

    const data = await response.json();

    if (data.success) {
      loadRooms(category, sectionElement);
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Xonani o\'chirishda xatolik yuz berdi.');
  }
}

async function loadRooms(category, sectionElement) {
  const listElement = sectionElement.querySelector('.roomList');

  try {
    const response = await fetch(`/api/rooms/${category}`);
    const data = await response.json();

    if (data.success) {
      renderRooms(data.rooms, listElement, sectionElement, category);
    }
  } catch (error) {
    listElement.innerHTML = '<p class="emptyRoomsText">Xonalarni yuklashda xatolik yuz berdi.</p>';
  }
}

function appendMessage(msg) {
  const bubble = document.createElement('div');
  const isOwn = msg.sender === currentUser.phone;
  bubble.className = isOwn ? 'messageBubble own' : 'messageBubble';

  let contentHtml = '';

  if (msg.text.startsWith('[sticker:') && msg.text.endsWith(']')) {
    const sticker = msg.text.slice(9, -1);
    contentHtml = `<span class="messageSticker">${sticker}</span>`;
  } else if (msg.text.startsWith('[gif:') && msg.text.endsWith(']')) {
    const gifUrl = msg.text.slice(5, -1);
    contentHtml = `<img class="messageGif" src="${gifUrl}" alt="gif">`;
  } else {
    contentHtml = `<p class="messageText">${msg.text}</p>`;
  }

  bubble.innerHTML = `
    <p class="messageSender">${msg.sender}</p>
    ${contentHtml}
  `;

  messageList.appendChild(bubble);
  messageList.scrollTop = messageList.scrollHeight;
}

function renderMessages(messages) {
  messageList.innerHTML = '';

  if (messages.length === 0) {
    messageList.innerHTML = '<p class="emptyMessagesText">Hali xabarlar yo\'q. Birinchi bo\'lib yozing!</p>';
    return;
  }

  messages.forEach((msg) => {
    appendMessage(msg);
  });
}

async function openRoom(roomId, sectionElement) {
  try {
    const response = await fetch(`/api/rooms/single/${roomId}`);
    const data = await response.json();

    if (data.success) {
      currentRoomSection = sectionElement;
      currentRoomId = roomId;
      sectionElement.classList.add('hidden');
      roomDetailSection.classList.remove('hidden');
      roomDetailName.textContent = data.room.name;
      renderMessages(data.room.messages);
      socket.emit('joinRoom', roomId);
    }
  } catch (error) {
    alert('Xonani yuklashda xatolik yuz berdi.');
  }
}

function closeAllPanels() {
  mediaPanel.classList.add('hidden');
  emojiPanel.classList.add('hidden');
  stickerPanel.classList.add('hidden');
  gifPanel.classList.add('hidden');
}

function togglePanel(panel) {
  const isHidden = panel.classList.contains('hidden');
  closeAllPanels();
  if (isHidden) {
    mediaPanel.classList.remove('hidden');
    panel.classList.remove('hidden');
  }
}

emojiBtn.addEventListener('click', () => {
  togglePanel(emojiPanel);
});

stickerBtn.addEventListener('click', () => {
  togglePanel(stickerPanel);
});

gifBtn.addEventListener('click', () => {
  togglePanel(gifPanel);
});

document.querySelectorAll('.emojiItem').forEach((item) => {
  item.addEventListener('click', () => {
    messageInput.value += item.textContent;
    closeAllPanels();
    messageInput.focus();
  });
});

document.querySelectorAll('.stickerItem').forEach((item) => {
  item.addEventListener('click', () => {
    const sticker = item.dataset.sticker;
    socket.emit('sendMessage', {
      roomId: currentRoomId,
      text: `[sticker:${sticker}]`,
      phone: currentUser.phone
    });
    closeAllPanels();
  });
});

document.querySelectorAll('.gifItem').forEach((item) => {
  item.addEventListener('click', () => {
    const gifUrl = item.src;
    socket.emit('sendMessage', {
      roomId: currentRoomId,
      text: `[gif:${gifUrl}]`,
      phone: currentUser.phone
    });
    closeAllPanels();
  });
});

socket.on('roomFull', () => {
  alert('Bu xona to\'la (12/12). Boshqa xonani tanlang.');
});

socket.on('newMessage', (msg) => {
  if (Number(currentRoomId) === msg.roomId) {
    appendMessage(msg);
  }
});

backToRoomListBtn.addEventListener('click', () => {
  roomDetailSection.classList.add('hidden');
  closeAllPanels();
  if (currentRoomSection) {
    currentRoomSection.classList.remove('hidden');
  }
});

sendMessageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value;
  if (!text.trim()) return;

  socket.emit('sendMessage', {
    roomId: currentRoomId,
    text: text,
    phone: currentUser.phone
  });

  messageInput.value = '';
});

const categoryCards = document.querySelectorAll('.categoryCard');

categoryCards.forEach((card) => {
  card.addEventListener('click', async () => {
    const category = card.dataset.category;
    const sectionId = categoryToSection[category];
    const targetSection = document.getElementById(sectionId);

    try {
      const response = await fetch('/api/category-enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: currentUser.phone })
      });

      const data = await response.json();

      if (data.success) {
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        profileDiamonds.textContent = data.user.diamonds;

        homeSection.classList.add('hidden');
        targetSection.classList.remove('hidden');
        loadRooms(category, targetSection);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
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