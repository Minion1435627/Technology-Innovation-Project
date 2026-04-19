# HeroKind — MVP Overview

## Core Concept

**"Ask nearby → solve quickly → reward helpful people."**

A map-based mobile app that connects urban students (especially international students in Melbourne) to solve small everyday problems — borrowing items, sharing food, getting physical help — from people nearby.

---

## Key Features

### 1. Authentication
- **Login / Register / Onboarding** screens
- New users are guided through an onboarding flow before reaching the main app

### 2. Map (Central Screen)
- Full-screen Google Maps with a warm custom style
- **Avatar pin markers** — each nearby user/post appears as a coloured avatar circle with a glow ring
- **Distance circle** — a radius ring drawn around your location using the Haversine formula
- **Floating search bar** at the top, sitting below the status bar
- **Nearby helpers button** — shows a badge with the count of visible pins; tap to open a slide-up modal listing everyone sorted by distance
- **Filter button** — opens a modal to filter by post type (Need/Supply/Friend), radius (0.5 / 1 / 2 / 5 km), and gender

### 3. Post Types
- **Need** — "I need help with X" (a request)
- **Supply** — "I can offer X" (a resource or skill)
- **Friend** — someone open to connecting socially

### 4. Pin Tooltip (Post Detail)
When you tap a map pin or a list item, a detail card shows:
- Post type badge + urgency level
- Title, category, distance, description, availability
- The poster's avatar — tap it to go to their full profile
- **Contact** and **Add Friend** buttons

### 5. Nearby List Screen
- **Needs** tab and **Supply** tab
- Card-based list of all nearby posts, sortable/filterable

### 6. Chat
- Chat list showing all active conversations
- Inside a chat: the original post is pinned at the top as context
- **Start Exchange** button to formally begin a transaction
- Tap the other user's avatar to view their profile

### 7. Exchange / Transaction System
The full help lifecycle:
1. Agree in chat → tap **Start Exchange**
2. Transaction screen shows status: `pending → in_progress → completed / overdue / disputed`
3. Countdown timer for the agreed deadline
4. Role-based actions — the **provider** and **requester** see different buttons
5. If overdue, the requester gets a lockout warning
6. Either party can **raise a dispute**

### 8. User Profiles
- Your own profile: level, XP bar, gender badge, active exchanges, reviews
- Other users' profiles: bio, gender, stats, posts, reviews

### 9. Gamification
- **Level + XP system** — earn XP by completing exchanges
- **Weekly Leaderboard** — ranked by helpfulness
- **Minigames** — Farmer and Fisher games as a fun reward mechanic (basic UI)

### 10. Gender System
- Users set a gender on registration
- Gender badge shown on profiles and in chat headers
- Map filter lets you filter pins by gender preference (for safety/comfort)

---

## How It Works End-to-End

```
User opens app
  → Onboards / logs in
  → Lands on the Map screen (sees nearby pins of Needs and Supplies)
  → Spots a pin, taps it → sees the detail tooltip
  → Taps "Contact" → goes to Chat
  → They agree on terms in chat
  → One party taps "Start Exchange" → Transaction screen opens
  → Both track the exchange (status, timer, actions)
  → Exchange completed → XP awarded to both parties
  → Profile and Leaderboard update
```

---

## Scoring System

### Overview
HeroKind uses two parallel numbers to measure a user's contribution:

| Field | What it represents |
|---|---|
| `xp` | **Lifetime XP** — total points earned across all time. Drives level-ups and never resets. |
| `weeklyScore` | **Weekly helpfulness score** — resets every Monday. Drives the leaderboard ranking. |

Both numbers increase together whenever a scoring event occurs.

---

### Score Events

#### Exchange completed (main source of points)

| Role | Exchange type | XP earned | Weekly score earned |
|---|---|---|---|
| Provider (giver) | Lend an item | +40 | +40 |
| Provider (giver) | Share food | +30 | +30 |
| Provider (giver) | Offer skills / service | +50 | +50 |
| Provider (giver) | Physical help | +50 | +50 |
| Requester (receiver) | Any type | +10 | +10 |

> **Why providers earn more:** The app rewards giving. Requesters still earn a small amount to encourage participation and fair reviews.

---

#### Review bonus (awarded when a review is submitted)

| Review score received | Bonus XP | Bonus weekly score |
|---|---|---|
| 5 stars | +15 | +15 |
| 4 stars | +8 | +8 |
| 3 stars | +3 | +3 |
| 1–2 stars | 0 | 0 |

---

#### Penalties

| Event | XP change | Weekly score change |
|---|---|---|
| Exchange goes overdue (as requester) | 0 | −10 |
| Dispute raised against you (found at fault) | −10 | −20 |

> XP is never deducted below 0. Weekly score can go negative.

---

### Level Thresholds

Level is derived from **total lifetime XP** (not weekly score).

| Level | Name | XP required |
|---|---|---|
| 1 | Newcomer | 0 |
| 2 | Helper | 200 |
| 3 | Trusted Neighbour | 500 |
| 4 | Community Pillar | 1 000 |
| 5 | Local Hero | 2 000 |

The XP bar on the profile shows progress from the current level threshold to the next.

---

### Weekly Reset

- `weeklyScore` resets to `0` every Monday at midnight (server-side in production).
- `weeklyRank` is recalculated from the new scores after reset.
- `xp` and `level` are **never reset** — they are permanent lifetime records.

---

### Example calculation

Alex (provider) lends a drill to Leo (requester). Leo returns it on time and leaves a 5-star review.

| Event | Alex (provider) | Leo (requester) |
|---|---|---|
| Exchange completed | +40 XP, +40 weekly | +10 XP, +10 weekly |
| 5-star review received | +15 XP, +15 weekly | — |
| **Total** | **+55 XP, +55 weekly** | **+10 XP, +10 weekly** |

---

## Current State

The app is a **UI prototype with mock data** — no live backend. All users, posts, chats, and transactions come from `mockData.js`. The full screen flows and interactions are functional on iOS Simulator.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navigation | React Navigation (bottom tabs + native stack) |
| Maps | react-native-maps with Google Maps |
| Location | expo-location (real GPS + Docklands fallback) |
| Icons | Ionicons (@expo/vector-icons) |
| Safe area | react-native-safe-area-context |
