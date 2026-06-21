const step1 = document.getElementById('step1');
const step2 = document.getElementById('step2');
const authSection = document.getElementById('authSection');
const loggedInSection = document.getElementById('loggedInSection');
const welcomeText = document.getElementById('welcomeText');
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

let currentPhone = '';

function showLoggedIn(user) {
  authSection.classList.add('hidden');
  loggedInSection.classList.remove('hidden');
  profilePhone.textContent = user.phone;
  profileDiamonds.textContent = user.diamonds;
  profileRank.textContent = user.rank;
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
const categoryCards = document.querySelectorAll('.categoryCard');

categoryCards.forEach((card) => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    alert(`"${card.querySelector('.categoryName').textContent}" bo'limi tez orada ishga tushadi!`);
  });
});