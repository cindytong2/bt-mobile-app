# IC Mobile App

A React Native mobile application built with Expo.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Expo Go](https://expo.dev/client) app on your iOS or Android device
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cindytong2/ic-mobile-app.git
   cd ic-mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

### Running the App

After running `npx expo start`, you can run the app in several ways:

- **On your physical device**:
  1. Install the Expo Go app on your iOS or Android device
  2. Scan the QR code in the terminal with your phone's camera (iOS) or the Expo Go app (Android)

- **On iOS Simulator** (macOS only):
  - Press `i` in the terminal to open iOS simulator
  - Requires Xcode to be installed

- **On Android Emulator**:
  - Press `a` in the terminal to open Android emulator
  - Requires Android Studio to be installed

## 🛠 Development

- **Project Structure**:
  - `/app` - Main application code with file-based routing
  - `/components` - Reusable React components
  - `/constants` - App-wide constants and configuration
  - `/assets` - Images, fonts, and other static files

- **Common Commands**:
  ```bash
  # Start the development server
  npm start
  
  # Run on iOS simulator (macOS only)
  npm run ios
  
  # Run on Android emulator
  npm run android
  
  # Run on web
  npm run web
  ```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
