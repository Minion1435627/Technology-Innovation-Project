import { supabase } from './supabase';

const AVATAR_BUCKET = 'avatars';

export function getAvatarPublicUrl(storagePath) {
  if (!storagePath) return null;
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl ?? null;
}

export async function copyRemoteAvatarToStorage(userId, remoteUrl, filename = `avatar-${Date.now()}.glb`) {
  if (!userId) throw new Error('Missing user id for avatar storage.');
  if (!remoteUrl) throw new Error('Missing remote avatar URL.');

  const response = await fetch(remoteUrl);
  if (!response.ok) {
    throw new Error(`Avatar download failed (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const storagePath = `users/${userId}/${filename}`;

  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: 'model/gltf-binary',
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase storage upload failed: ${error.message}`);
  }

  return {
    storagePath,
    publicUrl: getAvatarPublicUrl(storagePath),
  };
}

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

const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export async function createReview({ transactionId, reviewerId, revieweeId, stars, comment, tagLabels = [] }) {
  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      transaction_id: isUuid(transactionId) ? transactionId : null,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      stars,
      comment: comment?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error('createReview:', error.message);
    return null;
  }

  const cleanedLabels = tagLabels.filter(Boolean);
  if (cleanedLabels.length) {
    const { data: tags, error: tagsError } = await supabase
      .from('review_tags')
      .select('id, label')
      .in('label', cleanedLabels);

    if (tagsError) {
      console.error('createReview tags lookup:', tagsError.message);
      return review;
    }

    const selectedRows = (tags ?? []).map(tag => ({
      review_id: review.id,
      tag_id: tag.id,
    }));

    if (selectedRows.length) {
      const { error: selectedError } = await supabase
        .from('review_selected_tags')
        .insert(selectedRows);

      if (selectedError) {
        console.error('createReview selected tags:', selectedError.message);
      }
    }
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

function normalizeChatParticipants(user1Id, user2Id) {
  return [user1Id, user2Id].sort((a, b) => String(a).localeCompare(String(b)));
}

export async function createChat(user1Id, user2Id, postId = null) {
  const [normalizedUser1Id, normalizedUser2Id] = normalizeChatParticipants(user1Id, user2Id);
  const { data: existing } = await supabase
    .from('chats')
    .select('id, post_id')
    .eq('user1_id', normalizedUser1Id)
    .eq('user2_id', normalizedUser2Id)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from('chats')
    .insert({ user1_id: normalizedUser1Id, user2_id: normalizedUser2Id })
    .select()
    .single();
  if (error) console.error('createChat:', error.message);
  return data;
}

export async function createChatWithPost(user1Id, user2Id, postId = null) {
  const existing = await createChat(user1Id, user2Id, postId);
  if (existing?.id && postId) {
    await supabase
      .from('chats')
      .update({ post_id: postId })
      .eq('id', existing.id)
      .is('post_id', null);
  }
  return existing;
}

export async function fetchChats(userId) {
  const { data, error } = await supabase
    .from('chats')
    .select(`*, user1:user1_id(id, name, stars, gender), user2:user2_id(id, name, stars, gender), post:post_id(id, user_id, type, title, category)`)
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


const ACTIVE_TRANSACTION_STATUSES = ['pending', 'in_progress', 'overdue', 'disputed'];

export async function fetchTransactionByChat(chatId, postId = null) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, post_id, status, type, item, provider_id, requester_id, handover_date, agreed_return_date, completed_date, pending_by_user_id, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false });
  if (error) console.warn('fetchTransactionByChat:', error.message);
  const rows = data ?? [];
  if (!rows.length) return null;

  if (postId) {
    const matchingPostRows = rows.filter(row => row.post_id === postId);
    const matchingActive = matchingPostRows.find(row => ACTIVE_TRANSACTION_STATUSES.includes(row.status));
    if (matchingActive) return matchingActive;
    if (matchingPostRows.length) return matchingPostRows[0];

    // If this specific post has never started and there is no other active
    // exchange bound to this post, treat it as "no exchange yet" so the UI can show Start.
    return null;
  }

  return rows.find(row => ACTIVE_TRANSACTION_STATUSES.includes(row.status)) ?? rows[0] ?? null;
}

export async function fetchTransactionsByChat(chatId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, post_id, status, type, item, provider_id, requester_id, handover_date, agreed_return_date, completed_date, pending_by_user_id, created_at, post:post_id(id, title, type, category, user_id)')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: false });
  if (error) console.warn('fetchTransactionsByChat:', error.message);
  return data ?? [];
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

export async function fetchUnreadMessageCounts(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('chat_id')
    .neq('sender_id', userId)
    .is('read_at', null);

  if (error) {
    console.error('fetchUnreadMessageCounts:', error.message);
    return {};
  }

  return (data ?? []).reduce((acc, row) => {
    if (!row?.chat_id) return acc;
    acc[row.chat_id] = (acc[row.chat_id] ?? 0) + 1;
    return acc;
  }, {});
}

export async function markMessagesRead(chatId, userId) {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('chat_id', chatId)
    .neq('sender_id', userId)
    .is('read_at', null);

  if (error) console.error('markMessagesRead:', error.message);
  return !error;
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

// ─── Notifications ───────────────────────────────────────────────────────────

export async function fetchUnreadNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('fetchUnreadNotifications:', error.message);
    return [];
  }
  return data ?? [];
}

export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) console.error('markNotificationRead:', error.message);
  return !error;
}

export async function createNotification({
  userId,
  type,
  title,
  body,
  actorId = null,
  referenceId = null,
  referenceType = null,
}) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      body,
      actor_id: actorId,
      reference_id: referenceId,
      reference_type: referenceType,
      is_read: false,
    });

  if (error) {
    console.error('createNotification:', error.message);
    return { ok: false, errorMessage: error.message };
  }

  return { ok: true, errorMessage: null };
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
  if (tx.chat_id) {
    const { data: existing, error: existingError } = await supabase
      .from('transactions')
      .select('id, post_id, status, type, item, provider_id, requester_id, agreed_return_date, pending_by_user_id')
      .eq('chat_id', tx.chat_id)
      .eq('post_id', tx.post_id ?? null)
      .in('status', ['pending', 'in_progress', 'overdue', 'disputed'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) console.warn('createTransaction lookup:', existingError.message);
    if (existing) return existing;
  }

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
  return !error;
}

export async function updateTransaction(transactionId, fields) {
  const { error } = await supabase
    .from('transactions')
    .update(fields)
    .eq('id', transactionId);
  if (error) console.error('updateTransaction:', error.message);
  return !error;
}

export async function deleteTransaction(transactionId) {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .select('id');
  if (error) console.error('deleteTransaction:', error.message);
  return !error && Array.isArray(data) && data.length > 0;
}

export async function deletePendingTransactionById(transactionId) {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('status', 'pending')
    .select('id');
  if (error) console.error('deletePendingTransactionById:', error.message);
  return !error && Array.isArray(data) && data.length > 0;
}

export async function deletePendingTransactionsByChat(chatId, pendingByUserId) {
  let query = supabase
    .from('transactions')
    .delete()
    .eq('chat_id', chatId)
    .eq('status', 'pending')
    .select('id');

  if (pendingByUserId) {
    query = query.eq('pending_by_user_id', pendingByUserId);
  }

  const { data, error } = await query;
  if (error) console.error('deletePendingTransactionsByChat:', error.message);
  return !error && Array.isArray(data) && data.length > 0;
}

// ─── Task Progress ────────────────────────────────────────────────────────────

export async function fetchTaskProgress(userId) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday).toISOString();

  const [
    completedToday,
    completedWeek,
    lentWeek,
    reviewsGivenToday,
    reviewsReceivedWeek,
    messagesToday,
    postsToday,
    postsWeek,
    startedWeek,
  ] = await Promise.all([
    supabase.from('transactions').select('id', { count: 'exact', head: true })
      .or(`provider_id.eq.${userId},requester_id.eq.${userId}`)
      .eq('status', 'completed').gte('completed_date', todayStart),
    supabase.from('transactions').select('id', { count: 'exact', head: true })
      .or(`provider_id.eq.${userId},requester_id.eq.${userId}`)
      .eq('status', 'completed').gte('completed_date', weekStart),
    supabase.from('transactions').select('id', { count: 'exact', head: true })
      .eq('provider_id', userId).eq('type', 'borrow')
      .eq('status', 'completed').gte('completed_date', weekStart),
    supabase.from('reviews').select('id', { count: 'exact', head: true })
      .eq('reviewer_id', userId).gte('created_at', todayStart),
    supabase.from('reviews').select('id', { count: 'exact', head: true })
      .eq('reviewee_id', userId).gte('created_at', weekStart),
    supabase.from('messages').select('id', { count: 'exact', head: true })
      .eq('sender_id', userId).gte('created_at', todayStart),
    supabase.from('posts').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('created_at', todayStart),
    supabase.from('posts').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('created_at', weekStart),
    supabase.from('transactions').select('id', { count: 'exact', head: true })
      .or(`provider_id.eq.${userId},requester_id.eq.${userId}`)
      .gte('created_at', weekStart),
  ]);

  return {
    completedToday:      completedToday.count      ?? 0,
    completedWeek:       completedWeek.count        ?? 0,
    lentWeek:            lentWeek.count             ?? 0,
    reviewsGivenToday:   reviewsGivenToday.count    ?? 0,
    reviewsReceivedWeek: reviewsReceivedWeek.count  ?? 0,
    messagesToday:       messagesToday.count        ?? 0,
    postsToday:          postsToday.count           ?? 0,
    postsWeek:           postsWeek.count            ?? 0,
    startedWeek:         startedWeek.count          ?? 0,
  };
}
