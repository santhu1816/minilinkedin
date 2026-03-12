// Profile page logic (profile.html)

let currentUser = null;
let isOwnProfile = true;
let isEditMode = false;
let profileSkills = [];

checkAuthState();

auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      // Check if viewing own profile or someone else's
      const urlParams = new URLSearchParams(window.location.search);
      const profileId = urlParams.get('id');

      if (profileId) {
        // Viewing another user's profile
        const meData = await apiRequest('/api/users/me');
        currentUser = meData.user;

        if (profileId === currentUser._id) {
          isOwnProfile = true;
          loadProfile(currentUser);
        } else {
          isOwnProfile = false;
          const data = await apiRequest(`/api/users/${profileId}`);
          loadProfile(data.user);
        }
      } else {
        // Viewing own profile
        const data = await apiRequest('/api/users/me');
        currentUser = data.user;
        isOwnProfile = true;
        loadProfile(currentUser);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showToast('Failed to load profile', 'error');
    }
  }
});

function loadProfile(user) {
  // Profile header
  const pic = user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0a66c2&color=fff&size=120`;
  document.getElementById('profile-pic').src = pic;
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-headline').textContent = user.headline || '';
  document.getElementById('profile-email').textContent = user.email || '';

  // Show edit button only for own profile
  if (isOwnProfile) {
    document.getElementById('edit-btn-container').classList.remove('hidden');
  }

  // View mode data
  document.getElementById('view-bio').textContent = user.bio || 'No bio yet.';

  // Skills
  const skillsContainer = document.getElementById('view-skills');
  if (user.skills && user.skills.length > 0) {
    skillsContainer.innerHTML = user.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
  } else {
    skillsContainer.innerHTML = '<p class="text-gray-400 text-sm">No skills added yet.</p>';
  }

  // Experience
  const expContainer = document.getElementById('view-experience');
  if (user.experience && user.experience.length > 0) {
    expContainer.innerHTML = user.experience.map(exp => `
      <div class="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-800">${exp.title || ''}</p>
          <p class="text-xs text-gray-600">${exp.company || ''}</p>
          <p class="text-xs text-gray-400">${exp.duration || ''}</p>
        </div>
      </div>
    `).join('');
  } else {
    expContainer.innerHTML = '<p class="text-gray-400 text-sm">No experience added yet.</p>';
  }

  // Education
  const eduContainer = document.getElementById('view-education');
  if (user.education && user.education.length > 0) {
    eduContainer.innerHTML = user.education.map(edu => `
      <div class="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-800">${edu.school || ''}</p>
          <p class="text-xs text-gray-600">${edu.degree || ''}</p>
          <p class="text-xs text-gray-400">${edu.year || ''}</p>
        </div>
      </div>
    `).join('');
  } else {
    eduContainer.innerHTML = '<p class="text-gray-400 text-sm">No education added yet.</p>';
  }

  // Populate edit form if own profile
  if (isOwnProfile) {
    document.getElementById('edit-name').value = user.name || '';
    document.getElementById('edit-headline').value = user.headline || '';
    document.getElementById('edit-bio').value = user.bio || '';
    profileSkills = [...(user.skills || [])];
    renderEditSkills();
    renderEditExperience(user.experience || []);
    renderEditEducation(user.education || []);
  }
}

// Toggle between view/edit mode
function toggleEditMode() {
  isEditMode = !isEditMode;
  const viewMode = document.getElementById('view-mode');
  const editMode = document.getElementById('edit-mode');
  const toggleBtn = document.getElementById('edit-toggle-btn');

  if (isEditMode) {
    viewMode.classList.add('hidden');
    editMode.classList.remove('hidden');
    toggleBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
      Cancel
    `;
  } else {
    viewMode.classList.remove('hidden');
    editMode.classList.add('hidden');
    toggleBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
      Edit Profile
    `;
  }
}

// Skills management
function renderEditSkills() {
  const container = document.getElementById('skills-container');
  container.innerHTML = profileSkills.map((skill, idx) => `
    <span class="skill-tag group cursor-pointer" onclick="removeSkill(${idx})">
      ${skill}
      <svg class="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
    </span>
  `).join('');
}

function addSkill() {
  const input = document.getElementById('new-skill');
  const skill = input.value.trim();
  if (skill && !profileSkills.includes(skill)) {
    profileSkills.push(skill);
    renderEditSkills();
    input.value = '';
  }
}

function removeSkill(idx) {
  profileSkills.splice(idx, 1);
  renderEditSkills();
}

// Experience fields
function renderEditExperience(experiences) {
  const container = document.getElementById('experience-container');
  container.innerHTML = experiences.map((exp, idx) => `
    <div class="p-3 bg-gray-50 rounded-xl space-y-2 relative">
      <button type="button" onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <input type="text" name="exp-title" value="${exp.title || ''}" placeholder="Job Title" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
      <input type="text" name="exp-company" value="${exp.company || ''}" placeholder="Company" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
      <input type="text" name="exp-duration" value="${exp.duration || ''}" placeholder="Duration (e.g. 2020-2023)" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
    </div>
  `).join('');
}

function addExperienceField() {
  const container = document.getElementById('experience-container');
  const div = document.createElement('div');
  div.className = 'p-3 bg-gray-50 rounded-xl space-y-2 relative fade-in-up';
  div.innerHTML = `
    <button type="button" onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
    <input type="text" name="exp-title" placeholder="Job Title" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
    <input type="text" name="exp-company" placeholder="Company" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
    <input type="text" name="exp-duration" placeholder="Duration (e.g. 2020-2023)" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
  `;
  container.appendChild(div);
}

// Education fields
function renderEditEducation(educations) {
  const container = document.getElementById('education-container');
  container.innerHTML = educations.map((edu, idx) => `
    <div class="p-3 bg-gray-50 rounded-xl space-y-2 relative">
      <button type="button" onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <input type="text" name="edu-school" value="${edu.school || ''}" placeholder="School/University" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
      <input type="text" name="edu-degree" value="${edu.degree || ''}" placeholder="Degree" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
      <input type="text" name="edu-year" value="${edu.year || ''}" placeholder="Year (e.g. 2024)" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
    </div>
  `).join('');
}

function addEducationField() {
  const container = document.getElementById('education-container');
  const div = document.createElement('div');
  div.className = 'p-3 bg-gray-50 rounded-xl space-y-2 relative fade-in-up';
  div.innerHTML = `
    <button type="button" onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
    <input type="text" name="edu-school" placeholder="School/University" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
    <input type="text" name="edu-degree" placeholder="Degree" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
    <input type="text" name="edu-year" placeholder="Year (e.g. 2024)" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-400">
  `;
  container.appendChild(div);
}

// Save profile
document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();
    formData.append('name', document.getElementById('edit-name').value);
    formData.append('headline', document.getElementById('edit-headline').value);
    formData.append('bio', document.getElementById('edit-bio').value);
    formData.append('skills', JSON.stringify(profileSkills));

    // Gather experience
    const expItems = document.querySelectorAll('#experience-container > div');
    const experience = Array.from(expItems).map(item => ({
      title: item.querySelector('[name="exp-title"]').value,
      company: item.querySelector('[name="exp-company"]').value,
      duration: item.querySelector('[name="exp-duration"]').value,
    })).filter(e => e.title || e.company);
    formData.append('experience', JSON.stringify(experience));

    // Gather education
    const eduItems = document.querySelectorAll('#education-container > div');
    const education = Array.from(eduItems).map(item => ({
      school: item.querySelector('[name="edu-school"]').value,
      degree: item.querySelector('[name="edu-degree"]').value,
      year: item.querySelector('[name="edu-year"]').value,
    })).filter(e => e.school || e.degree);
    formData.append('education', JSON.stringify(education));

    // Profile picture
    const picInput = document.getElementById('edit-profile-pic');
    if (picInput.files[0]) {
      formData.append('profilePicture', picInput.files[0]);
    }

    const data = await apiRequest('/api/users/me', {
      method: 'PUT',
      body: formData
    });

    currentUser = data.user;
    loadProfile(currentUser);
    toggleEditMode();
    showToast('Profile updated! 🎉');
  } catch (error) {
    showToast('Failed to update profile', 'error');
  }
});
