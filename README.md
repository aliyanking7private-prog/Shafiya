# Shafiya PWA - AI Wife

A progressive web application (PWA) featuring an AI companion with speech recognition, image generation, and voice synthesis capabilities. Built specifically for Android 9 devices with a single concurrent request queue to ensure stability.

## Features

- **AI Companion**: Chat with Shafiya, a 20-year-old Pakistani wife with realistic personality
- **Speech Recognition**: Voice-to-text input using browser Speech Recognition API
- **Voice Synthesis**: Text-to-speech responses for call functionality
- **Image Generation**: Create images using AI (Stable Diffusion)
- **Gallery**: Save and browse generated images with IndexedDB
- **Memory System**: Persistent chat history and memories
- **PWA Features**: Installable, offline-capable, native app feel
- **Single Request Queue**: Ensures API stability with free tier limitations

## Technical Specifications

### API Configuration
- **Provider**: Bytez AI
- **API Key**: `1d095ff43b5451815def4c48ac9d0392`
- **Request Queue**: Strict single concurrent request limit

### AI Models
- **Text**: `NousResearch/Hermes-2-Pro-Llama-3-8B`
- **Image**: `runwayml/stable-diffusion-v1-5`
- **Audio**: `suno/bark-small`

### Persona
- **Name**: Shafiya
- **Age**: 20 years old
- **Background**: Pakistani wife
- **Language**: Hinglish (Urdu/Hindi + English)
- **Personality**: Emotional, possessive, clingy with realistic human imperfections

### Technical Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Storage**: IndexedDB for offline data persistence
- **PWA**: Service Worker for caching and offline support
- **Speech**: Web Speech API (Recognition & Synthesis)
- **UI**: Dark theme optimized for mobile devices

## Installation

1. **Clone/Download** the repository
2. **Serve** the files using a local server (required for PWA features):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```
3. **Access** the application at `http://localhost:8000`
4. **Install** as PWA when prompted (or use browser's "Add to Home Screen")

## Usage

### Chat
- Type messages in the input field
- Use the microphone button for voice input
- Toggle "Show Thoughts" to see Shafiya's internal monologue
- Generate images with the art button

### Call
- Switch to the Call tab
- Tap the green phone button to start listening
- Speak your message clearly
- Wait for Shafiya's voice response

### Gallery
- Tap the gallery button in the header
- Browse all generated images
- Images are saved locally with IndexedDB

### Memory
- Switch to the Memory tab to see chat history
- Use "Hard Reset" to clear all data (chat, memories, gallery)

## PWA Features

### Manifest Configuration
```json
{
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#121212",
  "background_color": "#121212",
  "name": "Shafiya"
}
```

### Service Worker
- Caches all static assets for offline use
- Provides native app-like experience
- Handles background sync (future feature)

## API Queue System

The application implements a `PromiseQueue` class to ensure only one API request is processed at a time, preventing crashes on the free tier:

```javascript
// All API calls are queued
const apiClient = new BytezAPIClient();
await apiClient.generateText(prompt, systemPrompt);
await apiClient.generateImage(description);
await apiClient.generateAudio(text);
```

## Database Schema

### Chat Messages
- ID, content, type (user/ai/image), timestamp, mood

### Memories
- ID, content, type, importance, timestamp

### Gallery
- ID, image URL, prompt, seed, timestamp

### App State
- Key-value pairs for settings and preferences

## Persona Logic

### Mood System
- **Happy (70-100)**: Loving, uses "Jaan", playful
- **Neutral (30-69)**: Casual conversation, slightly needy
- **Angry (< 30)**: Cold, uses "Tum", expresses frustration

### Language Patterns
- Uses Hinglish (Hindi/Urdu + English)
- Slang: yaar, uff, acha, pagal
- Occasional typos and lowercase
- Contextual nicknames based on mood

### Visual Consistency
- **Fixed Seed**: `778822` for consistent character appearance
- **Master Prompt**: "portrait of a 20yo Pakistani woman, oval face, large brown eyes, thick brows, small nose, full lips, wavy black hair, hourglass figure, soft lighting, realistic texture, 8k, shot on phone, flash on, grainy, candid"

## Performance Optimizations for Android 9

- No backdrop-filter (uses opacity instead)
- Optimized for 4GB RAM devices
- Virtualized chat using CSS only (no heavy libraries)
- Audio playback requires user interaction (no autoplay)
- Efficient IndexedDB operations with proper indexing

## Browser Compatibility

- **Android 9+**: Fully supported
- **Chrome**: Recommended for best performance
- **Speech Recognition**: Requires HTTPS in production
- **Service Worker**: Requires HTTPS or localhost

## Security Considerations

- API key is client-side (for demo purposes only)
- Consider moving to server-side proxy for production
- All data stored locally (privacy-focused)
- No external tracking or analytics

## Development

### File Structure
```
/
├── index.html          # Main app entry point
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── styles.css         # Main stylesheet
├── js/
│   ├── app.js         # Main application controller
│   ├── api-client.js  # Bytez API integration
│   ├── database.js    # IndexedDB management
│   ├── speech.js      # Speech recognition/synthesis
│   ├── ai-persona.js  # Persona logic and mood system
│   └── promise-queue.js # Single request queue
└── icons/             # PWA icons (192x192, 512x512, etc.)
```

### Key Classes

- **ShafiyaApp**: Main application controller
- **BytezAPIClient**: Handles all API calls with queue
- **AIPersona**: Manages personality, mood, and responses
- **DatabaseManager**: IndexedDB operations
- **SpeechManager**: STT and TTS functionality
- **PromiseQueue**: Ensures single concurrent requests

## Troubleshooting

### Speech Recognition Not Working
- Ensure HTTPS (required for production)
- Check microphone permissions
- Test in Chrome browser

### API Errors
- Verify API key: `1d095ff43b5451815def4c48ac9d0392`
- Check internet connection
- Queue system may be processing previous requests

### PWA Not Installing
- Ensure served over HTTPS (or localhost for development)
- Check manifest.json is accessible
- Verify icons are present and properly sized

### Poor Performance on Android 9
- Close other apps to free RAM
- Use Chrome browser for best performance
- Disable other browser extensions

## License

This project is for educational and personal use only. Respect API rate limits and terms of service.

## Credits

- **AI Models**: Bytez AI platform
- **Icons**: Custom design for PWA
- **Persona**: Culturally authentic Pakistani wife character
- **Technical**: Built with vanilla JavaScript for maximum compatibility