# HelpMate — Core Features

> This document describes the three core features implemented in the HelpMate MVP, how each works, and which user needs each feature is designed to address.

**Course:** INFO 90010 — Technology Innovation Project
**Team:** Group B | University of Melbourne, 2026

---

## Table of Contents

- [Feature 1 — Map-Based Help Discovery](#feature-1--map-based-help-discovery)
- [Feature 2 — Post and Exchange System](#feature-2--post-and-exchange-system)
- [Feature 3 — Trust, Reputation and Gamification](#feature-3--trust-reputation-and-gamification)
- [Summary Table](#summary-table)

---

## Feature 1 — Map-Based Help Discovery

### What It Does

When a user opens HelpMate, they land directly on a **live neighbourhood map** showing all nearby help requests and supply offers as colour-coded markers:

| Marker Colour | Meaning |
|--------------|---------|
| Red | A nearby user is requesting help or an item |
| Green | A nearby user is offering help or lending something |
| Blue | A friend  |

Each marker displays the poster's **two-letter initials** inside a circle, making the map feel personal and human rather than abstract. Users can adjust the visible radius (0.5 km, 1 km, 2 km, 5 km) and toggle filters directly on the map using the **Need / Supply / Friend** pills below the search bar — no extra screens required.

Tapping any marker opens a **detail card** sliding up from the bottom, showing:
- Post title, category, urgency level, and distance
- The poster's avatar, display name, reputation rating, and verification badge
- A **Contact** button to open in-app chat, or an **Add Friend** button

A **Nearby List** (accessible via the people icon) shows all visible posts sorted by friends first, then by distance — giving users a quick overview without needing to pan the map.

### How It Supports User Interaction

The map is the **primary entry point** of the app. Every core action — discovering help, contacting someone, filtering by preference — begins here. The inline filter pills mean users can switch between viewing Need/Supply/Friend posts with a single tap, reducing the steps needed to find relevant help. The tooltip card provides enough information to make a trust judgement before committing to contact.

### User Needs Addressed

| User Need | How This Feature Addresses It |
|-----------|-------------------------------|
| *"No fast, reliable way to find nearby peer help in real time"* | The live map shows all nearby posts instantly, with distance and urgency visible at a glance |
| *"Having to use multiple fragmented platforms to find help"* | All discovery happens in one screen — no switching between Facebook, WhatsApp, or noticeboards |
| *"Fear of interacting with unverified strangers"* | The user's profile shows the poster's rating, verification badge, and level before any contact is made |
| *"Women feel unsafe on open, anonymous platforms"* | Gender filter lets users restrict markers to their preferred gender of helper or requester |

---

## Feature 2 — Post and Exchange System

### What It Does

Users can post either a **help request** (Need) or a **help offer** (Supply) via the **+ Request Help** button on the map.

**Post creation fields:**

| Field | Details |
|-------|---------|
| Type | Need (requesting) or Supply (offering) |
| Title | Short summary (max 80 characters) |
| Description | Full explanation of the request or offer |
| Category | Borrow an item · Physical help · Food sharing · Study/skills · Custom |
| Urgency | Low · Medium · High · ASAP |
| Expiry | 1 hour to 7 days (mandatory on Need posts) |
| Photos | Optional — up to 3 photos |

Once posted, the marker appears on the map for nearby users. When another user taps **Contact**, an **in-app chat** opens with the original post pinned at the top for context.

From chat, either party can tap **Start Exchange** to formally begin the transaction. The exchange then moves through a tracked lifecycle:

```
pending → in_progress → completed / overdue / disputed
```

A countdown timer shows the agreed deadline. If an item is not confirmed returned within 3 days, the requester's account is temporarily locked. Either party can raise a **dispute**, which pauses the lockout and flags the exchange for review.

After completion, both parties are prompted to **leave a mutual review** — star rating plus written comment — which is then visible on both profiles.

### How It Supports User Interaction

The post system gives both sides of an exchange a **structured, low-friction way** to describe what they need or offer, without relying on informal messaging. The exchange lifecycle makes the entire process transparent — both parties can see the current status, agreed deadline, and their role-specific actions at any time. The mutual review prompt creates accountability without requiring external moderation.

### User Needs Addressed

| User Need | How This Feature Addresses It |
|-----------|-------------------------------|
| *"Small tasks are inconvenient to solve — no platform designed for micro-help"* | The post system is specifically designed for small, local, time-limited help requests — not buying/selling |
| *"High ghosting and no-show rates on informal platforms"* | The exchange lifecycle with a countdown timer and account lockout creates mutual accountability |
| *"Unnecessary purchases fill the gap"* | Borrowing and lending are first-class post types — users can request items without buying them |
| *"Feeling judged for asking for help"* | The structured post form normalises asking — it is presented as a routine community action, not an unusual request |

---

## Feature 3 — Trust, Reputation and Gamification

### What It Does

HelpMate addresses the core trust barrier — *"I don't know who this person is"* — through a layered reputation system and a gamification layer that rewards consistent helpfulness.

**Reputation system:**
- Every user has a **own profile** showing their star average, written reviews, completed exchange history, and level badge
- After each completed exchange, both parties leave a **mutual review** (1–5 stars + written comment + behaviour tags)
- A **trust score** is visible on the map tooltip, so users can assess a stranger before contacting them
- Friends are highlighted in blue on the map and sorted to the top of the Nearby List

**Leaderboard:**
- A **weekly leaderboard** ranks users by helpfulness score, filterable by area and task category
- Top 3 users are displayed on the top of page (🥇🥈🥉)
- Every user sees their own rank card with a motivational message
- A **horizontal bar chart** on each row shows each user's score proportionally relative to the top scorer

**Gamification — XP and Level system:**
- Users earn XP by completing daily and weekly tasks (e.g. Help 1 neighbour: +20 XP, Complete 3 exchanges: +50 XP)
- XP drives a 5-level progression: Newcomer → Helper → Trusted Neighbour → Community Pillar → Legend
- Higher levels unlock rarer crops in the **Farmer mini-game** and rarer fish in the **Fisher mini-game**

**Mini-games (Farmer and Fisher):**
- Two casual games built into the app, tied to the user's real-world level
- Give users a reason to stay engaged with the app even before the local community reaches critical mass
- Both games save state to Supabase so progress persists across sessions

### How It Supports User Interaction

The reputation system makes every profile into a **trust signal** — the combination of star rating, written reviews, exchange count, and level badge gives users enough information to make an informed decision before meeting a stranger. The leaderboard makes helpfulness visible and socially rewarding, not invisible. The gamification layer addresses the cold-start problem: users have a reason to open the app and stay active even when their immediate neighbourhood has few posts.

### User Needs Addressed

| User Need | How This Feature Addresses It |
|-----------|-------------------------------|
| *"No track record visible for new users — every first interaction feels like a blind date"* | Every profile shows completed exchanges, star average, and written reviews before any contact |
| *"Helpers receive no recognition for giving"* | The leaderboard, XP system, and level badges make helpfulness publicly visible and rewarded |
| *"Platforms feel impersonal — no community trust"* | Written reviews with behaviour tags create a human, contextual trust signal — not just a number |
| *"Risk of no responders in early adoption phase (cold-start)"* | Mini-games give users a reason to open the app regularly even before a critical mass of nearby users exists |
| *"Feel valued for the help they provide"* | XP tiers, weekly leaderboard rank, and level progression give helpers tangible, ongoing recognition |

---

## Summary Table

| Feature | Core Function | Key User Need Addressed |
|---------|--------------|------------------------|
| **Map-Based Help Discovery** | Live map of nearby Need/Supply/Friend posts with filtering | Find nearby help instantly; safety through visible trust signals |
| **Post and Exchange System** | Structured posting, in-app chat, tracked exchange lifecycle, mutual reviews | Low-friction help requests; accountability; dispute resolution |
| **Trust, Reputation and Gamification** | Public profiles, mutual reviews, leaderboard, XP levels, mini-games | Build trust with strangers; reward helpers; sustain engagement |

---

> For installation and access instructions, see [Install_Guideline.md](./Install_Guideline.md)
> For full feature documentation and design decisions, see [All_Features_Design.md](./All_Features_Design.md)
