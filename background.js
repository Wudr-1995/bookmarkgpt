// BookmarkGPT - Background Service Worker

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_BOOKMARKS') {
    chrome.storage.local.get(['bookmarks']).then(result => {
      sendResponse({ bookmarks: result.bookmarks || [] });
    });
    return true; // Keep channel open for async response
  }

  if (message.type === 'DELETE_BOOKMARK') {
    chrome.storage.local.get(['bookmarks']).then(result => {
      const bookmarks = result.bookmarks || [];
      const filtered = bookmarks.filter(b => b.id !== message.id);
      chrome.storage.local.set({ bookmarks: filtered }).then(() => {
        sendResponse({ success: true, count: filtered.length });
      });
    });
    return true;
  }

  if (message.type === 'SEARCH_BOOKMARKS') {
    chrome.storage.local.get(['bookmarks']).then(result => {
      const bookmarks = result.bookmarks || [];
      const query = message.query.toLowerCase();
      const filtered = bookmarks.filter(b =>
        b.title.toLowerCase().includes(query) ||
        b.summary.toLowerCase().includes(query) ||
        b.url.toLowerCase().includes(query) ||
        b.tags.some(t => t.toLowerCase().includes(query))
      );
      sendResponse({ bookmarks: filtered });
    });
    return true;
  }
});

// Badge update when bookmarks change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.bookmarks) {
    const count = changes.bookmarks.newValue?.length || 0;
    chrome.action.setBadgeText({ text: count > 0 ? count.toString() : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#667EEA' });
  }
});
