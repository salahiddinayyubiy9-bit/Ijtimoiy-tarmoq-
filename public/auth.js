const socket = io();
const STATE_KEY = 'appState';

const authSection = document.getElementById('authSection');
const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const step3 = document.getElementById('step3');
const phoneInput = document.getElementById('phoneInput');
const sendCodeBtn = document.getElementById('sendCodeBtn');
const verifyCodeBtn = document.getElementById('verifyCodeBtn');
const backToStep1 = document.getElementById('backToStep1');
const testCodeDisplay = document.getElementById('testCodeDisplay');
const authMessage = document.getElementById('authMessage');
const codeMessage = document.getElementById('codeMessage');
const profileMessage = document.getElementById('profileMessage');
const nicknameInput = document.getElementById('nicknameInput');
const usernameInput = document.getElementById('usernameInput');
const setupProfileBtn = document.getElementById('setupProfileBtn');
const countrySelector = document.getElementById('countrySelector');
const countryDropdown = document.getElementById('countryDropdown');
const countryFlag = document.getElementById('countryFlag');
const countryCodeEl = document.getElementById('countryCode');
const codeDigits = [
  document.getElementById('code1'),
  document.getElementById('code2'),
  document.getElementById('code3'),
  document.getElementById('code4')
];

const mainSection = document.getElementById('mainSection');
const homeTab = document.getElementById('homeTab');
const chatsTab = document.getElementById('chatsTab');
const groupsTab = document.getElementById('groupsTab');
const channelsTab = document.getElementById('channelsTab');
const profileNickname = document.getElementById('profileNickname');
const profilePhone = document.getElementById('profilePhone');
const profileDiamonds = document.getElementById('profileDiamonds');
const profileRank = document.getElementById('profileRank');
const dailyClaimBtn = document.getElementById('dailyClaimBtn');
const logoutBtn = document.getElementById('logoutBtn');
const chatsList = document.getElementById('chatsList');
const groupsList = document.getElementById('groupsList');
const channelsList = document.getElementById('channelsList');

const navHome = document.getElementById('navHome');
const navChats = document.getElementById('navChats');
const navGroups = document.getElementById('navGroups');
const navChannels = document.getElementById('navChannels');

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

const convPage = document.getElementById('convPage');
const convBackBtn = document.getElementById('convBackBtn');
const convPageName = document.getElementById('convPageName');
const convPageMeta = document.getElementById('convPageMeta');
const convDeleteBtn = document.getElementById('convDeleteBtn');
const convPageMessages = document.getElementById('convPageMessages');
const convMessageInput = document.getElementById('convMessageInput');
const convSendBtn = document.getElementById('convSendBtn');
const convVoiceBtn = document.getElementById('convVoiceBtn');
const convMediaPanel = document.getElementById('convMediaPanel');
const convEmojiPanel = document.getElementById('convEmojiPanel');
const convStickerPanel = document.getElementById('convStickerPanel');
const convGifPanel = document.getElementById('convGifPanel');
const convEmojiBtn = document.getElementById('convEmojiBtn');
const convStickerBtn = document.getElementById('convStickerBtn');
const convGifBtn = document.getElementById('convGifBtn');
const convInputArea = document.getElementById('convInputArea');
const channelSubscribeArea = document.getElementById('channelSubscribeArea');
const channelSubBtn = document.getElementById('channelSubBtn');

const searchModal = document.getElementById('searchModal');
const closeSearchModal = document.getElementById('closeSearchModal');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const newGroupModal = document.getElementById('newGroupModal');
const closeGroupModal = document.getElementById('closeGroupModal');
const groupNameInput = document.getElementById('groupNameInput');
const createGroupBtn = document.getElementById('createGroupBtn');
const newChannelModal = document.getElementById('newChannelModal');
const closeChannelModal = document.getElementById('closeChannelModal');
const channelNameInput = document.getElementById('channelNameInput');
const createChannelBtn = document.getElementById('createChannelBtn');
const newChatBtn = document.getElementById('newChatBtn');
const newGroupBtn = document.getElementById('newGroupBtn');
const newChannelBtn = document.getElementById('newChannelBtn');

let currentPhone = '';
let selectedCountryCode = '+998';
let currentUser = null;
let currentCategory = null;
let currentRoomId = null;
let currentConvId = null;
let currentConvType = null;
let activeTab = 'home';

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

function showError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError(el) {
  el.textContent = '';
  el.classList.add('hidden');
}

// ===== DAVLAT KODI =====
countrySelector.addEventListener('click', (e) => {
  e.stopPropagation();
  countryDropdown.classList.toggle('hidden');
});

document.addEventListener('click', () => {
  countryDropdown.classList.add('hidden');
});

document.querySelectorAll('.countryOption').forEach(opt => {
  opt.addEventListener('click', () => {
    selectedCountryCode = opt.dataset.code;
    countryFlag.textContent = opt.dataset.flag;
    countryCodeEl.textContent = opt.dataset.code;
    countryDropdown.classList.add('hidden');
  });
});

// ===== KOD KIRITISH =====
codeDigits.forEach((input, index) => {
  input.addEventListener('input', () => {
    input.value = input.value.replace(/\D/g, '');
    if (input.value && index < 3) codeDigits[index + 1].focus();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && index > 0) codeDigits[index - 1].focus();
  });
});

function getCode() {
  return codeDigits.map(d => d.value).join('');
}

function clearCode() {
  codeDigits.forEach(d => d.value = '');
  codeDigits[0].focus();
}

// ===== AUTH =====
sendCodeBtn.addEventListener('click', async () => {
  const number = phoneInput.value.trim();
  if (!number) return showError(authMessage, 'Telefon raqam kiriting');
  const fullPhone = selectedCountryCode + number;
  hideError(authMessage);
  try {
    const res = await fetch('/api/send-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: fullPhone })
    });
    const data = await res.json();
    if (data.success) {
      currentPhone = fullPhone;
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      testCodeDisplay.textContent = `Test kodi: ${data.testCode}`;
      codeDigits[0].focus();
    } else {
      showError(authMessage, data.error);
    }
  } catch {
    showError(authMessage, 'Xatolik yuz berdi.');
  }
});

backToStep1.addEventListener('click', () => {
  step2.classList.add('hidden');
  step1.classList.remove('hidden');
  clearCode();
});

verifyCodeBtn.addEventListener('click', async () => {
  const code = getCode();
  if (code.length < 4) return showError(codeMessage, 'To\'liq kodni kiriting');
  hideError(codeMessage);
  try {
    const res = await fetch('/api/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, code: code })
    });
    const data = await res.json();
    if (data.success) {
      if (data.isNewUser) {
        step2.classList.add('hidden');
        step3.classList.remove('hidden');
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        showMainSection(data.user);
      }
    } else {
      showError(codeMessage, data.error);
      clearCode();
    }
  } catch {
    showError(codeMessage, 'Xatolik yuz berdi.');
  }
});

setupProfileBtn.addEventListener('click', async () => {
  const nickname = nicknameInput.value.trim();
  if (!nickname) return showError(profileMessage, 'Ismingizni kiriting');
  const username = usernameInput.value.trim().replace('@', '');
  hideError(profileMessage);
  try {
    const res = await fetch('/api/setup-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentPhone, nickname: nickname, username: username || null })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));
      showMainSection(data.user);
    } else {
      showError(profileMessage, data.error);
    }
  } catch {
    showError(profileMessage, 'Xatolik yuz berdi.');
  }
});

// ===== ASOSIY SAHIFA =====
function showMainSection(user) {
  currentUser = user;
  authSection.classList.add('hidden');
  mainSection.classList.remove('hidden');
  profileNickname.textContent = user.nickname || user.phone;
  profilePhone.textContent = user.phone;
  profileDiamonds.textContent = user.diamonds;
  profileRank.textContent = user.rank;
}

const savedUser = localStorage.getItem('user');
if (savedUser) {
  showMainSection(JSON.parse(savedUser));
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('user');
  clearState();
  unlockScroll();
  mainSection.classList.add('hidden');
  categoryPage.classList.add('hidden');
  roomPage.classList.add('hidden');
  convPage.classList.add('hidden');
  authSection.classList.remove('hidden');
  step1.classList.remove('hidden');
  step2.classList.add('hidden');
  step3.classList.add('hidden');
  phoneInput.value = '';
  clearCode();
});

dailyClaimBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/daily-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentUser.phone })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      profileDiamonds.textContent = data.user.diamonds;
      alert('Tabriklaymiz! Sizga 15 olmos qo\'shildi!');
    } else {
      alert(data.error);
    }
  } catch {
    alert('Xatolik yuz berdi.');
  }
});

// ===== PASTKI NAV =====
function switchTab(tabName) {
  [homeTab, chatsTab, groupsTab, channelsTab].forEach(t => t.classList.add('hidden'));
  [navHome, navChats, navGroups, navChannels].forEach(b => b.classList.remove('active'));
  activeTab = tabName;

  if (tabName === 'home') {
    homeTab.classList.remove('hidden');
    navHome.classList.add('active');
  } else if (tabName === 'chats') {
    chatsTab.classList.remove('hidden');
    navChats.classList.add('active');
    loadConversations('private');
  } else if (tabName === 'groups') {
    groupsTab.classList.remove('hidden');
    navGroups.classList.add('active');
    loadConversations('group');
  } else if (tabName === 'channels') {
    channelsTab.classList.remove('hidden');
    navChannels.classList.add('active');
    loadConversations('channel');
  }
}

navHome.addEventListener('click', () => switchTab('home'));
navChats.addEventListener('click', () => switchTab('chats'));
navGroups.addEventListener('click', () => switchTab('groups'));
navChannels.addEventListener('click', () => switchTab('channels'));

// ===== SUHBATLAR RO'YXATI =====
async function loadConversations(type) {
  const listEl = type === 'private' ? chatsList : type === 'group' ? groupsList : channelsList;
  listEl.innerHTML = '<p class="emptyConvText">Yuklanmoqda...</p>';
  try {
    const res = await fetch(`/api/conversations?phone=${currentUser.phone}&type=${type}`);
    const data = await res.json();
    if (data.success) renderConversations(data.conversations, listEl, type);
  } catch {
    listEl.innerHTML = '<p class="emptyConvText">Xatolik yuz berdi.</p>';
  }
}

function renderConversations(convs, listEl, type) {
  listEl.innerHTML = '';
  if (convs.length === 0) {
    const empty = type === 'private' ? 'Hali chatlar yo\'q. + tugmasini bosib yangi chat boshlang.'
      : type === 'group' ? 'Hali guruhlar yo\'q. + tugmasini bosib yangi guruh yarating.'
      : 'Hali kanallar yo\'q. + tugmasini bosib yangi kanal yarating.';
    listEl.innerHTML = `<p class="emptyConvText">${empty}</p>`;
    return;
  }
  convs.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'convItem';
    const icon = type === 'private' ? '👤' : type === 'group' ? '👥' : '📢';
    const name = conv.name || conv.members?.find(m => m !== currentUser.phone) || 'Chat';
    const lastMsg = conv.lastMessage || '';
    const time = conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }) : '';
    item.innerHTML = `
      <div class="convAvatar">${icon}</div>
      <div class="convInfo">
        <div class="convName">${name}</div>
        <div class="convLastMsg">${lastMsg}</div>
      </div>
      <div class="convTime">${time}</div>
    `;
    item.addEventListener('click', () => openConvPage(conv));
    listEl.appendChild(item);
  });
}

// ===== SUHBAT SAHIFASI =====
async function openConvPage(conv) {
  currentConvId = conv._id;
  currentConvType = conv.type;
  convPageName.textContent = conv.name || conv.members?.find(m => m !== currentUser.phone) || 'Chat';

  if (conv.type === 'private') {
    convPageMeta.textContent = 'Shaxsiy chat';
    convInputArea.classList.remove('hidden');
    channelSubscribeArea.classList.add('hidden');
    convDeleteBtn.classList.add('hidden');
  } else if (conv.type === 'group') {
    convPageMeta.textContent = `${conv.members?.length || 0} a'zo`;
    convInputArea.classList.remove('hidden');
    channelSubscribeArea.classList.add('hidden');
    convDeleteBtn.classList[conv.createdBy === currentUser.phone ? 'remove' : 'add']('hidden');
  } else if (conv.type === 'channel') {
    convPageMeta.textContent = `${conv.subscribers?.length || 0} obunachi`;
    convInputArea.classList[conv.createdBy === currentUser.phone ? 'remove' : 'add']('hidden');
    channelSubscribeArea.classList[conv.createdBy === currentUser.phone ? 'add' : 'remove']('hidden');
    convDeleteBtn.classList[conv.createdBy === currentUser.phone ? 'remove' : 'add']('hidden');
    const isSubscribed = conv.subscribers?.includes(currentUser.phone);
    channelSubBtn.textContent = isSubscribed ? 'Obunani bekor qilish' : 'Obuna bo\'lish';
    channelSubBtn.classList[isSubscribed ? 'add' : 'remove']('subscribed');
  }

  lockScroll();
  convPage.classList.remove('hidden');

  try {
    const res = await fetch(`/api/conversations/${conv._id}`);
    const data = await res.json();
    if (data.success) renderConvMessages(data.conversation.messages || []);
  } catch {}

  socket.emit('joinConversation', conv._id);
}

function renderConvMessages(messages) {
  convPageMessages.innerHTML = '';
  if (messages.length === 0) {
    convPageMessages.innerHTML = '<p class="emptyMessagesText">Hali xabarlar yo\'q.</p>';
    return;
  }
  messages.forEach(msg => appendConvMessage(msg));
}

function appendConvMessage(msg) {
  const bubble = document.createElement('div');
  const isOwn = msg.sender === currentUser.phone;
  bubble.className = isOwn ? 'messageBubble own' : 'messageBubble';
  let contentHtml = '';
  if (msg.text.startsWith('[sticker:') && msg.text.endsWith(']')) {
    contentHtml = `<span class="messageSticker">${msg.text.slice(9, -1)}</span>`;
  } else if (msg.text.startsWith('[gif:') && msg.text.endsWith(']')) {
    contentHtml = `<img class="messageGif" src="${msg.text.slice(5, -1)}" alt="gif">`;
  } else {
    contentHtml = `<p class="messageText">${msg.text}</p>`;
  }
  bubble.innerHTML = `<p class="messageSender">${msg.senderNickname || msg.sender}</p>${contentHtml}`;
  convPageMessages.appendChild(bubble);
  convPageMessages.scrollTop = convPageMessages.scrollHeight;
}

convBackBtn.addEventListener('click', () => {
  convPage.classList.add('hidden');
  unlockScroll();
  closeAllConvPanels();
  // Ro'yxatni yangilash
  if (activeTab === 'chats') loadConversations('private');
  else if (activeTab === 'groups') loadConversations('group');
  else if (activeTab === 'channels') loadConversations('channel');
});

convSendBtn.addEventListener('click', sendConvMessage);
convMessageInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendConvMessage(); });

function sendConvMessage() {
  const text = convMessageInput.value.trim();
  if (!text || !currentConvId) return;
  socket.emit('sendConvMessage', {
    convId: currentConvId,
    text: text,
    phone: currentUser.phone,
    senderNickname: currentUser.nickname || currentUser.phone
  });
  convMessageInput.value = '';
}

convVoiceBtn.addEventListener('click', () => alert('Ovozli xabar tez orada!'));

channelSubBtn.addEventListener('click', async () => {
  const isSubscribed = channelSubBtn.classList.contains('subscribed');
  const url = `/api/conversations/${currentConvId}/${isSubscribed ? 'unsubscribe' : 'subscribe'}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentUser.phone })
    });
    const data = await res.json();
    if (data.success) {
      channelSubBtn.classList.toggle('subscribed');
      channelSubBtn.textContent = isSubscribed ? 'Obuna bo\'lish' : 'Obunani bekor qilish';
    }
  } catch {}
});

socket.on('newConvMessage', (data) => {
  if (currentConvId && data.convId === currentConvId) {
    appendConvMessage(data.message);
  }
});

// ===== MODAL: YANGI CHAT =====
newChatBtn.addEventListener('click', () => searchModal.classList.remove('hidden'));
closeSearchModal.addEventListener('click', () => {
  searchModal.classList.add('hidden');
  searchResults.innerHTML = '';
  searchInput.value = '';
});

searchBtn.addEventListener('click', async () => {
  const q = searchInput.value.trim();
  if (!q) return;
  try {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    searchResults.innerHTML = '';
    if (!data.success || data.users.length === 0) {
      searchResults.innerHTML = '<p class="emptyConvText">Topilmadi.</p>';
      return;
    }
    data.users.forEach(user => {
      if (user.phone === currentUser.phone) return;
      const item = document.createElement('div');
      item.className = 'searchResultItem';
      item.innerHTML = `
        <div class="convAvatar">👤</div>
        <div>
          <div class="searchResultName">${user.nickname || user.phone}</div>
          <div class="searchResultPhone">${user.username ? '@' + user.username : user.phone}</div>
        </div>
      `;
      item.addEventListener('click', async () => {
        searchModal.classList.add('hidden');
        searchResults.innerHTML = '';
        searchInput.value = '';
        try {
          const res = await fetch('/api/conversations/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'private', phone: currentUser.phone, targetPhone: user.phone })
          });
          const data = await res.json();
          if (data.success) {
            await loadConversations('private');
            openConvPage(data.conversation);
          }
        } catch {}
      });
      searchResults.appendChild(item);
    });
  } catch {}
});

// ===== MODAL: YANGI GURUH =====
newGroupBtn.addEventListener('click', () => newGroupModal.classList.remove('hidden'));
closeGroupModal.addEventListener('click', () => { newGroupModal.classList.add('hidden'); groupNameInput.value = ''; });

createGroupBtn.addEventListener('click', async () => {
  const name = groupNameInput.value.trim();
  if (!name) return alert('Guruh nomini kiriting');
  const isPublic = document.querySelector('input[name="groupType"]:checked').value === 'public';
  try {
    const res = await fetch('/api/conversations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'group', name: name, phone: currentUser.phone, isPublic: isPublic })
    });
    const data = await res.json();
    if (data.success) {
      newGroupModal.classList.add('hidden');
      groupNameInput.value = '';
      await loadConversations('group');
      openConvPage(data.conversation);
    }
  } catch {}
});

// ===== MODAL: YANGI KANAL =====
newChannelBtn.addEventListener('click', () => newChannelModal.classList.remove('hidden'));
closeChannelModal.addEventListener('click', () => { newChannelModal.classList.add('hidden'); channelNameInput.value = ''; });

createChannelBtn.addEventListener('click', async () => {
  const name = channelNameInput.value.trim();
  if (!name) return alert('Kanal nomini kiriting');
  const isPublic = document.querySelector('input[name="channelType"]:checked').value === 'public';
  try {
    const res = await fetch('/api/conversations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'channel', name: name, phone: currentUser.phone, isPublic: isPublic })
    });
    const data = await res.json();
    if (data.success) {
      newChannelModal.classList.add('hidden');
      channelNameInput.value = '';
      await loadConversations('channel');
      openConvPage(data.conversation);
    }
  } catch {}
});

// ===== KATEGORIYA SAHIFASI =====
const categoryNames = {
  tanishuv: 'Tanishuv-chat', talabalar: 'Talabalar',
  oqituvchilar: 'O\'qituvchilar', taqdimotlar: 'Taqdimotlar',
  ilmiyishlar: 'Ilmiy ishlar', bepuldarslar: 'Bepul darslar',
  qonun: 'Qonun masalalari', doktorlar: 'Doktorlar'
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
    const res = await fetch(`/api/rooms/${currentCategory}`);
    const data = await res.json();
    if (data.success) {
      categoryPageRoomCount.textContent = data.rooms.length;
      renderCategoryRooms(data.rooms);
    }
  } catch {
    categoryRoomList.innerHTML = '<p class="emptyRoomsText">Xatolik yuz berdi.</p>';
  }
}

function renderCategoryRooms(rooms) {
  categoryRoomList.innerHTML = '';
  if (rooms.length === 0) {
    categoryRoomList.innerHTML = '<p class="emptyRoomsText">Hali xonalar yo\'q. Birinchi bo\'lib yarating!</p>';
    return;
  }
  rooms.forEach(room => {
    const item = document.createElement('div');
    item.className = 'roomItem';
    const isOwner = currentUser && room.createdBy === currentUser.phone;
    item.innerHTML = `
      <span class="roomName">${room.name}</span>
      <span class="roomCreator">${room.createdBy}</span>
      ${isOwner ? '<span class="deleteRoomBtn">🗑️</span>' : ''}
    `;
    item.addEventListener('click', e => {
      if (e.target.classList.contains('deleteRoomBtn')) return;
      openRoomPage(room);
    });
    if (isOwner) {
      item.querySelector('.deleteRoomBtn').addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Rostdan ham bu xonani o\'chirmoqchimisiz?')) return;
        try {
          const res = await fetch(`/api/rooms/${room._id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: currentUser.phone })
          });
          const data = await res.json();
          if (data.success) await loadCategoryRooms();
        } catch {}
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

categoryCreateRoomForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = categoryRoomNameInput.value.trim();
  if (!name) return;
  try {
    const res = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, category: currentCategory, phone: currentUser.phone })
    });
    const data = await res.json();
    if (data.success) {
      categoryRoomNameInput.value = '';
      await loadCategoryRooms();
    }
  } catch {}
});

// ===== XONA SAHIFASI =====
async function openRoomPage(room) {
  currentRoomId = room._id;
  roomPageName.textContent = room.name;
  roomPageMyRank.textContent = currentUser.rank;
  roomPageCreatorRank.textContent = room.createdBy === currentUser.phone ? currentUser.rank : 'Oddiy askar';
  const isOwner = room.createdBy === currentUser.phone;
  roomDeleteBtn.classList[isOwner ? 'remove' : 'add']('hidden');
  roomPage.classList.remove('hidden');
  renderRoomMessages(room.messages || []);
  socket.emit('joinRoom', room._id);
  roomPageCount.textContent = 1;
  saveState('room', { roomId: room._id, category: currentCategory });
}

function renderRoomMessages(messages) {
  roomPageMessages.innerHTML = '';
  if (messages.length === 0) {
    roomPageMessages.innerHTML = '<p class="emptyMessagesText">Hali xabarlar yo\'q.</p>';
    return;
  }
  messages.forEach(msg => appendRoomMessage(msg));
}

function appendRoomMessage(msg) {
  const bubble = document.createElement('div');
  const isOwn = msg.sender === currentUser.phone;
  bubble.className = isOwn ? 'messageBubble own' : 'messageBubble';
  let contentHtml = '';
  if (msg.text.startsWith('[sticker:') && msg.text.endsWith(']')) {
    contentHtml = `<span class="messageSticker">${msg.text.slice(9, -1)}</span>`;
  } else if (msg.text.startsWith('[gif:') && msg.text.endsWith(']')) {
    contentHtml = `<img class="messageGif" src="${msg.text.slice(5, -1)}" alt="gif">`;
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
  if (!confirm('Rostdan ham bu xonani o\'chirmoqchimisiz?')) return;
  try {
    const res = await fetch(`/api/rooms/${currentRoomId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentUser.phone })
    });
    const data = await res.json();
    if (data.success) {
      roomPage.classList.add('hidden');
      clearState();
      saveState('category', { category: currentCategory });
      await loadCategoryRooms();
    }
  } catch {}
});

roomSendBtn.addEventListener('click', () => {
  const text = roomMessageInput.value.trim();
  if (!text) return;
  socket.emit('sendMessage', { roomId: currentRoomId, text: text, phone: currentUser.phone });
  roomMessageInput.value = '';
});

roomMessageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const text = roomMessageInput.value.trim();
    if (!text) return;
    socket.emit('sendMessage', { roomId: currentRoomId, text: text, phone: currentUser.phone });
    roomMessageInput.value = '';
  }
});

roomVoiceBtn.addEventListener('click', () => alert('Ovozli chat tez orada!'));

socket.on('newMessage', msg => {
  if (currentRoomId && msg.roomId && currentRoomId.toString() === msg.roomId.toString()) {
    appendRoomMessage(msg);
  }
});

socket.on('roomFull', () => {
  alert('Bu xona to\'la (12/12).');
  roomPage.classList.add('hidden');
  saveState('category', { category: currentCategory });
});

socket.on('roomUserCount', count => { roomPageCount.textContent = count; });

// ===== KATEGORIYA KARTOCHKALARI =====
document.querySelectorAll('.categoryCard').forEach(card => {
  card.addEventListener('click', async () => {
    const category = card.dataset.category;
    try {
      const res = await fetch('/api/category-enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: currentUser.phone })
      });
      const data = await res.json();
      if (data.success) {
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(data.user));
        profileDiamonds.textContent = data.user.diamonds;
        await openCategoryPage(category);
      } else {
        alert(data.error);
      }
    } catch {
      alert('Xatolik yuz berdi.');
    }
  });
});

// ===== ROOM PANELLARI =====
function closeAllRoomPanels() {
  roomMediaPanel.classList.add('hidden');
  roomEmojiPanel.classList.add('hidden');
  roomStickerPanel.classList.add('hidden');
  roomGifPanel.classList.add('hidden');
}

function toggleRoomPanel(panel) {
  const isHidden = panel.classList.contains('hidden');
  closeAllRoomPanels();
  if (isHidden) { roomMediaPanel.classList.remove('hidden'); panel.classList.remove('hidden'); }
}

roomEmojiBtn.addEventListener('click', () => toggleRoomPanel(roomEmojiPanel));
roomStickerBtn.addEventListener('click', () => toggleRoomPanel(roomStickerPanel));
roomGifBtn.addEventListener('click', () => toggleRoomPanel(roomGifPanel));

document.querySelectorAll('#roomEmojiPanel .emojiItem').forEach(item => {
  item.addEventListener('click', () => { roomMessageInput.value += item.textContent; closeAllRoomPanels(); roomMessageInput.focus(); });
});

document.querySelectorAll('#roomStickerPanel .stickerItem').forEach(item => {
  item.addEventListener('click', () => {
    socket.emit('sendMessage', { roomId: currentRoomId, text: `[sticker:${item.dataset.sticker}]`, phone: currentUser.phone });
    closeAllRoomPanels();
  });
});

document.querySelectorAll('#roomGifPanel .gifItem').forEach(item => {
  item.addEventListener('click', () => {
    socket.emit('sendMessage', { roomId: currentRoomId, text: `[gif:${item.src}]`, phone: currentUser.phone });
    closeAllRoomPanels();
  });
});

// ===== CONV PANELLARI =====
function closeAllConvPanels() {
  convMediaPanel.classList.add('hidden');
  convEmojiPanel.classList.add('hidden');
  convStickerPanel.classList.add('hidden');
  convGifPanel.classList.add('hidden');
}

function toggleConvPanel(panel) {
  const isHidden = panel.classList.contains('hidden');
  closeAllConvPanels();
  if (isHidden) { convMediaPanel.classList.remove('hidden'); panel.classList.remove('hidden'); }
}

convEmojiBtn.addEventListener('click', () => toggleConvPanel(convEmojiPanel));
convStickerBtn.addEventListener('click', () => toggleConvPanel(convStickerPanel));
convGifBtn.addEventListener('click', () => toggleConvPanel(convGifPanel));

document.querySelectorAll('#convEmojiPanel .emojiItem').forEach(item => {
  item.addEventListener('click', () => { convMessageInput.value += item.textContent; closeAllConvPanels(); convMessageInput.focus(); });
});

document.querySelectorAll('#convStickerPanel .stickerItem').forEach(item => {
  item.addEventListener('click', () => {
    socket.emit('sendConvMessage', { convId: currentConvId, text: `[sticker:${item.dataset.sticker}]`, phone: currentUser.phone, senderNickname: currentUser.nickname || currentUser.phone });
    closeAllConvPanels();
  });
});

document.querySelectorAll('#convGifPanel .gifItem').forEach(item => {
  item.addEventListener('click', () => {
    socket.emit('sendConvMessage', { convId: currentConvId, text: `[gif:${item.src}]`, phone: currentUser.phone, senderNickname: currentUser.nickname || currentUser.phone });
    closeAllConvPanels();
  });
});

// ===== HOLATNI TIKLASH =====
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
        const res = await fetch(`/api/rooms/single/${state.data.roomId}`);
        const data = await res.json();
        if (data.success) await openRoomPage(data.room);
      } catch { clearState(); }
    }
  } catch { clearState(); }
}

restoreState();