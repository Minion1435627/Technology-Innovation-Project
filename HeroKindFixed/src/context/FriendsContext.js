import React, { createContext, useContext, useState } from 'react';

const INITIAL_FRIEND_IDS = ['u6', 'u7', 'u2', 'u8'];

const FriendsContext = createContext(null);

export function FriendsProvider({ children }) {
  const [friendIds, setFriendIds] = useState(INITIAL_FRIEND_IDS);

  const addFriend = (id) => setFriendIds(prev => prev.includes(id) ? prev : [...prev, id]);
  const removeFriend = (id) => setFriendIds(prev => prev.filter(f => f !== id));
  const isFriend = (id) => friendIds.includes(id);

  return (
    <FriendsContext.Provider value={{ friendIds, addFriend, removeFriend, isFriend }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  return useContext(FriendsContext);
}
