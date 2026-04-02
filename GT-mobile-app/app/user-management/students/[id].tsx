import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Alert, RefreshControl, Image, Linking } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { api, endpoints } from '@/utils/api';

type TabType = 'profile' | 'history' | 'documents';

export default function StudentDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const colorScheme = useColorScheme() ?? 'light';
    const themeColors = Colors[colorScheme];

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [student, setStudent] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            const [studentData, historyData] = await Promise.all([
                api(endpoints.users.students.detail(id as string)),
                api(endpoints.users.students.history(id as string))
            ]);
            setStudent(studentData);
            setHistory(historyData);
        } catch (error) {
            console.error('Error fetching student details:', error);
            Alert.alert('Error', 'Failed to load student data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) return <Loading fullScreen message="Loading Profile..." />;
    if (!student) return <View style={styles.errorContainer}><Text>Student not found</Text></View>;

    const renderProfileTab = () => (
        <View style={styles.tabContent}>
            <Card style={styles.infoCard}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Academic Information</Text>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Class</Text>
                    <Text style={[styles.infoValue, { color: themeColors.text }]}>{student.classId?.name || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Arm</Text>
                    <Text style={[styles.infoValue, { color: themeColors.text }]}>{student.arm || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Admission No</Text>
                    <Text style={[styles.infoValue, { color: themeColors.text }]}>{student.studentId}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Level</Text>
                    <Text style={[styles.infoValue, { color: themeColors.text }]}>{student.level}</Text>
                </View>
            </Card>

            <Card style={[styles.infoCard, { marginTop: Spacing.md }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Personal Contact</Text>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Gender</Text>
                    <Text style={[styles.infoValue, { color: themeColors.text }]}>{student.gender}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Email</Text>
                    <Text style={[styles.infoValue, { color: themeColors.text }]}>{student.email || 'N/A'}</Text>
                </View>
            </Card>

            <Card style={[styles.infoCard, { marginTop: Spacing.md }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Settings & Status</Text>
                <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: themeColors.textSecondary }]}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: student.status === 'active' ? '#16a34a' + '20' : '#dc2626' + '20' }]}>
                        <Text style={[styles.statusText, { color: student.status === 'active' ? '#16a34a' : '#dc2626' }]}>
                            {student.status?.toUpperCase()}
                        </Text>
                    </View>
                </View>
                <Button
                    title="Promote / Transfer"
                    variant="outline"
                    onPress={() => router.push({
                        pathname: '/user-management/students/promote',
                        params: { studentIds: JSON.stringify([student._id]), studentNames: `${student.firstName} ${student.lastName}` }
                    })}
                    style={{ marginTop: Spacing.md }}
                />
            </Card>
        </View>
    );

    const renderHistoryTab = () => (
        <View style={styles.tabContent}>
            {history.length === 0 ? (
                <View style={styles.emptyResults}>
                    <Ionicons name="document-text-outline" size={48} color={themeColors.border} />
                    <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No academic history recorded yet.</Text>
                </View>
            ) : (
                history.map((res, index) => (
                    <Card key={index} style={styles.historyCard}>
                        <View style={styles.historyHeader}>
                            <View>
                                <Text style={[styles.historyClass, { color: themeColors.text }]}>{res.classId?.name}</Text>
                                <Text style={[styles.historySession, { color: themeColors.textSecondary }]}>
                                    {res.session} • {res.term}
                                </Text>
                            </View>
                            <View style={styles.historyScoreBox}>
                                <Text style={[styles.historyGrade, { color: themeColors.primary }]}>{res.grade}</Text>
                                <Text style={[styles.historyTotal, { color: themeColors.textSecondary }]}>{res.totalScore}%</Text>
                            </View>
                        </View>
                        <Text style={[styles.historySubject, { color: themeColors.text }]}>{res.subjectId?.name}</Text>
                    </Card>
                ))
            )}
        </View>
    );

    const renderDocumentsTab = () => (
        <View style={styles.tabContent}>
            <Button
                title="Add Document"
                icon="cloud-upload-outline"
                onPress={() => Alert.alert('Upload', 'Document upload is handled via School Dashboard or File Picker implemention.')}
                style={{ marginBottom: Spacing.md }}
            />

            {!student.documents || student.documents.length === 0 ? (
                <View style={styles.emptyResults}>
                    <Ionicons name="folder-open-outline" size={48} color={themeColors.border} />
                    <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No documents uploaded.</Text>
                </View>
            ) : (
                student.documents.map((doc: any, index: number) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.docItem, { borderColor: themeColors.border }]}
                        onPress={() => Linking.openURL(doc.url)}
                    >
                        <Ionicons name="document-outline" size={24} color={themeColors.primary} />
                        <View style={styles.docInfo}>
                            <Text style={[styles.docName, { color: themeColors.text }]}>{doc.name}</Text>
                            <Text style={[styles.docDate, { color: themeColors.textSecondary }]}>
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <Ionicons name="eye-outline" size={20} color={themeColors.textSecondary} />
                    </TouchableOpacity>
                ))
            )}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={styles.topHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.profileSummary}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{student.firstName[0]}{student.lastName[0]}</Text>
                    </View>
                    <Text style={styles.profileName}>{student.firstName} {student.lastName}</Text>
                    <Text style={styles.profileId}>{student.studentId} • {student.classId?.name}</Text>
                </View>
            </View>

            <View style={[styles.tabBar, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
                {(['profile', 'history', 'documents'] as TabType[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        style={[
                            styles.tabItem,
                            activeTab === tab && { borderBottomColor: themeColors.primary, borderBottomWidth: 2 }
                        ]}
                    >
                        <Text style={[
                            styles.tabLabel,
                            { color: activeTab === tab ? themeColors.primary : themeColors.textSecondary }
                        ]}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={styles.scrollContent}
            >
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'history' && renderHistoryTab()}
                {activeTab === 'documents' && renderDocumentsTab()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topHeader: {
        backgroundColor: '#3b82f6',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backBtn: {
        position: 'absolute',
        left: 20,
        top: Platform.OS === 'ios' ? 60 : 40,
    },
    profileSummary: {
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    profileName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
    },
    profileId: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    tabLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    tabContent: {
        flex: 1,
    },
    infoCard: {
        padding: Spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: Spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    emptyResults: {
        alignItems: 'center',
        marginTop: 50,
        opacity: 0.5,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 14,
    },
    historyCard: {
        marginBottom: Spacing.md,
        padding: Spacing.md,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    historyClass: {
        fontSize: 16,
        fontWeight: '700',
    },
    historySession: {
        fontSize: 12,
    },
    historyScoreBox: {
        alignItems: 'flex-end',
    },
    historyGrade: {
        fontSize: 18,
        fontWeight: '900',
    },
    historyTotal: {
        fontSize: 10,
    },
    historySubject: {
        fontSize: 14,
        fontWeight: '500',
    },
    docItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: Spacing.sm,
    },
    docInfo: {
        flex: 1,
        marginLeft: 12,
    },
    docName: {
        fontSize: 14,
        fontWeight: '700',
    },
    docDate: {
        fontSize: 11,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
