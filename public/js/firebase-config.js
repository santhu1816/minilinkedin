// Firebase Client Configuration
// ⚠️ REPLACE these values with YOUR Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCYXSKFQPZ6stX_A4xpnsm8CicQOWO58X4",
  authDomain: "elearn-bca-5d672.firebaseapp.com",
  projectId: "elearn-bca-5d672",
  storageBucket: "elearn-bca-5d672.firebasestorage.app",
  messagingSenderId: "421432913571",
  appId: "1:421432913571:web:4eabf249c6b9480395d916"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Helper: Get current user's auth token
async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = '/';
    return null;
  }
  return await user.getIdToken();
}

// Helper: Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const icon = document.getElementById('toast-icon');
  const msg = document.getElementById('toast-message');

  icon.textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  msg.textContent = message;

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Helper: Make authenticated API request
async function apiRequest(url, options = {}) {
  const token = await getAuthToken();
  if (!token) return null;

  const headers = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const baseUrl = window.location.origin.includes('5000') ? '' : 'http://localhost:5000';
  const response = await fetch(`${baseUrl}${url}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Handle logout (used by all pages)
function handleLogout() {
  auth.signOut().then(() => {
    window.location.href = '/';
  });
}

// Check auth state on protected pages
function checkAuthState() {
  auth.onAuthStateChanged((user) => {
    if (!user && !window.location.pathname.includes('index')) {
      window.location.href = '/';
    }
  });
}
