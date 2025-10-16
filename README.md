# Living Word Bible App 📖

A beautiful, AI-powered Bible application built with React Native and Expo Router. Get personalized verse recommendations, daily devotionals, and track your prayer journey.

![Living Word](https://img.shields.io/badge/Status-Active-success)
![React Native](https://img.shields.io/badge/React%20Native-Expo-blue)
![AI Powered](https://img.shields.io/badge/AI-Gemini%202.0-purple)

## ✨ Features

### 🏠 Home Screen
- Beautiful "Living Word" branding with gradient design
- Daily verse of the day with purple/blue gradients
- Quick access to Scripture search and Journal
- Morning devotional links

### 📖 AI-Powered Scripture Search
Tell the app what you're going through, and get relevant Bible verses:
- Share your situation in natural language
- Receive 3-5 relevant verses powered by Gemini AI 2.0 Flash
- Each verse includes:
  - Full reference (e.g., "Jeremiah 29:11")
  - Complete verse text
  - Context about the passage
  - Personalized relevance explanation
- Save verses for later reference

### ☀️ Daily Devotional
- AI-generated verse of the day
- Thoughtful title (e.g., "Strength in the Midst of Trials")
- 2-3 paragraph reflection to help you apply the verse
- Beautiful orange gradient card design
- Refresh to get a new devotional

### 📝 Prayer Journal
- Track your prayers and witness God's faithfulness
- Add, view, and delete journal entries
- Beautiful empty state to encourage journaling
- Persistent storage so your prayers are never lost

## 🎨 Design

- **Liquid Glass Theme** - Modern iOS 18+ glass effects where available
- **Gradient Cards** - Purple, blue, and orange gradients throughout
- **Dark Mode** - Full dark mode support
- **Smooth Animations** - React Native Reanimated for buttery smooth transitions
- **Platform-Specific** - Native feel on both iOS and Android

## 🤖 AI Integration

Powered by **Gemini 2.0 Flash**, the app provides:
- Intelligent verse recommendations based on your situation
- Daily devotionals with meaningful reflections
- Fallback verses if the API is unavailable

## 🛠 Tech Stack

- **React Native** with **Expo Router** (file-based routing)
- **Zustand** for state management with AsyncStorage persistence
- **Reanimated** for smooth animations
- **Gemini AI 2.0 Flash** for AI-powered features
- **Expo Glass Effect** for iOS 18+ liquid glass UI
- **Linear Gradient** for beautiful card designs

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go app)

### Installation

1. Clone the repository
```bash
git clone https://github.com/bestfriendai/living-word-bible-app.git
cd living-word-bible-app
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npx expo start
```

4. Run on your device
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan the QR code with Expo Go app

## 📱 Screens

### Tab Navigation
- 🏠 **Home** - Verse of the day and quick actions
- 📖 **Scripture** - AI-powered verse search
- ☀️ **Devotional** - Daily devotional with reflections
- 📝 **Journal** - Prayer tracking and journaling

## 🔧 Configuration

The app is configured with:
- **App Name:** Living Word
- **Bundle ID:** com.livingword.app
- **Scheme:** livingword

Update `app.config.ts` to customize:
```typescript
const APP_ID_PREFIX = "com.livingword";
```

## 📦 Key Dependencies

```json
{
  "@google/generative-ai": "^0.x.x",
  "expo-router": "latest",
  "zustand": "latest",
  "react-native-reanimated": "latest",
  "expo-linear-gradient": "latest",
  "@react-native-async-storage/async-storage": "latest"
}
```

## 🎯 Future Enhancements

- [ ] Search by book, chapter, verse
- [ ] Share verses to social media
- [ ] Prayer reminders/notifications
- [ ] Community prayer requests
- [ ] Audio Bible integration
- [ ] Reading plans
- [ ] Highlight and annotate verses

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- Powered by [Gemini AI](https://deepmind.google/technologies/gemini/)
- UI inspired by modern iOS design patterns
- Original React Conference app template

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ and AI**
