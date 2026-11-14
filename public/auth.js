const socket = io({ autoConnect: false });
const STATE_KEY = 'appState';
const ADMIN_SECRET = 'admin_secret_2026';

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
  document.getElementById('code1'), document.getElementById('code2'),
  document.getElementById('code3'), document.getElementById('code4'),
  document.getElementById('code5'), document.getElementById('code6')
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
const profileAvatar = document.getElementById('profileAvatar');
const profileImageInput = document.getElementById('profileImageInput');
const profileBioEl = document.getElementById('profileBio');
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
const roomImageInput = document.getElementById('roomImageInput');
const roomVoiceIndicator = document.getElementById('roomVoiceIndicator');
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
const convImageInput = document.getElementById('convImageInput');
const convVoiceIndicator = document.getElementById('convVoiceIndicator');
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
const voiceChatBtn = document.getElementById('voiceChatBtn');
const voiceChatBar = document.getElementById('voiceChatBar');
const voiceChatStatus = document.getElementById('voiceChatStatus');
const endVoiceChatBtn = document.getElementById('endVoiceChatBtn');
const searchMsgBtn = document.getElementById('searchMsgBtn');
const msgSearchBar = document.getElementById('msgSearchBar');
const msgSearchInput = document.getElementById('msgSearchInput');
const msgSearchClose = document.getElementById('msgSearchClose');
const replyPanel = document.getElementById('replyPanel');
const replyText = document.getElementById('replyText');
const cancelReplyBtn = document.getElementById('cancelReplyBtn');
const editMsgPanel = document.getElementById('editMsgPanel');
const editMsgPreview = document.getElementById('editMsgPreview');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const pinnedMsgBar = document.getElementById('pinnedMsgBar');
const pinnedMsgText = document.getElementById('pinnedMsgText');
const unpinMsgBtn = document.getElementById('unpinMsgBtn');
const typingIndicator = document.getElementById('typingIndicator');
const typingText = document.getElementById('typingText');
const msgMenu = document.getElementById('msgMenu');
const msgMenuReply = document.getElementById('msgMenuReply');
const msgMenuEdit = document.getElementById('msgMenuEdit');
const msgMenuPin = document.getElementById('msgMenuPin');
const msgMenuForward = document.getElementById('msgMenuForward');
const msgMenuDelete = document.getElementById('msgMenuDelete');
const msgMenuClose = document.getElementById('msgMenuClose');
const reactionPanel = document.getElementById('reactionPanel');

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
const addMemberModal = document.getElementById('addMemberModal');
const closeAddMemberModal = document.getElementById('closeAddMemberModal');
const addMemberInput = document.getElementById('addMemberInput');
const addMemberBtn = document.getElementById('addMemberBtn');
const addMemberMsg = document.getElementById('addMemberMsg');
const discoverModal = document.getElementById('discoverModal');
const closeDiscoverModal = document.getElementById('closeDiscoverModal');
const discoverTitle = document.getElementById('discoverTitle');
const discoverList = document.getElementById('discoverList');
const discoverGroupsBtn = document.getElementById('discoverGroupsBtn');
const discoverChannelsBtn = document.getElementById('discoverChannelsBtn');
const forwardModal = document.getElementById('forwardModal');
const closeForwardModal = document.getElementById('closeForwardModal');
const forwardList = document.getElementById('forwardList');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfileModal = document.getElementById('editProfileModal');
const closeEditProfileModal = document.getElementById('closeEditProfileModal');
const editNicknameInput = document.getElementById('editNicknameInput');
const editUsernameInput = document.getElementById('editUsernameInput');
const editBioInput = document.getElementById('editBioInput');
const editBirthDateInput = document.getElementById('editBirthDateInput');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const editProfileMsg = document.getElementById('editProfileMsg');
const adminModal = document.getElementById('adminModal');
const closeAdminModal = document.getElementById('closeAdminModal');
const adminContent = document.getElementById('adminContent');
const convMoreBtn = document.getElementById('convMoreBtn');
const convMoreMenu = document.getElementById('convMoreMenu');
const convMoreClose = document.getElementById('convMoreClose');
const blockUserBtn = document.getElementById('blockUserBtn');
const reportUserBtn = document.getElementById('reportUserBtn');
const reportModal = document.getElementById('reportModal');
const closeReportModal = document.getElementById('closeReportModal');
const reportDetailsInput = document.getElementById('reportDetailsInput');
const submitReportBtn = document.getElementById('submitReportBtn');
const reportMsg = document.getElementById('reportMsg');
const blockedBanner = document.getElementById('blockedBanner');

let currentPhone = '';
let selectedCountryCode = '+998';
let currentUser = null;
let currentCategory = null;
let currentRoomId = null;
let currentConvId = null;
let currentConvType = null;
let currentConvData = null;
let activeTab = 'home';
let replyToMsg = null;
let editingMsgId = null;
let selectedMsgEl = null;
let selectedMsgData = null;
let currentOtherPhone = null;
let isBlockedByMe = false;
let typingTimer = null;

let mediaRecorder = null;
let audioChunks = [];
let isRecordingRoom = false;
let isRecordingConv = false;
let peerConnection = null;
let localStream = null;
let isInVoiceChat = false;
const STUN_SERVERS = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };

function saveState(type, data) { localStorage.setItem(STATE_KEY, JSON.stringify({ type, data })); }
function clearState() { localStorage.removeItem(STATE_KEY); }
function lockScroll() { document.body.classList.add('no-scroll'); }
function unlockScroll() { document.body.classList.remove('no-scroll'); }
function showError(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }
function hideError(el) { el.textContent = ''; el.classList.add('hidden'); }
function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function safeMediaSource(value, type = 'image') {
  const url = String(value ?? '').trim();
  if (/^https:\/\/[^\s"'<>]+$/i.test(url) || /^\/api\/media\/avatar\/[A-Za-z0-9_-]+\.jpg$/.test(url)) return url;
  const mime = type === 'audio'
    ? /^data:audio\/(?:webm|ogg|mpeg|mp4|wav)(?:;codecs=[a-z0-9._-]+)?;base64,[a-z0-9+/=]+$/i
    : /^data:image\/(?:jpeg|png|gif|webp);base64,[a-z0-9+/=]+$/i;
  return mime.test(url) ? url : null;
}

function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function formatLastSeen(lastSeen) {
  if (!lastSeen) return '';
  const diff = Date.now() - new Date(lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hozir online edi';
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}
function setConversationPresence(isOnline, lastSeen = null) {
  const dot = document.createElement('span');
  dot.className = isOnline ? 'onlineDot' : 'offlineDot';
  convPageMeta.replaceChildren(dot, document.createTextNode(isOnline ? 'online' : formatLastSeen(lastSeen)));
}

countrySelector.addEventListener('click', (e) => { e.stopPropagation(); countryDropdown.classList.toggle('hidden'); });
document.addEventListener('click', () => countryDropdown.classList.add('hidden'));
document.querySelectorAll('.countryOption').forEach(opt => {
  opt.addEventListener('click', () => {
    selectedCountryCode = opt.dataset.code;
    countryFlag.textContent = opt.dataset.flag;
    countryCodeEl.textContent = opt.dataset.code;
    countryDropdown.classList.add('hidden');
  });
});

codeDigits.forEach((input, i) => {
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, ''); if (input.value && i < codeDigits.length - 1) codeDigits[i + 1].focus(); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !input.value && i > 0) codeDigits[i - 1].focus(); });
});
function getCode() { return codeDigits.map(d => d.value).join(''); }
function clearCode() { codeDigits.forEach(d => d.value = ''); codeDigits[0].focus(); }

sendCodeBtn.addEventListener('click', async () => {
  const number = phoneInput.value.trim();
  if (!number) return showError(authMessage, 'Telefon raqam kiriting');
  const fullPhone = selectedCountryCode + number;
  hideError(authMessage);
  try {
    const res = await fetch('/api/send-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: fullPhone }) });
    const data = await res.json();
    if (data.success) {
      currentPhone = fullPhone;
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
      testCodeDisplay.textContent = data.debugOtp ? `Sinov kodi: ${data.debugOtp}` : 'Tasdiqlash kodi yetkazib berish xizmati sozlanmagan.';
      codeDigits[0].focus();
    }
    else showError(authMessage, data.error);
  } catch { showError(authMessage, 'Xatolik yuz berdi.'); }
});

backToStep1.addEventListener('click', () => { step2.classList.add('hidden'); step1.classList.remove('hidden'); clearCode(); });

verifyCodeBtn.addEventListener('click', async () => {
  const code = getCode();
  if (code.length !== codeDigits.length) return showError(codeMessage, '6 xonali kodni to\'liq kiriting');
  hideError(codeMessage);
  try {
    const res = await fetch('/api/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentPhone, code }) });
    const data = await res.json();
    if (data.success) {
      if (data.isNewUser) { step2.classList.add('hidden'); step3.classList.remove('hidden'); }
      else { localStorage.setItem('user', JSON.stringify(data.user)); showMainSection(data.user); }
    } else { showError(codeMessage, data.error); clearCode(); }
  } catch { showError(codeMessage, 'Xatolik yuz berdi.'); }
});

setupProfileBtn.addEventListener('click', async () => {
  const nickname = nicknameInput.value.trim();
  if (!nickname) return showError(profileMessage, 'Ismingizni kiriting');
  const username = usernameInput.value.trim().replace('@', '');
  hideError(profileMessage);
  try {
    const res = await fetch('/api/setup-profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentPhone, nickname, username: username || null }) });
    const data = await res.json();
    if (data.success) { localStorage.setItem('user', JSON.stringify(data.user)); showMainSection(data.user); }
    else showError(profileMessage, data.error);
  } catch { showError(profileMessage, 'Xatolik yuz berdi.'); }
});

function showMainSection(user) {
  currentUser = user;
  authSection.classList.add('hidden');
  mainSection.classList.remove('hidden');
  profileNickname.textContent = user.nickname || user.phone;
  profilePhone.textContent = user.phone;
  profileDiamonds.textContent = user.diamonds;
  profileRank.textContent = user.rank;
  if (profileBioEl) profileBioEl.textContent = user.bio || '';
  const avatarUrl = safeMediaSource(user.profileImage);
  if (avatarUrl) profileAvatar.innerHTML = `<img src="${escapeHTML(avatarUrl)}" alt="profil">`;
  else profileAvatar.textContent = '👤';
  if (!socket.connected) socket.connect();
}

socket.on('connect', () => { if (currentUser) socket.emit('setOnline'); });

profileImageInput.addEventListener('change', async () => {
  const file = profileImageInput.files[0];
  if (!file || !currentUser) return;
  try {
    const form = new FormData();
    form.append('avatar', file);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body: form });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('user', JSON.stringify(data.user));
      const avatarUrl = safeMediaSource(data.user.profileImage);
      if (avatarUrl) profileAvatar.innerHTML = `<img src="${escapeHTML(avatarUrl)}" alt="profil">`;
      else profileAvatar.textContent = '👤';
    } else alert(data.error || 'Rasm yuklashda xatolik.');
  } catch { alert('Rasm yuklashda xatolik.'); }
  profileImageInput.value = '';
});

editProfileBtn.addEventListener('click', () => {
  editNicknameInput.value = currentUser.nickname || '';
  editUsernameInput.value = currentUser.username ? '@' + currentUser.username : '';
  editBioInput.value = currentUser.bio || '';
  editBirthDateInput.value = currentUser.birthDate || '';
  hideError(editProfileMsg);
  editProfileModal.classList.remove('hidden');
});
closeEditProfileModal.addEventListener('click', () => editProfileModal.classList.add('hidden'));

saveProfileBtn.addEventListener('click', async () => {
  const nickname = editNicknameInput.value.trim();
  if (!nickname) return showError(editProfileMsg, 'Ismingizni kiriting');
  const username = editUsernameInput.value.trim().replace('@', '');
  hideError(editProfileMsg);
  try {
    const res = await fetch('/api/profile/update', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: currentUser.phone, nickname, username: username || null, bio: editBioInput.value.trim(), birthDate: editBirthDateInput.value || null })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user; localStorage.setItem('user', JSON.stringify(data.user));
      profileNickname.textContent = data.user.nickname || data.user.phone;
      if (profileBioEl) profileBioEl.textContent = data.user.bio || '';
      editProfileModal.classList.add('hidden');
    } else showError(editProfileMsg, data.error);
  } catch { showError(editProfileMsg, 'Xatolik yuz berdi.'); }
});

logoutBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/logout', { method: 'POST' });
    if (!res.ok && res.status !== 401) {
      alert('Tizimdan chiqib bo‘lmadi. Qayta urinib ko‘ring.');
      return;
    }
  } catch {
    alert('Tarmoq xatosi. Chiqish amalga oshmadi.');
    return;
  }
  socket.disconnect();
  currentUser = null;
  localStorage.removeItem('user'); clearState(); unlockScroll();
  mainSection.classList.add('hidden'); categoryPage.classList.add('hidden');
  roomPage.classList.add('hidden'); convPage.classList.add('hidden');
  authSection.classList.remove('hidden'); step1.classList.remove('hidden');
  step2.classList.add('hidden'); step3.classList.add('hidden');
  phoneInput.value = ''; clearCode();
});

dailyClaimBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/daily-claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentUser.phone }) });
    const data = await res.json();
    if (data.success) { currentUser = data.user; localStorage.setItem('user', JSON.stringify(data.user)); profileDiamonds.textContent = data.user.diamonds; alert('Tabriklaymiz! 15 olmos qo\'shildi!'); }
    else alert(data.error);
  } catch { alert('Xatolik.'); }
});

let profileClickCount = 0;
profileAvatar.addEventListener('click', () => { profileClickCount++; if (profileClickCount >= 5) { profileClickCount = 0; openAdminPanel(); } });

function switchTab(tabName) {
  [homeTab, chatsTab, groupsTab, channelsTab].forEach(t => t.classList.add('hidden'));
  [navHome, navChats, navGroups, navChannels].forEach(b => b.classList.remove('active'));
  activeTab = tabName;
  if (tabName === 'home') { homeTab.classList.remove('hidden'); navHome.classList.add('active'); }
  else if (tabName === 'chats') { chatsTab.classList.remove('hidden'); navChats.classList.add('active'); loadConversations('private'); }
  else if (tabName === 'groups') { groupsTab.classList.remove('hidden'); navGroups.classList.add('active'); loadConversations('group'); }
  else if (tabName === 'channels') { channelsTab.classList.remove('hidden'); navChannels.classList.add('active'); loadConversations('channel'); }
}
navHome.addEventListener('click', () => switchTab('home'));
navChats.addEventListener('click', () => switchTab('chats'));
navGroups.addEventListener('click', () => switchTab('groups'));
navChannels.addEventListener('click', () => switchTab('channels'));

async function loadConversations(type) {
  const listEl = type === 'private' ? chatsList : type === 'group' ? groupsList : channelsList;
  listEl.innerHTML = '<p class="emptyConvText">Yuklanmoqda...</p>';
  try {
    const res = await fetch(`/api/conversations?phone=${currentUser.phone}&type=${type}`);
    const data = await res.json();
    if (data.success) renderConversations(data.conversations, listEl, type);
  } catch { listEl.innerHTML = '<p class="emptyConvText">Xatolik.</p>'; }
}

function renderConversations(convs, listEl, type) {
  listEl.innerHTML = '';
  if (convs.length === 0) {
    const empty = type === 'private' ? 'Hali chatlar yo\'q.' : type === 'group' ? 'Hali guruhlar yo\'q.' : 'Hali kanallar yo\'q.';
    listEl.innerHTML = `<p class="emptyConvText">${empty}</p>`;
    return;
  }
  convs.forEach(conv => {
    const item = document.createElement('div');
    item.className = 'convItem';
    const icon = type === 'private' ? '👤' : type === 'group' ? '👥' : '📢';
    const otherPhone = conv.members?.find(m => m !== currentUser.phone);
    const name = conv.name || otherPhone || 'Chat';
    const lastMsg = conv.lastMessage || '';
    const time = conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }) : '';
    item.innerHTML = `
      <div class="convAvatar">${icon}</div>
      <div class="convInfo"><div class="convName">${escapeHTML(name)}</div><div class="convLastMsg">${escapeHTML(lastMsg)}</div></div>
      <div class="convTime">${time}</div>
    `;
    item.addEventListener('click', () => openConvPage(conv));
    listEl.appendChild(item);
  });
}

async function openConvPage(conv) {
  currentConvId = conv._id;
  currentConvType = conv.type;
  currentConvData = conv;
  const otherPhone = conv.members?.find(m => m !== currentUser.phone);
  convPageName.textContent = conv.name || otherPhone || 'Chat';
  replyToMsg = null; editingMsgId = null;
  replyPanel.classList.add('hidden');
  editMsgPanel.classList.add('hidden');
  msgSearchBar.classList.add('hidden');
  pinnedMsgBar.classList.add('hidden');
  typingIndicator.classList.add('hidden');

  const existingBar = document.getElementById('groupActionsBar');
  if (existingBar) existingBar.remove();

  if (conv.type === 'private') {
    convPageMeta.textContent = 'Shaxsiy chat';
    currentOtherPhone = otherPhone;
    convMoreBtn.classList.remove('hidden');
    if (otherPhone) {
      fetch(`/api/users/status/${otherPhone}`).then(r => r.json()).then(d => {
        if (d.success) setConversationPresence(d.isOnline, d.lastSeen);
      }).catch(() => {});
      fetch(`/api/users/blocked-status?phone=${currentUser.phone}&targetPhone=${otherPhone}`).then(r => r.json()).then(d => {
        if (d.success) { isBlockedByMe = d.iBlockedThem; blockUserBtn.textContent = isBlockedByMe ? '✅ Blokdan chiqarish' : '🚫 Bloklash'; updateBlockedBanner(); }
      }).catch(() => {});
    }
    convInputArea.classList.remove('hidden');
    channelSubscribeArea.classList.add('hidden');
    convDeleteBtn.classList.add('hidden');
    voiceChatBtn.classList.remove('hidden');
  } else if (conv.type === 'group') {
    convMoreBtn.classList.add('hidden');
    blockedBanner.classList.add('hidden');
    convPageMeta.textContent = `${conv.members?.length || 0} a'zo`;
    convInputArea.classList.remove('hidden');
    channelSubscribeArea.classList.add('hidden');
    convDeleteBtn.classList[conv.createdBy === currentUser.phone ? 'remove' : 'add']('hidden');
    voiceChatBtn.classList.add('hidden');
    const bar = document.createElement('div');
    bar.id = 'groupActionsBar';
    bar.className = 'groupActionsBar';
    const isAdmin = conv.admins?.includes(currentUser.phone);
    bar.innerHTML = `
      ${isAdmin ? '<button class="groupActionBtn" id="addMemberBarBtn">👤+ A\'zo qo\'shish</button>' : ''}
      <button class="groupActionBtn groupLeaveBtn" id="leaveGroupBtn">🚪 Chiqish</button>
    `;
    convPage.insertBefore(bar, document.getElementById('voiceChatBar').nextSibling);
    if (isAdmin) {
      document.getElementById('addMemberBarBtn').addEventListener('click', () => { addMemberModal.classList.remove('hidden'); addMemberInput.value = ''; hideError(addMemberMsg); });
    }
    document.getElementById('leaveGroupBtn').addEventListener('click', async () => {
      if (!confirm('Guruhdan chiqmoqchimisiz?')) return;
      try {
        const res = await fetch(`/api/conversations/${currentConvId}/leave`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentUser.phone }) });
        const data = await res.json();
        if (data.success) { convPage.classList.add('hidden'); unlockScroll(); clearState(); loadConversations('group'); }
      } catch {}
    });
  } else if (conv.type === 'channel') {
    convMoreBtn.classList.add('hidden');
    blockedBanner.classList.add('hidden');
    convPageMeta.textContent = `${conv.subscribers?.length || 0} obunachi`;
    convInputArea.classList[conv.createdBy === currentUser.phone ? 'remove' : 'add']('hidden');
    channelSubscribeArea.classList[conv.createdBy === currentUser.phone ? 'add' : 'remove']('hidden');
    convDeleteBtn.classList[conv.createdBy === currentUser.phone ? 'remove' : 'add']('hidden');
    voiceChatBtn.classList.add('hidden');
    const isSubscribed = conv.subscribers?.includes(currentUser.phone);
    channelSubBtn.textContent = isSubscribed ? 'Obunani bekor qilish' : 'Obuna bo\'lish';
    channelSubBtn.classList[isSubscribed ? 'add' : 'remove']('subscribed');
  }

  lockScroll();
  convPage.classList.remove('hidden');
  saveState('conv', { convId: conv._id, convType: conv.type });

  try {
    const res = await fetch(`/api/conversations/${conv._id}`);
    const data = await res.json();
    if (data.success) {
      renderConvMessages(data.conversation.messages || []);
      const pinned = data.conversation.messages.find(m => m.pinned);
      if (pinned) { pinnedMsgText.textContent = pinned.text.substring(0, 50); pinnedMsgBar.classList.remove('hidden'); }
    }
  } catch {}

  socket.emit('joinConversation', conv._id);
}

function renderConvMessages(messages) {
  convPageMessages.innerHTML = '';
  if (messages.length === 0) { convPageMessages.innerHTML = '<p class="emptyMessagesText">Hali xabarlar yo\'q.</p>'; return; }
  messages.forEach(msg => appendConvMessage(msg));
}

function appendConvMessage(msg) {
  if (msg.deleted) {
    const del = document.createElement('div');
    del.className = 'msgDeleted';
    del.dataset.msgId = msg._id;
    del.textContent = '🗑️ Xabar o\'chirildi';
    convPageMessages.appendChild(del);
    convPageMessages.scrollTop = convPageMessages.scrollHeight;
    return;
  }
  const bubble = document.createElement('div');
  const messageText = String(msg.text ?? '');
  const isOwn = msg.sender === currentUser.phone;
  bubble.className = isOwn ? 'messageBubble own' : 'messageBubble';
  bubble.dataset.msgId = msg._id || '';
  bubble.dataset.msgText = messageText;
  bubble.dataset.msgSender = msg.senderNickname || msg.sender || '';

  let replyHtml = '';
  if (msg.replyTo && msg.replyTo.msgId) {
    replyHtml = `<div class="msgReplyBox">↩️ ${escapeHTML(msg.replyTo.sender)}: ${escapeHTML(String(msg.replyTo.text ?? '').substring(0, 50))}</div>`;
  }

  let contentHtml = '';
  if (messageText.startsWith('[sticker:') && messageText.endsWith(']')) contentHtml = `<span class="messageSticker">${escapeHTML(messageText.slice(9, -1))}</span>`;
  else if (messageText.startsWith('[gif:') && messageText.endsWith(']')) {
    const src = safeMediaSource(messageText.slice(5, -1));
    contentHtml = src ? `<img class="messageGif" src="${escapeHTML(src)}" alt="gif">` : '<p class="messageText">Media manzili yaroqsiz.</p>';
  } else if (messageText.startsWith('[image:') && messageText.endsWith(']')) {
    const src = safeMediaSource(messageText.slice(7, -1));
    contentHtml = src ? `<img class="messageImage" src="${escapeHTML(src)}" alt="rasm">` : '<p class="messageText">Media manzili yaroqsiz.</p>';
  } else if (messageText.startsWith('[audio:') && messageText.endsWith(']')) {
    const src = safeMediaSource(messageText.slice(7, -1), 'audio');
    contentHtml = src ? `<audio class="messageAudio" controls src="${escapeHTML(src)}"></audio>` : '<p class="messageText">Media manzili yaroqsiz.</p>';
  } else contentHtml = `<p class="messageText">${escapeHTML(messageText)}${msg.edited ? ' <span class="editedLabel">(tahrirlangan)</span>' : ''}</p>`;

  const reactionsHtml = buildReactionsHtml(msg.reactions || [], msg._id);
  const pinnedHtml = msg.pinned ? '<span class="pinnedLabel">📌</span>' : '';

  bubble.innerHTML = `<p class="messageSender">${escapeHTML(msg.senderNickname || msg.sender)}${pinnedHtml}</p>${replyHtml}${contentHtml}${reactionsHtml}`;

  let pressTimer;
  bubble.addEventListener('touchstart', () => { pressTimer = setTimeout(() => openMsgMenu(bubble, msg, isOwn), 600); });
  bubble.addEventListener('touchend', () => clearTimeout(pressTimer));
  bubble.addEventListener('mousedown', () => { pressTimer = setTimeout(() => openMsgMenu(bubble, msg, isOwn), 600); });
  bubble.addEventListener('mouseup', () => clearTimeout(pressTimer));

  convPageMessages.appendChild(bubble);
  convPageMessages.scrollTop = convPageMessages.scrollHeight;
}

function buildReactionsHtml(reactions, msgId) {
  if (!reactions || reactions.length === 0) return '';
  const grouped = {};
  reactions.forEach(r => { grouped[r.emoji] = (grouped[r.emoji] || 0) + 1; });
  const items = Object.entries(grouped).map(([emoji, count]) =>
    `<span class="reactionBadge" data-emoji="${escapeHTML(emoji)}" data-msgid="${escapeHTML(msgId)}">${escapeHTML(emoji)} ${count}</span>`
  ).join('');
  return `<div class="reactionRow">${items}</div>`;
}

function openMsgMenu(bubbleEl, msg, isOwn) {
  selectedMsgEl = bubbleEl;
  selectedMsgData = msg;
  msgMenuDelete.classList[isOwn ? 'remove' : 'add']('hidden');
  msgMenuEdit.classList[isOwn && !msg.text.startsWith('[') ? 'remove' : 'add']('hidden');
  const isAdminOrOwner = currentConvData?.admins?.includes(currentUser.phone) || currentConvData?.createdBy === currentUser.phone;
  msgMenuPin.classList[isAdminOrOwner ? 'remove' : 'add']('hidden');
  msgMenu.classList.remove('hidden');
}

msgMenuClose.addEventListener('click', () => { msgMenu.classList.add('hidden'); selectedMsgEl = null; selectedMsgData = null; });

msgMenuReply.addEventListener('click', () => {
  if (!selectedMsgData) return;
  replyToMsg = { msgId: selectedMsgData._id, text: selectedMsgData.text.substring(0, 60), sender: selectedMsgData.senderNickname || selectedMsgData.sender };
  replyText.textContent = `${replyToMsg.sender}: ${replyToMsg.text}`;
  replyPanel.classList.remove('hidden');
  editMsgPanel.classList.add('hidden');
  editingMsgId = null;
  msgMenu.classList.add('hidden');
  convMessageInput.focus();
});

cancelReplyBtn.addEventListener('click', () => { replyToMsg = null; replyPanel.classList.add('hidden'); });

// TAHRIRLASH (#13)
msgMenuEdit.addEventListener('click', () => {
  if (!selectedMsgData) return;
  editingMsgId = selectedMsgData._id;
  editMsgPreview.textContent = selectedMsgData.text;
  editMsgPanel.classList.remove('hidden');
  replyPanel.classList.add('hidden');
  replyToMsg = null;
  convMessageInput.value = selectedMsgData.text;
  msgMenu.classList.add('hidden');
  convMessageInput.focus();
});

cancelEditBtn.addEventListener('click', () => { editingMsgId = null; editMsgPanel.classList.add('hidden'); convMessageInput.value = ''; });

// PIN (#14)
msgMenuPin.addEventListener('click', () => {
  if (!selectedMsgData) return;
  socket.emit('pinConvMessage', { convId: currentConvId, msgId: selectedMsgData._id, phone: currentUser.phone });
  msgMenu.classList.add('hidden');
});

unpinMsgBtn.addEventListener('click', () => {
  socket.emit('unpinConvMessage', { convId: currentConvId, phone: currentUser.phone });
});

socket.on('convMessagePinned', (data) => {
  if (data.convId !== currentConvId) return;
  pinnedMsgText.textContent = String(data.text ?? '').substring(0, 50);
  pinnedMsgBar.classList.remove('hidden');
  const bubbles = convPageMessages.querySelectorAll('.messageBubble');
  bubbles.forEach(b => {
    const senderEl = b.querySelector('.messageSender');
    senderEl?.querySelector('.pinnedLabel')?.remove();
    if (b.dataset.msgId === data.msgId) {
      if (senderEl && !senderEl.querySelector('.pinnedLabel')) {
        const label = document.createElement('span');
        label.className = 'pinnedLabel';
        label.textContent = '📌';
        senderEl.appendChild(label);
      }
    }
  });
});

socket.on('convMessageUnpinned', (data) => {
  if (data.convId !== currentConvId) return;
  pinnedMsgBar.classList.add('hidden');
  convPageMessages.querySelectorAll('.pinnedLabel').forEach(el => el.remove());
});

msgMenuDelete.addEventListener('click', () => {
  if (!selectedMsgData || !selectedMsgData._id) return;
  if (!confirm('Xabarni o\'chirmoqchimisiz?')) return;
  socket.emit('deleteConvMessage', { convId: currentConvId, msgId: selectedMsgData._id, phone: currentUser.phone });
  msgMenu.classList.add('hidden');
});

msgMenuForward.addEventListener('click', () => {
  if (!selectedMsgData) return;
  msgMenu.classList.add('hidden');
  openForwardModal(selectedMsgData.text);
});

socket.on('convMessageDeleted', (data) => {
  if (data.convId !== currentConvId) return;
  const el = convPageMessages.querySelector(`[data-msg-id="${data.msgId}"]`);
  if (el) { el.className = 'msgDeleted'; el.textContent = '🗑️ Xabar o\'chirildi'; }
});

// TAHRIRLASH SOCKET (#13)
socket.on('convMessageEdited', (data) => {
  if (data.convId !== currentConvId) return;
  const el = convPageMessages.querySelector(`[data-msg-id="${data.msgId}"]`);
  if (el) {
    const textEl = el.querySelector('.messageText');
    if (textEl) textEl.innerHTML = `${escapeHTML(data.newText)} <span class="editedLabel">(tahrirlangan)</span>`;
    el.dataset.msgText = String(data.newText ?? '');
  }
});

// REAKSIYA SOCKET (#15)
socket.on('convMessageReacted', (data) => {
  if (data.convId !== currentConvId) return;
  const el = convPageMessages.querySelector(`[data-msg-id="${data.msgId}"]`);
  if (el) {
    let row = el.querySelector('.reactionRow');
    if (!row) { row = document.createElement('div'); row.className = 'reactionRow'; el.appendChild(row); }
    row.innerHTML = buildReactionsHtml(data.reactions, data.msgId).replace('<div class="reactionRow">', '').replace('</div>', '');
    row.querySelectorAll('.reactionBadge').forEach(badge => {
      badge.addEventListener('click', () => {
        socket.emit('reactConvMessage', { convId: currentConvId, msgId: badge.dataset.msgid, emoji: badge.dataset.emoji, phone: currentUser.phone });
      });
    });
  }
});

// REAKSIYA PANEL (#15)
document.querySelectorAll('.reactionEmoji').forEach(el => {
  el.addEventListener('click', () => {
    if (!selectedMsgData) return;
    socket.emit('reactConvMessage', { convId: currentConvId, msgId: selectedMsgData._id, emoji: el.dataset.emoji, phone: currentUser.phone });
    reactionPanel.classList.add('hidden');
    msgMenu.classList.add('hidden');
  });
});

// XABAR QIDIRUV
searchMsgBtn.addEventListener('click', () => { msgSearchBar.classList.toggle('hidden'); if (!msgSearchBar.classList.contains('hidden')) msgSearchInput.focus(); });
msgSearchClose.addEventListener('click', () => { msgSearchBar.classList.add('hidden'); msgSearchInput.value = ''; clearMsgHighlights(); });
msgSearchInput.addEventListener('input', () => {
  const q = msgSearchInput.value.trim().toLowerCase();
  clearMsgHighlights();
  if (!q) return;
  const bubbles = convPageMessages.querySelectorAll('.messageBubble');
  let first = null;
  bubbles.forEach(b => { if ((b.dataset.msgText?.toLowerCase() || '').includes(q)) { b.classList.add('msgHighlight'); if (!first) first = b; } });
  if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
function clearMsgHighlights() { convPageMessages.querySelectorAll('.msgHighlight').forEach(el => el.classList.remove('msgHighlight')); }

// FORWARD
async function openForwardModal(msgText) {
  forwardModal.classList.remove('hidden');
  forwardList.innerHTML = '<p class="emptyConvText">Yuklanmoqda...</p>';
  try {
    const [chatsRes, groupsRes] = await Promise.all([
      fetch(`/api/conversations?phone=${currentUser.phone}&type=private`),
      fetch(`/api/conversations?phone=${currentUser.phone}&type=group`)
    ]);
    const all = [...((await chatsRes.json()).conversations || []), ...((await groupsRes.json()).conversations || [])];
    forwardList.innerHTML = '';
    if (all.length === 0) { forwardList.innerHTML = '<p class="emptyConvText">Chatlar yo\'q.</p>'; return; }
    all.forEach(conv => {
      const otherPhone = conv.members?.find(m => m !== currentUser.phone);
      const name = conv.name || otherPhone || 'Chat';
      const el = document.createElement('div');
      el.className = 'discoverItem';
      el.innerHTML = `<div class="discoverItemInfo"><div class="discoverItemName">${conv.type === 'private' ? '👤' : '👥'} ${escapeHTML(name)}</div></div><button class="discoverJoinBtn">Yuborish</button>`;
      el.querySelector('.discoverJoinBtn').addEventListener('click', () => {
        socket.emit('sendConvMessage', { convId: conv._id, text: `📨 Forward: ${msgText}`, phone: currentUser.phone, senderNickname: currentUser.nickname || currentUser.phone });
        forwardModal.classList.add('hidden');
        alert('Xabar yuborildi!');
      });
      forwardList.appendChild(el);
    });
  } catch { forwardList.innerHTML = '<p class="emptyConvText">Xatolik.</p>'; }
}
closeForwardModal.addEventListener('click', () => forwardModal.classList.add('hidden'));

// BLOKLASH
convMoreBtn.addEventListener('click', () => convMoreMenu.classList.toggle('hidden'));
convMoreClose.addEventListener('click', () => convMoreMenu.classList.add('hidden'));

blockUserBtn.addEventListener('click', async () => {
  if (!currentOtherPhone) return;
  convMoreMenu.classList.add('hidden');
  if (!confirm(isBlockedByMe ? 'Blokdan chiqarmoqchimisiz?' : 'Bloklamoqchimisiz?')) return;
  try {
    const res = await fetch(`/api/users/${isBlockedByMe ? 'unblock' : 'block'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentUser.phone, targetPhone: currentOtherPhone }) });
    const data = await res.json();
    if (data.success) { currentUser = data.user; localStorage.setItem('user', JSON.stringify(data.user)); isBlockedByMe = !isBlockedByMe; blockUserBtn.textContent = isBlockedByMe ? '✅ Blokdan chiqarish' : '🚫 Bloklash'; updateBlockedBanner(); }
  } catch { alert('Xatolik.'); }
});

reportUserBtn.addEventListener('click', () => { convMoreMenu.classList.add('hidden'); reportDetailsInput.value = ''; hideError(reportMsg); document.querySelectorAll('input[name="reportReason"]').forEach(r => r.checked = false); reportModal.classList.remove('hidden'); });
closeReportModal.addEventListener('click', () => reportModal.classList.add('hidden'));

submitReportBtn.addEventListener('click', async () => {
  const reasonEl = document.querySelector('input[name="reportReason"]:checked');
  if (!reasonEl) return showError(reportMsg, 'Sababni tanlang');
  hideError(reportMsg);
  try {
    const res = await fetch('/api/reports/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportedBy: currentUser.phone, reportedUser: currentOtherPhone, reason: reasonEl.value, details: reportDetailsInput.value.trim() }) });
    const data = await res.json();
    if (data.success) { reportModal.classList.add('hidden'); alert('Shikoyatingiz qabul qilindi!'); }
  } catch { showError(reportMsg, 'Xatolik.'); }
});

function updateBlockedBanner() {
  if (isBlockedByMe) { blockedBanner.classList.remove('hidden'); convInputArea.classList.add('hidden'); }
  else { blockedBanner.classList.add('hidden'); if (currentConvType === 'private') convInputArea.classList.remove('hidden'); }
}

socket.on('messageBlocked', () => alert('Xabar yuborilmadi — bloklangan.'));

// YOZILMOQDA (#18)
convMessageInput.addEventListener('input', () => {
  if (!currentConvId) return;
  socket.emit('typing', { convId: currentConvId, phone: currentUser.phone, nickname: currentUser.nickname || currentUser.phone });
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => { socket.emit('stopTyping', { convId: currentConvId, phone: currentUser.phone }); }, 2000);
});

socket.on('userTyping', (data) => {
  if (data.convId !== currentConvId || data.phone === currentUser.phone) return;
  typingText.textContent = `${data.nickname} yozmoqda...`;
  typingIndicator.classList.remove('hidden');
});

socket.on('userStopTyping', (data) => {
  if (data.convId !== currentConvId || data.phone === currentUser.phone) return;
  typingIndicator.classList.add('hidden');
});

convBackBtn.addEventListener('click', () => {
  if (isInVoiceChat) endVoiceChat();
  convMoreBtn.classList.add('hidden'); convMoreMenu.classList.add('hidden');
  blockedBanner.classList.add('hidden'); pinnedMsgBar.classList.add('hidden');
  typingIndicator.classList.add('hidden');
  convPage.classList.add('hidden'); unlockScroll();
  closeAllConvPanels(); clearState();
  msgSearchBar.classList.add('hidden'); msgSearchInput.value = '';
  replyToMsg = null; replyPanel.classList.add('hidden');
  editingMsgId = null; editMsgPanel.classList.add('hidden');
  const bar = document.getElementById('groupActionsBar');
  if (bar) bar.remove();
  if (activeTab === 'chats') loadConversations('private');
  else if (activeTab === 'groups') loadConversations('group');
  else if (activeTab === 'channels') loadConversations('channel');
});

convSendBtn.addEventListener('click', sendConvMessage);
convMessageInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendConvMessage(); });

function sendConvMessage() {
  const text = convMessageInput.value.trim();
  if (!text || !currentConvId) return;
  if (editingMsgId) {
    socket.emit('editConvMessage', { convId: currentConvId, msgId: editingMsgId, newText: text, phone: currentUser.phone });
    editingMsgId = null; editMsgPanel.classList.add('hidden');
  } else {
    socket.emit('sendConvMessage', { convId: currentConvId, text, phone: currentUser.phone, senderNickname: currentUser.nickname || currentUser.phone, replyTo: replyToMsg || null });
    replyToMsg = null; replyPanel.classList.add('hidden');
  }
  convMessageInput.value = '';
  socket.emit('stopTyping', { convId: currentConvId, phone: currentUser.phone });
}

convImageInput.addEventListener('change', async () => {
  const file = convImageInput.files[0];
  if (!file) return;
  const imageData = await compressImage(file);
  socket.emit('sendConvMessage', { convId: currentConvId, text: '', phone: currentUser.phone, senderNickname: currentUser.nickname || currentUser.phone, imageData });
  convImageInput.value = '';
});

channelSubBtn.addEventListener('click', async () => {
  const isSubscribed = channelSubBtn.classList.contains('subscribed');
  try {
    const res = await fetch(`/api/conversations/${currentConvId}/${isSubscribed ? 'unsubscribe' : 'subscribe'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentUser.phone }) });
    const data = await res.json();
    if (data.success) { channelSubBtn.classList.toggle('subscribed'); channelSubBtn.textContent = isSubscribed ? 'Obuna bo\'lish' : 'Obunani bekor qilish'; }
  } catch {}
});

socket.on('newConvMessage', (data) => { if (currentConvId && data.convId === currentConvId) appendConvMessage(data.message); });

// OVOZLI XABAR
async function startVoiceRecording(isRoom) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = () => {
        const audioData = reader.result;
        if (isRoom) socket.emit('sendMessage', { roomId: currentRoomId, text: '', phone: currentUser.phone, audioData });
        else socket.emit('sendConvMessage', { convId: currentConvId, text: '', phone: currentUser.phone, senderNickname: currentUser.nickname || currentUser.phone, audioData });
      };
      reader.readAsDataURL(blob);
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorder.start();
    if (isRoom) { isRecordingRoom = true; roomVoiceBtn.classList.add('recording'); roomVoiceIndicator.classList.remove('hidden'); }
    else { isRecordingConv = true; convVoiceBtn.classList.add('recording'); convVoiceIndicator.classList.remove('hidden'); }
  } catch { alert('Mikrofonga ruxsat berilmadi.'); }
}

function stopVoiceRecording(isRoom) {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  if (isRoom) { isRecordingRoom = false; roomVoiceBtn.classList.remove('recording'); roomVoiceIndicator.classList.add('hidden'); }
  else { isRecordingConv = false; convVoiceBtn.classList.remove('recording'); convVoiceIndicator.classList.add('hidden'); }
}

roomVoiceBtn.addEventListener('mousedown', () => startVoiceRecording(true));
roomVoiceBtn.addEventListener('mouseup', () => stopVoiceRecording(true));
roomVoiceBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startVoiceRecording(true); });
roomVoiceBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopVoiceRecording(true); });
convVoiceBtn.addEventListener('mousedown', () => startVoiceRecording(false));
convVoiceBtn.addEventListener('mouseup', () => stopVoiceRecording(false));
convVoiceBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startVoiceRecording(false); });
convVoiceBtn.addEventListener('touchend', (e) => { e.preventDefault(); stopVoiceRecording(false); });

// WEBRTC
voiceChatBtn.addEventListener('click', async () => {
  if (isInVoiceChat) { endVoiceChat(); return; }
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(STUN_SERVERS);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = (e) => { const a = document.createElement('audio'); a.srcObject = e.streams[0]; a.autoplay = true; a.id = 'remoteAudio'; document.body.appendChild(a); };
    peerConnection.onicecandidate = (e) => { if (e.candidate) socket.emit('webrtc-ice', { convId: currentConvId, candidate: e.candidate }); };
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('webrtc-offer', { convId: currentConvId, offer });
    isInVoiceChat = true; voiceChatBtn.classList.add('active'); voiceChatBar.classList.remove('hidden'); voiceChatStatus.textContent = '📞 Ulanilmoqda...';
  } catch { alert('Mikrofonga ruxsat berilmadi.'); }
});

endVoiceChatBtn.addEventListener('click', () => endVoiceChat());

function endVoiceChat({ notifyPeer = true } = {}) {
  if (peerConnection) { peerConnection.close(); peerConnection = null; }
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  const a = document.getElementById('remoteAudio');
  if (a) a.remove();
  isInVoiceChat = false; voiceChatBtn.classList.remove('active'); voiceChatBar.classList.add('hidden');
  if (notifyPeer) socket.emit('webrtc-end', { convId: currentConvId });
}

socket.on('webrtc-offer', async (data) => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    peerConnection = new RTCPeerConnection(STUN_SERVERS);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = (e) => { const a = document.createElement('audio'); a.srcObject = e.streams[0]; a.autoplay = true; a.id = 'remoteAudio'; document.body.appendChild(a); };
    peerConnection.onicecandidate = (e) => { if (e.candidate) socket.emit('webrtc-ice', { convId: data.convId, candidate: e.candidate }); };
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('webrtc-answer', { convId: data.convId, answer });
    isInVoiceChat = true; voiceChatBtn.classList.add('active'); voiceChatBar.classList.remove('hidden'); voiceChatStatus.textContent = '📞 Ovozli chat faol';
  } catch {}
});

socket.on('webrtc-answer', async (data) => { if (data.convId !== currentConvId) return; try { await peerConnection?.setRemoteDescription(data.answer); voiceChatStatus.textContent = '📞 Ovozli chat faol'; } catch {} });
socket.on('webrtc-ice', async (data) => { if (data.convId !== currentConvId) return; try { if (peerConnection) await peerConnection.addIceCandidate(data.candidate); } catch {} });
socket.on('webrtc-end', (data) => { if (data?.convId === currentConvId) endVoiceChat({ notifyPeer: false }); });

socket.on('userOnline', (data) => { if (currentConvType === 'private' && currentConvData?.members?.includes(data.phone)) setConversationPresence(true); });
socket.on('userOffline', (data) => { if (currentConvType === 'private' && currentConvData?.members?.includes(data.phone)) setConversationPresence(false, data.lastSeen); });

// GURUHGA A'ZO QO'SHISH
closeAddMemberModal.addEventListener('click', () => { addMemberModal.classList.add('hidden'); addMemberInput.value = ''; });
addMemberBtn.addEventListener('click', async () => {
  const q = addMemberInput.value.trim();
  if (!q) return showError(addMemberMsg, 'Telefon yoki username kiriting');
  hideError(addMemberMsg);
  try {
    const body = q.startsWith('@') ? { phone: currentUser.phone, targetUsername: q.slice(1) } : { phone: currentUser.phone, targetPhone: q };
    const res = await fetch(`/api/conversations/${currentConvId}/add-member`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) { addMemberModal.classList.add('hidden'); addMemberInput.value = ''; alert('A\'zo qo\'shildi!'); convPageMeta.textContent = `${data.conversation.members?.length || 0} a'zo`; }
    else showError(addMemberMsg, data.error);
  } catch { showError(addMemberMsg, 'Xatolik.'); }
});

// KASHFIYOT
discoverGroupsBtn.addEventListener('click', () => openDiscoverModal('group'));
discoverChannelsBtn.addEventListener('click', () => openDiscoverModal('channel'));
closeDiscoverModal.addEventListener('click', () => discoverModal.classList.add('hidden'));

async function openDiscoverModal(type) {
  discoverTitle.textContent = type === 'group' ? 'Ommaviy guruhlar' : 'Ommaviy kanallar';
  discoverModal.classList.remove('hidden');
  discoverList.innerHTML = '<p class="emptyConvText">Yuklanmoqda...</p>';
  try {
    const res = await fetch(`/api/discover?type=${type}`);
    const data = await res.json();
    discoverList.innerHTML = '';
    if (!data.success || data.items.length === 0) { discoverList.innerHTML = '<p class="emptyConvText">Hali ommaviy ' + (type === 'group' ? 'guruhlar' : 'kanallar') + ' yo\'q.</p>'; return; }
    data.items.forEach(item => {
      const isMember = Boolean(item.joined);
      const el = document.createElement('div');
      el.className = 'discoverItem';
      el.innerHTML = `<div class="discoverItemInfo"><div class="discoverItemName">${type === 'group' ? '👥' : '📢'} ${escapeHTML(item.name)}</div><div class="discoverItemMeta">${Number(item.memberCount) || 0} a'zo</div></div><button class="discoverJoinBtn ${isMember ? 'joined' : ''}">${isMember ? 'A\'zo' : 'Qo\'shilish'}</button>`;
      const joinBtn = el.querySelector('.discoverJoinBtn');
      if (!isMember) {
        joinBtn.addEventListener('click', async () => {
          try {
            const url = type === 'channel' ? `/api/conversations/${item._id}/subscribe` : `/api/conversations/${item._id}/add-member`;
            const body = type === 'channel' ? { phone: currentUser.phone } : { phone: currentUser.phone, targetPhone: currentUser.phone };
            await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            joinBtn.textContent = 'A\'zo'; joinBtn.classList.add('joined');
            loadConversations(type === 'group' ? 'group' : 'channel');
          } catch {}
        });
      }
      discoverList.appendChild(el);
    });
  } catch { discoverList.innerHTML = '<p class="emptyConvText">Xatolik.</p>'; }
}

// MODALLAR
newChatBtn.addEventListener('click', () => searchModal.classList.remove('hidden'));
closeSearchModal.addEventListener('click', () => { searchModal.classList.add('hidden'); searchResults.innerHTML = ''; searchInput.value = ''; });

searchBtn.addEventListener('click', async () => {
  const q = searchInput.value.trim();
  if (!q) return;
  try {
    const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    searchResults.innerHTML = '';
    if (!data.success || data.users.length === 0) { searchResults.innerHTML = '<p class="emptyConvText">Topilmadi.</p>'; return; }
    data.users.forEach(user => {
      if (user.phone === currentUser.phone) return;
      const item = document.createElement('div');
      item.className = 'searchResultItem';
      const avatarUrl = safeMediaSource(user.profileImage);
      const avatar = avatarUrl ? `<img src="${escapeHTML(avatarUrl)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">` : '👤';
      item.innerHTML = `<div class="convAvatar">${avatar}</div><div><div class="searchResultName">${escapeHTML(user.nickname || user.phone)}</div><div class="searchResultPhone">${escapeHTML(user.username ? '@' + user.username : user.phone)}</div></div>`;
      item.addEventListener('click', async () => {
        searchModal.classList.add('hidden'); searchResults.innerHTML = ''; searchInput.value = '';
        try {
          const target = user.username ? { targetUsername: user.username } : user.phone ? { targetPhone: user.phone } : null;
          if (!target) return;
          const res = await fetch('/api/conversations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'private', ...target }) });
          const data = await res.json();
          if (data.success) { await loadConversations('private'); openConvPage(data.conversation); }
        } catch {}
      });
      searchResults.appendChild(item);
    });
  } catch {}
});

newGroupBtn.addEventListener('click', () => newGroupModal.classList.remove('hidden'));
closeGroupModal.addEventListener('click', () => { newGroupModal.classList.add('hidden'); groupNameInput.value = ''; });
createGroupBtn.addEventListener('click', async () => {
  const name = groupNameInput.value.trim();
  if (!name) return alert('Guruh nomini kiriting');
  const isPublic = document.querySelector('input[name="groupType"]:checked').value === 'public';
  try {
    const res = await fetch('/api/conversations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'group', name, phone: currentUser.phone, isPublic }) });
    const data = await res.json();
    if (data.success) { newGroupModal.classList.add('hidden'); groupNameInput.value = ''; await loadConversations('group'); openConvPage(data.conversation); }
  } catch {}
});

newChannelBtn.addEventListener('click', () => newChannelModal.classList.remove('hidden'));
closeChannelModal.addEventListener('click', () => { newChannelModal.classList.add('hidden'); channelNameInput.value = ''; });
createChannelBtn.addEventListener('click', async () => {
  const name = channelNameInput.value.trim();
  if (!name) return alert('Kanal nomini kiriting');
  const isPublic = document.querySelector('input[name="channelType"]:checked').value === 'public';
  try {
    const res = await fetch('/api/conversations/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'channel', name, phone: currentUser.phone, isPublic }) });
    const data = await res.json();
    if (data.success) { newChannelModal.classList.add('hidden'); channelNameInput.value = ''; await loadConversations('channel'); openConvPage(data.conversation); }
  } catch {}
});

// ADMIN
closeAdminModal.addEventListener('click', () => adminModal.classList.add('hidden'));
document.querySelectorAll('.adminTabBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.adminTabBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadAdminTab(btn.dataset.tab);
  });
});

async function openAdminPanel() { adminModal.classList.remove('hidden'); loadAdminTab('users'); }

async function loadAdminTab(tab) {
  adminContent.innerHTML = '<p class="emptyConvText">Yuklanmoqda...</p>';
  try {
    const url = tab === 'users' ? '/api/admin/users' : tab === 'rooms' ? '/api/admin/rooms' : tab === 'convs' ? '/api/admin/conversations' : '/api/admin/reports';
    const res = await fetch(url, { headers: { 'x-admin-secret': ADMIN_SECRET } });
    const data = await res.json();
    if (!data.success) { adminContent.innerHTML = '<p class="emptyConvText">Xatolik.</p>'; return; }
    adminContent.innerHTML = '';
    const items = data.users || data.rooms || data.conversations || data.reports;
    if (!items || items.length === 0) { adminContent.innerHTML = '<p class="emptyConvText">Bo\'sh.</p>'; return; }
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'adminRow';
      if (tab === 'users') {
        row.innerHTML = `<div class="adminRowInfo"><div class="adminRowName">${escapeHTML(item.nickname || '—')} ${escapeHTML(item.username ? '@' + item.username : '')}</div><div class="adminRowSub">${escapeHTML(item.phone)} | 💎${Number(item.diamonds) || 0} | 🏅${escapeHTML(item.rank)}</div></div><div class="adminRowBtns"><button class="adminBtn adminGiveBtn" data-phone="${escapeHTML(item.phone)}">+50💎</button><button class="adminBtn adminDelBtn" data-phone="${escapeHTML(item.phone)}">🗑️</button></div>`;
        row.querySelector('.adminGiveBtn').addEventListener('click', async (e) => {
          const r = await fetch(`/api/admin/users/${e.target.dataset.phone}/diamonds`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET }, body: JSON.stringify({ amount: 50 }) });
          const d = await r.json();
          if (d.success) { alert('50 olmos berildi'); loadAdminTab('users'); }
        });
        row.querySelector('.adminDelBtn').addEventListener('click', async (e) => {
          if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
          await fetch(`/api/admin/users/${e.target.dataset.phone}`, { method: 'DELETE', headers: { 'x-admin-secret': ADMIN_SECRET } });
          loadAdminTab('users');
        });
      } else if (tab === 'rooms') {
        row.innerHTML = `<div class="adminRowInfo"><div class="adminRowName">${escapeHTML(item.name)}</div><div class="adminRowSub">${escapeHTML(item.category)} | ${escapeHTML(item.createdBy)}</div></div><button class="adminBtn adminDelBtn" data-id="${escapeHTML(item._id)}">🗑️</button>`;
        row.querySelector('.adminDelBtn').addEventListener('click', async (e) => {
          if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
          await fetch(`/api/admin/rooms/${e.target.dataset.id}`, { method: 'DELETE', headers: { 'x-admin-secret': ADMIN_SECRET } });
          loadAdminTab('rooms');
        });
      } else if (tab === 'convs') {
        row.innerHTML = `<div class="adminRowInfo"><div class="adminRowName">${escapeHTML(item.name || item.type)} (${escapeHTML(item.type)})</div><div class="adminRowSub">${escapeHTML(item.createdBy)} | ${item.members?.length || 0} a'zo</div></div><button class="adminBtn adminDelBtn" data-id="${escapeHTML(item._id)}">🗑️</button>`;
        row.querySelector('.adminDelBtn').addEventListener('click', async (e) => {
          if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
          await fetch(`/api/admin/conversations/${e.target.dataset.id}`, { method: 'DELETE', headers: { 'x-admin-secret': ADMIN_SECRET } });
          loadAdminTab('convs');
        });
      } else {
        row.innerHTML = `<div class="adminRowInfo"><div class="adminRowName">${escapeHTML(item.reason)} ${item.status === 'resolved' ? '✅' : '🟡'}</div><div class="adminRowSub">${escapeHTML(item.reportedBy)} → ${escapeHTML(item.reportedUser)}${item.details ? ' | ' + escapeHTML(item.details) : ''}</div></div>${item.status !== 'resolved' ? `<button class="adminBtn adminGiveBtn" data-id="${escapeHTML(item._id)}">✅ Hal qilindi</button>` : ''}`;
        const resolveBtn = row.querySelector('.adminGiveBtn');
        if (resolveBtn) {
          resolveBtn.addEventListener('click', async (e) => {
            await fetch(`/api/admin/reports/${e.target.dataset.id}/resolve`, { method: 'POST', headers: { 'x-admin-secret': ADMIN_SECRET } });
            loadAdminTab('reports');
          });
        }
      }
      adminContent.appendChild(row);
    });
  } catch { adminContent.innerHTML = '<p class="emptyConvText">Xatolik.</p>'; }
}

// KATEGORIYA
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
  lockScroll(); categoryPage.classList.remove('hidden');
  saveState('category', { category });
  await loadCategoryRooms();
}

async function loadCategoryRooms() {
  try {
    const res = await fetch(`/api/rooms/${currentCategory}`);
    const data = await res.json();
    if (data.success) { categoryPageRoomCount.textContent = data.rooms.length; renderCategoryRooms(data.rooms); }
  } catch { categoryRoomList.innerHTML = '<p class="emptyRoomsText">Xatolik.</p>'; }
}

function renderCategoryRooms(rooms) {
  categoryRoomList.innerHTML = '';
  if (rooms.length === 0) { categoryRoomList.innerHTML = '<p class="emptyRoomsText">Hali xonalar yo\'q.</p>'; return; }
  rooms.forEach(room => {
    const item = document.createElement('div');
    item.className = 'roomItem';
    const isOwner = currentUser && room.createdBy === currentUser.phone;
    item.innerHTML = `<span class="roomName">${escapeHTML(room.name)}</span><span class="roomCreator">${escapeHTML(room.createdBy)}</span>${isOwner ? '<span class="deleteRoomBtn">🗑️</span>' : ''}`;
    item.addEventListener('click', e => { if (e.target.classList.contains('deleteRoomBtn')) return; openRoomPage(room); });
    if (isOwner) {
      item.querySelector('.deleteRoomBtn').addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Xonani o\'chirmoqchimisiz?')) return;
        try {
          const res = await fetch(`/api/rooms/${room._id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentUser.phone }) });
          const data = await res.json();
          if (data.success) await loadCategoryRooms();
        } catch {}
      });
    }
    categoryRoomList.appendChild(item);
  });
}

categoryBackBtn.addEventListener('click', () => { categoryPage.classList.add('hidden'); unlockScroll(); currentCategory = null; clearState(); });
categoryCreateRoomForm.addEventListener('submit', async e => {
  e.preventDefault();
  const name = categoryRoomNameInput.value.trim();
  if (!name) return;
  try {
    const res = await fetch('/api/rooms/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, category: currentCategory, phone: currentUser.phone }) });
    const data = await res.json();
    if (data.success) { categoryRoomNameInput.value = ''; await loadCategoryRooms(); }
  } catch {}
});

// XONA
async function openRoomPage(room) {
  currentRoomId = room._id;
  roomPageName.textContent = room.name;
  roomPageMyRank.textContent = currentUser.rank;
  roomPageCreatorRank.textContent = room.createdBy === currentUser.phone ? currentUser.rank : 'Oddiy askar';
  roomDeleteBtn.classList[room.createdBy === currentUser.phone ? 'remove' : 'add']('hidden');
  roomPage.classList.remove('hidden');
  renderRoomMessages(room.messages || []);
  socket.emit('joinRoom', room._id);
  roomPageCount.textContent = 1;
  saveState('room', { roomId: room._id, category: currentCategory });
}

function renderRoomMessages(messages) {
  roomPageMessages.innerHTML = '';
  if (messages.length === 0) { roomPageMessages.innerHTML = '<p class="emptyMessagesText">Hali xabarlar yo\'q.</p>'; return; }
  messages.forEach(msg => appendRoomMessage(msg));
}

function appendRoomMessage(msg) {
  const bubble = document.createElement('div');
  const messageText = String(msg.text ?? '');
  const isOwn = msg.sender === currentUser.phone;
  bubble.className = isOwn ? 'messageBubble own' : 'messageBubble';
  let contentHtml = '';
  if (messageText.startsWith('[sticker:') && messageText.endsWith(']')) contentHtml = `<span class="messageSticker">${escapeHTML(messageText.slice(9, -1))}</span>`;
  else if (messageText.startsWith('[gif:') && messageText.endsWith(']')) {
    const src = safeMediaSource(messageText.slice(5, -1));
    contentHtml = src ? `<img class="messageGif" src="${escapeHTML(src)}" alt="gif">` : '<p class="messageText">Media manzili yaroqsiz.</p>';
  } else if (messageText.startsWith('[image:') && messageText.endsWith(']')) {
    const src = safeMediaSource(messageText.slice(7, -1));
    contentHtml = src ? `<img class="messageImage" src="${escapeHTML(src)}" alt="rasm">` : '<p class="messageText">Media manzili yaroqsiz.</p>';
  } else if (messageText.startsWith('[audio:') && messageText.endsWith(']')) {
    const src = safeMediaSource(messageText.slice(7, -1), 'audio');
    contentHtml = src ? `<audio class="messageAudio" controls src="${escapeHTML(src)}"></audio>` : '<p class="messageText">Media manzili yaroqsiz.</p>';
  } else contentHtml = `<p class="messageText">${escapeHTML(messageText)}</p>`;
  bubble.innerHTML = `<p class="messageSender">${escapeHTML(msg.sender)}</p>${contentHtml}`;
  roomPageMessages.appendChild(bubble);
  roomPageMessages.scrollTop = roomPageMessages.scrollHeight;
}

roomBackBtn.addEventListener('click', () => { roomPage.classList.add('hidden'); closeAllRoomPanels(); saveState('category', { category: currentCategory }); });
roomDeleteBtn.addEventListener('click', async () => {
  if (!confirm('Xonani o\'chirmoqchimisiz?')) return;
  try {
    const res = await fetch(`/api/rooms/${currentRoomId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentUser.phone }) });
    const data = await res.json();
    if (data.success) { roomPage.classList.add('hidden'); clearState(); saveState('category', { category: currentCategory }); await loadCategoryRooms(); }
  } catch {}
});

roomSendBtn.addEventListener('click', () => {
  const text = roomMessageInput.value.trim();
  if (!text) return;
  socket.emit('sendMessage', { roomId: currentRoomId, text, phone: currentUser.phone });
  roomMessageInput.value = '';
});
roomMessageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') { const text = roomMessageInput.value.trim(); if (!text) return; socket.emit('sendMessage', { roomId: currentRoomId, text, phone: currentUser.phone }); roomMessageInput.value = ''; }
});
roomImageInput.addEventListener('change', async () => {
  const file = roomImageInput.files[0];
  if (!file) return;
  const imageData = await compressImage(file);
  socket.emit('sendMessage', { roomId: currentRoomId, text: '', phone: currentUser.phone, imageData });
  roomImageInput.value = '';
});

socket.on('newMessage', msg => { if (currentRoomId && msg.roomId && currentRoomId.toString() === msg.roomId.toString()) appendRoomMessage(msg); });
socket.on('roomFull', () => { alert('Bu xona to\'la (12/12).'); roomPage.classList.add('hidden'); saveState('category', { category: currentCategory }); });
socket.on('roomUserCount', count => { roomPageCount.textContent = count; });

document.querySelectorAll('.categoryCard').forEach(card => {
  card.addEventListener('click', async () => {
    const category = card.dataset.category;
    try {
      const res = await fetch('/api/category-enter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category }) });
      const data = await res.json();
      if (data.success) { currentUser = data.user; localStorage.setItem('user', JSON.stringify(data.user)); profileDiamonds.textContent = data.user.diamonds; await openCategoryPage(category); }
      else alert(data.error);
    } catch { alert('Xatolik yuz berdi.'); }
  });
});

function closeAllRoomPanels() {
  roomMediaPanel.classList.add('hidden'); roomEmojiPanel.classList.add('hidden');
  roomStickerPanel.classList.add('hidden'); roomGifPanel.classList.add('hidden');
}
function toggleRoomPanel(panel) { const h = panel.classList.contains('hidden'); closeAllRoomPanels(); if (h) { roomMediaPanel.classList.remove('hidden'); panel.classList.remove('hidden'); } }
roomEmojiBtn.addEventListener('click', () => toggleRoomPanel(roomEmojiPanel));
roomStickerBtn.addEventListener('click', () => toggleRoomPanel(roomStickerPanel));
roomGifBtn.addEventListener('click', () => toggleRoomPanel(roomGifPanel));
document.querySelectorAll('#roomEmojiPanel .emojiItem').forEach(item => { item.addEventListener('click', () => { roomMessageInput.value += item.textContent; closeAllRoomPanels(); roomMessageInput.focus(); }); });
document.querySelectorAll('#roomStickerPanel .stickerItem').forEach(item => { item.addEventListener('click', () => { socket.emit('sendMessage', { roomId: currentRoomId, text: `[sticker:${item.dataset.sticker}]`, phone: currentUser.phone }); closeAllRoomPanels(); }); });
document.querySelectorAll('#roomGifPanel .gifItem').forEach(item => { item.addEventListener('click', () => { socket.emit('sendMessage', { roomId: currentRoomId, text: `[gif:${item.src}]`, phone: currentUser.phone }); closeAllRoomPanels(); }); });

function closeAllConvPanels() {
  convMediaPanel.classList.add('hidden'); convEmojiPanel.classList.add('hidden');
  convStickerPanel.classList.add('hidden'); convGifPanel.classList.add('hidden');
}
function toggleConvPanel(panel) { const h = panel.classList.contains('hidden'); closeAllConvPanels(); if (h) { convMediaPanel.classList.remove('hidden'); panel.classList.remove('hidden'); } }
convEmojiBtn.addEventListener('click', () => toggleConvPanel(convEmojiPanel));
convStickerBtn.addEventListener('click', () => toggleConvPanel(convStickerPanel));
convGifBtn.addEventListener('click', () => toggleConvPanel(convGifPanel));
document.querySelectorAll('#convEmojiPanel .emojiItem').forEach(item => { item.addEventListener('click', () => { convMessageInput.value += item.textContent; closeAllConvPanels(); convMessageInput.focus(); }); });
document.querySelectorAll('#convStickerPanel .stickerItem').forEach(item => { item.addEventListener('click', () => { socket.emit('sendConvMessage', { convId: currentConvId, text: `[sticker:${item.dataset.sticker}]`, phone: currentUser.phone, senderNickname: currentUser.nickname || currentUser.phone }); closeAllConvPanels(); }); });
document.querySelectorAll('#convGifPanel .gifItem').forEach(item => { item.addEventListener('click', () => { socket.emit('sendConvMessage', { convId: currentConvId, text: `[gif:${item.src}]`, phone: currentUser.phone, senderNickname: currentUser.nickname || currentUser.phone }); closeAllConvPanels(); }); });

// HOLATNI TIKLASH
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
      lockScroll(); categoryPage.classList.remove('hidden');
      await loadCategoryRooms();
    } else if (state.type === 'room' && state.data.roomId && state.data.category) {
      currentCategory = state.data.category;
      categoryPageTitle.textContent = categoryNames[currentCategory];
      categoryPageDiamonds.textContent = currentUser.diamonds;
      lockScroll(); categoryPage.classList.remove('hidden');
      await loadCategoryRooms();
      try {
        const res = await fetch(`/api/rooms/single/${state.data.roomId}`);
        const data = await res.json();
        if (data.success) await openRoomPage(data.room);
      } catch { clearState(); }
    } else if (state.type === 'conv' && state.data.convId) {
      try {
        const res = await fetch(`/api/conversations/${state.data.convId}`);
        const data = await res.json();
        if (data.success) {
          const type = data.conversation.type;
          activeTab = type === 'private' ? 'chats' : type === 'group' ? 'groups' : 'channels';
          switchTab(activeTab);
          await openConvPage(data.conversation);
        } else clearState();
      } catch { clearState(); }
    }
  } catch { clearState(); }
}

async function restoreAuthentication() {
  try {
    const res = await fetch('/api/me');
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
      currentUser = null;
      localStorage.removeItem('user');
      clearState();
      return;
    }
    if (!res.ok || !data.success || !data.user) {
      throw new Error('Sessiyani tekshirib bo‘lmadi');
    }
    currentUser = data.user;
    localStorage.setItem('user', JSON.stringify(data.user));
    showMainSection(data.user);
    await restoreState();
  } catch {
    showError(authMessage, 'Sessiyani tekshirib bo‘lmadi. Tarmoqni tekshirib, sahifani yangilang.');
  }
}

restoreAuthentication();
