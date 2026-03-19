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

This project proposes a **map-based community platform** (web application) that allows nearby users to **request help, offer resources, and build local social connections**.

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
| Frontend | React (web) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| Maps | Google Maps API |
| Auth | Email/password + Google OAuth + Phone OTP |
| Real-time Chat | WebSockets (Socket.io) |

---

## Application Structure

### Main Page Layout

```
┌─────────────────────────────────────┐
│  🔍 Search    [Filter ▼]    [+ Post] │
│                                     │
│   🗺️  MAP  (full screen)             │
│   🔴 Need Help                       │
│   🟢 Supply / Offering               │
│   🔵 Friends Nearby / Top Helper     │
│   🟡 My Location (current user)      │
│   ⭐ Short Walking Distance radius   │
│                                     │
│  [ Needs ] [ Supply ] [ Chat ] [ Profile ] │
└─────────────────────────────────────┘
```

**Bottom navigation tabs:** Needs | Supply | Chat | Profile

---

## Map Interface

The map is the **central interface** of the platform. When users open the app they see a neighbourhood map displaying nearby activity.

### Map Markers

| Marker | Meaning |
|---|---|
| 🔴 Red | Need Help posts |
| 🟢 Green | Supply / Offer posts |
| 🔵 Blue | Friends Nearby + Top Helpers |
| 🟡 Yellow | Current user's own location |

### Walking Distance Radius

- Displayed as a **dashed circle** around the user's location
- User can adjust the radius by dragging or entering a value
- Posts inside the radius are prioritised in listings

### Map Marker Popup / Detail Card

When a user clicks a marker on the map, a card appears showing:

- Post title & description
- Distance from user (e.g. "0.3 km away")
- Poster's name & reputation rating (stars)
- **Contact / Respond button** — opens the in-app chat
- **Location: Approximate only** (general area, not exact address — privacy by design)

### Dynamic Filtering Panel

Accessible via the **[Filter ▼]** button:

- Toggle: Need Help (show/hide red markers)
- Toggle: Supply (show/hide green markers)
- Toggle: Friends (show/hide blue markers)
- Category filter: Tools / Food / Physical Help / Study Help / Custom

---

## Login & Authentication

Users can sign in or register via:

- **Email & password**
- **Google / social login** (OAuth)
- **Phone number** (OTP via SMS)

---

## Needs Page

Users post requests for help. Each post contains:

**Post Fields:**
- Title & description
- Category (preset or custom)
- Urgency level: Low / Medium / High / ASAP
- Duration / expiry (how long the item is needed, or when the post expires)

**Preset Categories:**
- Borrow an item (tools, equipment, household items)
- Physical help (moving furniture, carrying boxes, repairs)
- Food / sharing (need food, share leftovers)
- Study / skills help (homework, translation, IT help)
- ➕ User-defined custom categories

**Example scenario:** A student receives newly delivered furniture but lacks tools to assemble it. Instead of buying a screwdriver, they post: *"Need to borrow a screwdriver for about 30 minutes."* Nearby users who have one can respond immediately.

---

## Supply Page

Users post offers of help or resources. Each post contains:

**Post Fields:**
- Title & description
- Category (preset or custom)
- Availability window (e.g. today only, this weekend)
- Photo upload (optional — useful for showing the item being offered)

**Preset Categories:**
- Lend an item (tools, household items, equipment)
- Offer physical help (moving, carrying, repairs)
- Share food (extra cooked food, groceries)
- Offer skills / knowledge (study help, translation, IT)
- ➕ User-defined custom categories

---

## Chat / Messaging

**How chat is initiated:**
- From the map marker popup → click **"Contact"** button
- From any Needs or Supply listing → click **"Respond"** button

**Features:**
- Real-time text messaging between users (via WebSockets / Socket.io)
- Photo sharing (e.g. photo of the item being lent)
- Push notifications for new messages

---

## Profile Page

Displays:
- Avatar, name, general location, join date
- Reputation score & earned badges (e.g. Top Helper, Food Sharer)
- Post history (past Need and Supply posts)
- Weekly leaderboard rank among nearby helpers

---

## Reputation & Ranking System

- After each completed exchange, both users rate each other **1–5 stars**
- Ratings accumulate into an overall **reputation score** displayed on the profile and map popups
- Weekly **local leaderboard** showing the most helpful users nearby
- **Badges** awarded for milestones (e.g. Top Helper, Food Sharer, Community Builder)
- **Micro-rewards:** appreciation points, digital badges, thank-you tokens

---

## Friend System

- Users can add others as **friends** after successful interactions
- Faster communication and stronger community relationships
- When a friend posts a new request, the system sends **automatic notifications**

---

## Safety Features

- **Identity verification** via student email, phone number, or university account
- **Approximate location only** — exact addresses are never displayed
- **Reporting tools** — users can report suspicious behaviour or posts
- **Request expiration** — posts automatically expire to avoid outdated listings

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
- Mobile application (React Native)

---

## License

This project is currently under development for academic purposes (INFO 90010).
