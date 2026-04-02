import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '@/hooks/useAuth';
import { api, endpoints } from '@/utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, teachersRes, feesRes] = await Promise.all([
        api(endpoints.students.list).catch(() => ({ students: [] })),
        api(endpoints.teachers.list).catch(() => ({ teachers: [] })),
        api(endpoints.fees.summary).catch(() => ({ total: '0.00' })),
      ]);

      const students = Array.isArray(studentsRes) ? studentsRes : (studentsRes.students || []);
      const teachers = Array.isArray(teachersRes) ? teachersRes : (teachersRes.teachers || []);

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalFeesCollected: feesRes.overview?.totalRevenue || 0,
      });
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) return <Loading fullScreen message="Loading Dashboard..." />;

  const StatCard = ({ title, value, icon, color, delay, style }: any) => (
    <Animatable.View animation="zoomIn" delay={delay} duration={800} style={[styles.statCardWrapper, style]}>
      <Card style={[styles.statCard, { borderLeftWidth: 4, borderLeftColor: color }] as any}>
        <View style={styles.statContent}>
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: themeColors.text }]}>{value}</Text>
            <Text style={[styles.statTitle, { color: themeColors.textSecondary }]}>{title}</Text>
          </View>
        </View>
      </Card>
    </Animatable.View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: themeColors.textSecondary }]}>Welcome back,</Text>
          <Text style={[styles.userName, { color: themeColors.text }]}>{user?.name || 'Administrator'}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            style={[styles.iconButton, { backgroundColor: themeColors.card }]}
          >
            <Ionicons name="notifications-outline" size={24} color={themeColors.text} />
            <View style={[styles.badge, { backgroundColor: themeColors.error }]} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            style={[styles.profileButton, { backgroundColor: themeColors.card }]}
          >
            <Ionicons name="person-circle-outline" size={40} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Students"
          value={stats?.totalStudents}
          icon="people"
          color="#3b82f6"
          delay={0}
          style={{ width: '48.5%' }}
        />
        <StatCard
          title="Teachers"
          value={stats?.totalTeachers}
          icon="school"
          color="#16a34a"
          delay={100}
          style={{ width: '48.5%' }}
        />
        <StatCard
          title="Fees Coll."
          value={`NGN ${(stats?.totalFeesCollected || 0).toLocaleString()}`}
          icon="cash"
          color="#f59e0b"
          delay={200}
          style={{ width: '100%' }}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { label: 'Student', icon: 'person', color: '#16a34a', route: '/students' },
          { label: 'Collect Fee', icon: 'wallet', color: '#f59e0b', route: '/fees' },
          { label: 'View Results', icon: 'stats-chart', color: '#3b82f6', route: '/results' },
          { label: 'Teachers', icon: 'school', color: '#8b5cf6', route: '/teachers' },
        ].map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => router.push(action.route as any)}
            style={[styles.actionBtn, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: themeColors.text }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Recent Activity</Text>
      <Card style={styles.activityCard}>
        <View style={styles.emptyActivity}>
          <Ionicons name="time-outline" size={48} color={themeColors.border} />
          <Text style={{ color: themeColors.textSecondary, marginTop: Spacing.sm }}>No recent activity to show</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    ...Platform.select({
      ios: Shadows.soft as any,
      android: { elevation: 2 } as any,
    }) as any,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: Shadows.soft as any,
      android: { elevation: 2 } as any,
    }) as any,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCardWrapper: {
    marginBottom: Spacing.md,
  },
  statCard: {
    padding: Spacing.md,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: Spacing.sm,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionIcon: {
    padding: Spacing.sm,
    borderRadius: 12,
    marginBottom: Spacing.xs,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  activityCard: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyActivity: {
    alignItems: 'center',
  },
});
