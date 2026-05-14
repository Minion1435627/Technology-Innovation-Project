import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchFriends, addFriend as dbAddFriend, removeFriend as dbRemoveFriend } from '../lib/db';
import { useAuth } from './AuthContext';

const FriendsContext = createContext(null);

export function FriendsProvider({ children }) {
  const [friends, setFriends] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    fetchFriends(user.id).then(rows => {
      setFriends(rows.map(r => r.friend).filter(Boolean));
    });
  }, [user?.id]);

  const friendIds = friends.map(f => f.id);

  const addFriend = async (id, userObj) => {
    if (friendIds.includes(id)) return;
    if (user?.id) await dbAddFriend(user.id, id);
    setFriends(prev => [...prev, userObj ?? { id }]);
  };

  const removeFriend = async (id) => {
    if (user?.id) await dbRemoveFriend(user.id, id);
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  const isFriend = (id) => friendIds.includes(id);

  return (
    <FriendsContext.Provider value={{ friends, friendIds, addFriend, removeFriend, isFriend }}>
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  return useContext(FriendsContext);
}
