import React, { createContext, useContext, useState, useEffect } from 'react';
import { createPost, deletePost, fetchNearbyPosts } from '../lib/db';
import { useAuth } from './AuthContext';

const XP_LEVELS = [
  { level: 1, xp: 0 },
  { level: 2, xp: 100 },
  { level: 3, xp: 200 },
  { level: 4, xp: 500 },
  { level: 5, xp: 1000 },
];
const getLevelFromXp = (xp) =>
  XP_LEVELS.reduce((lvl, rule) => (xp ?? 0) >= rule.xp ? rule.level : lvl, 1);

const PostsContext = createContext(null);

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  // Load all posts from database
  useEffect(() => {
    const loadPosts = async () => {
      const dbPosts = await fetchNearbyPosts();
      const mapped = dbPosts.map(p => ({
        id:           p.id,
        type:         p.type,
        latitude:     parseFloat(p.lat),
        longitude:    parseFloat(p.lng),
        title:        p.title,
        description:  p.description,
        category:     p.category,
        urgency:      p.urgency,
        availability: p.availability,
        timePosted:   new Date(p.created_at).toLocaleDateString(),
        user_id:      p.user_id,
        poster: {
          id:       p.users?.id,
          name:     p.users?.name,
          stars:    p.users?.stars,
          level:    getLevelFromXp(p.users?.xp ?? p.users?.level),
          verified: p.users?.verified,
          gender:   p.users?.gender,
        },
        fromDB: true,
      }));
      setPosts(mapped);
    };
    loadPosts();
  }, []);

  const addPost = async (newPost) => {
    // Always show immediately in UI
    setPosts(prev => [newPost, ...prev]);

    // If it has lat/lng and user_id, save to database
    if (newPost.latitude && newPost.user_id) {
      const saved = await createPost({
        user_id:      newPost.user_id,
        type:         newPost.type,
        title:        newPost.title,
        description:  newPost.description,
        category:     newPost.category,
        urgency:      newPost.urgency ?? null,
        availability: newPost.availability ?? null,
        lat:          newPost.latitude,
        lng:          newPost.longitude,
      });
      // Replace temp post with DB version (has real UUID)
      if (saved) {
        setPosts(prev => prev.map(p =>
          p.id === newPost.id ? { ...p, id: saved.id, fromDB: true } : p
        ));
      }
    }
  };

  const removePost = async (postId) => {
    const post = posts.find(p => p.id === postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    // Only soft-delete in DB if it came from there AND belongs to current user
    if (post?.fromDB && post?.user_id === user?.id) {
      await deletePost(postId);
    }
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
