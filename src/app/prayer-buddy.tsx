import { Stack, useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { geminiService, ChatMessage } from "@/services/geminiService";

export default function PrayerBuddy() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your Prayer Buddy. I'm here to support you in your spiritual journey, answer questions about faith, help you pray, or simply listen. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await geminiService.chatWithPrayerBuddy(
        userMessage.content,
        messages,
      );

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Prayer Buddy",
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: textColor,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: 8, marginLeft: -8 }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(index * 50)}
            style={[
              styles.messageWrapper,
              message.role === "user"
                ? styles.userMessageWrapper
                : styles.assistantMessageWrapper,
            ]}
          >
            {message.role === "assistant" && (
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: "#a855f7" }]}>
                  <MaterialCommunityIcons
                    name="hand-peace"
                    size={24}
                    color="#fff"
                  />
                </View>
              </View>
            )}
            <View
              style={[
                styles.messageBubble,
                message.role === "user"
                  ? styles.userBubble
                  : [styles.assistantBubble, { backgroundColor: cardBg }],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === "user"
                    ? styles.userMessageText
                    : { color: textColor },
                ]}
              >
                {message.content}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  message.role === "user"
                    ? styles.userTimeText
                    : { color: textColor + "60" },
                ]}
              >
                {formatTime(message.timestamp)}
              </Text>
            </View>
            {message.role === "user" && (
              <View style={styles.avatarContainer}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: theme.color.reactBlue.dark },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="account"
                    size={24}
                    color="#fff"
                  />
                </View>
              </View>
            )}
          </Animated.View>
        ))}

        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: "#a855f7" }]}>
                <MaterialCommunityIcons
                  name="hand-heart"
                  size={24}
                  color="#fff"
                />
              </View>
            </View>
            <View style={[styles.typingBubble, { backgroundColor: cardBg }]}>
              <View style={styles.typingDots}>
                <View
                  style={[
                    styles.typingDot,
                    { backgroundColor: textColor + "40" },
                  ]}
                />
                <View
                  style={[
                    styles.typingDot,
                    { backgroundColor: textColor + "40" },
                  ]}
                />
                <View
                  style={[
                    styles.typingDot,
                    { backgroundColor: textColor + "40" },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Bar */}
      <View style={[styles.inputContainer, { backgroundColor: cardBg }]}>
        <View style={[styles.inputWrapper, { backgroundColor }]}>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Share what's on your heart..."
            placeholderTextColor={textColor + "50"}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTyping}
          >
            <View
              style={[
                styles.sendButtonGradient,
                {
                  backgroundColor:
                    !inputText.trim() || isTyping ? "#a855f780" : "#a855f7",
                },
              ]}
            >
              <MaterialCommunityIcons name="send" size={28} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  assistantMessageWrapper: {
    justifyContent: "flex-start",
  },
  avatar: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarContainer: {
    marginHorizontal: 10,
  },
  container: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    maxHeight: 120,
    minHeight: 56,
    paddingVertical: 12,
  },
  inputContainer: {
    borderTopColor: "#00000010",
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    position: "absolute",
    right: 0,
  },
  inputWrapper: {
    alignItems: "flex-end",
    borderRadius: 28,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  messageBubble: {
    borderRadius: 20,
    maxWidth: "70%",
    padding: 20,
  },
  messageText: {
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 4,
  },
  messageWrapper: {
    alignItems: "flex-end",
    flexDirection: "row",
    marginBottom: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sendButton: {
    borderRadius: 30,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    alignItems: "center",
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  timeText: {
    fontSize: 13,
  },
  typingBubble: {
    borderBottomLeftRadius: 4,
    borderRadius: 20,
    padding: 20,
    paddingVertical: 20,
  },
  typingDot: {
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  typingDots: {
    flexDirection: "row",
    gap: 8,
  },
  typingIndicator: {
    alignItems: "flex-end",
    flexDirection: "row",
    marginBottom: 20,
  },
  userBubble: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  userMessageText: {
    color: "#fff",
  },
  userMessageWrapper: {
    justifyContent: "flex-end",
  },
  userTimeText: {
    color: "#ffffff90",
  },
});
