// Feed page logic (feed.html)

let currentUser = null;

// Initialize feed page
checkAuthState();

auth.onAuthStateChanged(async (user) => {
  if (user) {
    try {
      const data = await apiRequest('/api/users/me');
      currentUser = data.user;

      // Update avatars
      const avatarUrl = currentUser.profilePicture ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0a66c2&color=fff&size=40`;
      document.getElementById('user-avatar').src = avatarUrl;
      document.getElementById('modal-user-avatar').src = avatarUrl;
      document.getElementById('modal-user-name').textContent = currentUser.name;

      // Check notification count
      loadNotificationCount();

      // Load feed
      loadFeed();
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  }
});

// Load notification count for badge
async function loadNotificationCount() {
  try {
    const data = await apiRequest('/api/notifications/skill-matches');
    const count = data.matches?.length || 0;
    const badge = document.getElementById('notification-count');
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    }
  } catch (error) {
    // Silent fail
  }
}

// Load feed posts
async function loadFeed() {
  try {
    const data = await apiRequest('/api/posts');
    const skeleton = document.getElementById('feed-skeleton');
    const emptyFeed = document.getElementById('empty-feed');
    const feedContainer = document.getElementById('posts-feed');

    skeleton.classList.add('hidden');

    if (!data.posts || data.posts.length === 0) {
      emptyFeed.classList.remove('hidden');
      return;
    }

    feedContainer.innerHTML = data.posts.map(post => createPostCard(post)).join('');
  } catch (error) {
    console.error('Failed to load feed:', error);
    showToast('Failed to load feed', 'error');
  }
}

// Create post card HTML
function createPostCard(post) {
  const authorPic = post.author?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || 'U')}&background=0a66c2&color=fff&size=40`;
  const isLiked = post.likes?.includes(currentUser?._id);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;
  const timeAgo = getTimeAgo(post.createdAt);

  const imageHtml = post.image ? `
    <div class="post-image-container">
      <img src="${post.image}" alt="post image" loading="lazy">
    </div>
  ` : '';

  const skillsHtml = post.detectedSkills?.length ? `
    <div class="px-4 pb-2 flex flex-wrap gap-1">
      ${post.detectedSkills.map(s => `<span class="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">${s}</span>`).join('')}
    </div>
  ` : '';

  const commentsHtml = post.comments?.length ? `
    <div class="px-4 pb-3 space-y-2" id="comments-${post._id}">
      ${post.comments.slice(-3).map(c => `
        <div class="comment-item py-1">
          <span class="text-xs font-semibold text-gray-800">${c.user?.name || 'User'}</span>
          <span class="text-xs text-gray-600 ml-1">${c.text}</span>
        </div>
      `).join('')}
      ${post.comments.length > 3 ? `<p class="text-xs text-gray-400">... and ${post.comments.length - 3} more comments</p>` : ''}
    </div>
  ` : '';

  return `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 overflow-hidden feed-card fade-in-up">
      <!-- Author Header -->
      <div class="flex items-center gap-3 p-4">
        <a href="/profile.html?id=${post.author?._id}">
          <img src="${authorPic}" alt="${post.author?.name}" class="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-blue-400 transition">
        </a>
        <div class="flex-1">
          <a href="/profile.html?id=${post.author?._id}" class="text-sm font-semibold text-gray-900 hover:text-blue-600 hover:underline transition">${post.author?.name || 'Unknown'}</a>
          <p class="text-xs text-gray-500">${post.author?.headline || ''} • ${timeAgo}</p>
        </div>
      </div>

      <!-- Caption -->
      <div class="px-4 pb-3">
        <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">${escapeHtml(post.caption)}</p>
      </div>

      <!-- Skills detected -->
      ${skillsHtml}

      <!-- Image -->
      ${imageHtml}

      <!-- Stats -->
      <div class="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-50">
        <span id="like-count-${post._id}">${likeCount} ${likeCount === 1 ? 'like' : 'likes'}</span>
        <span>${commentCount} ${commentCount === 1 ? 'comment' : 'comments'}</span>
      </div>

      <!-- Actions -->
      <div class="flex border-t border-gray-100">
        <button onclick="toggleLike('${post._id}')" id="like-btn-${post._id}"
          class="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium ${isLiked ? 'text-blue-600' : 'text-gray-600'} hover:bg-gray-50 transition">
          <svg class="w-5 h-5" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.095 4.439 9.5 5.575 9.5h.054c.624 0 .87.933.405 1.317A4.5 4.5 0 005.904 14.5v4.25z"/>
          </svg>
          Like
        </button>
        <button onclick="toggleCommentForm('${post._id}')" class="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"/></svg>
          Comment
        </button>
      </div>

      <!-- Comment Form (hidden) -->
      <div id="comment-form-${post._id}" class="hidden px-4 pb-3 border-t border-gray-100 pt-3">
        <div class="flex gap-2">
          <input type="text" id="comment-input-${post._id}" placeholder="Write a comment..."
            class="flex-1 px-3 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm outline-none focus:border-blue-400 transition"
            onkeypress="if(event.key==='Enter')submitComment('${post._id}')">
          <button onclick="submitComment('${post._id}')" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-full font-medium hover:bg-blue-700 transition">Post</button>
        </div>
      </div>

      <!-- Comments -->
      ${commentsHtml}
    </div>
  `;
}

// Toggle like
async function toggleLike(postId) {
  try {
    const data = await apiRequest(`/api/posts/${postId}/like`, { method: 'PUT' });
    const btn = document.getElementById(`like-btn-${postId}`);
    const countEl = document.getElementById(`like-count-${postId}`);

    if (data.liked) {
      btn.classList.add('text-blue-600');
      btn.classList.remove('text-gray-600');
      btn.querySelector('svg').setAttribute('fill', 'currentColor');
      btn.classList.add('like-animate');
      setTimeout(() => btn.classList.remove('like-animate'), 400);
    } else {
      btn.classList.remove('text-blue-600');
      btn.classList.add('text-gray-600');
      btn.querySelector('svg').setAttribute('fill', 'none');
    }

    const likeCount = data.likes.length;
    countEl.textContent = `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`;
  } catch (error) {
    showToast('Failed to like post', 'error');
  }
}

// Toggle comment form
function toggleCommentForm(postId) {
  const form = document.getElementById(`comment-form-${postId}`);
  form.classList.toggle('hidden');
  if (!form.classList.contains('hidden')) {
    document.getElementById(`comment-input-${postId}`).focus();
  }
}

// Submit comment
async function submitComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();
  if (!text) return;

  try {
    const data = await apiRequest(`/api/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    input.value = '';
    showToast('Comment added!');
    loadFeed(); // Refresh feed to show new comment
  } catch (error) {
    showToast('Failed to add comment', 'error');
  }
}

// Create post modal
function openCreatePostModal() {
  document.getElementById('create-post-modal').classList.remove('hidden');
}

function closeCreatePostModal() {
  document.getElementById('create-post-modal').classList.add('hidden');
  document.getElementById('create-post-form').reset();
  removeImagePreview();
}

// Image preview
function previewPostImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('image-preview').src = e.target.result;
      document.getElementById('image-preview-container').classList.remove('hidden');
      document.getElementById('upload-placeholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }
}

function removeImagePreview(event) {
  if (event) event.stopPropagation();
  document.getElementById('post-image').value = '';
  document.getElementById('image-preview-container').classList.add('hidden');
  document.getElementById('upload-placeholder').classList.remove('hidden');
}

// Submit post
document.getElementById('create-post-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const caption = document.getElementById('post-caption').value.trim();
  const imageInput = document.getElementById('post-image');
  const submitBtn = document.getElementById('post-submit-btn');

  if (!caption) {
    showToast('Please write something!', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="spinner"></div> Posting...';

  try {
    const formData = new FormData();
    formData.append('caption', caption);
    if (imageInput.files[0]) {
      formData.append('image', imageInput.files[0]);
    }

    await apiRequest('/api/posts', {
      method: 'POST',
      body: formData
    });

    closeCreatePostModal();
    showToast('Post created! 🎉');
    loadFeed();
  } catch (error) {
    showToast('Failed to create post', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Post';
  }
});

// Helpers
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(text));
  return div.innerHTML;
}
