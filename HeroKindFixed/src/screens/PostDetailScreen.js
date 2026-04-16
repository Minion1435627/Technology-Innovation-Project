import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export default function PostDetailScreen({ navigation, route }) {
  const post = route?.params?.post;

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Post not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Original Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.topRow}>
            <View style={styles.typeChip}>
              <Text style={styles.typeChipText}>{post.typeLabel}</Text>
            </View>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText}>{post.category}</Text>
            </View>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.description}>{post.description}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Original post details</Text>
          <Text style={styles.originalBody}>
            {post.description}
          </Text>
          <Text style={styles.originalBody}>
            {post.typeLabel === 'Need'
              ? 'Looking for someone nearby who can help with this as soon as possible. Happy to coordinate timing in chat and follow the exchange flow if needed.'
              : 'Available to help nearby and happy to confirm timing in chat before starting the exchange process. Please message first so we can agree on the details.'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Posted by</Text>
          <Text style={styles.infoValue}>{post.ownerName}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Exchange summary</Text>
          <Text style={styles.infoValue}>{post.exchangeSummary}</Text>
        </View>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.textWhite} />
          <Text style={styles.chatBtnText}>Back to Chat</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 36,
  },
  container: {
    padding: 20,
    gap: 14,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  typeChipText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  categoryChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  originalBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  chatBtn: {
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chatBtnText: {
    ...typography.button,
    color: colors.textWhite,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  backBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtnText: {
    ...typography.button,
    color: colors.textWhite,
  },
});
