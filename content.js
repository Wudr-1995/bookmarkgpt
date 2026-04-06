// BookmarkGPT Content Script
// Handles keyboard shortcuts for quick bookmarking

// Keyboard shortcut: Ctrl+Shift+B (or Cmd+Shift+B on Mac)
document.addEventListener('keydown', async (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
    e.preventDefault();
    
    // Get current page info
    const pageInfo = {
      url: window.location.href,
      title: document.title,
    };
    
    // Store temporarily for popup to pick up
    try {
      await chrome.storage.local.set({ pendingBookmark: pageInfo });
      
      // Show a subtle notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
      `;
      notification.innerHTML = '📚 BookmarkGPT: Click extension icon to save this page!';
      
      // Add animation keyframes
      const style = document.createElement('style');
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
      
      document.body.appendChild(notification);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
      
    } catch (err) {
      console.error('BookmarkGPT: Failed to save pending bookmark', err);
    }
  }
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getPageInfo') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      selection: window.getSelection().toString()
    });
  }
  return true;
});
