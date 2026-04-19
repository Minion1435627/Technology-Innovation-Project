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
  bio: 'Friendly local neighbour who often helps with quick exchanges, study support, and borrowed items.',
  reviews: [
    {
      id: 'mr1',
      reviewer: 'David M.',
      stars: 5,
      comment: 'Alex was super helpful and returned everything in perfect condition. Would definitely help again!',
      tags: ['Reliable', 'Friendly', 'Returned on time'],
      date: '2 days ago',
    },
    {
      id: 'mr2',
      reviewer: 'Emma R.',
      stars: 5,
      comment: 'Great neighbour, responded instantly. Exactly what this app is about.',
      tags: ['Fast response', 'Friendly'],
      date: '1 week ago',
    },
    {
      id: 'mr3',
      reviewer: 'Nara P.',
      stars: 4,
      comment: 'Helpful and kind. Picked up the food exactly on time.',
      tags: ['Friendly', 'Reliable'],
      date: '2 weeks ago',
    },
  ],
  posts: [],
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
    verified: true, level: 2, levelName: 'Helper', stars: 4.6, totalReviews: 18, friends: ['u8'],
    bio: 'Uni student, love baking and helping neighbours out 🍰',
    weeklyScore: 140, weeklyRank: 6,
    reviews: [
      { id: 'r1', reviewer: 'David M.', stars: 5, comment: 'Returned everything super quickly, great neighbour!', tags: ['Reliable', 'Friendly'], date: '1 week ago' },
      { id: 'r2', reviewer: 'Emma R.', stars: 4, comment: 'Very responsive, came on time.', tags: ['Fast response'], date: '2 weeks ago' },
    ],
    posts: [
      { id: 'n1', type: 'need', title: 'Need a screwdriver to assemble IKEA shelf', category: 'Borrow an item', timePosted: '5 min ago' },
    ],
  },
  u6: {
    id: 'u6', name: 'David M.', gender: 'Male', neighbourhood: 'Fitzroy', joinDate: 'Nov 2024',
    verified: true, level: 4, levelName: 'Community Pillar', stars: 4.7, totalReviews: 52, friends: ['u8', 'u7'],
    bio: 'Handyman & weekend cyclist. Happy to lend tools anytime 🔧',
    weeklyScore: 380, weeklyRank: 1,
    reviews: [
      { id: 'r1', reviewer: 'Mia L.', stars: 5, comment: 'David is incredibly generous with his tools and time. Top neighbour!', tags: ['Reliable', 'Generous', 'Friendly'], date: '2 days ago' },
      { id: 'r2', reviewer: 'Nara P.', stars: 5, comment: 'Super helpful, lent his drill without hesitation.', tags: ['Trustworthy', 'Fast response'], date: '1 week ago' },
      { id: 'r3', reviewer: 'Sophie K.', stars: 4, comment: 'Great experience, tools were in perfect condition.', tags: ['Reliable'], date: '3 weeks ago' },
    ],
    posts: [
      { id: 's1', type: 'supply', title: 'Offering drill + full toolset for the weekend', category: 'Lend an item', timePosted: '15 min ago' },
    ],
  },
  u7: {
    id: 'u7', name: 'Nara P.', gender: 'Female', neighbourhood: 'Brunswick', joinDate: 'Feb 2025',
    verified: false, level: 2, levelName: 'Helper', stars: 4.9, totalReviews: 27, friends: ['u6', 'u9'],
    bio: 'Food lover, always cooking too much 🍜 Come eat with me!',
    weeklyScore: 275, weeklyRank: 3,
    reviews: [
      { id: 'r1', reviewer: 'Sophie K.', stars: 5, comment: 'The food was incredible, so generous!', tags: ['Generous', 'Friendly'], date: '3 days ago' },
      { id: 'r2', reviewer: 'Mia L.', stars: 5, comment: 'Best Thai food I have ever had from a neighbour.', tags: ['Generous'], date: '1 week ago' },
    ],
    posts: [
      { id: 's2', type: 'supply', title: 'Free leftover Thai food — pad see ew & spring rolls', category: 'Share food', timePosted: '30 min ago' },
    ],
  },
  u3: {
    id: 'u3', name: 'James W.', gender: 'Male', neighbourhood: 'Richmond', joinDate: 'Dec 2024',
    verified: false, level: 1, levelName: 'Newcomer', stars: 4.9, totalReviews: 8, friends: [],
    bio: 'Always moving flats and grateful for neighbours who pitch in. Happy to return the favour!',
    weeklyScore: 95, weeklyRank: 7,
    reviews: [
      { id: 'r1', reviewer: 'Bella', stars: 5, comment: 'James was grateful and super easy to coordinate with on moving day.', tags: ['Friendly', 'Appreciative'], date: '1 week ago' },
    ],
    posts: [
      { id: 'n2', type: 'need', title: 'Help carrying boxes up 3 flights of stairs', category: 'Physical help', timePosted: '12 min ago' },
    ],
  },
  u4: {
    id: 'u4', name: 'Sophie K.', gender: 'Female', neighbourhood: 'Parkville', joinDate: 'Oct 2024',
    verified: true, level: 4, levelName: 'Community Pillar', stars: 5.0, totalReviews: 41, friends: ['u8'],
    bio: 'Avid cyclist and uni student. Always happy to lend gear to fellow riders and help out nearby.',
    weeklyScore: 162, weeklyRank: 5,
    reviews: [
      { id: 'r1', reviewer: 'Leo', stars: 5, comment: 'Sophie is incredibly reliable and always returns things in perfect condition.', tags: ['Reliable', 'Friendly'], date: '3 days ago' },
      { id: 'r2', reviewer: 'David M.', stars: 5, comment: 'Great neighbour, quick to respond and always helpful.', tags: ['Fast response', 'Trustworthy'], date: '2 weeks ago' },
    ],
    posts: [
      { id: 'n3', type: 'need', title: 'Looking to borrow a bicycle pump', category: 'Borrow an item', timePosted: '20 min ago' },
    ],
  },
  u5: {
    id: 'u5', name: 'Ryo T.', gender: 'Male', neighbourhood: 'Collingwood', joinDate: 'Jan 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.3, totalReviews: 11, friends: [],
    bio: 'CS student who sometimes gets stuck on tricky datasets and loves collaborative problem-solving.',
    weeklyScore: 78, weeklyRank: 8,
    reviews: [
      { id: 'r1', reviewer: 'Emma R.', stars: 4, comment: 'Ryo was polite and picked up the concepts quickly once we got started.', tags: ['Friendly', 'Engaged'], date: '1 week ago' },
    ],
    posts: [
      { id: 'n4', type: 'need', title: 'Need help with Python assignment', category: 'Study / Skills', timePosted: '1 hr ago' },
    ],
  },
  u8: {
    id: 'u8', name: 'Emma R.', gender: 'Female', neighbourhood: 'Carlton', joinDate: 'Sep 2024',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.8, totalReviews: 36, friends: ['u6', 'u2', 'u19', 'u11'],
    bio: '3rd year CS student. Happy to help with frontend questions and pair-programming sessions.',
    weeklyScore: 310, weeklyRank: 2,
    reviews: [
      { id: 'r1', reviewer: 'Ruby', stars: 5, comment: 'Emma explained everything clearly and was very patient throughout.', tags: ['Helpful', 'Patient', 'Friendly'], date: '4 days ago' },
      { id: 'r2', reviewer: 'Mia L.', stars: 5, comment: 'Super knowledgeable and made it easy to follow along.', tags: ['Knowledgeable', 'Friendly'], date: '1 week ago' },
      { id: 'r3', reviewer: 'Nara P.', stars: 4, comment: 'Great session, would definitely reach out again.', tags: ['Helpful'], date: '2 weeks ago' },
    ],
    posts: [
      { id: 's3', type: 'supply', title: 'Can help with React / JavaScript questions', category: 'Offer skills', timePosted: '45 min ago' },
    ],
  },
  u9: {
    id: 'u9', name: 'Lena B.', gender: 'Female', neighbourhood: 'Southbank', joinDate: 'Feb 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.7, totalReviews: 15, friends: ['u7', 'u10'],
    bio: 'Dog mum and outdoor enthusiast. My pup loves long walks and meeting friendly new people!',
    weeklyScore: 112, weeklyRank: 10,
    reviews: [
      { id: 'r1', reviewer: 'Nara P.', stars: 5, comment: 'Lena was super appreciative and her dog was adorable to walk!', tags: ['Friendly', 'Appreciative'], date: '5 days ago' },
    ],
    posts: [
      { id: 'n5', type: 'need', title: 'Need someone to walk my dog', category: 'Pet care', timePosted: '35 min ago' },
    ],
  },
  u10: {
    id: 'u10', name: 'Omar S.', gender: 'Male', neighbourhood: 'West Melbourne', joinDate: 'Mar 2025',
    verified: false, level: 1, levelName: 'Newcomer', stars: 4.5, totalReviews: 6, friends: ['u9'],
    bio: 'Recently moved apartments and passing on some beloved plants to good homes nearby.',
    weeklyScore: 55, weeklyRank: 13,
    reviews: [
      { id: 'r1', reviewer: 'Tammy', stars: 4, comment: 'Quick handover, the plants were healthy and well-cared for.', tags: ['Friendly', 'Reliable'], date: '2 days ago' },
    ],
    posts: [
      { id: 's4', type: 'supply', title: 'Giving away houseplants', category: 'Free item', timePosted: '2 hrs ago' },
    ],
  },
  u11: {
    id: 'u11', name: 'Tammy', gender: 'Female', neighbourhood: 'Carlton', joinDate: 'Apr 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.8, totalReviews: 21, friends: ['u14', 'u8'],
    bio: 'Frontend student who enjoys helping people untangle React state and UI flow problems.',
    weeklyScore: 210, weeklyRank: 5,
    reviews: [
      { id: 'r1', reviewer: 'Bella', stars: 5, comment: 'Explained React concepts clearly and was very patient.', tags: ['Helpful', 'Friendly'], date: '5 days ago' },
    ],
    posts: [
      { id: 's11', type: 'supply', title: 'Can help with React / JavaScript questions this afternoon', category: 'Offer skills', timePosted: '2 hrs ago' },
    ],
  },
  u12: {
    id: 'u12', name: 'Leo', gender: 'Male', neighbourhood: 'Parkville', joinDate: 'May 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.6, totalReviews: 12, friends: ['u20', 'u13'],
    bio: 'Usually borrowing tools for quick apartment fixes and always returns them carefully.',
    weeklyScore: 128, weeklyRank: 9,
    reviews: [
      { id: 'r1', reviewer: 'Minion', stars: 4, comment: 'Easy to coordinate with and polite in chat.', tags: ['Friendly', 'On time'], date: '1 week ago' },
    ],
    posts: [
      { id: 'n12', type: 'need', title: 'Need a screwdriver to assemble my IKEA shelf', category: 'Borrow an item', timePosted: '6 hrs ago' },
    ],
  },
  u13: {
    id: 'u13', name: 'Minion', gender: 'Male', neighbourhood: 'Fitzroy North', joinDate: 'Mar 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.7, totalReviews: 16, friends: ['u12'],
    bio: 'Often borrows basic tools for DIY projects and keeps everyone updated during returns.',
    weeklyScore: 142, weeklyRank: 8,
    reviews: [
      { id: 'r1', reviewer: 'Ethan', stars: 5, comment: 'Great communication during the whole exchange.', tags: ['Clear communication', 'Reliable'], date: '4 days ago' },
    ],
    posts: [
      { id: 'n13', type: 'need', title: 'Need a screwdriver to finish one last shelf tonight', category: 'Borrow an item', timePosted: '7 hrs ago' },
    ],
  },
  u14: {
    id: 'u14', name: 'Bella', gender: 'Female', neighbourhood: 'Melbourne CBD', joinDate: 'Jun 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.9, totalReviews: 24, friends: ['u11', 'u19'],
    bio: 'Happy to mentor people through UI polish, flows, and frontend debugging sessions.',
    weeklyScore: 240, weeklyRank: 4,
    reviews: [
      { id: 'r1', reviewer: 'Tammy', stars: 5, comment: 'Very thoughtful mentor and super practical.', tags: ['Helpful', 'Clear communication'], date: '2 days ago' },
    ],
    posts: [
      { id: 's14', type: 'supply', title: 'Offering React mentoring for UI flow and state questions', category: 'Offer skills', timePosted: '8 hrs ago' },
    ],
  },
  u15: {
    id: 'u15', name: 'Anita', gender: 'Female', neighbourhood: 'North Melbourne', joinDate: 'Feb 2025',
    verified: true, level: 2, levelName: 'Helper', stars: 4.5, totalReviews: 14, friends: ['u9'],
    bio: 'Usually careful with borrowed items, but sometimes juggles too many projects at once.',
    weeklyScore: 101, weeklyRank: 12,
    reviews: [
      { id: 'r1', reviewer: 'Leo', stars: 3, comment: 'Friendly, but the return needed extra follow-up this time.', tags: ['Friendly'], date: '1 day ago' },
    ],
    posts: [
      { id: 'n15', type: 'need', title: 'Need a screwdriver for shelf assembly, return delayed', category: 'Borrow an item', timePosted: '9 hrs ago' },
    ],
  },
  u19: {
    id: 'u19', name: 'Ruby', gender: 'Female', neighbourhood: 'Brunswick East', joinDate: 'Apr 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.8, totalReviews: 19, friends: ['u14', 'u8'],
    bio: 'Enjoys short study support sessions and always leaves thoughtful feedback after helping.',
    weeklyScore: 198, weeklyRank: 6,
    reviews: [
      { id: 'r1', reviewer: 'Emma R.', stars: 5, comment: 'The session was clear, focused, and super helpful.', tags: ['Helpful', 'Friendly'], date: '3 days ago' },
    ],
    posts: [
      { id: 's19', type: 'supply', title: 'Can help review your React component structure', category: 'Offer skills', timePosted: '14 hrs ago' },
    ],
  },
  u20: {
    id: 'u20', name: 'Ethan', gender: 'Male', neighbourhood: 'Docklands', joinDate: 'Jan 2025',
    verified: true, level: 3, levelName: 'Trusted Neighbour', stars: 4.7, totalReviews: 22, friends: ['u12'],
    bio: 'Lends tools often and prefers to resolve issues carefully if something comes back missing.',
    weeklyScore: 205, weeklyRank: 7,
    reviews: [
      { id: 'r1', reviewer: 'David M.', stars: 4, comment: 'Generally very reliable and responsive.', tags: ['Reliable', 'Fast response'], date: '2 weeks ago' },
    ],
    posts: [
      { id: 's20', type: 'supply', title: 'Offering drill + bits set for weekend projects', category: 'Lend an item', timePosted: '15 hrs ago' },
    ],
  },
};

export function addReviewToUserProfile(userId, review) {
  const targetUser = userId === mockUser.id ? mockUser : mockOtherUsers[userId];
  if (!targetUser) return null;

  const safeStars = Math.max(1, Math.min(5, review.stars || 0));
  const nextReview = {
    id: `r_${Date.now()}`,
    reviewer: review.reviewer || mockUser.name,
    stars: safeStars,
    comment: review.comment?.trim() || 'Great exchange experience.',
    tags: Array.isArray(review.tags) ? review.tags : [],
    date: review.date || 'Just now',
  };

  const previousCount = targetUser.totalReviews || targetUser.reviews?.length || 0;
  const previousAverage = Number(targetUser.stars || 0);
  const nextCount = previousCount + 1;
  const nextAverage = ((previousAverage * previousCount) + safeStars) / nextCount;

  targetUser.reviews = [nextReview, ...(targetUser.reviews || [])];
  targetUser.totalReviews = nextCount;
  targetUser.stars = Number(nextAverage.toFixed(1));

  return nextReview;
}


// Marker in the map
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
  },
  {
    id: 'n4',
    type: 'need',
    title: 'Need help with Python assignment',
    description: 'Stuck on a pandas data cleaning task. Can anyone spare 30 mins over video call?',
    category: 'Study / Skills',
    urgency: 'Low',
    distance: '1.1 km',
    timePosted: '1 hr ago',
    poster: { id: 'u5', name: 'Ryo T.', stars: 4.3, verified: true, level: 2 },
  },
  {
    id: 'n12',
    type: 'need',
    title: 'Need a screwdriver to assemble my IKEA shelf',
    description: 'Need a screwdriver to assemble my IKEA shelf. Will return right after — just need about 30 mins!',
    category: 'Borrow an item',
    urgency: 'High',
    distance: '0.5 km',
    timePosted: '6 hrs ago',
    poster: { id: 'u12', name: 'Leo', stars: 4.6, verified: true, level: 2 },
  },
  {
    id: 'n13',
    type: 'need',
    title: 'Need a screwdriver to finish one last shelf tonight',
    description: 'Just one last shelf to put together tonight. Can I borrow a Phillips screwdriver? Will keep everyone updated.',
    category: 'Borrow an item',
    urgency: 'ASAP',
    distance: '0.5 km',
    timePosted: '7 hrs ago',
    poster: { id: 'u13', name: 'Minion', stars: 4.7, verified: true, level: 2 },
  },
  {
    id: 'n15',
    type: 'need',
    title: 'Need a screwdriver for shelf assembly, return delayed',
    description: 'Need a screwdriver for shelf assembly. Might be a bit slow on the return due to classes — will keep you posted!',
    category: 'Borrow an item',
    urgency: 'Medium',
    distance: '0.6 km',
    timePosted: '9 hrs ago',
    poster: { id: 'u15', name: 'Anita', stars: 4.5, verified: true, level: 2 },
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
  },
  {
    id: 's11',
    type: 'supply',
    title: 'Can help with React / JavaScript questions this afternoon',
    description: 'Happy to help with React and JavaScript questions this afternoon. Drop me a message if you still need it!',
    category: 'Offer skills',
    availability: 'Today afternoon',
    distance: '0.2 km',
    timePosted: '5 hrs ago',
    poster: { id: 'u11', name: 'Tammy', stars: 4.8, verified: true, level: 3 },
  },
  {
    id: 's14',
    type: 'supply',
    title: 'Offering React mentoring for UI flow and state questions',
    description: 'Happy to mentor people through UI polish, flows, and frontend debugging sessions. Very practical and thorough.',
    category: 'Offer skills',
    availability: 'Today online',
    distance: '0.6 km',
    timePosted: '8 hrs ago',
    poster: { id: 'u14', name: 'Bella', stars: 4.9, verified: true, level: 3 },
  },
  {
    id: 's19',
    type: 'supply',
    title: 'Can help review your React component structure',
    description: 'Enjoy short study support sessions and always leave thoughtful feedback after helping. Feel free to reach out!',
    category: 'Offer skills',
    availability: 'This afternoon',
    distance: '0.3 km',
    timePosted: '14 hrs ago',
    poster: { id: 'u19', name: 'Ruby', stars: 4.8, verified: true, level: 3 },
  },
  {
    id: 's20',
    type: 'supply',
    title: 'Offering drill + bits set for weekend projects',
    description: 'Lends tools often and prefers to resolve issues carefully if something comes back missing. Available this weekend.',
    category: 'Lend an item',
    availability: 'This weekend',
    distance: '0.5 km',
    timePosted: '15 hrs ago',
    poster: { id: 'u20', name: 'Ethan', stars: 4.7, verified: true, level: 3 },
  },
];

// Mock data for the list in Chat tab
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

//Mock Review in the UserProfile
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


// Message in the chatbox
export const CHAT_MESSAGE_SCENARIOS = {
  c4: [
    { id: 'c4_m1', sender: 'them', text: 'Hi Alex, I saw your question about React state handling.', time: '1:10 PM', read: true },
    { id: 'c4_m2', sender: 'me', text: 'Yes please, I am stuck on how to structure the chat flow.', time: '1:12 PM', read: true },
    { id: 'c4_m3', sender: 'them', text: 'No problem. We can do a short help session later today if that works for you.', time: '1:14 PM', read: true },
    { id: 'c4_m4', sender: 'me', text: 'That would be amazing. Maybe around 4pm?', time: '1:16 PM', read: true },
    { id: 'c4_m5', sender: 'them', text: '4pm works. Once we are both ready, you can start the exchange flow in chat.', time: '1:18 PM', read: false },
  ],
  c5: [
    { id: 'c5_m1', sender: 'them', text: 'Hi, is the screwdriver still available to borrow today?', time: '9:02 AM', read: true },
    { id: 'c5_m2', sender: 'me', text: 'Yes, I can lend it to you this afternoon.', time: '9:05 AM', read: true },
    { id: 'c5_m3', sender: 'them', text: 'Perfect. I only need it for one shelf, so I should be quick.', time: '9:06 AM', read: true },
    { id: 'c5_m4', sender: 'me', text: 'Sounds good. Let us meet downstairs at 2pm.', time: '9:08 AM', read: true },
    { id: 'c5_m5', sender: 'them', text: 'Great, message me once you are there and I will come down.', time: '9:09 AM', read: false },
  ],
  c6: [
    { id: 'c6_m1', sender: 'them', text: 'Thanks again for lending the screwdriver yesterday.', time: '10:15 AM', read: true },
    { id: 'c6_m2', sender: 'me', text: 'No worries. The return timer should already be running in the app.', time: '10:18 AM', read: true },
    { id: 'c6_m3', sender: 'them', text: 'Yes, I can see it. I have finished the shelf and will return it this evening.', time: '10:20 AM', read: true },
    { id: 'c6_m4', sender: 'me', text: 'Perfect. Just leave it with the concierge and send me a message after.', time: '10:22 AM', read: true },
    { id: 'c6_m5', sender: 'them', text: 'Done, I left it there a minute ago. Could you confirm when you pick it up?', time: '10:29 AM', read: false },
  ],
  c7: [
    { id: 'c7_m1', sender: 'them', text: 'Hi Alex, I am ready to go through your React component now.', time: '3:00 PM', read: true },
    { id: 'c7_m2', sender: 'me', text: 'Amazing, thank you. I mainly need help with the chat and exchange states.', time: '3:02 PM', read: true },
    { id: 'c7_m3', sender: 'them', text: 'Let us start with the flow first, then we can polish the UI text after.', time: '3:04 PM', read: true },
    { id: 'c7_m4', sender: 'me', text: 'Perfect. I have my simulator open so I can test while we talk.', time: '3:06 PM', read: true },
    { id: 'c7_m5', sender: 'them', text: 'Great, the task has started on my side. We should be able to finish within the next two hours.', time: '3:08 PM', read: false },
  ],
  c8: [
    { id: 'c8_m1', sender: 'them', text: 'Hi Alex, is the screwdriver still available to borrow for my shelf build?', time: '09 Apr, 4:55 PM', read: true },
    { id: 'c8_m2', sender: 'me', text: 'Yes, that works. I can lend it to you this evening if you still need it.', time: '09 Apr, 5:08 PM', read: true },
    { id: 'c8_m3', sender: 'them', text: 'Perfect, thank you. I only need it overnight and can return it tomorrow.', time: '09 Apr, 5:12 PM', read: true },
    { id: 'c8_m4', sender: 'me', text: 'No problem. Let us meet downstairs at 8:30 and we can start the exchange in the app.', time: '09 Apr, 5:16 PM', read: true },
    { id: 'c8_m5', sender: 'them', text: 'I have picked it up, thanks again. I will message you as soon as I am done with the shelf.', time: '10 Apr, 9:05 AM', read: true },
    { id: 'c8_m6', sender: 'me', text: 'Sounds good. Please make sure it is returned before the deadline shown in chat.', time: '10 Apr, 9:18 AM', read: true },
    { id: 'c8_m7', sender: 'them', text: 'I am running behind because the build took longer than expected. I may need a little more time.', time: '12 Apr, 8:40 PM', read: true },
    { id: 'c8_m8', sender: 'me', text: 'Please keep me updated. Once the deadline passes, the exchange will show as overdue until I can confirm the return.', time: '12 Apr, 8:52 PM', read: true },
    { id: 'c8_m9', sender: 'them', text: 'Hi Alex, sorry about the late return. I dropped the screwdriver back this morning, but I think you were out.', time: '13 Apr, 10:05 AM', read: true },
    { id: 'c8_m10', sender: 'me', text: 'Okay, I will check the mailbox area tonight and confirm once I see it.', time: '13 Apr, 10:18 AM', read: true },
    { id: 'c8_m11', sender: 'them', text: 'Thank you. I really do not want this to stay overdue longer than necessary.', time: '13 Apr, 10:22 AM', read: false },
  ],
  c13: [
    { id: 'c13_m1', sender: 'them', text: 'Thanks again for the React mentoring session.', time: '6:20 PM', read: true },
    { id: 'c13_m2', sender: 'me', text: 'You did great. Your component structure is much cleaner now.', time: '6:22 PM', read: true },
    { id: 'c13_m3', sender: 'them', text: 'I also understand the exchange states a lot better now.', time: '6:24 PM', read: true },
    { id: 'c13_m4', sender: 'me', text: 'Glad to hear that. I have marked the task completed on my side.', time: '6:25 PM', read: true },
    { id: 'c13_m5', sender: 'them', text: 'Perfect, I can see the review section now. I will leave feedback in a moment.', time: '6:27 PM', read: false },
  ],
  c14: [
    { id: 'c14_m1', sender: 'them', text: 'Hi Alex, I need to flag an issue with the drill return.', time: '11:40 AM', read: true },
    { id: 'c14_m2', sender: 'me', text: 'Okay, tell me what happened and we can sort it out here.', time: '11:42 AM', read: true },
    { id: 'c14_m3', sender: 'them', text: 'The case came back, but one of the drill bits is missing.', time: '11:44 AM', read: true },
    { id: 'c14_m4', sender: 'me', text: 'I understand. I have paused completion for now until we confirm everything.', time: '11:46 AM', read: true },
    { id: 'c14_m5', sender: 'them', text: 'That is fair. Let us keep it disputed until I check my bag again tonight.', time: '11:49 AM', read: false },
  ],
};
