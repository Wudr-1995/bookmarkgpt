// BookmarkGPT - Popup Script
// Uses Chrome's built-in AI (Prompt API) when available

let currentTab = null;
let generatedSummary = '';
let generatedTags = '';
let pendingBookmark = null;

// Elements
const pageTitleEl = document.getElementById('page-title');
const pageUrlEl = document.getElementById('page-url');
const summaryContentEl = document.getElementById('summary-content');
const tagInputEl = document.getElementById('tag-input');
const saveBtnEl = document.getElementById('save-btn');
const cancelBtnEl = document.getElementById('cancel-btn');
const errorContainerEl = document.getElementById('error-container');
const mainViewEl = document.getElementById('main-view');
const savedViewEl = document.getElementById('saved-view');
const savedCountEl = document.getElementById('saved-count');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    // Check for pending bookmark from keyboard shortcut
    const pending = await chrome.storage.local.get(['pendingBookmark']);
    if (pending.pendingBookmark) {
      pendingBookmark = pending.pendingBookmark;
      await chrome.storage.local.remove(['pendingBookmark']);
    }

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    // Use pending bookmark if available (from keyboard shortcut)
    const title = pendingBookmark?.title || tab.title || 'Untitled';
    const url = pendingBookmark?.url || tab.url || '';

    pageTitleEl.textContent = title;
    pageUrlEl.textContent = url;

    // Generate AI summary
    await generateSummary({ title, url, tab });

    // Load existing bookmarks count
    updateSavedCount();
  } catch (err) {
    showError('Failed to load page info');
    console.error(err);
  }
}

async function generateSummary(pageInfo) {
  try {
    // Check if Chrome's built-in AI is available
    let summary = '';
    let tags = '';

    if ('ai' in window && 'createTextSession' in window.ai) {
      // Use Chrome's built-in AI (Prompt API with Gemini Nano)
      const session = await window.ai.createTextSession();
      
      const prompt = `You are a bookmark summarizer. Given the following web page, generate:
1. A 2-3 sentence summary of what this page is about
2. 3-5 relevant tags (comma separated)

Format your response as:
SUMMARY: [your summary here]
TAGS: [tag1, tag2, tag3]

Page title: ${pageInfo.title}
Page URL: ${pageInfo.url}`;

      const result = await session.prompt(prompt);
      session.destroy();

      // Parse result
      const summaryMatch = result.match(/SUMMARY:\s*([\s\S]*?)(?=TAGS:|$)/i);
      const tagsMatch = result.match(/TAGS:\s*([\s\S]*?)$/i);

      summary = summaryMatch ? summaryMatch[1].trim() : '';
      tags = tagsMatch ? tagsMatch[1].trim() : '';

      if (!summary) {
        const lines = result.split('\n').filter(l => l.trim() && !l.startsWith('TAGS'));
        summary = lines.join(' ').trim();
      }
    } else {
      // Fallback: extractive summary from title
      summary = `This bookmark captures content from "${pageInfo.title}". The page is located at ${new URL(pageInfo.url).hostname} and has been saved for later reference.`;
      
      const words = (pageInfo.title + ' ' + pageInfo.url).split(/\s+/)
        .filter(w => w.length > 4)
        .filter(w => !/^(https?|www|com|org|net|io)$/i.test(w))
        .slice(0, 5);
      tags = [...new Set(words)].join(', ');
    }

    generatedSummary = summary;
    generatedTags = tags || '';

    // Display summary
    summaryContentEl.innerHTML = `
      <div class="summary-text" id="summary-text">${escapeHtml(summary)}</div>
      ${summary.length > 120 ? '<span class="expand-btn" onclick="toggleSummary(this)">Show more</span>' : ''}
    `;

    // Auto-fill tags
    if (tags) {
      tagInputEl.value = tags;
    }

    // Enable save button
    saveBtnEl.disabled = false;

  } catch (err) {
    console.error('AI summary failed:', err);
    
    generatedSummary = `Bookmark for "${currentTab?.title || 'Untitled'}". Saved from ${currentTab?.url || ''}`;
    summaryContentEl.innerHTML = `
      <div class="summary-text">${escapeHtml(generatedSummary)}</div>
    `;
    saveBtnEl.disabled = false;
    
    try {
      const url = new URL(currentTab?.url || 'https://example.com');
      const keywords = url.hostname.replace('www.', '').split('.');
      tagInputEl.value = keywords.filter(w => w.length > 2).slice(0, 3).join(', ');
    } catch {}
  }
}

function toggleSummary(btn) {
  const textEl = document.getElementById('summary-text');
  textEl.classList.toggle('expanded');
  btn.textContent = textEl.classList.contains('expanded') ? 'Show less' : 'Show more';
}

window.toggleSummary = toggleSummary;

async function saveBookmark() {
  const url = pendingBookmark?.url || currentTab?.url;
  const title = pendingBookmark?.title || currentTab?.title;
  
  if (!url) return;

  saveBtnEl.disabled = true;
  saveBtnEl.textContent = 'Saving...';

  const bookmark = {
    id: Date.now().toString(),
    url: url,
    title: title,
    summary: generatedSummary,
    tags: tagInputEl.value.split(',').map(t => t.trim()).filter(Boolean),
    createdAt: new Date().toISOString(),
    favicon: currentTab?.favIconUrl || null
  };

  try {
    const result = await chrome.storage.local.get(['bookmarks']);
    const bookmarks = result.bookmarks || [];
    
    const exists = bookmarks.some(b => b.url === bookmark.url);
    if (exists) {
      showError('This page is already bookmarked!');
      saveBtnEl.disabled = false;
      saveBtnEl.textContent = 'Save Bookmark';
      return;
    }

    bookmarks.unshift(bookmark);
    await chrome.storage.local.set({ bookmarks });

    mainViewEl.style.display = 'none';
    savedViewEl.style.display = 'block';
    savedCountEl.textContent = `${bookmarks.length} bookmark${bookmarks.length > 1 ? 's' : ''} saved`;

    setTimeout(() => window.close(), 1500);

  } catch (err) {
    showError('Failed to save bookmark');
    saveBtnEl.disabled = false;
    saveBtnEl.textContent = 'Save Bookmark';
    console.error(err);
  }
}

async function updateSavedCount() {
  try {
    const result = await chrome.storage.local.get(['bookmarks']);
    const count = (result.bookmarks || []).length;
    if (count > 0) {
      savedCountEl.textContent = `${count} bookmark${count > 1 ? 's' : ''} saved`;
    }
  } catch {}
}

function showError(msg) {
  errorContainerEl.innerHTML = `<div class="error">⚠️ ${escapeHtml(msg)}</div>`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
saveBtnEl.addEventListener('click', saveBookmark);
cancelBtnEl.addEventListener('click', () => window.close());
