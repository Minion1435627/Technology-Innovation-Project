import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchChats, fetchTransactionByChat } from '../lib/db';
import { useAuth } from './AuthContext';

const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', overdue: 'Overdue', disputed: 'Disputed' };

function mapTxToExchange(tx, userId) {
  const myRole = tx.provider_id === userId ? 'provider' : 'requester';
  const txType = tx.type ?? 'borrow';
  const state = tx.status ?? 'pending';
  return {
    state,
    type: txType,
    myRole,
    typeLabel: txType === 'service' ? 'Help / service' : 'Borrowed item',
    statusLabel: STATUS_LABEL[state] ?? state,
    countdownText: tx.agreed_return_date
      ? `Return: ${new Date(tx.agreed_return_date).toLocaleDateString()}`
      : '',
    summaryText: tx.title ?? '',
    actionLabel: 'View Exchange',
  };
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    fetchChats(user.id).then(async rows => {
      const mapped = await Promise.all(rows.map(async row => {
        const other = row.user1_id === user.id ? row.user2 : row.user1;
        const tx = await fetchTransactionByChat(row.id);
        const exchange = tx ? mapTxToExchange(tx, user.id) : null;
        return {
          id: row.id,
          user: {
            id: other?.id,
            name: other?.name,
            stars: other?.stars,
            gender: other?.gender,
          },
          lastMessage: row.last_message ?? '',
          time: row.last_message_at
            ? new Date(row.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          postTitle: row.post_title ?? 'Direct message',
          unread: 0,
          exchange,
        };
      }));
      setChats(mapped);
    });
  }, [user?.id]);

  const addChat = (newChat) => {
    setChats(prev => {
      if (prev.some(c => c.user?.id === newChat.user?.id)) return prev;
      return [newChat, ...prev];
    });
  };

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
