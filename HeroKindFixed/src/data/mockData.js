export const mockUser = {
  id: 'u1',
  name: 'Alex Chen',
  gender: 'Male',
  neighbourhood: 'Carlton North',
  joinDate: 'Jan 2025',
  verified: true,
  bio: 'Happy to help neighbours nearby',
  level: 3,
  levelName: 'Trusted Neighbour',
  xp: 420,
  xpNext: 700,
  stars: 4.8,
  totalReviews: 34,
  weeklyScore: 185,
  weeklyRank: 4,
  avatar: null,
};

// Full profiles for other users (for UserProfileScreen)
export const mockOtherUsers = {
  u1: {
    id: 'u1', name: 'Alex Chen', gender: 'Male', neighbourhood: 'Carlton North', joinDate: 'Jan 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.8, totalReviews: 34,
    bio: 'Happy to help neighbours nearby',
    weeklyScore: 185, weeklyRank: 4,
    reviews: [
      { id: 'r1', reviewer: 'David M.', stars: 5, comment: 'Alex was super helpful and returned everything in perfect condition.', tags: ['Reliable', 'Friendly', 'On time'], date: '2 days ago' },
      { id: 'r2', reviewer: 'Emma R.', stars: 5, comment: 'Great neighbour, responded instantly.', tags: ['Fast response'], date: '1 week ago' },
      { id: 'r3', reviewer: 'Nara P.', stars: 4, comment: 'Helpful and kind. Picked up the food on time.', tags: ['Friendly', 'Reliable'], date: '2 weeks ago' },
    ],
    posts: [],
  },
  u2: {
    id: 'u2', name: 'Mia L.', gender: 'Female', neighbourhood: 'Northcote', joinDate: 'Mar 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.6, totalReviews: 18,
    bio: 'Uni student, love baking and helping neighbours out 🍰',
    weeklyScore: 140, weeklyRank: 6,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 5, comment: 'Returned everything super quickly, great neighbour!', tags: ['Reliable', 'Friendly'], date: '1 week ago' },
      { id: 'r2', reviewer: 'Emma R.', stars: 4, comment: 'Very responsive, came on time.', tags: ['Fast response'], date: '2 weeks ago' },
    ],
    posts: [
      { id: 'n1', type: 'need', title: 'Need a screwdriver to assemble IKEA shelf', category: 'Borrow an item', timePosted: '5 min ago' },
    ],
  },
  u6: {
    id: 'u6', name: 'David M.', gender: 'Male', neighbourhood: 'Fitzroy', joinDate: 'Nov 2024',
    verified: true, level: 4, levelName: 'Community Pillar', stars: 4.7, totalReviews: 52,
    bio: 'Handyman & weekend cyclist. Happy to lend tools anytime 🔧',
    weeklyScore: 380, weeklyRank: 1,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 5, comment: 'David is incredibly generous with his tools and time. Top neighbour!', tags: ['Reliable', 'Generous', 'Friendly'], date: '2 days ago' },
      { id: 'r2', reviewer: 'Nara P.', stars: 5, comment: 'Super helpful, lent his drill without hesitation.', tags: ['Trustworthy', 'Fast response'], date: '1 week ago' },
      { id: 'r3', reviewer: 'Sophie K.', stars: 4, comment: 'Great experience, tools were in perfect condition.', tags: ['Reliable'], date: '3 weeks ago' },
    ],
    posts: [
      { id: 's1', type: 'supply', title: 'Offering drill + full toolset for the weekend', category: 'Lend an item', timePosted: '15 min ago' },
    ],
  },
  u7: {
    id: 'u7', name: 'Nara P.', gender: 'Female', neighbourhood: 'Brunswick', joinDate: 'Feb 2025',
    verified: false, level: 2, levelName: 'Helper', stars: 4.9, totalReviews: 27,
    bio: 'Food lover, always cooking too much 🍜 Come eat with me!',
    weeklyScore: 275, weeklyRank: 3,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 5, comment: 'The food was incredible, so generous!', tags: ['Generous', 'Friendly'], date: '3 days ago' },
      { id: 'r2', reviewer: 'Mia L.', stars: 5, comment: 'Best Thai food I have ever had from a neighbour.', tags: ['Generous'], date: '1 week ago' },
    ],
    posts: [
      { id: 's2', type: 'supply', title: 'Free leftover Thai food — pad see ew & spring rolls', category: 'Share food', timePosted: '30 min ago' },
    ],
  },
  u11: {
    id: 'u11', name: 'Tammy', gender: 'Female', neighbourhood: 'Carlton', joinDate: 'Apr 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.8, totalReviews: 21,
    bio: 'Frontend student who enjoys helping people untangle React state and UI flow problems.',
    weeklyScore: 210, weeklyRank: 5,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 5, comment: 'Explained React concepts clearly and was very patient.', tags: ['Helpful', 'Friendly'], date: '5 days ago' },
    ],
    posts: [
      { id: 's11', type: 'supply', title: 'Can help with React / JavaScript questions this afternoon', category: 'Offer skills', timePosted: '2 hrs ago' },
    ],
  },
  u12: {
    id: 'u12', name: 'Leo', gender: 'Male', neighbourhood: 'Parkville', joinDate: 'May 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.6, totalReviews: 12,
    bio: 'Usually borrowing tools for quick apartment fixes and always returns them carefully.',
    weeklyScore: 128, weeklyRank: 9,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 4, comment: 'Easy to coordinate with and polite in chat.', tags: ['Friendly', 'On time'], date: '1 week ago' },
    ],
    posts: [
      { id: 'n12', type: 'need', title: 'Need a screwdriver to assemble my IKEA shelf', category: 'Borrow an item', timePosted: '6 hrs ago' },
    ],
  },
  u13: {
    id: 'u13', name: 'Minion', gender: 'Male', neighbourhood: 'Fitzroy North', joinDate: 'Mar 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.7, totalReviews: 16,
    bio: 'Often borrows basic tools for DIY projects and keeps everyone updated during returns.',
    weeklyScore: 142, weeklyRank: 8,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 5, comment: 'Great communication during the whole exchange.', tags: ['Clear communication', 'Reliable'], date: '4 days ago' },
    ],
    posts: [
      { id: 'n13', type: 'need', title: 'Need a screwdriver to finish one last shelf tonight', category: 'Borrow an item', timePosted: '7 hrs ago' },
    ],
  },
  u14: {
    id: 'u14', name: 'Bella', gender: 'Female', neighbourhood: 'Melbourne CBD', joinDate: 'Jun 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.9, totalReviews: 24,
    bio: 'Happy to mentor people through UI polish, flows, and frontend debugging sessions.',
    weeklyScore: 240, weeklyRank: 4,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 5, comment: 'Very thoughtful mentor and super practical.', tags: ['Helpful', 'Clear communication'], date: '2 days ago' },
    ],
    posts: [
      { id: 's14', type: 'supply', title: 'Offering React mentoring for UI flow and state questions', category: 'Offer skills', timePosted: '8 hrs ago' },
    ],
  },
  u15: {
    id: 'u15', name: 'Anita', gender: 'Female', neighbourhood: 'North Melbourne', joinDate: 'Feb 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.5, totalReviews: 14,
    bio: 'Usually careful with borrowed items, but sometimes juggles too many projects at once.',
    weeklyScore: 101, weeklyRank: 12,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 3, comment: 'Friendly, but the return needed extra follow-up this time.', tags: ['Friendly'], date: '1 day ago' },
    ],
    posts: [
      { id: 'n15', type: 'need', title: 'Need a screwdriver for shelf assembly, return delayed', category: 'Borrow an item', timePosted: '9 hrs ago' },
    ],
  },
  u19: {
    id: 'u19', name: 'Ruby', gender: 'Female', neighbourhood: 'Brunswick East', joinDate: 'Apr 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.8, totalReviews: 19,
    bio: 'Enjoys short study support sessions and always leaves thoughtful feedback after helping.',
    weeklyScore: 198, weeklyRank: 6,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 5, comment: 'The session was clear, focused, and super helpful.', tags: ['Helpful', 'Friendly'], date: '3 days ago' },
    ],
    posts: [
      { id: 's19', type: 'supply', title: 'Can help review your React component structure', category: 'Offer skills', timePosted: '14 hrs ago' },
    ],
  },
  u20: {
    id: 'u20', name: 'Ethan', gender: 'Male', neighbourhood: 'Docklands', joinDate: 'Jan 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.7, totalReviews: 22,
    bio: 'Lends tools often and prefers to resolve issues carefully if something comes back missing.',
    weeklyScore: 205, weeklyRank: 7,
    reviews: [
      { id: 'r1', reviewer: 'Alex Chen', stars: 4, comment: 'Generally very reliable and responsive.', tags: ['Reliable', 'Fast response'], date: '2 weeks ago' },
    ],
    posts: [
      { id: 's20', type: 'supply', title: 'Offering drill + bits set for weekend projects', category: 'Lend an item', timePosted: '15 hrs ago' },
    ],
  },
};

export const mockNeeds = [
  {
    id: 'n1',
    type: 'need',
    title: 'Need a screwdriver to assemble IKEA shelf',
    description: 'Moving into a new place and need a Phillips screwdriver for about 30 mins. Happy to come to you!',
    category: 'Borrow an item',
    urgency: 'High',
    distance: '0.2 km',
    timePosted: '5 min ago',
    poster: { id: 'u2', name: 'Mia L.', stars: 4.6, verified: true, level: 2 },
    lat: -37.7853,
    lng: 144.9765,
  },
  {
    id: 'n2',
    type: 'need',
    title: 'Help carrying boxes up 3 flights of stairs',
    description: 'Moving day! Need 2 people for about an hour. Will shout pizza and drinks.',
    category: 'Physical help',
    urgency: 'ASAP',
    distance: '0.5 km',
    timePosted: '12 min ago',
    poster: { id: 'u3', name: 'James W.', stars: 4.9, verified: false, level: 1 },
    lat: -37.787,
    lng: 144.974,
  },
  {
    id: 'n3',
    type: 'need',
    title: 'Looking to borrow a bicycle pump',
    description: 'Flat tyre before uni — just need a pump for a minute.',
    category: 'Borrow an item',
    urgency: 'Medium',
    distance: '0.8 km',
    timePosted: '20 min ago',
    poster: { id: 'u4', name: 'Sophie K.', stars: 5.0, verified: true, level: 4 },
    lat: -37.784,
    lng: 144.979,
  },
  {
    id: 'n4',
    type: 'need',
    title: 'Need help with Python assignment',
    description: 'Stuck on a pandas data cleaning task. Can anyone spare 30 mins over video call?',
    category: 'Study/skills',
    urgency: 'Low',
    distance: '1.1 km',
    timePosted: '1 hr ago',
    poster: { id: 'u5', name: 'Ryo T.', stars: 4.3, verified: true, level: 2 },
    lat: -37.782,
    lng: 144.977,
  },
];

export const mockSupplies = [
  {
    id: 's1',
    type: 'supply',
    title: 'Offering drill + full toolset for the weekend',
    description: 'Happy to lend my drill, screwdrivers, and hammer. Available Sat–Sun. Please return Sunday night.',
    category: 'Lend an item',
    availability: 'Sat–Sun this weekend',
    distance: '0.3 km',
    timePosted: '15 min ago',
    poster: { id: 'u6', name: 'David M.', stars: 4.7, verified: true, level: 3 },
    lat: -37.786,
    lng: 144.973,
  },
  {
    id: 's2',
    type: 'supply',
    title: 'Free leftover Thai food — pad see ew & spring rolls',
    description: 'Made too much dinner. Come grab some before 9pm tonight!',
    category: 'Share food',
    availability: 'Tonight until 9 PM',
    distance: '0.6 km',
    timePosted: '30 min ago',
    poster: { id: 'u7', name: 'Nara P.', stars: 4.9, verified: false, level: 2 },
    lat: -37.789,
    lng: 144.975,
  },
  {
    id: 's3',
    type: 'supply',
    title: 'Can help with React / JavaScript questions',
    description: '3rd year CS student. Happy to help with frontend questions this afternoon.',
    category: 'Offer skills',
    availability: 'Today 2–6 PM',
    distance: '0.9 km',
    timePosted: '45 min ago',
    poster: { id: 'u8', name: 'Emma R.', stars: 4.8, verified: true, level: 3 },
    lat: -37.783,
    lng: 144.971,
  },
];

export const mockChats = [
  {
    id: 'c4',
    user: { id: 'u11', name: 'Tammy', stars: 4.8, gender: 'Female' },
    postTitle: 'Start Exchange Test - React help session',
    lastMessage: 'Happy to help later this afternoon if you still need it.',
    time: '5 hrs ago',
    unread: 0,
  },
  {
    id: 'c5',
    user: { id: 'u12', name: 'Leo', stars: 4.6, gender: 'Male' },
    postTitle: 'Borrow Pending Test - screwdriver loan',
    lastMessage: 'I can pick it up whenever you are ready.',
    time: '6 hrs ago',
    unread: 1,
  },
  {
    id: 'c6',
    user: { id: 'u13', name: 'Minion', stars: 4.6, gender: 'Male' },
    postTitle: 'Borrow In Progress Test - screwdriver return',
    lastMessage: 'I have returned it outside your unit just now.',
    time: '7 hrs ago',
    unread: 0,
  },
  {
    id: 'c7',
    user: { id: 'u14', name: 'Bella', stars: 4.8, gender: 'Female' },
    postTitle: 'Service In Progress Test - React mentoring',
    lastMessage: 'I am online now, let us finish the task today.',
    time: '8 hrs ago',
    unread: 0,
  },
  {
    id: 'c8',
    user: { id: 'u15', name: 'Anita', stars: 4.6, gender: 'Female' },
    postTitle: 'Borrow Overdue Test - screwdriver follow-up',
    lastMessage: 'Sorry, I know this is overdue. Can you confirm when you see it?',
    time: '9 hrs ago',
    unread: 0,
  },
  {
    id: 'c13',
    user: { id: 'u19', name: 'Ruby', stars: 4.8, gender: 'Female' },
    postTitle: 'Completed Review Test - React help finished',
    lastMessage: 'Glad that solved it. Feel free to leave a review.',
    time: '14 hrs ago',
    unread: 0,
  },
  {
    id: 'c14',
    user: { id: 'u20', name: 'Ethan', stars: 4.7, gender: 'Male' },
    postTitle: 'Dispute Test - drill exchange issue',
    lastMessage: 'Let us keep the exchange paused until we clear this up.',
    time: '15 hrs ago',
    unread: 0,
  },
];

export const mockMessages = [
  { id: 'm1', sender: 'them', text: 'Hi! Is the screwdriver still available?', time: '3:45 PM', read: true },
  { id: 'm2', sender: 'me', text: 'Yes it is! When do you need it?', time: '3:47 PM', read: true },
  { id: 'm3', sender: 'them', text: 'Right now if possible — assembling IKEA furniture 😅', time: '3:48 PM', read: true },
  { id: 'm4', sender: 'me', text: 'No worries, come to Unit 4 / 12 Lygon St. I\'ll buzz you in.', time: '3:50 PM', read: true },
  { id: 'm5', sender: 'them', text: 'Amazing, on my way! Be there in 5 mins 🙌', time: '3:51 PM', read: false },
  { id: 'm6', sender: 'them', text: 'Thanks again. I just wanted to double check the return timing.', time: '4:02 PM', read: true },
  { id: 'm7', sender: 'me', text: 'All good, just keep me updated if anything changes.', time: '4:04 PM', read: true },
  { id: 'm8', sender: 'them', text: 'Will do. I might need a little extra time if class runs late.', time: '4:07 PM', read: true },
  { id: 'm9', sender: 'me', text: 'That is fine, just message me before the deadline so we stay aligned.', time: '4:08 PM', read: true },
  { id: 'm10', sender: 'them', text: 'Perfect, appreciate it.', time: '4:09 PM', read: true },
  { id: 'm11', sender: 'me', text: 'No problem. The app should keep the timing visible for both of us.', time: '4:11 PM', read: true },
  { id: 'm12', sender: 'them', text: 'Yes, I can see it now. That makes the process much clearer.', time: '4:12 PM', read: true },
  { id: 'm13', sender: 'me', text: 'Exactly, that way the deadline is visible in both the chat and exchange screen.', time: '4:14 PM', read: true },
  { id: 'm14', sender: 'them', text: 'I think that will help prevent confusion, especially when people get busy.', time: '4:15 PM', read: true },
  { id: 'm15', sender: 'me', text: 'Yes, and the provider still controls the final completion step.', time: '4:17 PM', read: true },
  { id: 'm16', sender: 'them', text: 'That makes sense for borrowed items.', time: '4:18 PM', read: true },
  { id: 'm17', sender: 'me', text: 'For help tasks we will use task started and task completed instead.', time: '4:20 PM', read: true },
  { id: 'm18', sender: 'them', text: 'Great, the wording should be much clearer now.', time: '4:21 PM', read: true },
  { id: 'm19', sender: 'me', text: 'I will keep this thread updated if anything changes on my side.', time: '4:23 PM', read: true },
  { id: 'm20', sender: 'them', text: 'Sounds good, thanks for staying responsive.', time: '4:24 PM', read: true },
];

export const mockLeaderboard = [
  { rank: 1, id: 'u6', name: 'David M.', score: 380, level: 4, stars: 4.7, neighbourhood: 'Fitzroy' },
  { rank: 2, id: 'u8', name: 'Emma R.', score: 310, level: 3, stars: 4.8, neighbourhood: 'Carlton' },
  { rank: 3, id: 'u7', name: 'Nara P.', score: 275, level: 3, stars: 4.9, neighbourhood: 'Brunswick' },
  { rank: 4, id: 'u1', name: 'Alex Chen', score: 185, level: 3, stars: 4.8, neighbourhood: 'Carlton North' },
  { rank: 5, id: 'u4', name: 'Sophie K.', score: 162, level: 4, stars: 5.0, neighbourhood: 'Parkville' },
  { rank: 6, id: 'u2', name: 'Mia L.', score: 140, level: 2, stars: 4.6, neighbourhood: 'Northcote' },
  { rank: 7, id: 'u3', name: 'James W.', score: 95, level: 1, stars: 4.9, neighbourhood: 'Richmond' },
  { rank: 8, id: 'u5', name: 'Ryo T.', score: 78, level: 2, stars: 4.3, neighbourhood: 'Collingwood' },
];

export const mockReviews = [
  {
    id: 'r1',
    reviewer: 'David M.',
    stars: 5,
    comment: 'Alex was super helpful and returned everything in perfect condition. Would definitely help again!',
    tags: ['Reliable', 'Friendly', 'Returned on time'],
    date: '2 days ago',
  },
  {
    id: 'r2',
    reviewer: 'Emma R.',
    stars: 5,
    comment: 'Great neighbour, responded instantly. Exactly what this app is about.',
    tags: ['Fast response', 'Friendly'],
    date: '1 week ago',
  },
  {
    id: 'r3',
    reviewer: 'Nara P.',
    stars: 4,
    comment: 'Helpful and kind. Picked up the food exactly on time.',
    tags: ['Friendly', 'Reliable'],
    date: '2 weeks ago',
  },
];

// Transaction / Exchange system
export const mockTransactions = [
  {
    id: 't1',
    status: 'in_progress',        // pending | in_progress | completed | overdue | disputed
    type: 'borrow',               // borrow | service | food
    postTitle: 'Offering drill + full toolset',
    item: 'Drill + full toolset',
    provider: { id: 'u6', name: 'David M.', level: 4, stars: 4.7 },
    requester: { id: 'u1', name: 'Alex Chen', level: 3, stars: 4.8 },
    myRole: 'requester',
    handoverDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    agreedReturnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Return to Unit 4 / 12 Lygon St before Sunday night.',
  },
  {
    id: 't2',
    status: 'overdue',
    type: 'borrow',
    postTitle: 'Need a screwdriver to assemble IKEA shelf',
    item: 'Phillips screwdriver',
    provider: { id: 'u1', name: 'Alex Chen', level: 3, stars: 4.8 },
    requester: { id: 'u2', name: 'Mia L.', level: 2, stars: 4.6 },
    myRole: 'provider',
    handoverDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    agreedReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Return to Carlton North any time.',
  },
  {
    id: 't3',
    status: 'completed',
    type: 'service',
    postTitle: 'Help carrying boxes up 3 flights',
    item: 'Physical help — moving',
    provider: { id: 'u1', name: 'Alex Chen', level: 3, stars: 4.8 },
    requester: { id: 'u3', name: 'James W.', level: 1, stars: 4.9 },
    myRole: 'provider',
    handoverDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    agreedReturnDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Completed same day.',
  },
];

export const mockFarmerCrops = [
  { id: 'cr1', name: 'Tomato', emoji: '🍅', level: 2, status: 'ready', plantedAt: '2 days ago' },
  { id: 'cr2', name: 'Blueberry', emoji: '🫐', level: 3, status: 'growing', progress: 0.6, hoursLeft: 14 },
  { id: 'cr3', name: 'Corn', emoji: '🌽', level: 3, status: 'growing', progress: 0.2, hoursLeft: 32 },
  { id: 'cr4', name: 'Strawberry', emoji: '🍓', level: 1, status: 'harvested', harvestedAt: '3 days ago' },
  { id: 'cr5', name: 'Watermelon', emoji: '🍉', level: 4, status: 'locked', requiredLevel: 4 },
];

export const mockFishCollection = [
  { id: 'f1', name: 'Common Carp', emoji: '🐟', rarity: 'Common', level: 1, caught: 5 },
  { id: 'f2', name: 'Bass', emoji: '🐠', rarity: 'Common', level: 1, caught: 3 },
  { id: 'f3', name: 'Rainbow Trout', emoji: '🐡', rarity: 'Uncommon', level: 2, caught: 2 },
  { id: 'f4', name: 'Golden Koi', emoji: '🎏', rarity: 'Rare', level: 3, caught: 1 },
  { id: 'f5', name: 'Deep Sea Eel', emoji: '🦑', rarity: 'Epic', level: 4, caught: 0, locked: true },
  { id: 'f6', name: 'Legendary Dragon Fish', emoji: '🐉', rarity: 'Legendary', level: 5, caught: 0, locked: true },
];
