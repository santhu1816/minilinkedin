// AI Features (Groq API integration)

// Enhance bio using AI
async function enhanceBio() {
  const bioInput = document.getElementById('edit-bio');
  const bio = bioInput.value.trim();

  if (!bio) {
    showToast('Please write something in your bio first', 'error');
    return;
  }

  // Show loading state  
  const originalBio = bio;
  bioInput.value = '✨ AI is enhancing your bio...';
  bioInput.disabled = true;

  try {
    const data = await apiRequest('/api/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify({ bio })
    });

    bioInput.value = data.enhancedBio;
    showToast('Bio enhanced by AI! ✨');
  } catch (error) {
    bioInput.value = originalBio;
    showToast('Failed to enhance bio. Try again.', 'error');
  } finally {
    bioInput.disabled = false;
    bioInput.focus();
  }
}

// Enhance caption using AI
async function enhanceCaption() {
  const captionInput = document.getElementById('post-caption');
  const caption = captionInput.value.trim();

  if (!caption) {
    showToast('Please write a caption first', 'error');
    return;
  }

  const btn = document.getElementById('enhance-caption-btn');
  const originalCaption = caption;
  captionInput.value = '✨ AI is enhancing your caption...';
  captionInput.disabled = true;
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div> Enhancing...';

  try {
    const data = await apiRequest('/api/ai/enhance-caption', {
      method: 'POST',
      body: JSON.stringify({ caption })
    });

    captionInput.value = data.enhancedCaption;
    showToast('Caption enhanced by AI! ✨');
  } catch (error) {
    captionInput.value = originalCaption;
    showToast('Failed to enhance caption. Try again.', 'error');
  } finally {
    captionInput.disabled = false;
    btn.disabled = false;
    btn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"/></svg>
      ✨ AI Enhance Caption
    `;
    captionInput.focus();
  }
}
