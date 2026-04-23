import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchChats, fetchTransactionByChat, fetchTransactionsByChat } from '../lib/db';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const STATUS_LABEL = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', overdue: 'Overdue', disputed: 'Disputed' };

function pendingRoleFromTx(tx) {
  if (!tx?.pending_by_user_id) return null;
  if (tx.pending_by_user_id === tx.provider_id) return 'provider';
  if (tx.pending_by_user_id === tx.requester_id) return 'requester';
  return null;
}

function mapTxToExchange(tx, userId) {
  const myRole = tx.provider_id === userId ? 'provider' : 'requester';
  const txType = tx.type ?? 'borrow';
  const state = tx.status ?? 'pending';
  return {
    transactionId: tx.id,
    state,
    type: txType,
    myRole,
    pendingBy: pendingRoleFromTx(tx),
    pendingByUserId: tx.pending_by_user_id ?? null,
    typeLabel: txType === 'service' ? 'Help / service' : 'Borrowed item',
    statusLabel: STATUS_LABEL[state] ?? state,
    countdownText: tx.agreed_return_date
      ? `Return: ${new Date(tx.agreed_return_date).toLocaleDateString()}`
      : '',
    summaryText: tx.item ?? '',
    actionLabel: 'View Exchange',
  };
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const { user } = useAuth();

  const getChatDedupeKey = (row) => {
    const userId = row.user?.id ? String(row.user.id) : '';
    const userName = row.user?.name ? String(row.user.name).trim().toLowerCase() : '';
    return userId || userName || row.id;
  };

  const dedupeChatsByUser = (rows) => {
    const byUser = new Map();
    rows.forEach(row => {
      const key = getChatDedupeKey(row);
      if (!key) return;
      const existing = byUser.get(key);
      if (!existing) {
        byUser.set(key, row);
        return;
      }

      const existingTime = existing.rawLastMessageAt ? new Date(existing.rawLastMessageAt).getTime() : 0;
      const nextTime = row.rawLastMessageAt ? new Date(row.rawLastMessageAt).getTime() : 0;
      if (nextTime >= existingTime) {
        byUser.set(key, row);
      }
    });
    return Array.from(byUser.values());
  };

  useEffect(() => {
    if (!user?.id) return;
    fetchChats(user.id).then(async rows => {
      const mapped = await Promise.all(rows.map(async row => {
        const other = row.user1_id === user.id ? row.user2 : row.user1;
        const tx = await fetchTransactionByChat(row.id);
        const txRows = await fetchTransactionsByChat(row.id);
        const latestTask = txRows[0] ?? null;
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
          rawLastMessageAt: row.last_message_at ?? null,
          time: row.last_message_at
            ? new Date(row.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          postId: latestTask?.post?.id ?? row.post?.id ?? row.post_id ?? null,
          postType: latestTask?.post?.type ?? row.post?.type ?? null,
          postOwnerId: latestTask?.post?.user_id ?? row.post?.user_id ?? null,
          postCategory: latestTask?.post?.category ?? row.post?.category ?? null,
          postTitle: latestTask?.post?.title ?? row.post?.title ?? row.post_title ?? 'Direct message',
          unread: 0,
          exchange,
        };
      }));
      setChats(dedupeChatsByUser(mapped));
    });
  }, [user?.id]);

  // Refresh exchange status when a transaction is inserted or updated
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('transactions_watch')
      .on('postgres_changes', {
        event: '*',
        schema: 'HelpMate',
        table: 'transactions',
      }, (payload) => {
        const chatId = payload?.new?.chat_id ?? payload?.old?.chat_id;
        if (!chatId) return;
        fetchTransactionByChat(chatId).then(fresh => {
          setChats(prev => dedupeChatsByUser(prev.map(c =>
            c.id === chatId
              ? { ...c, exchange: fresh ? mapTxToExchange(fresh, user.id) : null }
              : c
          )));
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user?.id]);

  const addChat = (newChat) => {
    setChats(prev => {
      if (prev.some(c => c.user?.id === newChat.user?.id)) return prev;
      return dedupeChatsByUser([newChat, ...prev]);
    });
  };

  const updateLastMessage = (chatId, text, time) => {
    setChats(prev =>
      prev.map(c => c.id === chatId ? { ...c, lastMessage: text, time, rawLastMessageAt: new Date().toISOString() } : c)
    );
  };

  const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const refreshChatExchange = async (chatId, postId = null) => {
    if (!user?.id || !chatId || !isUuid(chatId)) return;
    const tx = await fetchTransactionByChat(chatId, postId);
    setChats(prev => prev.map(c =>
      c.id === chatId
        ? { ...c, exchange: tx ? mapTxToExchange(tx, user.id) : null }
        : c
    ));
  };

  return (
    <ChatContext.Provider value={{ chats, addChat, updateLastMessage, refreshChatExchange }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChats() {
  return useContext(ChatContext);
}