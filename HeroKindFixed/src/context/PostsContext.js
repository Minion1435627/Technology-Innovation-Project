import React, { createContext, useContext, useState, useEffect } from 'react';

// Context is for shared live Context is for shared live state. 
// They work together — the context just seeds itself from mockData as the starting value.                                                                           
const INITIAL_PINS = [
  { id: 'n1', type: 'need',   latitude: -37.8130, longitude: 144.9420, title: 'Need a screwdriver for IKEA shelf',       poster: { id: 'u2', name: 'Mia L.',    level: 2, gender: 'Female',     stars: 4.6 }, urgency: 'High',   category: 'Borrow an item',  description: 'Moving into a new place — need a Phillips screwdriver for about 30 mins. Happy to come to you!', timePosted: '5 min ago' },
  { id: 'n2', type: 'need',   latitude: -37.8160, longitude: 144.9450, title: 'Help carrying boxes up 3 flights',         poster: { id: 'u3', name: 'James W.',  level: 1, gender: 'Male',       stars: 4.9 }, urgency: 'ASAP',  category: 'Physical help',   description: 'Moving day! Need 2 people for about an hour. Will shout pizza and drinks.', timePosted: '12 min ago' },
  { id: 'n3', type: 'need',   latitude: -37.8115, longitude: 144.9370, title: 'Borrow a bicycle pump',                    poster: { id: 'u4', name: 'Sophie K.', level: 4, gender: 'Female',     stars: 5.0 }, urgency: 'Medium', category: 'Borrow an item',  description: 'Flat tyre before uni — just need a pump for a minute.', timePosted: '20 min ago' },
  { id: 'n4', type: 'need',   latitude: -37.8175, longitude: 144.9340, title: 'Help with Python assignment',               poster: { id: 'u5', name: 'Ryo T.',    level: 2, gender: 'Male',       stars: 4.3 }, urgency: 'Low',   category: 'Study / Skills',  description: 'Stuck on a pandas data cleaning task. Can anyone spare 30 mins over video call?', timePosted: '1 hr ago' },
  { id: 'n5', type: 'need',   latitude: -37.8095, longitude: 144.9435, title: 'Need someone to walk my dog',               poster: { id: 'u9', name: 'Lena B.',   level: 2, gender: 'Female',     stars: 4.7 }, urgency: 'Medium', category: 'Pet care',        description: 'Away for the afternoon, dog needs a 30-min walk around the waterfront.', timePosted: '35 min ago' },
  { id: 's1', type: 'supply', latitude: -37.8138, longitude: 144.9408, title: 'Offering drill + full toolset',             poster: { id: 'u6', name: 'David M.', level: 3, gender: 'Male',       stars: 4.7 }, category: 'Lend an item',    description: 'Happy to lend my drill, screwdrivers, and hammer. Available Sat–Sun. Please return Sunday night.', availability: 'Sat–Sun this weekend', timePosted: '15 min ago' },
  { id: 's2', type: 'supply', latitude: -37.8155, longitude: 144.9385, title: 'Free leftover Thai food',                   poster: { id: 'u7', name: 'Nara P.',  level: 2, gender: 'Female',     stars: 4.9 }, category: 'Share food',      description: 'Made too much dinner. Come grab some before 9pm tonight!', availability: 'Tonight until 9 PM', timePosted: '30 min ago' },
  { id: 's3', type: 'supply', latitude: -37.8120, longitude: 144.9460, title: 'Can help with React / JS questions',        poster: { id: 'u8', name: 'Emma R.',  level: 3, gender: 'Female',     stars: 4.8 }, category: 'Offer skills',    description: '3rd year CS student. Happy to help with frontend questions this afternoon.', availability: 'Today 2–6 PM', timePosted: '45 min ago' },
  { id: 's4', type: 'supply', latitude: -37.8108, longitude: 144.9395, title: 'Giving away houseplants',                   poster: { id: 'u10', name: 'Omar S.', level: 1, gender: 'Male',       stars: 4.5 }, category: 'Free item',       description: "Moving out and can't take my plants. Free to good homes — pothos, spider plant, snake plant.", availability: 'This weekend', timePosted: '2 hrs ago' },
  { id: 'f1', type: 'friend', latitude: -37.8148, longitude: 144.9428, title: 'Emma R. is nearby',                         poster: { id: 'u8', name: 'Emma R.',  level: 3, gender: 'Female',     stars: 4.8 }, category: 'Friend',          description: 'Emma is a trusted neighbour — she has helped 12 people this month!', timePosted: 'online now' },
  { id: 'f2', type: 'friend', latitude: -37.8125, longitude: 144.9352, title: 'David M. is nearby',                        poster: { id: 'u6', name: 'David M.', level: 4, gender: 'Male',       stars: 4.7 }, category: 'Friend',          description: 'David is a Community Pillar — top helper this week with 380 pts!', timePosted: '10 min ago' },
];

const PostsContext = createContext(null);

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState(INITIAL_PINS);

  const addPost = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const removePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  // Prune expired posts every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setPosts(prev => prev.filter(p => !p.expiresAt || p.expiresAt > now));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PostsContext.Provider value={{ posts, addPost, removePost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  return useContext(PostsContext);
}
