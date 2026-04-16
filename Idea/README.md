# Community Help Platform for Urban Students

**Course:** INFO 90010 — Technology Innovation Project
**Due:** 16/03/2026 (Proposal)

---

## Project Overview

Modern cities such as Melbourne can sometimes feel like a **concrete jungle**, where people live close to each other physically but remain socially disconnected. Many urban residents — especially **international students and young professionals** — do not know their neighbours and lack a local support network.

At the same time, many small everyday problems occur that are **too minor to justify buying new items or hiring professional services**, yet they can still cause real inconvenience.

Examples include:

- needing a screwdriver to assemble new furniture
- needing help carrying heavy objects upstairs
- having extra cooked food that would otherwise go to waste
- needing to borrow small household items for a short time

This project proposes a **map-based community platform** (mobile application for iOS & Android) that allows nearby users to **request help, offer resources, and build local social connections**.

### Core Idea

**Ask nearby → solve quickly → reward helpful people.**

The platform aims to transform anonymous urban environments into **small supportive communities** by enabling quick local cooperation.

---

## Problem Statement

Urban students face three major challenges.

### 1. Resource Inefficiency

People frequently buy tools or items that are rarely used — screwdrivers, ladders, kitchen tools, moving equipment. Many are used only once or twice but still require purchase, leading to **wasted money and unnecessary consumption**.

### 2. Lack of Local Support

International students and newcomers often do not have nearby people to rely on. Unlike living with family or long-term communities, many students live alone or in temporary accommodation. Even **small tasks can become difficult without help**.

### 3. Small Tasks Are Inconvenient to Solve

Some problems are too small to hire someone for, but still difficult to solve alone — moving furniture, borrowing tools, short-term item usage, quick technical help, sharing leftover food. Existing platforms usually focus on **buying, selling, or professional services**, not **micro-help between neighbours**.

---

## Core Value Proposition

Our platform creates a **local assistance network** where users can:

- ask nearby people for small help
- share resources within walking distance
- build trusted local relationships

The platform encourages community support through **visibility, communication, and reward mechanisms**, making helping neighbours **easy, fast, and socially rewarding**.

---

## Tech Stack

| Layer | Decision |
|---|---|
| Frontend | React Native (iOS & Android) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Maps | React Native Maps (Google Maps API) |
| Auth | Email/password + Google OAuth + Phone OTP |
| Real-time Chat | WebSockets (Socket.io) |

---

## Application Structure

### Main Screen Layout

```
┌─────────────────────────┐
│  9:41        ●●●  WiFi  │  ← Status bar
│─────────────────────────│
│  🔍 Search  [Filter ▼] [+ Post] │
│─────────────────────────│
│                         │
│   🗺️  MAP  (full screen) │
│   🔴 Need Help           │
│   🟢 Supply / Offering   │
│   🔵 Friends / Top Helper│
│   🟡 My Location         │
│   ⭐ Walking radius      │
│                         │
│─────────────────────────│
│ 🆘 Needs │ 📦 Supply │ 💬 Chat │ 👤 Profile │
└─────────────────────────┘
```

**Native bottom tab bar:** Needs | Supply | Chat | Profile

---

## App Functions

---

### 1. Login & Authentication

Users can create an account or sign in using three methods:

- **Email & password** — standard registration with email verification link sent on sign-up
- **Google OAuth** — one-tap sign-in using an existing Google account
- **Phone number (OTP)** — enter mobile number, receive a 6-digit SMS code, enter to verify

**First-time setup flow:**
After the first successful login, new users are taken through a short onboarding screen where they:
1. Choose a display name and set their general suburb/neighbourhood (not exact address)
2. Upload any image they like (a selfie, an illustration, a cartoon — anything) to generate their **3D avatar** via tripo.ai (see Section 10)
3. Accept community guidelines before the account is activated

**Student / identity verification:**
To increase trust, users can optionally verify themselves with a university email address (e.g. `@student.unimelb.edu.au`). Verified accounts receive a checkmark badge on their profile and are shown with higher priority in the map and leaderboard.

---

### 2. Map View

The map is the **home screen and central interface** of the app. When users open the app, they immediately see a live neighbourhood map.

**Map markers:**

| Marker | Colour | Meaning |
|---|---|---|
| Need Help post | 🔴 Red | Someone nearby is requesting help or an item |
| Supply / Offer post | 🟢 Green | Someone nearby is offering help or lending an item |
| Friend / Top Helper | 🔵 Blue | A friend or top-ranked helper is nearby |
| My Location | 🟡 Yellow | The current user's own position |

**Walking-distance radius:**
- A **dashed circle** is drawn around the user's current location
- The radius can be adjusted by dragging the circle edge outward or inward, or by typing a value (e.g. 500 m, 1 km, 2 km)
- Posts inside the radius are marked as "Nearby" and ranked higher in the list view
- Posts outside the radius are still visible on the map but greyed out slightly

**Map marker tooltip (tap to open):**
When a user taps any marker on the map, a tooltip card slides up from the bottom of the screen displaying:
- Post title and a short description preview
- Category tag (e.g. "Tools", "Food", "Physical Help")
- Urgency badge for Need posts (Low / Medium / High / ASAP)
- Distance from the user (e.g. "0.4 km away")
- The poster's **3D avatar thumbnail** and display name — tapping the avatar opens their full profile
- The poster's reputation star rating (e.g. ⭐ 4.8)
- A **Contact** button — tapping this opens the in-app chat with that user
- Approximate location label (e.g. "Carlton North area") — never an exact address

---

### 3. Search & Filter

**Search bar:**
- Located at the top of the map screen, always visible
- As the user types, results update in real time — matching post titles and descriptions are highlighted on the map and in the list view below
- Searching by keyword (e.g. "screwdriver", "IKEA assembly", "leftover rice") filters visible markers immediately

**Filter panel:**
- Opened by tapping the **[Filter ▼]** button next to the search bar
- The panel slides up as a bottom sheet with the following controls:

  | Filter | Control |
  |---|---|
  | Show Need Help posts | Toggle on/off (🔴 red markers) |
  | Show Supply / Offer posts | Toggle on/off (🟢 green markers) |
  | Show Friends & Top Helpers | Toggle on/off (🔵 blue markers) |
  | Category | Multi-select chips: Tools · Food · Physical Help · Study/Skills · Custom |
  | Urgency | Multi-select chips: Low · Medium · High · ASAP |
  | Distance | Slider to override the default radius |

- Applied filters persist while the user navigates between screens and are shown as small chips under the search bar so the user knows filters are active

---

### 4. Nearby List View

Accessible by swiping up on the map or tapping the **Needs** or **Supply** tab in the bottom navigation bar.

**Layout:**
Each item is displayed as a card showing:
- Post title and description (truncated to 2 lines)
- Category tag and urgency badge
- Poster's 3D avatar thumbnail, display name, and star rating
- Distance from the user and time posted (e.g. "0.3 km · 10 min ago")
- A **Respond** button that opens the in-app chat

**Sorting options (top of list):**
- Nearest first (default)
- Most urgent first
- Most recent first

**Tabs:**
- **Needs** tab — shows all nearby Need Help posts
- **Supply** tab — shows all nearby Supply / Offer posts

Tapping any card opens the full post detail screen, where the user can read the complete description, view the uploaded photo (if any), and tap **Contact** to open chat.

---

### 5. Post a Need

Users can post a request for help by tapping the **[+ Post]** button on the map screen or the **+** button in the Needs tab.

**Form fields:**

| Field | Details |
|---|---|
| Title | Short summary of what is needed (max 80 characters) |
| Description | Full explanation — what exactly is needed, any special requirements, preferred handover method |
| Category | Single-select: Borrow an item · Physical help · Food sharing · Study/skills · Custom |
| Custom category | Free-text field, shown only when "Custom" is selected |
| Urgency | Single-select pill: Low · Medium · High · ASAP |
| Duration / Expiry | How long is the item needed (e.g. "30 minutes", "this afternoon") and when should the post expire (e.g. 2 hours, 1 day, 3 days) |
| Photo | Optional — up to 3 photos, e.g. a photo of the furniture that needs assembly |

**After posting:**
- A 🔴 red marker appears on the map at the user's approximate location
- The post appears in the Nearby List View for other users within range
- The user can edit or delete the post from their profile at any time before it expires

---

### 6. Post a Supply / Offer

Users can post an offer of help or an item to lend by tapping **[+ Post]** and selecting "I want to offer".

**Form fields:**

| Field | Details |
|---|---|
| Title | Short summary of what is being offered (max 80 characters) |
| Description | Full details — condition of the item, any usage instructions, how to arrange pickup/return |
| Category | Single-select: Lend an item · Physical help · Share food · Offer skills · Custom |
| Custom category | Free-text, shown only when "Custom" is selected |
| Availability window | When the item or help is available (e.g. "Today 2–6 PM", "This weekend only") |
| Photo | Optional — up to 3 photos to show what is being offered (strongly recommended for item lending) |

**After posting:**
- A 🟢 green marker appears on the map at the user's approximate location
- The post is listed in the nearby Supply tab for other users in range
- The post automatically expires at the end of the availability window

---

### 7. In-App Chat

**How a conversation starts:**
1. User taps a map marker → tooltip appears → taps **Contact**
   — OR —
   User taps a card in the list view → taps **Respond**
2. A new chat thread is created between the two users, linked to the specific post

**Controlled first-message flow:**
To prevent spam and unsolicited messages, chat follows a gated flow:
- The **requester** (person who tapped Contact) sends the **first message** — e.g. "Hi, is the screwdriver still available? I live on Lygon St."
- The chat is then **locked** on the requester's side — they cannot send another message until the provider replies
- Once the **provider** sends their first reply, both sides can message freely in real time
- This ensures the provider always has the choice to respond or ignore without being bombarded

**Chat features:**
- Real-time text messaging powered by WebSockets (Socket.io)
- Photo sharing — either party can attach a photo in the chat (e.g. provider sends a photo of the item's condition)
- Timestamps on each message
- Read receipts (single tick = sent, double tick = read)
- Push notification for each new incoming message

**Navigation from chat:**
- The **chat header** shows the other user's 3D avatar and name — tapping it opens their full profile page
- A small **post reference card** is pinned at the top of the chat showing the original Need or Supply post so both parties always have context

**Chat list:**
- All active conversations are accessible from the **Chat tab** in the bottom navigation bar
- Each thread shows the other user's avatar, last message preview, and time — unread threads are bolded

---

### 8. Item Return & Confirmation System

This system ensures accountability for borrowed items and protects lenders.

**Exchange lifecycle:**

```
Post created → Contact made → Handover agreed via chat
    → Item lent out → Task marked "In Progress"
    → Item returned → Provider confirms return
    → Exchange marked "Completed" → Review triggered
```

**How confirmation works:**
1. After the item is physically returned, the **provider** opens the app and taps **"Confirm Item Returned"** on the active exchange card in their profile
2. The exchange is marked **Completed** and both parties are prompted to leave a review

**3-day grace period and account lockout:**
- If the provider does **not** confirm the return within **3 days** of the agreed return date, the system automatically flags the exchange as overdue
- The **requester's account is locked**: they can no longer post new Needs or Supplies and cannot initiate new chats
- During the 3-day window, **both parties can still interact with other users** — the lockout only activates after the deadline passes without confirmation
- The requester receives **reminder push notifications** at 24 hours and 6 hours before the deadline
- Once the provider confirms the return (even after the 3-day window), the lockout is lifted immediately
- Repeated lockout incidents are recorded on the user's profile and reduce their reputation score

**Dispute resolution:**
- If there is a genuine disagreement (e.g. the requester claims they already returned it), either party can raise a **dispute** from the exchange screen
- Disputed exchanges are flagged for manual review and the lockout is paused during review

---

### 9. Review & Scoring System

**When reviews are triggered:**
After an exchange is marked **Completed** (provider confirms return, or task is done for non-item help), both the requester and the provider receive an in-app prompt to leave a review — this appears as a card notification at the top of the home screen.

**Review form:**
- **Star rating:** 1–5 stars (required)
- **Written comment:** free-text up to 300 characters (optional but encouraged)
- **Tags (multi-select):** Fast response · Friendly · Reliable · Returned on time · Item as described · Went above and beyond · Late · Item damaged · Unresponsive

**Where reviews appear:**
- On the reviewed user's **profile page**, visible to all users — displayed as a scrollable list of comments with star ratings, similar to an app store review section
- The overall star average is shown on the profile header and on the map tooltip
- When another user is considering contacting someone, they can tap through to read past reviews and decide if they trust them

**Score calculation:**
- Each completed exchange earns both parties a **base score** (e.g. 10 points for completing a task)
- The star rating received from the other party adds a **bonus multiplier** (e.g. 5 stars = ×2.0, 4 stars = ×1.5, 3 stars = ×1.0, 2 stars = ×0.5, 1 star = ×0.0)
- Scores feed directly into the weekly leaderboard and the gamification level system

---

### 10. Profile & 3D Avatar

**Profile page contents:**
- **3D avatar** rendered at the top (animated idle pose)
- Display name, general neighbourhood, join date
- Verification badge (if student email verified)
- Overall reputation score and star average
- Current level badge and XP progress bar toward next level
- Earned achievement badges (e.g. Top Helper, Food Sharer, Community Builder, Reliable Returner)
- Weekly leaderboard rank
- Post history — tabs for past Needs and past Supplies, each showing status (Completed / Expired / Active)
- Review section — all received written reviews with star ratings, displayed chronologically

**3D Avatar creation flow:**
1. User taps "Set Avatar" on their profile and uploads any image — this can be a selfie, a character illustration, an anime face, a photo of a pet — anything the user wants to represent themselves
2. The image is sent to the **tripo.ai API** on the backend
3. tripo.ai processes the image and returns a **3D model file** (GLB/GLTF format)
4. The backend stores the model file and links it to the user's account
5. The app loads and renders the 3D avatar in real time using a 3D rendering library (e.g. Three.js via WebGL, or a React Native 3D library)
6. The avatar is displayed in:
   - The user's own profile page (full animated rendering)
   - Map marker tooltips (small circular thumbnail)
   - Chat header (small thumbnail)
   - Leaderboard podium (full rendering for top 3)
   - Mini-game scenes (see Section 16)

**Visiting another user's profile:**
- Tap the avatar thumbnail in the map tooltip
- Tap the avatar/name link in the chat header
- Tap any reviewer's name in the review section

---

### 11. Leaderboard

The **Leaderboard** is a dedicated page accessible from the bottom navigation bar or the Profile tab.

**Weekly leaderboard:**
- Resets every Monday at midnight (local time)
- Ranks all users in the area by the **total score earned that week** from completed exchanges and reviews
- Score is contributed by both sides of each exchange — both the helper and the person who received help earn points, encouraging participation from all users

**Podium display (Top 3):**
- The top 3 users of the week are displayed on a **3D podium stage**:
  - 🥇 1st place stands on the tallest platform in the centre, their full 3D avatar rendered and animated
  - 🥈 2nd place stands to the left on a slightly shorter platform
  - 🥉 3rd place stands to the right on the shortest platform
- Tapping any podium avatar opens that user's profile
- A confetti animation plays when the leaderboard first loads each week

**Full leaderboard list:**
Below the podium, a scrollable ranked list shows all participating users with their avatar thumbnail, display name, weekly score, and rank number. The current user's own row is highlighted so they can quickly find their position.

---

### 12. Gamification & Level System

The level system gives users a long-term progression goal beyond single exchanges, encouraging continued helpful behaviour.

**How levelling works:**

| Level | Score Threshold | Reward |
|---|---|---|
| Level 1 — Newcomer | 0 pts | Default avatar outfit |
| Level 2 — Helper | 100 pts | Casual outfit set for avatar |
| Level 3 — Trusted Neighbour | 300 pts | Explorer outfit + backpack accessory |
| Level 4 — Community Pillar | 700 pts | Special "Guardian" outfit + glowing badge |
| Level 5 — Legend | 1500 pts | Exclusive "Legend" outfit + animated aura effect |

*(Exact thresholds and rewards to be finalised during development.)*

**Avatar cosmetic rewards:**
- Each new level unlocks a new **outfit or accessory** for the user's 3D avatar
- Rewards are applied to the avatar model directly — the avatar's appearance in the map tooltip, leaderboard, and mini-games reflects the unlocked cosmetic
- Users can switch between unlocked outfits at any time from their profile

**Level badge:**
- The current level badge is displayed on the profile page header and next to the user's name in the leaderboard, making experience and community standing immediately visible to others

---

### 13. Friend System

**How to add a friend:**
- From the **map tooltip** — tap "Add Friend" button below the Contact button
- From a **user's profile page** — tap the "Add Friend" button at the top
- From the **chat header** — tap the avatar/name and then "Add Friend" on their profile

**Friend request flow:**
1. User A sends a friend request to User B
2. User B receives a push notification and an in-app notification badge
3. User B can **Accept** or **Decline** from the notification or from their profile's friend requests section
4. If accepted, both users are now friends — mutual relationship

**Friends on the map:**
- Friends who have recently active posts or who are currently nearby appear as 🔵 blue markers on the map
- Tapping a friend's blue marker shows the same tooltip as any other marker, but with a "Friend" tag at the top

**Friend notifications:**
- When a friend posts a new Need or Supply, the user receives a **push notification** immediately: *"[Name] just posted a need nearby — can you help?"*
- This helps build stronger local ties by making friends aware of each other's needs first

**Friend list:**
- Viewable from the Profile page under a "Friends" tab
- Shows each friend's avatar, name, reputation score, and an option to remove the friend

---

### 14. Push Notifications

The app sends push notifications (via Firebase Cloud Messaging or equivalent) for the following events:

| Event | Notification Message |
|---|---|
| New nearby post within radius | "New need posted 0.3 km away — [post title]" |
| New chat message received | "[Name]: [message preview]" |
| Friend posts a new request | "[Friend name] just posted a need nearby — can you help?" |
| Friend request received | "[Name] wants to add you as a friend" |
| Return confirmation reminder (24 hrs) | "Reminder: please return the item borrowed from [Name] — 24 hours left" |
| Return confirmation reminder (6 hrs) | "Urgent: item return due in 6 hours — [Name] is waiting" |
| Account lockout warning | "Your account has been locked due to an unconfirmed item return. Resolve it to restore access." |
| Review prompt after exchange | "How was your exchange with [Name]? Leave a quick review." |
| Level up | "You levelled up to Level [X]! Check your new avatar reward." |
| Leaderboard achievement | "You made it to the Top 10 this week! Check the Leaderboard." |

Users can manage notification preferences from the app's Settings screen, enabling or disabling each category individually.

---

### 15. Safety Features

**Location privacy:**
- The app only stores and displays the user's **approximate location** — a general suburb or neighbourhood area, not an exact street address
- The walking-distance radius on the map is centred on an approximate point, not the user's precise GPS coordinate
- Exact coordinates are never stored in the database or shown to other users

**Reporting tools:**
- Any post or user can be reported by tapping the **⋮ menu → Report**
- The reporter selects a reason: Spam · Inappropriate content · Suspicious behaviour · Fake listing · Harassment
- Reported content is flagged for review; repeated reports on a single user trigger an automatic account suspension pending manual review

**Post expiration:**
- All Need posts have a mandatory expiry time set by the poster (between 1 hour and 7 days)
- Supply posts expire at the end of the stated availability window
- Expired posts are automatically removed from the map and list view, keeping the board current and clean

**Account lockout:**
- Triggered by unconfirmed item returns (see Section 8)
- Locked accounts cannot post, respond to posts, or initiate new chats
- The lockout screen shows a clear explanation and a button to contact the provider or raise a dispute

**Identity verification:**
- Optional but encouraged: verify with a student email address
- Verified users receive a checkmark badge visible to all, increasing community trust

---

### 16. Mini-Games *(Stretch Goal)*

If development time allows, two casual mini-games will be built into the app. Both games use the user's **3D avatar as the in-game character** and tie progression to the real-world level system — giving users another reason to be helpful in the community.

---

#### Farmer

**Concept:**
The user's avatar becomes a farmer who tends a personal virtual plot of land. Helping others in real life grows the farm.

**Gameplay:**
- Each time the user levels up in the main app, they receive a **seed packet** for a new type of food crop (e.g. Level 2 unlocks Tomato seeds, Level 3 unlocks Blueberry seeds, etc.)
- The user plants the seed in their virtual plot — the crop then **grows over real time** (e.g. 24–48 hours in real life for it to mature)
- When the crop is ready, the user taps it to **harvest** — the harvested produce appears as a small icon on their profile page, visible to anyone who views their profile
- The profile shows a "Garden" section displaying all the fruits and vegetables they have ever grown, representing their history of community contributions
- Higher-level crops are rarer and more visually impressive, giving experienced users a visible badge of long-term commitment

---

#### Fisher

**Concept:**
The user's avatar stands at a virtual riverside or pier and casts a fishing line. The quality of the catch is tied to the user's level.

**Gameplay:**
- The user opens the Fisher mini-game and taps to cast the line
- After a short animated wait, a fish bites — the user taps at the right moment (simple timing mechanic) to reel it in
- The **rarity and species** of the fish caught depends on the user's current level:
  - Lower levels: common fish (e.g. carp, small bass)
  - Higher levels: higher probability of rare species (e.g. golden koi, exotic deep-sea fish)
- Caught fish are added to a **collection album** visible on the user's profile, showing which species they have discovered
- Special rare fish can only be caught above certain levels, giving high-contributing users exclusive collectibles

---

## Technical Challenges

| Challenge | Approach |
|---|---|
| Real-time location matching | Geospatial queries in PostgreSQL (PostGIS); indexed radius search |
| Real-time chat | WebSockets via Socket.io |
| Trust & safety between strangers | Rating system + identity verification + reporting tools |
| Data privacy | Approximate location display; no exact addresses stored or shown |
| User adoption | University partnerships; student community promotion; incentive/reward systems |

---

## Expected Outcomes

If successful, the platform will:

- reduce unnecessary purchases and resource waste
- decrease food waste through sharing
- strengthen local communities
- help international students feel supported and connected
- encourage kindness and cooperation in cities

The long-term goal is to transform anonymous city environments into **more connected and supportive communities**.

---

## Future Development

- AI-powered recommendation for matching helpers to requests
- Smart request categorisation using NLP
- Predictive suggestions for nearby needs
- Integration with campus communities and university systems
- Web-based admin dashboard for moderation and analytics

---

## License

This project is currently under development for academic purposes (INFO 90010).
