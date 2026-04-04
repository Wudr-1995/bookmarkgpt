# BookmarkGPT Chrome Extension

**AI-powered bookmarks with automatic summaries.**

Save any webpage as a bookmark and get an instant AI-generated summary — no API key required. Uses Chrome's built-in Gemini Nano AI.

## Features

- 🤖 **AI Summaries** — Uses Chrome's built-in AI (Gemini Nano) to generate 2-3 sentence page summaries
- 🏷️ **Auto Tags** — AI automatically generates relevant topic tags
- 🔍 **Full-Text Search** — Search across all your bookmarks by title, summary, URL, or tags
- 📱 **Syncs Everywhere** — Uses Chrome Storage (syncs with your Google account)
- 🔒 **Private** — All processing happens locally in your browser
- 💰 **Free** — No API key, no subscription, no cost

## How It Works

1. Click the BookmarkGPT icon in Chrome toolbar
2. AI generates a summary of the current page
3. Add tags if you want
4. Click "Save Bookmark"
5. Find all your bookmarks via the extension popup

## Installation

### Developer Mode (Recommended for Testing)

1. Clone or download this repo
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `bookmarkgpt` folder

### Load as Temporary Extension (Quick Test)

1. Go to `chrome://extensions/`
2. Enable Developer mode
3. Click "Pack extension"
4. Select the `bookmarkgpt` folder
5. Load the generated `.crx` file

## Tech Stack

- **Manifest V3** Chrome Extension
- **Chrome Prompt API** (Gemini Nano) for AI summaries
- **Chrome Storage API** for bookmark persistence
- Pure HTML/CSS/JS — no build step needed

## Browser Requirements

- Chrome 131+ (with Gemini Nano support)
- Or any Chromium-based browser with Prompt API

## Privacy

BookmarkGPT processes all page data locally using Chrome's built-in AI. No data is sent to external servers. Your bookmarks are stored in your Chrome sync account (if signed in) or locally.

## Future Enhancements

- [ ] Export/import bookmarks (JSON, HTML)
- [ ] Tag management UI
- [ ] Keyboard shortcuts
- [ ] Right-click "Bookmark with AI" option
- [ ] Bookmark folders/categories
- [ ] Visit tracking (last visited, frequency)
- [ ] Chrome New Tab page integration

## File Structure

```
bookmarkgpt/
├── manifest.json     # Extension manifest
├── popup.html        # Extension popup UI
├── popup.js         # Popup logic & AI integration
├── background.js    # Service worker
├── icons/           # Extension icons
└── README.md        # This file
```

## License

MIT
