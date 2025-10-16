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
      content: "Hello! I'm your Prayer Buddy. I'm here to support you in your spiritual journey, answer questions about faith, help you pray, or simply listen. How can I help you today?",
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
        messages
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
        content: "I'm having trouble connecting right now. Please try again in a moment.",
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
            <TouchableOpacity onPress={() => router.back()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
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
                <LinearGradient
                  colors={["#a855f7", "#ec4899"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatar}
                >
                  <MaterialCommunityIcons name="hand-peace" size={20} color="#fff" />
                </LinearGradient>
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
                <View style={[styles.avatar, { backgroundColor: theme.color.reactBlue.dark }]}>
                  <MaterialCommunityIcons name="account" size={20} color="#fff" />
                </View>
              </View>
            )}
          </Animated.View>
        ))}

        {isTyping && (
          <View style={styles.typingIndicator}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={["#a855f7", "#ec4899"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <MaterialCommunityIcons name="hand-heart" size={20} color="#fff" />
              </LinearGradient>
            </View>
            <View style={[styles.typingBubble, { backgroundColor: cardBg }]}>
              <View style={styles.typingDots}>
                <View style={[styles.typingDot, { backgroundColor: textColor + "40" }]} />
                <View style={[styles.typingDot, { backgroundColor: textColor + "40" }]} />
                <View style={[styles.typingDot, { backgroundColor: textColor + "40" }]} />
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
            <LinearGradient
              colors={
                !inputText.trim() || isTyping
                  ? ["#a855f780", "#ec489980"]
                  : ["#a855f7", "#ec4899"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendButtonGradient}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageWrapper: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-end",
  },
  userMessageWrapper: {
    justifyContent: "flex-end",
  },
  assistantMessageWrapper: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginHorizontal: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  messageBubble: {
    maxWidth: "70%",
    borderRadius: 20,
    padding: 12,
  },
  userBubble: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: "#fff",
  },
  timeText: {
    fontSize: 11,
  },
  userTimeText: {
    color: "#ffffff90",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  typingBubble: {
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 12,
    paddingVertical: 16,
  },
  typingDots: {
    flexDirection: "row",
    gap: 6,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#00000010",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});
