// Auth page logic (index.html)

// Tab switching
function switchTab(tab) {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const loginTab = document.getElementById('login-tab');
  const signupTab = document.getElementById('signup-tab');
  const errorEl = document.getElementById('auth-error');

  errorEl.classList.add('hidden');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    loginTab.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all bg-white text-blue-600 shadow-sm';
    signupTab.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all text-gray-500 hover:text-gray-700';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signupTab.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all bg-white text-blue-600 shadow-sm';
    loginTab.className = 'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all text-gray-500 hover:text-gray-700';
  }
}

// Show error
function showAuthError(message) {
  const errorEl = document.getElementById('auth-error');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
}

// Set button loading state
function setButtonLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Please wait...';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.id === 'login-btn' ? 'Sign In' : 'Create Account';
  }
}

// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');

  setButtonLoading(btn, true);

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdToken();

    // Sync with backend
    const baseUrl = window.location.origin.includes('5000') ? '' : 'http://localhost:5000';
    await fetch(`${baseUrl}/api/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: userCredential.user.displayName || email.split('@')[0] })
    });

    showToast('Welcome back!');
    setTimeout(() => window.location.href = '/feed.html', 500);
  } catch (error) {
    showAuthError(error.message.replace('Firebase: ', ''));
    setButtonLoading(btn, false);
  }
});

// Signup
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const btn = document.getElementById('signup-btn');

  setButtonLoading(btn, true);

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);

    // Update display name
    await userCredential.user.updateProfile({ displayName: name });

    const token = await userCredential.user.getIdToken();

    // Sync with backend (create user in MongoDB)
    const baseUrl = window.location.origin.includes('5000') ? '' : 'http://localhost:5000';
    await fetch(`${baseUrl}/api/auth/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    showToast('Account created successfully!');
    setTimeout(() => window.location.href = '/feed.html', 500);
  } catch (error) {
    showAuthError(error.message.replace('Firebase: ', ''));
    setButtonLoading(btn, false);
  }
});

// If already logged in, redirect to feed
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = '/feed.html';
  }
});
