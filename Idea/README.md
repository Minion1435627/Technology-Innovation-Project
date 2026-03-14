
# Community Help Platform for Urban Students

## Project Overview

Modern cities such as Melbourne can sometimes feel like a **concrete jungle**, where people live close to each other physically but remain socially disconnected. Many urban residents—especially **international students and young professionals**—do not know their neighbors and lack a local support network.

At the same time, many small everyday problems occur that are **too minor to justify buying new items or hiring professional services**, yet they can still cause inconvenience.

Examples include:

- needing a screwdriver to assemble new furniture  
- needing help carrying heavy objects upstairs  
- having extra cooked food that would otherwise go to waste  
- needing to borrow small household items for a short time  

These problems happen frequently, but they are often solved inefficiently.

This project proposes a **map-based community platform** (available as both a **website and mobile application**) that allows nearby users to **request help, offer resources, and build local social connections**.

### Core Idea

**Ask nearby → solve quickly → reward helpful people.**

The platform aims to transform anonymous urban environments into **small supportive communities** by enabling quick local cooperation.

---

# Problem Statement

Urban students face three major challenges.

## 1. Resource Inefficiency

People frequently buy tools or items that are rarely used.

Examples include:

- screwdrivers  
- ladders  
- kitchen tools  
- moving equipment  

Many of these items are only used once or twice but still require purchase.

This leads to **wasted money and unnecessary consumption**.

---

## 2. Lack of Local Support

International students and newcomers often do not have nearby people to rely on.

Unlike living with family or long-term communities, many students live alone or in temporary accommodation.

Even **small tasks can become difficult without help**.

---

## 3. Small Tasks Are Inconvenient

Some problems are too small to hire someone for, but still difficult to solve alone.

Examples include:

- moving furniture  
- borrowing tools  
- short-term item usage  
- quick technical help  
- sharing leftover food  

Existing platforms usually focus on **buying, selling, or professional services**, not **micro-help between neighbors**.

---

# Core Value Proposition

Our platform creates a **local assistance network** where users can:

- ask nearby people for small help  
- share resources within walking distance  
- build trusted local relationships  

The platform encourages community support through **visibility, communication, and reward mechanisms**.

The goal is to make helping neighbors **easy, fast, and socially rewarding**.

---

# Platform Structure

The platform includes two main interaction pages.

## Needs Page

Users can post requests for help.

Requests may include:

### Borrowing Items

Examples:

- screwdriver  
- ladder  
- kitchen tools  
- drill  
- bicycle pump  

Users can specify:

- item name  
- how long they need it  
- approximate location  
- urgency level  

Example scenario:

A student receives newly delivered furniture but lacks the tools to assemble it. Instead of buying a screwdriver, they can post:

> “Need to borrow a screwdriver for about 30 minutes.”

Nearby users who have one can respond quickly.

---

### Requesting Physical Help

Examples:

- moving heavy furniture  
- carrying boxes  
- assembling furniture  
- simple repairs  

---

### Temporary Assistance

Examples:

- helping translate a document  
- checking computer issues  
- quick homework help  
- short-term pet sitting  

---

## Supply Page

The Supply Page allows users to offer help or share resources.

### Lending Items

Users can offer tools or household items such as:

- tools  
- kitchen equipment  
- appliances  
- sports equipment  

---

### Offering Help

Users may offer assistance such as:

- helping move furniture  
- helping carry groceries  
- simple computer troubleshooting  

---

### Food Sharing

Users can share extra food they cannot finish.

Example:

> “I cooked too much dinner tonight. Anyone nearby want to share?”

This reduces food waste and encourages social interaction.

---

# Map-Based System

The map is the **central interface** of the platform.

When users open the app, they see a **neighborhood map** displaying nearby activities.

Each user is represented by:

- a small avatar  
- a colored marker  
- or a custom icon  

## Marker Types

Example map markers:

🔴 Red marker — Need help  
🟢 Green marker — Supply or offering help  
🔵 Blue marker — Friends nearby  
⭐ Gold marker — Top helper in the area  

Users can zoom into the map to see:

- nearby requests  
- available resources  
- active helpers  

Clicking a marker opens a **detail card** containing:

- request description  
- distance  
- user rating  
- contact button  

## Map Filters

Users can filter requests by category:

- tools  
- food sharing  
- moving help  
- study help  
- technical help  

This makes it easier to find relevant opportunities nearby.

---

# Friend System

Users can add others as **friends** after successful interactions.

Benefits include:

- faster communication  
- stronger community relationships  
- easier trust between users  

When a friend posts a request, the system can send **automatic notifications** so they can respond quickly.

---

# Reputation and Ranking System

To encourage helpful behavior, the platform includes a **community reputation system**.

Users can:

- rate interactions  
- leave feedback  
- confirm completed requests  

Each week the app may display a **local leaderboard** showing the most helpful users.

Example title:

**Top Helper of the Week**

This system helps:

- reward positive behavior  
- build trust between users  
- encourage community participation  

---

# Communication System

The platform includes a **built-in chat system**.

Users can:

- message each other  
- share location information  
- arrange meeting times  
- send item photos  

This ensures smooth communication before meeting.

---

# Additional Features

## Distance-Based Matching

The system prioritizes requests within a **short walking distance**.

---

## Safety Verification

Users can verify their identity using:

- student email  
- phone number  
- university account  

---

## Request Expiration

Requests automatically expire after a certain time to avoid outdated posts.

---

## Micro Reward System

Users may receive:

- appreciation points  
- digital badges  
- thank-you tokens  

These encourage helpful participation.

---

## Community Events

Users may organize local events such as:

- group study sessions  
- cooking gatherings  
- neighborhood meetups  

This strengthens community connections.

---

# System Architecture (Conceptual)

The platform consists of several major components.

## Frontend

Website and mobile interface.

Possible technologies:

- React  
- React Native  
- Flutter  

---

## Backend

Handles system logic such as:

- user authentication  
- request management  
- messaging  
- ranking system  

Possible technologies:

- Node.js  
- Express  
- Firebase  

---

## Database

Stores platform data including:

- user profiles  
- help requests  
- item listings  
- ratings  
- chat messages  

Possible technologies:

- PostgreSQL  
- MongoDB  

---

## Map Service

Map visualization is provided through external APIs.

Possible options:

- Google Maps API  
- Mapbox  

---

# Technical Challenges

## Real-Time Location Matching

Efficiently matching nearby requests requires location filtering and fast updates.

---

## Real-Time Communication

Chat and notifications require technologies such as:

- WebSockets  
- Firebase real-time services  

---

## Trust and Safety

Interactions between strangers require safety mechanisms.

Possible solutions:

- rating systems  
- user verification  
- reporting tools  

---

## Data Privacy

Users should not reveal exact home addresses.

The platform may display **approximate locations instead of precise addresses**.

---

## User Adoption

The platform works best when many users participate.

Early growth may require:

- university partnerships  
- student community promotion  
- incentive systems  

---

# Expected Outcomes

If successful, the platform will:

- reduce unnecessary purchases  
- decrease food waste  
- strengthen local communities  
- help international students feel supported  
- encourage kindness and cooperation in cities  

The long-term goal is to transform anonymous city environments into **more connected and supportive communities**.

---

# Future Development

Potential future improvements include:

- AI recommendation for matching helpers  
- smart request categorization  
- predictive suggestions for nearby needs  
- integration with campus communities  

---

# License

This project is currently under development for academic purposes.
