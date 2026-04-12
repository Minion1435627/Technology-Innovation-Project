import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
   FlatList, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import PostCard from '../components/PostCard';
import { mockNeeds, mockSupplies } from '../data/mockData';

const SORT_OPTIONS = ['Nearest first', 'Most urgent', 'Most recent'];

export default function NearbyListScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('needs');
  const [sortIndex, setSortIndex] = useState(0);

  const data = activeTab === 'needs' ? mockNeeds : mockSupplies;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nearby</Text>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => navigation.navigate('Post')}
        >
          <Text style={styles.postBtnText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {[
          { key: 'needs', label: '🆘 Needs', count: mockNeeds.length },
          { key: 'supply', label: '📦 Supply', count: mockSupplies.length },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
            <View style={[styles.tabBadge, activeTab === tab.key && styles.tabBadgeActive]}>
              <Text style={[styles.tabBadgeText, activeTab === tab.key && styles.tabBadgeTextActive]}>
                {tab.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {SORT_OPTIONS.map((opt, i) => (
            <TouchableOpacity
              key={opt}
              style={[styles.sortChip, i === sortIndex && styles.sortChipActive]}
              onPress={() => setSortIndex(i)}
            >
              <Text style={[styles.sortChipText, i === sortIndex && styles.sortChipTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        style={{ flex: 1 }}
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            onPress={() => navigation.navigate('Chat')}
            onRespond={() => navigation.navigate('Chat')}
          />
        )}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              {data.length} posts within your radius
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>{activeTab === 'needs' ? '🆘' : '📦'}</Text>
            <Text style={styles.emptyTitle}>No posts nearby</Text>
            <Text style={styles.emptyBody}>Be the first to post in your area!</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  postBtn: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postBtnText: { ...typography.smallBold, color: colors.textWhite },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: colors.transparent,
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { ...typography.bodyBold, color: colors.textSecondary },
  tabTextActive: { color: colors.primary },
  tabBadge: {
    backgroundColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: { backgroundColor: colors.primaryLight },
  tabBadgeText: { ...typography.caption, color: colors.textSecondary },
  tabBadgeTextActive: { color: colors.primary },

  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortLabel: { ...typography.small, color: colors.textSecondary },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  sortChipText: { ...typography.small, color: colors.textSecondary },
  sortChipTextActive: { color: colors.primary, fontWeight: '600' },

  listHeader: { paddingHorizontal: 16, paddingVertical: 10 },
  listHeaderText: { ...typography.small, color: colors.textSecondary },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { ...typography.h3, color: colors.textPrimary },
  emptyBody: { ...typography.body, color: colors.textSecondary },
});
