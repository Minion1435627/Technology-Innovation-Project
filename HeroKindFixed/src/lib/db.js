import { supabase } from './supabase';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) console.warn('fetchUserProfile:', error.message);
  return data;
}

export async function updateUserProfile(userId, fields) {
  const { error } = await supabase
    .from('users')
    .update(fields)
    .eq('id', userId);
  if (error) console.error('updateUserProfile:', error.message);
  return !error;
}

// ─── Posts ────────────────────────────────────────────────────────────────────

export async function fetchNearbyPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select(`*, users(id, name, stars, level, verified, gender)`)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) console.error('fetchNearbyPosts:', error.message);
  return data ?? [];
}

export async function createPost(post) {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();
  if (error) console.error('createPost:', error.message);
  return data;
}

export async function deletePost(postId) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);
  if (error) console.warn('deletePost:', error.message);
  return !error;
}

// ─── Friendships ──────────────────────────────────────────────────────────────

export async function fetchFriends(userId) {
  const { data, error } = await supabase
    .from('friendships')
    .select(`*, friend:friend_id(id, name, stars, level, neighbourhood)`)
    .eq('user_id', userId)
    .eq('status', 'accepted');
  if (error) console.error('fetchFriends:', error.message);
  return data ?? [];
}

export async function addFriend(userId, friendId) {
  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: userId, friend_id: friendId, status: 'accepted' });
  if (error) console.error('addFriend:', error.message);
  return !error;
}

export async function removeFriend(userId, friendId) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendId);
  if (error) console.error('removeFriend:', error.message);
  return !error;
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function submitReview({ reviewerId, revieweeId, transactionId, stars, comment, tags }) {
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({ reviewer_id: reviewerId, reviewee_id: revieweeId, transaction_id: transactionId, stars, comment })
    .select()
    .single();
  if (error) { console.error('submitReview:', error.message); return null; }

  if (tags?.length) {
    const tagRows = await Promise.all(
      tags.map(label => supabase.from('review_tags').select('id').eq('label', label).maybeSingle())
    );
    const tagInserts = tagRows
      .map(r => r.data?.id)
      .filter(Boolean)
      .map(tagId => ({ review_id: review.id, tag_id: tagId }));
    if (tagInserts.length) await supabase.from('review_selected_tags').insert(tagInserts);
  }

  // Recalculate reviewee's star rating
  const { data: avg } = await supabase
    .from('reviews')
    .select('stars')
    .eq('reviewee_id', revieweeId);
  if (avg?.length) {
    const newStars = avg.reduce((sum, r) => sum + r.stars, 0) / avg.length;
    await supabase.from('users').update({ stars: Math.round(newStars * 10) / 10 }).eq('id', revieweeId);
  }

  return review;
}

export async function fetchUserAchievements(userId) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select('achievement_key, unlocked_at')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });
  if (error) console.error('fetchUserAchievements:', error.message);
  return data ?? [];
}

export async function fetchUserReviews(userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`*, reviewer:reviewer_id(name), review_selected_tags(tag_id, review_tags(label))`)
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('fetchUserReviews:', error.message);
  return data ?? [];
}

// ─── Chats ────────────────────────────────────────────────────────────────────

export async function createChat(user1Id, user2Id) {
  // Return existing chat between these two users if one already exists
  const { data: existing } = await supabase
    .from('chats')
    .select('id')
    .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from('chats')
    .insert({ user1_id: user1Id, user2_id: user2Id })
    .select()
    .single();
  if (error) console.error('createChat:', error.message);
  return data;
}

export async function fetchChats(userId) {
  const { data, error } = await supabase
    .from('chats')
    .select(`*, user1:user1_id(id, name, stars, gender), user2:user2_id(id, name, stars, gender)`)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });
  if (error) console.error('fetchChats:', error.message);
  return data ?? [];
}

export async function fetchTransactionById(txId) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`*, provider:provider_id(id, name, stars, level), requester:requester_id(id, name, stars, level)`)
    .eq('id', txId)
    .maybeSingle();
  if (error) console.warn('fetchTransactionById:', error.message);
  return data ?? null;
}

export async function fetchTransactionByChat(chatId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, status, type, item, provider_id, requester_id, agreed_return_date')
    .eq('chat_id', chatId)
    .limit(1)
    .maybeSingle();
  if (error) console.warn('fetchTransactionByChat:', error.message);
  return data ?? null;
}

export async function fetchMessages(chatId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });
  if (error) console.error('fetchMessages:', error.message);
  return data ?? [];
}

export async function sendMessage(chatId, senderId, text) {
  const { error: msgError } = await supabase
    .from('messages')
    .insert({ chat_id: chatId, sender_id: senderId, text });

  // Update last_message preview on the chat
  await supabase
    .from('chats')
    .update({ last_message: text, last_message_at: new Date().toISOString() })
    .eq('id', chatId);

  if (msgError) console.error('sendMessage:', msgError.message);
  return !msgError;
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, level, xp, stars, weekly_score, neighbourhood')
    .order('weekly_score', { ascending: false })
    .limit(20);
  if (error) console.warn('fetchLeaderboard:', error.message);
  return data ?? [];
}

export async function createTransaction(tx) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(tx)
    .select()
    .single();
  if (error) console.error('createTransaction:', error.message);
  return data;
}

export async function fetchTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`*, provider:provider_id(id, name, stars, level), requester:requester_id(id, name, stars, level)`)
    .or(`provider_id.eq.${userId},requester_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) console.error('fetchTransactions:', error.message);
  return data ?? [];
}

export async function updateTransactionStatus(transactionId, status) {
  const fields = { status };
  if (status === 'completed') fields.completed_date = new Date().toISOString();
  const { error } = await supabase
    .from('transactions')
    .update(fields)
    .eq('id', transactionId);
  if (error) console.error('updateTransactionStatus:', error.message);

  // Deactivate the linked post when transaction completes
  if (!error && status === 'completed') {
    const { data: tx } = await supabase
      .from('transactions')
      .select('chat_id')
      .eq('id', transactionId)
      .maybeSingle();
    if (tx?.chat_id) {
      const { data: chat } = await supabase
        .from('chats')
        .select('post_title')
        .eq('id', tx.chat_id)
        .maybeSingle();
      if (chat?.post_title) {
        await supabase
          .from('posts')
          .update({ is_active: false })
          .ilike('title', chat.post_title);
      }
    }
  }

  return !error;
}
