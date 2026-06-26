const socket = io();

const STATE_KEY = 'appState';

const authSection = document.getElementById('authSection');
const loggedInSection = document.getElementById('loggedInSection');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const phoneForm = document.getElementById('phoneForm');
const codeForm = document.getElementById('codeForm');
const phoneInput = document.getElementById('phoneInput');
const codeInput = document.getElementById('codeInput');
const testCodeDisplay = document.getElementById('testCodeDisplay');
const message = document.getElementById('message');
const profilePhone = document.getElementById('profilePhone');
const profileDiamonds = document.getElementById('profileDiamonds');
const profileRank = document.getElementById('profileRank');
const logoutBtn = document.getElementById('logoutBtn');
const dailyClaimBtn = document.getElementById('dailyClaimBtn');
const homeSection = document.getElementById('homeSection');

const categoryPage = document.getElementById('categoryPage');
const categoryBackBtn = document.getElementById('categoryBackBtn');
const categoryPageTitle = document.getElementById('categoryPageTitle');
const categoryPageDiamonds = document.getElementById('categoryPageDiamonds');
const categoryPageRoomCount = document.getElementById('categoryPageRoomCount');
const categoryCreateRoomForm = document.getElementById('categoryCreateRoomForm');
const categoryRoomNameInput = document.getElementById('categoryRoomNameInput');
const categoryRoomList = document.getElementById('categoryRoomList');

const roomPage = document.getElementById('roomPage');
const roomBackBtn = document.getElementById('roomBackBtn');
const roomPageName = document.getElementById('roomPageName');
const roomPageCount = document.getElementById('roomPageCount');
const roomPageCreatorRank = document.getElementById('roomPageCreatorRank');
const roomPageMyRank = document.getElementById('roomPageMyRank');
const roomDeleteBtn = document.getElementById('roomDeleteBtn');
const roomPageMessages = document.getElementById('roomPageMessages');
const roomMessageInput = document.getElementById('roomMessageInput');
const roomSendBtn = document.getElementById('roomSendBtn');
const roomVoiceBtn = document.getElementById('roomVoiceBtn');
const roomMediaPanel = document.getElementById('roomMediaPanel');
const roomEmojiPanel = document.getElementById('roomEmojiPanel');
const roomStickerPanel = document.getElementById('roomStickerPanel');
const roomGifPanel = document.getElementById('roomGifPanel');
const roomEmojiBtn = document.getElementById('roomEmojiBtn');
const roomStickerBtn = document.getElementById('roomStickerBtn');
const roomGifBtn = document.getElementById('roomGifBtn');

let currentPhone = '';
let currentUser = null;
let currentCategory = null;
let currentRoomId = null;
let currentRoomData = null;

function saveState(type, data) {
  localStorage.setItem(STATE_KEY, JSON.stringify({ type, data }));
}

function clearState() {
  localStorage.removeItem(STATE_KEY);
}

function lockScroll() {
  document.body.classList.add('no-scroll');
}

function unlockScroll() {
  document.body.classList.remove('no-scroll');
}

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
    message.textContent = 'Xatolik yuz berdi.';
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
    message.textContent = 'Xatolik yuz berdi.';
    message.style.color = '#f87171';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  clearState();
  unlockScroll();
  categoryPage.classList.add('hidden');
  roomPage.classList.add('hidden');
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
    alert('Xatolik yuz berdi.');
  }
});

const categoryNames = {
  tanishuv: 'Tanishuv-chat',
  talabalar: 'Talabalar',
  oqituvchilar: 'O\'qituvchilar',
  taqdimotlar: 'Taqdimotlar',
  ilmiyishlar: 'Ilmiy ishlar',
  bepuldarslar: 'Bepul darslar',
  qonun: 'Qonun masalalari',
  doktorlar: 'Doktorlar'
};

async function openCategoryPage(category) {
  currentCategory = category;
  categoryPageTitle.textContent = categoryNames[category];
  categoryPageDiamonds.textContent = currentUser.diamonds;
  lockScroll();
  categoryPage.classList.remove('hidden');
  saveState('category', { category });
  await loadCategoryRooms();
}

async function loadCategoryRooms() {
  try {
    const response = await fetch(`/api/rooms/${currentCategory}`);
    const data = await response.json();
    if (data.success) {
      categoryPageRoomCount.textContent = data.rooms.length;
      renderCategoryRooms(data.rooms);
    }
  } catch (error) {
    categoryRoomList.innerHTML = '<p class="emptyRoomsText">Xatolik yuz berdi.</p>';
  }
}

function renderCategoryRooms(rooms) {
  categoryRoomList.innerHTML = '';
  if (rooms.length === 0) {
    categoryRoomList.innerHTML = '<p class="emptyRoomsText">Hali xonalar yo\'q. Birinchi bo\'lib yarating!</p>';
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
      if (e.target.classList.contains('deleteRoomBtn')) return;
      openRoomPage(room);
    });
    if (isOwner) {
      item.querySelector('.deleteRoomBtn').addEventListener('click', async (e) => {
        e.stopPropagation();
        const confirmed = confirm('Rostdan ham bu xonani o\'chirmoqchimisiz?');
        if (!confirmed) return;
        try {
          const response = await fetch(`/api/rooms/${room._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone })
          });
          const data = await response.json();
          if (data.success) {
            await loadCategoryRooms();
          } else {
            alert(data.error);
          }
        } catch (err) {
          alert('Xatolik yuz berdi.');
        }
      });
    }
    categoryRoomList.appendChild(item);
  });
}

categoryBackBtn.addEventListener('click', () => {
  categoryPage.classList.add('hidden');
  unlockScroll();
  currentCategory = null;
  clearState();
});

categoryCreateRoomForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const roomName = categoryRoomNameInput.value.trim();
  if (!roomName) return;
  try {
    const response = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: roomName, category: currentCategory, phone: currentUser.phone })
    });
    const data = await response.json();
    if (data.success) {
      categoryRoomNameInput.value = '';
      await loadCategoryRooms();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Xatolik yuz berdi.');
  }
});

async function openRoomPage(room) {
  currentRoomId = room._id;
  currentRoomData = room;
  roomPageName.textContent = room.name;
  roomPageMyRank.textContent = currentUser.rank;
  roomPageCreatorRank.textContent = room.createdBy === currentUser.phone ? currentUser.rank : 'Oddiy askar';

  const isOwner = room.createdBy === currentUser.phone;
  if (isOwner) {
    roomDeleteBtn.classList.remove('hidden');
  } else {
    roomDeleteBtn.classList.add('hidden');
  }

  roomPage.classList.remove('hidden');
  renderRoomMessages(room.messages || []);
  socket.emit('joinRoom', room._id);
  roomPageCount.textContent = 1;
  saveState('room', { roomId: room._id, category: currentCategory });
}

function renderRoomMessages(messages) {
  roomPageMessages.innerHTML = '';
  if (messages.length === 0) {
    roomPageMessages.innerHTML = '<p class="emptyMessagesText">Hali xabarlar yo\'q. Birinchi bo\'lib yozing!</p>';
    return;
  }
  messages.forEach((msg) => appendRoomMessage(msg));
}

function appendRoomMessage(msg) {
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
  bubble.innerHTML = `<p class="messageSender">${msg.sender}</p>${contentHtml}`;
  roomPageMessages.appendChild(bubble);
  roomPageMessages.scrollTop = roomPageMessages.scrollHeight;
}

roomBackBtn.addEventListener('click', () => {
  roomPage.classList.add('hidden');
  closeAllRoomPanels();
  saveState('category', { category: currentCategory });
});

roomDeleteBtn.addEventListener('click', async () => {
  const confirmed = confirm('Rostdan ham bu xonani o\'chirmoqchimisiz?');
  if (!confirmed) return;
  try {
    const response = await fetch(`/api/rooms/${currentRoomId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentUser.phone })
    });
    const data = await response.json();
    if (data.success) {
      roomPage.classList.add('hidden');
      clearState();
      saveState('category', { category: currentCategory });
      await loadCategoryRooms();
    } else {
      alert(data.error);
    }
  } catch (error) {
    alert('Xatolik yuz berdi.');
  }
});

roomSendBtn.addEventListener('click', () => {
  const text = roomMessageInput.value.trim();
  if (!text) return;
  socket.emit('sendMessage', { roomId: currentRoomId, text: text, phone: currentUser.phone });
  roomMessageInput.value = '';
});

roomMessageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const text = roomMessageInput.value.trim();
    if (!text) return;
    socket.emit('sendMessage', { roomId: currentRoomId, text: text, phone: currentUser.phone });
    roomMessageInput.value = '';
  }
});

roomVoiceBtn.addEventListener('click', () => {
  alert('Ovozli chat tez orada ishga tushadi!');
});

function closeAllRoomPanels() {
  roomMediaPanel.classList.add('hidden');
  roomEmojiPanel.classList.add('hidden');
  roomStickerPanel.classList.add('hidden');
  roomGifPanel.classList.add('hidden');
}

function toggleRoomPanel(panel) {
  const isHidden = panel.classList.contains('hidden');
  closeAllRoomPanels();
  if (isHidden) {
    roomMediaPanel.classList.remove('hidden');
    panel.classList.remove('hidden');
  }
}

roomEmojiBtn.addEventListener('click', () => toggleRoomPanel(roomEmojiPanel));
roomStickerBtn.addEventListener('click', () => toggleRoomPanel(roomStickerPanel));
roomGifBtn.addEventListener('click', () => toggleRoomPanel(roomGifPanel));

document.querySelectorAll('.emojiItem').forEach((item) => {
  item.addEventListener('click', () => {
    roomMessageInput.value += item.textContent;
    closeAllRoomPanels();
    roomMessageInput.focus();
  });
});

document.querySelectorAll('.stickerItem').forEach((item) => {
  item.addEventListener('click', () => {
    socket.emit('sendMessage', {
      roomId: currentRoomId,
      text: `[sticker:${item.dataset.sticker}]`,
      phone: currentUser.phone
    });
    closeAllRoomPanels();
  });
});

document.querySelectorAll('.gifItem').forEach((item) => {
  item.addEventListener('click', () => {
    socket.emit('sendMessage', {
      roomId: currentRoomId,
      text: `[gif:${item.src}]`,
      phone: currentUser.phone
    });
    closeAllRoomPanels();
  });
});

socket.on('newMessage', (msg) => {
  if (currentRoomId && msg.roomId && currentRoomId.toString() === msg.roomId.toString()) {
    appendRoomMessage(msg);
  }
});

socket.on('roomFull', () => {
  alert('Bu xona to\'la (12/12). Boshqa xonani tanlang.');
  roomPage.classList.add('hidden');
  saveState('category', { category: currentCategory });
});

socket.on('roomUserCount', (count) => {
  roomPageCount.textContent = count;
});

const categoryCards = document.querySelectorAll('.categoryCard');
categoryCards.forEach((card) => {
  card.addEventListener('click', async () => {
    const category = card.dataset.category;
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
        await openCategoryPage(category);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Xatolik yuz berdi.');
    }
  });
});

async function restoreState() {
  if (!currentUser) return;
  const savedState = localStorage.getItem(STATE_KEY);
  if (!savedState) return;

  try {
    const state = JSON.parse(savedState);

    if (state.type === 'category' && state.data.category) {
      currentCategory = state.data.category;
      categoryPageTitle.textContent = categoryNames[currentCategory];
      categoryPageDiamonds.textContent = currentUser.diamonds;
      lockScroll();
      categoryPage.classList.remove('hidden');
      await loadCategoryRooms();
    } else if (state.type === 'room' && state.data.roomId && state.data.category) {
      currentCategory = state.data.category;
      categoryPageTitle.textContent = categoryNames[currentCategory];
      categoryPageDiamonds.textContent = currentUser.diamonds;
      lockScroll();
      categoryPage.classList.remove('hidden');
      await loadCategoryRooms();
      try {
        const response = await fetch(`/api/rooms/single/${state.data.roomId}`);
        const data = await response.json();
        if (data.success) {
          await openRoomPage(data.room);
        }
      } catch (err) {
        clearState();
        saveState('category', { category: currentCategory });
      }
    }
  } catch (err) {
    clearState();
  }
}

restoreState();