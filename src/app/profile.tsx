import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { spacing, borderRadius, fontSize, fontWeight } from "@/theme/spacing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/theme/colors";

interface UserProfile {
  fullName: string;
  email: string;
  avatar: string | null;
  preferredTranslation: string;
  readingStreak: number;
  totalVersesRead: number;
  joinedAt: Date;
  lastActiveAt: Date;
  preferences: {
    dailyVerseNotifications: boolean;
    readingReminders: boolean;
    prayerUpdates: boolean;
    darkMode: boolean;
    fontSize: "small" | "medium" | "large";
  };
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const borderColor = useThemeColor(theme.color.border);

  const [profile, setProfile] = useState<UserProfile>({
    fullName: "John Doe",
    email: "john.doe@example.com",
    avatar: null,
    preferredTranslation: "NIV",
    readingStreak: 7,
    totalVersesRead: 342,
    joinedAt: new Date("2024-01-15"),
    lastActiveAt: new Date(),
    preferences: {
      dailyVerseNotifications: true,
      readingReminders: true,
      prayerUpdates: false,
      darkMode: false,
      fontSize: "medium",
    },
  });

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  const translations = [
    { code: "NIV", name: "New International Version" },
    { code: "ESV", name: "English Standard Version" },
    { code: "KJV", name: "King James Version" },
    { code: "NLT", name: "New Living Translation" },
    { code: "NKJV", name: "New King James Version" },
    { code: "NASB", name: "New American Standard Bible" },
    { code: "AMP", name: "Amplified Bible" },
    { code: "MSG", name: "The Message" },
    { code: "CEV", name: "Contemporary English Version" },
    { code: "GNT", name: "Good News Translation" },
  ];

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setProfile((prev) => ({
        ...prev,
        avatar: result.assets[0].uri,
      }));
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const updatePreferences = (
    key: keyof UserProfile["preferences"],
    value: any,
  ) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
    Haptics.selectionAsync();
  };

  const handleNameEdit = () => {
    if (editingName) {
      if (tempName.trim()) {
        updateProfile({ fullName: tempName.trim() });
      }
      setEditingName(false);
    } else {
      setTempName(profile.fullName);
      setEditingName(true);
    }
  };

  const showTranslationSelector = () => {
    Alert.alert(
      "Select Bible Translation",
      "Choose your preferred Bible translation",
      translations.map((t) => ({
        text: `${t.code} - ${t.name}`,
        onPress: () => updateProfile({ preferredTranslation: t.code }),
      })),
      { cancelable: true },
    );
  };

  const showFontSizeSelector = () => {
    const fontSizes = [
      { label: "Small", value: "small" as const },
      { label: "Medium", value: "medium" as const },
      { label: "Large", value: "large" as const },
    ];

    Alert.alert(
      "Font Size",
      "Choose your preferred font size",
      fontSizes.map((size) => ({
        text: size.label,
        onPress: () => updatePreferences("fontSize", size.value),
      })),
      { cancelable: true },
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return "🔥🔥🔥";
    if (streak >= 30) return "🔥🔥";
    if (streak >= 7) return "🔥";
    return "📖";
  };

  const primaryColor = colors.primary;
  const secondaryColor = colors.secondary;
  const accentColor = colors.purple;
  const errorColor = colors.error;

  return (
    <View
      style={[styles.container, { backgroundColor, paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={textColor}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Profile</Text>
        <TouchableOpacity onPress={() => router.push("/settings")}>
          <MaterialCommunityIcons name="cog" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: cardBg }]}>
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <LinearGradient
                colors={[primaryColor, secondaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarPlaceholder}
              >
                <MaterialCommunityIcons
                  name="account"
                  size={48}
                  color={colors.white}
                />
              </LinearGradient>
            )}
            <View style={styles.editAvatarIcon}>
              <MaterialCommunityIcons
                name="camera"
                size={16}
                color={colors.white}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            {editingName ? (
              <View style={styles.nameEditContainer}>
                <TextInput
                  style={[styles.nameInput, { color: textColor, borderColor }]}
                  value={tempName}
                  onChangeText={setTempName}
                  onSubmitEditing={handleNameEdit}
                  autoFocus
                  maxLength={50}
                />
                <TouchableOpacity onPress={handleNameEdit}>
                  <MaterialCommunityIcons
                    name="check"
                    size={24}
                    color={colors.success}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleNameEdit}
                style={styles.nameContainer}
              >
                <Text style={[styles.profileName, { color: textColor }]}>
                  {profile.fullName}
                </Text>
                <MaterialCommunityIcons
                  name="pencil"
                  size={18}
                  color={textColor + "80"}
                />
              </TouchableOpacity>
            )}
            <Text style={[styles.profileEmail, { color: textColor + "80" }]}>
              {profile.email}
            </Text>
            <View style={styles.memberSinceContainer}>
              <MaterialCommunityIcons
                name="calendar"
                size={14}
                color={textColor + "60"}
                style={styles.calendarIcon}
              />
              <Text style={[styles.memberSince, { color: textColor + "60" }]}>
                Member since {formatDate(profile.joinedAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>
                {getStreakEmoji(profile.readingStreak)}
              </Text>
            </View>
            <Text style={[styles.statNumber, { color: textColor }]}>
              {profile.readingStreak}
            </Text>
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Day Streak
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: primaryColor + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="book-open-variant"
                size={24}
                color={primaryColor}
              />
            </View>
            <Text style={[styles.statNumber, { color: textColor }]}>
              {profile.totalVersesRead}
            </Text>
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Verses Read
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: cardBg }]}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: secondaryColor + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="trophy"
                size={24}
                color={secondaryColor}
              />
            </View>
            <Text style={[styles.statNumber, { color: textColor }]}>12</Text>
            <Text style={[styles.statLabel, { color: textColor + "60" }]}>
              Achievements
            </Text>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Reading Preferences
          </Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={showTranslationSelector}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons name="book" size={20} color={textColor} />
              <Text style={[styles.settingText, { color: textColor }]}>
                Bible Translation
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: textColor + "60" }]}>
                {profile.preferredTranslation}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={textColor + "40"}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={showFontSizeSelector}
          >
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="format-size"
                size={20}
                color={textColor}
              />
              <Text style={[styles.settingText, { color: textColor }]}>
                Font Size
              </Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: textColor + "60" }]}>
                {profile.preferences.fontSize.charAt(0).toUpperCase() +
                  profile.preferences.fontSize.slice(1)}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={textColor + "40"}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Notifications
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={20}
                color={textColor}
              />
              <Text style={[styles.settingText, { color: textColor }]}>
                Daily Verse
              </Text>
            </View>
            <Switch
              value={profile.preferences.dailyVerseNotifications}
              onValueChange={(value) =>
                updatePreferences("dailyVerseNotifications", value)
              }
              trackColor={{
                false: textColor + "20",
                true: primaryColor + "40",
              }}
              thumbColor={
                profile.preferences.dailyVerseNotifications
                  ? primaryColor
                  : textColor + "60"
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="clock"
                size={20}
                color={textColor}
              />
              <Text style={[styles.settingText, { color: textColor }]}>
                Reading Reminders
              </Text>
            </View>
            <Switch
              value={profile.preferences.readingReminders}
              onValueChange={(value) =>
                updatePreferences("readingReminders", value)
              }
              trackColor={{
                false: textColor + "20",
                true: primaryColor + "40",
              }}
              thumbColor={
                profile.preferences.readingReminders
                  ? primaryColor
                  : textColor + "60"
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <MaterialCommunityIcons
                name="hand-heart"
                size={20}
                color={textColor}
              />
              <Text style={[styles.settingText, { color: textColor }]}>
                Prayer Updates
              </Text>
            </View>
            <Switch
              value={profile.preferences.prayerUpdates}
              onValueChange={(value) =>
                updatePreferences("prayerUpdates", value)
              }
              trackColor={{
                false: textColor + "20",
                true: primaryColor + "40",
              }}
              thumbColor={
                profile.preferences.prayerUpdates
                  ? primaryColor
                  : textColor + "60"
              }
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Quick Actions
          </Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push("/reading-plans")}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={20}
              color={primaryColor}
            />
            <Text style={[styles.actionText, { color: textColor }]}>
              My Reading Plans
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={textColor + "40"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push("/memorization")}
          >
            <MaterialCommunityIcons
              name="brain"
              size={20}
              color={secondaryColor}
            />
            <Text style={[styles.actionText, { color: textColor }]}>
              Memorization Progress
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={textColor + "40"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push("/journal")}
          >
            <MaterialCommunityIcons
              name="book-open"
              size={20}
              color={accentColor}
            />
            <Text style={[styles.actionText, { color: textColor }]}>
              Prayer Journal
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={textColor + "40"}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[
            styles.signOutButton,
            { backgroundColor: errorColor + "20", borderColor: errorColor },
          ]}
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              {
                text: "Sign Out",
                style: "destructive",
                onPress: () => {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success,
                  );
                  // Will implement sign out when auth is added
                },
              },
            ]);
          }}
        >
          <MaterialCommunityIcons name="logout" size={20} color={errorColor} />
          <Text style={[styles.signOutText, { color: errorColor }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  actionText: {
    flex: 1,
    fontSize: fontSize.md,
  },
  avatar: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
  avatarContainer: {
    marginRight: spacing.lg,
    position: "relative",
  },
  avatarPlaceholder: {
    alignItems: "center",
    borderRadius: 50,
    height: 100,
    justifyContent: "center",
    width: 100,
  },
  calendarIcon: {
    marginRight: spacing.xs,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  editAvatarIcon: {
    alignItems: "center",
    backgroundColor: colors.black + "99",
    borderRadius: borderRadius.full,
    bottom: 0,
    height: 28,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 28,
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  memberSince: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  memberSinceContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: spacing.xs,
  },
  nameContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  nameEditContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  nameInput: {
    borderBottomWidth: 1,
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    paddingVertical: spacing.xs,
  },
  profileEmail: {
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
  },
  profileSection: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    elevation: 4,
    flexDirection: "row",
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  section: {
    borderRadius: borderRadius.xl,
    elevation: 2,
    marginBottom: spacing.lg,
    padding: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  settingItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  settingLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  settingRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  settingText: {
    fontSize: fontSize.md,
  },
  settingValue: {
    fontSize: fontSize.sm,
  },
  signOutButton: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  signOutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  statCard: {
    alignItems: "center",
    borderRadius: borderRadius.xl,
    elevation: 3,
    flex: 1,
    padding: spacing.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statEmoji: {
    fontSize: fontSize.xl,
  },
  statIcon: {
    alignItems: "center",
    borderRadius: borderRadius.full,
    height: 56,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 56,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: "center",
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  statsContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
});
