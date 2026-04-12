export const mockUser = {
  id: 'u1',
  name: 'Alex Chen',
  gender: 'Male',
  neighbourhood: 'Carlton North',
  joinDate: 'Jan 2025',
  verified: true,
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
    id: 'c1',
    user: { id: 'u6', name: 'David M.', stars: 4.7 },
    postTitle: 'Offering drill + full toolset',
    lastMessage: 'Sure! Come by anytime before 6pm.',
    time: '2 min ago',
    unread: 2,
  },
  {
    id: 'c2',
    user: { id: 'u2', name: 'Mia L.', stars: 4.6 },
    postTitle: 'Need a screwdriver',
    lastMessage: 'Thanks so much, really appreciated!',
    time: '1 hr ago',
    unread: 0,
  },
  {
    id: 'c3',
    user: { id: 'u7', name: 'Nara P.', stars: 4.9 },
    postTitle: 'Free leftover Thai food',
    lastMessage: 'I\'ll be there in 10 minutes!',
    time: '3 hrs ago',
    unread: 0,
  },
];

export const mockMessages = [
  { id: 'm1', sender: 'them', text: 'Hi! Is the screwdriver still available?', time: '3:45 PM', read: true },
  { id: 'm2', sender: 'me', text: 'Yes it is! When do you need it?', time: '3:47 PM', read: true },
  { id: 'm3', sender: 'them', text: 'Right now if possible — assembling IKEA furniture 😅', time: '3:48 PM', read: true },
  { id: 'm4', sender: 'me', text: 'No worries, come to Unit 4 / 12 Lygon St. I\'ll buzz you in.', time: '3:50 PM', read: true },
  { id: 'm5', sender: 'them', text: 'Amazing, on my way! Be there in 5 mins 🙌', time: '3:51 PM', read: false },
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
