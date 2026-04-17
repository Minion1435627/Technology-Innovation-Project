import React, { createContext, useContext, useState } from 'react';
import { mockChats } from '../data/mockData';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState(mockChats);

  // Add a brand-new chat to the top of the list.
  // Silently skips if a chat with the same user already exists.
  const addChat = (newChat) => {
    setChats(prev => {
      if (prev.some(c => c.user.id === newChat.user.id)) return prev;
      return [newChat, ...prev];
    });
  };

  // Update the last-message preview and timestamp shown in the list.
  const updateLastMessage = (chatId, text, time) => {
    setChats(prev =>
      prev.map(c => c.id === chatId ? { ...c, lastMessage: text, time } : c)
    );
  };

  return (
    <ChatContext.Provider value={{ chats, addChat, updateLastMessage }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChats() {
  return useContext(ChatContext);
}
