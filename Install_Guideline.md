# HelpMate

> **HelpMate** is a hyper-local community help platform built with React Native + Expo.  
> Connect with neighbours nearby to exchange small everyday tasks, borrow items, and build your local community.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Installation Methods](#installation-methods)
  - [Option 1 — Expo Go on Mobile (Recommended)](#option-1--expo-go-on-mobile-recommended)
  - [Option 2 — iOS Simulator on Mac](#option-2--ios-simulator-on-mac)
  - [Option 3 — Real iPhone via Xcode](#option-3--real-iphone-via-xcode)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Team](#team)

---

## Test Accounts

Once the app is running, you can access HelpMate using one of the following methods:

### Option A — Create a New Account
Register directly in the app with any email address and password. You will be taken through the onboarding flow to set your display name, neighbourhood, gender, and generate your 3D avatar.

### Option B — Use the Dev Account (Recommended for Quick Testing)

A pre-configured developer account is available with existing posts, exchange history, reviews, and leaderboard data already set up, so you can explore all features immediately without needing to set anything up.

> **Tip:** On the login screen, there is also a **⚡ Dev: Login as Alex Chen** button at the bottom (visible in development mode) for one-tap access.

> **Note:** This is a shared test account. Please do not change the email or password. You are welcome to post, chat, and complete exchanges — all data is for testing purposes only.

---

## Prerequisites

Make sure you have the following installed before you begin:

| Tool | Version | How to check |
|------|---------|--------------|
| Node.js | v18 or later | `node --version` |
| npm | v9 or later | `npm --version` |
| Git | any | `git --version` |
| Xcode | 15 or later | Mac App Store *(for Options 2 & 3)* |
| CocoaPods | 1.12 or later | `pod --version` *(for Options 2 & 3)* |
| Expo Go app | latest | App Store *(iPhone)* or Google Play *(Android)* — for Option 1 |

> **macOS only** — iOS builds (Options 2 & 3) require a Mac with Xcode installed.  
> **Android users** — Option 1 (Expo Go) works on any Android phone. Options 2 & 3 are iOS/Mac only.

---

## Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/Minion1435627/Technology-Innovation-Project.git
cd HelpMate
```

**2. Install JavaScript dependencies**

```bash
npm install
```

**3. Install iOS native dependencies** *(Xcode builds only — skip if using Expo Go)*

> **Only required for Option 2 (iOS Simulator) and Option 3 (real iPhone via Xcode).**  
> If you are using **Option 1 — Expo Go**, skip this step entirely and go straight to [Option 1](#option-1--expo-go-on-mobile-recommended).

```bash
cd ios
pod install
cd ..
```

> If `pod install` fails, try `pod deintegrate && pod install` inside the `ios/` folder.

> Notice: After running `npx expo prebuild --clean`, the Podfile is regenerated.  
> You must re-add the project line and re-run `pod install`:
> ```bash
> # Add this line back at the top of ios/Podfile (after the require lines):
> project 'HeroKindFixed.xcodeproj'
> ```

---

## Installation Methods

---

### Option 1 — Expo Go on Mobile (Recommended)

Run the app on any iPhone or Android phone over the internet using **Expo Go** and a **tunnel connection**. This is the easiest and most intuitive method — no Xcode or cable required. Works across different Wi-Fi networks and is ideal for sharing with testers remotely.

**Requirements:**
- **Expo Go** app installed on the tester's phone (free, from App Store / Google Play)
- The host Mac must have the local development server running
- Internet connection on both the Mac and the tester's phone

**Steps:**

1. Install the tunnel package if you haven't already:
   ```bash
   npm install -g @expo/ngrok
   ```

2. Start the Expo server in tunnel mode:
   ```bash
   npx expo start --tunnel
   ```

3. A **QR code** will appear in the terminal.

4. On the tester's phone:
   - **iPhone:** Open the default **Camera app**, point it at the QR code, and tap the Expo Go link
   - **Android:** Open **Expo Go** → tap **Scan QR code**

5. The app will load on their phone via the tunnel.

> **Important:** <br>
> The local server on your Mac must stay running while testers use the app.  
> Some features (e.g. native maps, camera) may behave differently in Expo Go compared to a full native build.

---

### Option 2 — iOS Simulator on Mac

Run the app in the built-in iPhone simulator on your Mac — no physical device needed.

**Requirements:**
- A Mac with Xcode 15+
- At least one iOS Simulator installed (Xcode → **Settings → Platforms → iOS**)

**Method A — via Expo CLI (faster)**

```bash
npx expo start
```

Then press **`i`** in the terminal to open the iOS Simulator automatically.

**Method B — via Xcode directly**

1. Open `ios/HeroKindFixed.xcworkspace` in Xcode
2. Select a simulator from the device dropdown (e.g. **iPhone 16 Pro**)
3. Press **▶ Play** (`Cmd + R`)

> **Note:** <br>
> The **avatar** (3D character) may not render perfectly in the Mac Simulator due to GPU limitations. For the best avatar experience, use **Option 1 (Expo Go)** or **Option 3 (real iPhone via Xcode)**.

---

### Option 3 — Real iPhone via Xcode

Run the full app on a physical iPhone over a USB cable. This method does **not** require a network connection between your Mac and the phone, and gives the most complete native experience.

**Requirements:**
- A Mac with Xcode 15+
- A physical iPhone running iOS 15.1 or later
- A USB-A to Lightning or USB-C cable
- An Apple Developer account (free account works for personal devices)

**Steps:**

1. Connect your iPhone to your Mac via USB cable.

2. Open the Xcode workspace — **do not open the `.xcodeproj` directly**:
   ```
   ios/HeroKindFixed.xcworkspace
   ```

3. In Xcode, select your iPhone from the device dropdown at the top of the window (next to the play button).

4. Set up code signing:
   - Go to **HeroKindFixed** target → **Signing & Capabilities**
   - Check **Automatically manage signing**
   - Select your Apple ID team from the **Team** dropdown
   - If you don't have an Apple ID added: Xcode menu → **Settings → Accounts → + → Apple ID**

5. Trust your Mac on the iPhone:
   - On your iPhone: **Settings → General → VPN & Device Management**
   - Tap your developer certificate and tap **Trust**

6. Press the **▶ Play button** in Xcode (or `Cmd + R`)

7. The app will build and launch directly on your iPhone. The display name will appear as **HelpMate**.

> **Tip:** </br>
> The first build takes 3–5 minutes. Subsequent builds are faster.  
> The app stays on your phone even after disconnecting the cable (for 7 days with a free account).

---

## Known Limitations

| Limitation | Detail |
|------------|--------|
| **Push notifications** | Not yet implemented — the app must be open to receive chat messages in real time |
| **Identity verification** | The verification badge is UI only — no backend verification is performed |
| **Google OAuth** | The Google login button is present but the native OAuth redirect is not fully configured |
| **Avatar in Simulator** | 3D avatars may not render correctly in the iOS Simulator due to GPU limitations — use a real device for best results |
| **Score penalties** | Overdue/dispute deductions are designed but not yet wired to the backend |


---

## Project Structure

```
HelpMate/
├── src/
│   ├── screens/          # All app screens (MapScreen, PostScreen, etc.)
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context (Auth, Posts, Friends, Chat…)
│   ├── navigation/       # App navigator and tab bar
│   └── theme/            # Colors and typography
├── assets/               # Images, icons, splash screen
├── ios/                  # Native iOS project (Xcode)
│   ├── HeroKindFixed.xcworkspace   ← Open this in Xcode
│   └── Podfile
├── app.json              # Expo config (bundle ID, API keys, display name)
├── App.js                # App entry point
└── package.json
```

> **Note:** <br>The internal Xcode project is named `HeroKindFixed` for build stability (HeroKind is our original name).  
> The app displays as **HelpMate** on the home screen.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo SDK 54 |
| Navigation | React Navigation v7 |
| Maps | Google Maps (react-native-maps) |
| Backend / Auth | Supabase |
| 3D / Mini-game | Three.js + Expo GL |
| Avatar Generation | Tripo AI (tripo3d.ai) |
| Location | expo-location |
| Image Picker | expo-image-picker |
| Storage | AsyncStorage |

---

## Team

**INFO90010 Technology Innovation Project — Group B**  
University of Melbourne, 2026

| Name | Role |
|------|------|
| Anita Yang | Full Stack (Frontend: map, mini-game, profile, setting; backend: supabase) |
| Tammy Lee | Design Prototype / Frontend (Chat) |
| Leo Lin |  Frontend (Leaderboard) / Avatar import|
| Bella Chen | Test |


---

> For questions or issues, please contact the team or raise a GitHub issue.
