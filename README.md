# Shafiya - AI Wife PWA

A sophisticated Progressive Web App (PWA) featuring an AI-powered Pakistani wife persona, optimized for Android 9 devices with strict API queue management.

## 🎯 Features

- **AI Persona**: Shafiya - 20-year-old Pakistani wife with Hinglish language, emotional depth, and mood-based responses
- **PromiseQueue System**: STRICT single concurrent request enforcement to prevent API crashes
- **Multi-Model AI Integration**:
  - Text: NousResearch/Hermes-2-Pro-Llama-3-8B
  - Image: Stable Diffusion v1.5 (with fixed seed for consistency)
  - Audio: Suno Bark-small (non-verbal sounds)
- **Call Simulator**: Full-screen dialer with STT/TTS integration
- **Smart Gallery**: IndexedDB-backed image storage with thumbnails
- **Offline Support**: Service Worker with network-first caching
- **Performance Optimized**: Built for 4GB RAM, Android 9 devices (Honor 8X)
- **Privacy Controls**: Clear Chat, Hard Reset options
- **Mood System**: 0-100 scale affecting response tone and personality

## 📱 Requirements

- Android 9+ or modern browser with PWA support
- Bytez API key (included in config)
- ~50MB storage for images and data

## 🚀 Quick Start

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aliyanking7private-prog/Shafiya.git
cd Shafiya
