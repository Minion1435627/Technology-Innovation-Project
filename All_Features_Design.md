# HelpMate — Idea & Design Documentation

> This document shows all features details with added notes on **design decisions** made throughout the project.

**Course:** INFO 90010 — Technology Innovation Project
**Team:** Group B | University of Melbourne, 2026

---

## Table of Contents

- [Core Concept](#core-concept)
- [Problem Statement](#problem-statement)
- [Core Value Proposition](#core-value-proposition)
- [Design Decisions Overview](#design-decisions-overview)
- [App Functions](#app-functions)
  - [1. Login & Authentication](#1-login--authentication)
  - [2. Map View](#2-map-view)
  - [3. Search & Filter](#3-search--filter)
  - [4a. Nearby List View](#4a-nearby-list-view)
  - [4b. Map Marker Tooltip](#4b-map-marker-tooltip)
  - [5. Post a Need](#5-post-a-need)
  - [6. Post a Supply / Offer](#6-post-a-supply--offer)
  - [7. In-App Chat](#7-in-app-chat)
  - [8. Exchange / Transaction System](#8-exchange--transaction-system)
  - [9. Review & Scoring System](#9-review--scoring-system)
  - [10. Profile & 3D Avatar](#10-profile--3d-avatar)
  - [11. Leaderboard](#11-leaderboard)
  - [12. Gamification & Level System](#12-gamification--level-system)
  - [13. Friend System](#13-friend-system)
  - [14. Push Notifications](#14-push-notifications)
  - [15. Safety Features](#15-safety-features)
  - [16. Mini-Games](#16-mini-games)
- [Scoring System (Detailed)](#scoring-system-detailed)
- [How It Works End-to-End](#how-it-works-end-to-end)
- [Tech Stack & Decisions](#tech-stack--decisions)
- [Technical Challenges](#technical-challenges)
- [Expected Outcomes](#expected-outcomes)
- [Future Development](#future-development)

---

## Core Concept

**"Ask nearby → solve quickly → reward helpful people."**

A map-based mobile app that connects urban students, especially international students in Melbourne. To solve small everyday problems: borrowing items, sharing food, getting physical help, from people nearby.

The platform aims to transform anonymous urban environments into **small, supportive communities** by enabling quick local cooperation.

---

## Problem Statement

Urban students face three major challenges:

### 1. Resource Inefficiency
People frequently buy tools or items they rarely use — screwdrivers, ladders, kitchen tools, moving equipment. Many are used only once or twice, leading to **wasted money and unnecessary consumption**.

### 2. Lack of Local Support
International students and newcomers often do not have nearby people to rely on. Unlike living with family or in long-term communities, many students live alone or in temporary accommodation. Even **small tasks can become difficult without help**.

### 3. Small Tasks Are Inconvenient to Solve
Some problems are too small to hire someone for, but still difficult to solve alone — moving furniture, borrowing tools, short-term item usage, quick technical help, sharing leftover food. Existing platforms (Facebook, Nextdoor) focus on **buying, selling, or professional services**, not **micro-help between neighbours**.

---

## Core Value Proposition

Our platform creates a **local assistance network** where users can:
- Ask nearby people for small help
- Share resources within walking distance
- Build trusted local relationships

The platform encourages community support through **visibility, communication, and reward mechanisms**, making helping neighbours easy, fast, and socially rewarding.

---

## Design Decisions Overview

This section summarises key decisions made as the project evolved from proposal to implementation.

| Decision | Original Plan | Final Decision | Reason |
|----------|--------------|----------------|--------|
| **App name** | HeroKind | **HelpMate** | Clearer branding — "Help" is direct and "Mate" reflects Australian community culture |
| **Backend** | Node.js + Express + PostgreSQL | **Supabase** | Faster development, built-in auth, real-time subscriptions, and no separate server to manage |
| **Real-time chat** | WebSockets (Socket.io) | **Supabase Realtime** | Already integrated with the backend — no extra infrastructure needed |
| **Authentication** | Email + Google OAuth + Phone OTP | **Email/password + Supabase Auth** | Simplified for MVP scope; Google OAuth added later |
| **Distance radius** | Draggable circle on map | **Fixed Radii**  | Simpler UX — dragging on a small mobile screen was frustrating in testing |
| **Map filters** | Filter panel only | **Inline filter pills + panel** | User feedback showed people wanted one-tap filtering directly on the map |
| **Marker design** | Simple coloured dots | **Two letters for first and last name** | More personal and human — makes the map feel like a community, not a bulletin board |
| **Gender filter** | Not in original plan | **Added as safety feature** | Emerged directly from user research — female participants said it was non-negotiable |
| **Mini-games** | Not in original plan | **Farmer and Fisher implemented** | Farmer and Fisher tied naturally to level-up rewards |
| **Avatar generation** | Not in original plan | **Tripo AI (tripo3d.ai)** | Tripo AI produces high-quality 3D models from a single photo via API |
| **Scoring** | Equal points for both sides | **Providers earn significantly more** | Encourages giving, not just receiving. Community health depends on helpers being rewarded |
| **Post expiry** | Manual only | **Mandatory expiry on all Need posts** | Keeps the map clean and ensures requests stay relevant |
| **Internal project name** | HelpMate | **HeroKindFixed** (Xcode only) | Renaming the Xcode project caused build-breaking module errors; kept internal name for stability |

---

## App Functions

---

### 1. Login & Authentication

Users can create an account or sign in using:
- **Email & password** — standard registration with email verification
- **Google OAuth** — one-tap sign-in using an existing Google account (Frontend only)

**First-time setup flow:**
After the first successful login, new users are taken through a short onboarding screen where they:
1. Choose a display name and set their general suburb/neighbourhood (not exact address)
2. Upload any image to generate their **3D avatar** via Tripo AI (see Section 10)
3. Set gender — used for safety filtering on the map

**Student / identity verification:**
Users can optionally verify themselves with a university email address (e.g. `@student.unimelb.edu.au`). Verified accounts receive a checkmark badge and are shown with higher priority on the map and leaderboard. (Frontend only)

> **Decision:** Phone OTP was removed from the MVP. It added complexity (Twilio integration, cost) without enough benefit at the demo stage. It remains a future option.

---

### 2. Map View

The map is the **home screen and central interface** of the app. When users open the app, they see a live neighbourhood map with a warm custom style.

**Map markers:**

| Marker | Colour | Meaning |
|--------|--------|---------|
| Need Help post | Red | Someone nearby is requesting help or an item |
| Supply / Offer post |Green | Someone nearby is offering help or lending an item |
| Friend / Top Helper | Blue | A friend or top-ranked helper is nearby |

Each marker shows the user's **two-letter initials** (first + last name) inside a coloured circle with a glow ring, making the map feel personal and human rather than abstract.

**Distance radius:**
A circle is drawn around the user's location. The radius is adjustable via **chip options** (0.5 km, 1 km, 2 km, 5 km) rather than a draggable handle.

> **Decision:** The draggable radius circle was replaced with fixed chip options after early testing showed it was frustrating to drag precisely on a small mobile screen.

**Map marker tooltip (tap to open):**
When a user taps a marker, a card slides up from the bottom showing:
- Post title, description preview, category, urgency, distance
- Poster's avatar and display name (tap to open full profile)
- Reputation star rating
- **Contact** button — opens in-app chat
- **Add Friend** button

**Quick filter pills (below search bar):**
The **Need / Supply / Friend** pills under the search bar are tappable — tapping one toggles that marker type on or off instantly without opening the filter panel.

> **Decision:** Added inline filter pills based on user feedback during testing — people wanted one-tap access without opening a modal.

---

### 3. Search & Filter

**Search bar:**
- Located at the top of the map screen, always visible
- Filters markers in real time by keyword matching post titles and descriptions

**Filter panel:**
Opened by tapping the options icon. Includes:

| Filter | Control |
|--------|---------|
| Show Need / Supply / Friend | Toggle on/off |
| Category | Multi-select chips |
| Urgency | Multi-select chips |
| Distance radius | Chip options (0.5 / 1 / 2 / 5 km) |
| Poster gender | Toggle by gender (♂ Male / ♀ Female / ⚧ Non-binary) |

> **Decision:** Gender filtering was not in the original plan. It was added directly as a result of user research — female participants consistently raised safety concerns and said filtering by gender was a prerequisite for them to use the platform.

---

### 4a. Nearby List View

Accessible by tapping the **people icon button** in the top-left corner of the map screen. A slide-up modal appears listing all visible posts.

**Sorting order:**
- **Friends' posts always appear first**, regardless of distance — this prioritises people the user already trusts and encourages friend network engagement
- Within each group (friends / non-friends), posts are sorted by **distance** from the user (nearest first)

Each row in the list shows:
- Poster's initials name circle (coloured by post type)
- Display name + friend tag (if friend)
- Post title and category
- Distance from user
- Post type badge (Need / Supply)

Tapping any row in the list **closes the modal and opens the map marker tooltip** for that post, keeping the map as the central interface.

The list also includes **inline filter chips** (Radius / Need / Supply / Friend / Gender) synced with the main map filters, so users can refine results without leaving the modal.

---

### 4b. Map Marker Tooltip

When a user taps any marker directly on the map, a **detail card slides up from the bottom** of the screen showing the full post information.

**Tooltip contents:**
- Post type badge (Need Help / Offering) with urgency tag if applicable
- Friend badge if the poster is a friend
- Post title
- Category and distance from user
- Description (full text)
- Optional photos (horizontal scroll)
- Availability window (if set)

- **Poster row** — display name, verification badge, gender icon, level — tapping this row navigates to the poster's full profile
- **Actions:**
  - **Contact** button — opens in-app chat (shown only if the poster allows contact)
  - **Locked state** — shown if the poster's privacy is set to Friends Only and the user is not yet a friend
  - **Add Friend / Friends** toggle button
  - **Delete Post** button — shown only to the post's own author

> The tooltip is the primary way users assess whether to contact someone. The poster's level, rating, and verification badge are all visible here so the user can make a trust judgement before committing to contact.

---

### 5. Post a Need

Users post a help request via **[+ Request Help]** on the map screen and selecting "I Need Help".

| Field | Details |
|-------|---------|
| Title | Short summary (max 80 characters) |
| Description | Full explanation of what is needed |
| Category | Borrow an item · Physical help · Food sharing · Study/skills · Custom |
| Urgency | Low · Medium · High · ASAP |
| Duration / Expiry | How long needed and when the post expires (1 hour to 7 days) |
| Photo | Optional — up to 3 photos |

After posting:
- A red marker appears on the map at the user's approximate location
- The post appears in the Nearby List for other users within range

> **Decision:** Expiry is **mandatory** on all Need posts (not optional). This keeps the map clean and ensures stale requests don't confuse future users.

---

### 6. Post a Supply / Offer

Users post an offer of help or a lendable item by tapping **[+ Request Help]** and selecting "I want to offer".

| Field | Details |
|-------|---------|
| Title | Short summary of what is being offered |
| Description | Condition of the item, usage instructions, pickup/return details |
| Category | Lend an item · Physical help · Share food · Offer skills · Custom |
| Availability window | When the help or item is available |
| Photo | Optional — up to 3 photos (strongly recommended for items) |

After posting:
- A green marker appears on the map
- The post expires automatically at the end of the availability window

---

### 7. In-App Chat

**How a conversation starts:**
- Tap a map marker → tooltip → **Contact**

A new chat thread is created between the two users, linked to the specific post (pinned at the top of the chat for context).

**Chat features:**
- Real-time text messaging via Supabase Realtime
- Photo sharing in chat
- Timestamps and read receipts
- Push notification for new messages
- **Start Exchange** button to formally begin a transaction

> **Decision:** Real-time chat was originally planned with Socket.io. Switched to Supabase Realtime subscriptions since the backend was already Supabase — eliminated an entire extra service.

**Messaging privacy:**
Users can set who can message them — **Everyone** or **Friends only**. This was added as a safety feature; if a user has set their privacy to Friends Only, the contact button shows a locked state to non-friends.

---

### 8. Exchange / Transaction System

**Full exchange lifecycle:**

```
Post created → Contact made → Chat → Agree on terms
  → Tap "Start Exchange" → Exchange screen opens
  → Status: pending → in_progress → completed / overdue / disputed
  → Countdown timer shows deadline
  → Provider confirms return → Exchange marked Completed
  → Review prompt triggered for both parties
```

**Role-based actions:**
The **provider** and **requester** see different buttons and status messages depending on their role in the exchange.

**Overdue and lockout:**
- If an item is not confirmed returned within 3 days of the agreed date, the **requester's account is locked**
- Locked accounts cannot post, respond, or initiate new chats
- The requester receives reminder notifications at 24 hours and 6 hours before the deadline (Not functional now)

**Dispute resolution:**
Either party can raise a **dispute** from the exchange screen. Disputed exchanges are flagged for review by our team and the lockout is paused during review.

> **Decision:** The 3-day lockout system was kept from the original proposal because it provides real accountability without being too aggressive. 

---

### 9. Review & Scoring System

**When reviews are triggered:**
After an exchange is marked **Completed**, both parties receive an in-app prompt to leave a review.

**Review form:**
- Star rating: 1–5 stars (required)
- Written comment: up to 300 characters (optional but encouraged)
- Tags: Fast response · Friendly · Reliable · Returned on time · Item as described · Went above and beyond · Late · Item damaged · Unresponsive

**Where reviews appear:**
- On the reviewed user's profile page — visible to all users
- Star average shown on the map tooltip so others can assess trustworthiness at a glance

> **Decision:** Written reviews were prioritised over star ratings alone. User research showed participants trusted text comments far more than a number — *"Human-generated reviews are more important than ratings"* was a direct quote from our interviews.

---

### 10. Profile & 3D Avatar

**Profile page:**
- 3D avatar rendered at the top (animated idle pose)
- Display name, neighbourhood, join date, verification badge
- Reputation score, star average, level badge, XP progress bar
- Earned achievement badges
- Weekly leaderboard rank
- Post history (Needs and Supplies tabs)
- All received reviews

**3D Avatar creation flow:**
1. User uploads any image (selfie, illustration, anime face, pet photo — anything)
2. The image is sent to the **Tripo AI API** (tripo3d.ai)
3. Tripo AI processes the image and returns a **3D model file (GLB format)**
4. The backend stores the model and links it to the user's account
5. The app renders the 3D avatar using **Three.js via Expo GL**
6. The avatar appears in: profile page and leaderboard podium

> **Decision:** Tripo AI was chosen after testing multiple 3D generation tools. It produced the most accurate and visually appealing 3D models from a single photo. The GLB format integrates directly with Three.js, which was already being used for the leaderboard podium.

> **Decision:** Avatar rendering in the iOS Simulator may show imperfect results due to GPU limitations in the simulator. The avatar renders correctly on real devices (both iPhone via Xcode and via Expo Go).

---

### 11. Leaderboard

A dedicated leaderboard page accessible from the bottom navigation.

**Dropdown filters (3 dropdowns at the top of the screen):**

| Dropdown | Options | Purpose |
|----------|---------|---------|
| **Time period** | This Week / All Time | Switch between weekly ranking (resets Monday) and all-time cumulative score |
| **Area** | All Areas / by suburb or neighbourhood | Filter the leaderboard to only show users within a specific local area — so users can see who the top helper is in their own suburb, not just globally |
| **Task type** | All Tasks / by category (e.g. Tools, Food, Physical Help, Skills) | Filter by the type of exchange — users can find who is the most helpful specifically for the kind of task they care about |

These three filters can be combined — for example, a user can see *"Top helpers in Docklands this week for Physical Help"* — making the leaderboard feel locally relevant rather than a global competition.

> **Decision:** The area and task-type dropdowns were added because a global leaderboard felt impersonal and demotivating for users in smaller suburbs. Filtering by local area gives new users a realistic chance to appear near the top of their neighbourhood leaderboard, which encourages early participation.

**Weekly leaderboard:**
- Resets every Monday at midnight
- Ranks all users by **total weekly score** from completed exchanges and reviews
- Both sides of each exchange earn points — encouraging participation from everyone

**Top 3 display:**
The top 3 users are highlighted at the top of the leaderboard as individual ranked cards. Each card shows:
- 🥇 1st place 
- 🥈 2nd place 
- 🥉 3rd place 
- User's avatar initials, display name, weekly points, and neighbourhood
- Tapping any card opens that user's full profile

> **Decision:** The 3D podium was removed in favour of a cleaner card-based top 3 layout. The podium added visual complexity and GPU load without providing meaningful extra information. The medal badge system communicates rank clearly and loads reliably across all devices.

**Your rank card:**
- A highlighted card always shows the **current user's own rank, points, and a motivational message** (e.g. *"Help more neighbours to climb!"*) — even if they are not in the top 3
- This ensures every user knows their position at a glance without scrolling

**Full Rankings with score bar chart:**
Below the rank card, a scrollable ranked list shows all participating users. Each row displays:
- Rank number, avatar initials, display name, neighbourhood, and weekly points
- A **horizontal bar chart** proportional to each user's score relative to the top scorer, making it visually immediate how close or far apart each user's contribution is
- The current user's row is highlighted so it is easy to find their own position in the list

---

### 12. Gamification & Level System

Level gives users a long-term progression goal beyond individual exchanges.

| Level | Name | XP Required | Reward |
|-------|------|-------------|--------|
| 1 | Newcomer | 0 | Default avatar outfit |
| 2 | Helper | 200 | Casual outfit set |
| 3 | Trusted Neighbour | 500 | Explorer outfit + backpack |
| 4 | Community Pillar | 1,000 | Guardian outfit + glowing badge |
| 5 | Local Hero | 2,000 | Legend outfit + animated aura |

- Each new level unlocks a new **outfit or accessory** for the 3D avatar (Not Functional)
- Level badge is visible on the profile header and in the leaderboard
- `xp` (lifetime) drives level-ups and **never resets**
- `weeklyScore` drives the leaderboard and **resets every Monday**

> **Decision:** Providers earn significantly more XP than requesters (e.g. +40–50 vs. +10). This was a deliberate design choice — the health of the community depends on people being motivated to give, not just receive.

---

### 13. Friend System

**How to add a friend:**
- From the map tooltip → **Add Friend / Friends** toggle button
- From a user's full profile page
- From the chat header

**Friend flow (current implementation — one-directional):**
The current MVP uses a **simplified one-directional friend system**. When User A taps "Add Friend" on User B's profile or tooltip, they are immediately friends — no request, no acceptance flow, no notification required. Tapping the button again removes the friendship. Both users who have added each other will see the other as a friend.

> **Decision:** The original design planned a mutual request-and-accept flow with push notifications. This was simplified in the MVP because push notifications are not yet implemented. A one-directional add is faster, reduces friction for new users, and still achieves the core goal — making friends' posts visible on the map and sorting them to the top of the nearby list.

**Friends on the map:**
- Friends with active nearby posts appear as **blue markers** on the map
- The blue colour makes friend posts immediately distinguishable from stranger posts
- In the Nearby List, friends are always sorted to the **top**, above all other posts regardless of distance

**Friend notifications** *(Planned — not yet implemented):*
In a future sprint, when a friend posts a new Need or Supply the user will receive a push notification: *"[Name] just posted a need nearby — can you help?"*

> **Decision:** The friend system was prioritised because user research showed that social connection was a core motivation for users. Making friends visible on the map and sorting them first in the list directly supports the social job identified in the Value Proposition Canvas.

---

### 14. Push Notifications *(Planned — not yet implemented)*

Push notifications are designed but not yet integrated in the current MVP. The full notification system is planned for a future sprint using **Firebase Cloud Messaging (FCM)** or an equivalent service.

**Planned notification events:**

| Event | Notification Message | Priority |
|-------|---------------------|----------|
| New chat message received | "[Name]: [message preview]" | High |
| Return reminder (24 hrs) | "Reminder: please return the item — 24 hours left" | High |
| Return reminder (6 hrs) | "Urgent: item return due in 6 hours" | High |
| Account lockout warning | "Your account has been locked due to an unconfirmed return." | High |
| Friend posts a new request | "[Friend name] just posted a need nearby — can you help?" | Medium |
| New nearby post within radius | "New need posted 0.3 km away — [title]" | Medium |
| Review prompt after exchange | "How was your exchange with [Name]? Leave a review." |  Medium |
| Level up | "You levelled up to Level [X]! Check your avatar reward." |  Low |
| Leaderboard achievement | "You made it to the Top 10 this week!" |  Low |

**Current state:**
- In-app chat messages are delivered in real time via **Supabase Realtime** while the app is open — no background push notification yet
- All other notification triggers are tracked in the data model but not yet surfaced to the user as device notifications

**Planned settings:**
Users will be able to manage notification preferences from the **Settings screen**, enabling or disabling each category individually (e.g. turn off leaderboard alerts but keep return reminders on).

> **Decision:** Push notifications were deprioritised in the MVP to focus on core map, post, and chat functionality first. They are identified as a high-priority item for the future step, since return reminders and chat notifications are important for user trust and exchange accountability.

---

### 15. Safety Features

**Location privacy:**
- Only the user's **approximate location** (suburb/neighbourhood) is displayed — never an exact street address
- Exact GPS coordinates are never stored in the database or shown to other users

**Reporting tools** *(Not fully functional):*
- Any post or user will be reportable via the ⋮ settings menu on the post or profile
- Planned report reasons: Spam · Inappropriate content · Suspicious behaviour · Fake listing · Harassment
- Repeated reports on a single user are planned to trigger automatic account suspension pending manual review


**Post expiration:**
- All Need posts have a mandatory expiry (1 hour to 7 days)
- Supply posts expire at the end of the stated availability window
- Expired posts are automatically removed from the map

**Gender filtering:**
- Users can filter map markers by the gender of the poster
- Female users can restrict who can respond to their posts after 10 PM (e.g. female helpers only for late-night requests)

> **Decision:** Gender-based safety features were not in the original proposal. They were added based on direct user research findings, where multiple female participants described safety concerns as a **prerequisite** for using the platform, not a nice-to-have.

---

### 16. Mini-Games

Two casual mini-games are fully built into the app. Both tie the user's **real-world level** (earned through community exchanges) to in-game progression, giving users an additional reason to stay active in the community. Game state is saved to **Supabase** so progress persists across sessions.

---

#### Farmer

A farming simulation where the user manages a **crop plot grid**, buying seeds, watering crops, harvesting produce, and selling it for coins.

**Resources:**

| Resource | Description |
|----------|-------------|
| Coins | Used to buy seeds, water, and unlock new plots |
| Water | Consumed when watering crops; can be purchased with coins |
| Plots | Grid of 12 plots — starts with 5 unlocked, 7 locked (purchasable with coins) |

**Seed packets (unlocked by player level):**

| Seed | Level Required | Cost | Sell Value |
|------|---------------|------|-----------|
| Carrot | Level 1 | 3 coins | 8 coins |
| Tomato | Level 2 | 5 coins | 12 coins |
| Strawberry | Level 3 | 8 coins | 18 coins |
| Corn | Level 4 | 12 coins | 26 coins |
| Watermelon | Level 5 | 18 coins | 40 coins |

**Crop growth stages:**
`empty → seed → sprout → ready`

Each watering action advances the crop one stage. Crops do **not** grow over real time — the user must manually water them.

**Actions:**
- **Water** — spend 1 water to advance the selected crop one stage
- **Harvest** — collect a ready crop into the basket
- **Sell** — sell everything in the basket for coins (also restocks a small amount of water)

**Shop:**
- **Buy Water** — 8 coins for 3 water units
- **Unlock next Plot** — costs 30 to 195 coins depending on which plot (Plot 6 to 12)

A **Next Goal card** always shows the user what to work toward next — e.g. *"Earn 20 more coins to unlock Plot 7"* or *"Reach 200 weekly points to unlock Level 3 seeds."*

> **Decision:** The Farmer game creates a simple, satisfying loop: plant, water, harvest, sell, that rewards returning to the app regularly. Tying seed variety to the player's real-world level directly incentivises participating in community exchanges to unlock better crops.

---

#### Fisher

A fishing game where the user selects a **bait and rod**, casts a line, and catches fish from a collection of 12 species across 5 rarity tiers. What the user catches is determined by their player level, chosen equipment, and a **weighted random system**.

**Equipment:**

*Rods (purchased with coins):*

| Rod | Cost | Catch Bonus | Rare Bonus |
|-----|------|------------|-----------|
| Twig Rod | Free | — | — |
| Bamboo Rod | 35 coins | +8% | +16% |
| Steel Rod | 90 coins | +14% | +30% |
| Golden Rod | 160 coins | +20% | +50% |

*Baits (purchased in packs of 3):*

| Bait | Cost | Catch Bonus | Rare Bonus |
|------|------|------------|-----------|
| Worm | 3 coins | — | — |
| Shrimp | 8 coins | +6% | +16% |
| Fly | 12 coins | +8% | +24% |
| Minnow | 18 coins | +12% | +38% |

**Fish species (12 total, unlocked by player level):**

| Rarity | Species | Level Required |
|--------|---------|---------------|
| Common | Common Carp, Bluegill, Yellow Perch | Level 1 |
| Uncommon | Rainbow Trout, Lake Bass, Mud Catfish | Level 2 |
| Rare | Golden Koi, Silver Pike | Level 3 |
| Epic | Moon Eel, Ember Salmon | Level 4 |
| Legendary | Crystal Sturgeon, Dragonfish | Level 5 |

**How it works:**
1. Select a rod and bait from the shop
2. Cast the line — the weighted random system gives better equipment a higher catch rate and greater probability of rare fish
3. Caught fish go into the **fish basket**; sell the basket for coins
4. Every species caught is recorded in the **Collection album** — players track which fish they have discovered

**Two tabs:**
- **Game** — rod/bait selection, casting, basket management, shop
- **Collection** — full album showing all 12 fish species, catch count per species, and undiscovered entries

> **Decision:** Both Farmer and Fisher were fully implemented. Fisher adds a luck-based play style with equipment investment, complementing Farmer's deterministic loop. The collection album gives players a long-term completionist goal that encourages continued play and higher level progression through real-world community exchanges.

---

## Scoring System (Detailed)

HelpMate uses two parallel numbers to measure a user's contribution:

| Field | What it represents |
|-------|--------------------|
| `xp` | **Lifetime XP** — total points earned across all time. Drives level-ups. Never resets. |
| `weekly_score` | **Weekly score** — resets every Monday. Drives the leaderboard ranking. |

Both values increase together whenever an XP event occurs.

**Level thresholds (from code):**

| Level | Name | XP Required |
|-------|------|------------|
| 1 | Newcomer | 0 |
| 2 | Helper | 100 |
| 3 | Trusted Neighbour | 200 |
| 4 | Community Pillar | 500 |
| 5 | Legend | 1,000 |

---

### Current Implementation — Task-Based XP

XP is currently earned by completing **daily and weekly tasks** from the Tasks screen. Both `xp` and `weekly_score` increase together when a task is claimed.

**Daily tasks (reset each day):**

| Task | XP Earned |
|------|-----------|
| Help 1 neighbour | +20 XP |
| Leave a review | +10 XP |
| Send a message | +5 XP |
| Post a need or supply | +10 XP |

**Weekly tasks (reset each Monday):**

| Task | XP Earned |
|------|-----------|
| Complete 3 exchanges | +50 XP |
| Lend 2 items to neighbours | +40 XP |
| Receive 2 reviews | +30 XP |
| Post 3 supply or need items | +30 XP |
| Start 3 exchanges this week | +20 XP |

> **Decision:** Task-based XP was chosen for the MVP because it gives users clear, actionable goals without requiring fully automated exchange tracking. It also allows XP to be awarded for behaviours that are hard to auto-detect (e.g. "help a neighbour"), bridging the gap between real-world action and in-app reward.

---

### Planned — Exchange-Based XP *(Not yet implemented)*

The original design called for XP to be awarded **automatically on exchange completion**, with different amounts based on the user's role and exchange type. This remains the long-term target but has not yet been built into the backend.

**Planned exchange XP:**

| Role | Exchange type | XP earned | Weekly score earned |
|------|--------------|-----------|---------------------|
| Provider | Lend an item | +40 | +40 |
| Provider | Share food | +30 | +30 |
| Provider | Offer skills / service | +50 | +50 |
| Provider | Physical help | +50 | +50 |
| Requester | Any type | +10 | +10 |

**Planned review bonus:**

| Stars received | Bonus XP | Bonus weekly score |
|----------------|----------|--------------------|
| 5 stars | +15 | +15 |
| 4 stars | +8 | +8 |
| 3 stars | +3 | +3 |
| 1–2 stars | 0 | 0 |

**Planned penalties:**

| Event | XP change | Weekly score change |
|-------|-----------|---------------------|
| Exchange goes overdue (as requester) | 0 | −10 |
| Dispute raised against you (found at fault) | −10 | −20 |

> XP is never deducted below 0. Weekly score can go negative.
> All penalty logic is planned — the dispute and overdue UI exists in the app, but score deductions are not yet connected.

---

## How It Works End-to-End

```
User opens app
  → Onboards / logs in
  → Creates 3D avatar via Tripo AI
  → Lands on the Map screen (sees nearby Need and Supply pins)
  → Spots a pin → taps it → sees the detail tooltip
  → Taps "Contact" → goes to Chat
  → They agree on terms in chat
  → One party taps "Start Exchange" → Transaction screen opens
  → Both track the exchange (status, countdown timer, role-based actions)
  → Exchange completed → XP awarded to both parties
  → Review prompt appears for both
  → Profile, level, and Leaderboard update
  → If levelled up → new avatar outfit unlocked → Farmer game receives a new seed
```

---

## Tech Stack & Decisions

| Layer | Original Plan | Final Decision | Status |
|-------|--------------|----------------|--------|
| Framework | React Native | React Native + Expo SDK 54 | Implemented |
| Backend | Node.js + Express | Supabase | Implemented |
| Database | PostgreSQL | Supabase PostgreSQL |Implemented |
| Auth — Email/password | Email/password | Supabase Auth | Implemented |
| Auth — Google OAuth | Google OAuth | UI present, signInWithOAuth wired | Partially done — OAuth redirect not fully configured for native |
| Auth — Phone OTP | Phone OTP | Removed from scope |  Not implemented |
| Real-time Chat | WebSockets (Socket.io) | Supabase Realtime (postgres_changes) |  Implemented |
| Maps | React Native Maps | react-native-maps + Google Maps API |  Implemented |
| Location | GPS only | expo-location + Melbourne CBD fallback |  Implemented |
| 3D Rendering | Three.js / React Native 3D | Three.js via Expo GL | Implemented |
| Avatar Generation | Generic 3D library | Tripo AI (tripo3d.ai) full API integration |  Implemented |
| Navigation | — | React Navigation v7 (bottom tabs + native stack) | Implemented |
| Icons | — | Ionicons (@expo/vector-icons) |  Implemented |
| Local storage | — | AsyncStorage (tasks state persistence) | Implemented |
| Push Notifications | Firebase Cloud Messaging | Not yet integrated |  Not implemented |
| Identity verification | Student email badge | Frontend badge only — no backend verification |  UI only |
| Reporting system | Report button + moderation | Not yet built |  Not implemented |
| Automated XP on exchange | Auto-award on completion | Task-based manual claim instead |  Replaced by Tasks screen |
| Score penalties | Auto deduction on overdue/dispute | Dispute UI exists, deductions not wired |  Not implemented |

---

## Technical Challenges

| Challenge | Approach | Status |
|-----------|----------|--------|
| Real-time location matching | Haversine formula on client; Supabase for data storage | Done |
| Real-time chat | Supabase Realtime postgres_changes subscriptions |  Done |
| 3D avatar rendering | Three.js via Expo GL; GLB from Tripo AI; Simulator GPU limitations noted |  Done |
| Game state persistence | Farmer and Fisher state saved to Supabase  | Done |
| User adoption (cold start) | Friend system + gamification create early value even with few users |  Addressed by design |
| Trust & safety between strangers | Gender filters + review system + planned reporting tools |Partially done |
| Data privacy | Approximate location display; no exact addresses stored or shown | Done |
| Google OAuth native redirect | with helpmate:// scheme configured but deep link not fully tested |  Partially done |
| Automated scoring & penalties | Task-based XP implemented; exchange-based auto-award and penalties planned |  Planned |
| Push notifications | Identified as high priority; FCM not yet integrated |  Planned |

---

## Expected Outcomes

If successful, the platform will:
- Reduce unnecessary purchases and resource waste
- Decrease food waste through sharing
- Strengthen local communities in Melbourne
- Help international students feel supported and connected
- Encourage kindness and cooperation in cities

The long-term goal is to transform anonymous city environments into **more connected and supportive communities**.

---

## Future Development

| Feature | Priority | Notes |
|---------|----------|-------|
| Push notifications (FCM) | High | Critical for chat, return reminders, and friend activity |
| Exchange-based auto XP |  High | Replace task-based XP with automatic award on completion |
| Score penalties | Medium | Wire overdue/dispute deductions into backend |
| Google OAuth (full native) | Medium | Complete deep link configuration for native app |
| Reporting & moderation system |  Medium | Report button UI + backend flag + admin review flow |
| AI-powered helper matching |  Low | Recommend helpers to requesters based on category and history |
| Web-based admin dashboard |  Low | Moderation and analytics visibility |
| University system integration |  Low | Verified student onboarding via campus SSO |
| TestFlight / App Store distribution | Low | Wider user testing beyond the development team |
| Android full native build | Low | Current MVP targets iOS; Android via Expo Go only |

---

> *"Don't Hesitate use HelpMate."*
