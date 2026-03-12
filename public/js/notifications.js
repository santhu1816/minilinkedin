// Notifications page logic (notifications.html)

checkAuthState();

auth.onAuthStateChanged(async (user) => {
  if (user) {
    loadSkillMatches();
  }
});

async function loadSkillMatches() {
  try {
    const data = await apiRequest('/api/notifications/skill-matches');
    const skeleton = document.getElementById('notifications-skeleton');
    const list = document.getElementById('notifications-list');
    const empty = document.getElementById('empty-notifications');

    skeleton.classList.add('hidden');

    if (!data.matches || data.matches.length === 0) {
      empty.classList.remove('hidden');
      return;
    }

    list.classList.remove('hidden');
    list.innerHTML = data.matches.map((match, idx) => {
      const pic = match.user.profilePicture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(match.user.name)}&background=0a66c2&color=fff&size=48`;
      const skills = match.sharedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');

      return `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-start gap-4 slide-in-right" style="animation-delay: ${idx * 0.1}s">
          <a href="/profile.html?id=${match.user._id}">
            <img src="${pic}" alt="${match.user.name}" class="w-12 h-12 rounded-full object-cover hover:ring-2 hover:ring-blue-400 transition">
          </a>
          <div class="flex-1">
            <div class="flex items-start justify-between gap-2">
              <div>
                <p class="text-sm font-semibold text-gray-900">
                  <span class="text-purple-600">✨</span>
                  You and <a href="/profile.html?id=${match.user._id}" class="text-blue-600 hover:underline">${match.user.name}</a> both mentioned <span class="font-bold text-blue-600">${skills}</span>
                </p>
                <p class="text-xs text-gray-500 mt-0.5">${match.user.headline || 'LinkedIn member'}</p>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-2">Consider connecting since you share similar skills!</p>
            <div class="flex flex-wrap gap-1.5 mt-2">
              ${match.sharedSkills.map(s => `<span class="skill-tag text-xs">${s}</span>`).join('')}
            </div>
            <a href="/profile.html?id=${match.user._id}" class="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-blue-600 hover:underline">
              View Profile
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </a>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Failed to load notifications:', error);
    document.getElementById('notifications-skeleton').classList.add('hidden');
    document.getElementById('empty-notifications').classList.remove('hidden');
  }
}
