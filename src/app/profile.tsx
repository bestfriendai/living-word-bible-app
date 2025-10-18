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
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

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

  const primaryColor = useThemeColor(theme.color.primary);
  const secondaryColor = theme.color.purple;
  const accentColor = theme.color.violet;
  const errorColor = useThemeColor(theme.color.danger);

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
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: primaryColor },
                ]}
              >
                <MaterialCommunityIcons name="account" size={40} color="#fff" />
              </View>
            )}
            <View style={styles.editAvatarIcon}>
              <MaterialCommunityIcons name="camera" size={16} color="#fff" />
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
                    size={20}
                    color={theme.color.success.light}
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
                  size={16}
                  color={textColor}
                />
              </TouchableOpacity>
            )}
            <Text style={[styles.profileEmail, { color: textColor + "80" }]}>
              {profile.email}
            </Text>
            <Text style={[styles.memberSince, { color: textColor + "60" }]}>
              Member since {formatDate(profile.joinedAt)}
            </Text>
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
    gap: 12,
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
  },
  avatar: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  avatarContainer: {
    marginRight: 16,
    position: "relative",
  },
  avatarPlaceholder: {
    alignItems: "center",
    borderRadius: 40,
    height: 80,
    justifyContent: "center",
    width: 80,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  editAvatarIcon: {
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 12,
    bottom: 0,
    height: 24,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 24,
  },
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  memberSince: {
    fontSize: 12,
    marginTop: 2,
  },
  nameContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  nameEditContainer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  nameInput: {
    borderBottomWidth: 1,
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    paddingVertical: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    borderRadius: 16,
    flexDirection: "row",
    marginBottom: 24,
    marginTop: 20,
    padding: 20,
  },
  section: {
    borderRadius: 12,
    marginBottom: 20,
    padding: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingItem: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  settingRight: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  settingText: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  signOutButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 40,
    padding: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statCard: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    padding: 16,
  },
  statEmoji: {
    fontSize: 24,
  },
  statIcon: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 8,
    width: 48,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
});
