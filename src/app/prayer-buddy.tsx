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
  Alert,
  Keyboard,
  Animated as RNAnimated,
  Share,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { geminiService, ChatMessage } from "@/services/geminiService";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { validators } from "@/utils/validation";
import { networkService } from "@/utils/network";

// Quick reply suggestions based on conversation context
const QUICK_REPLIES = {
  greeting: [
    "I need prayer guidance",
    "Help me understand a verse",
    "I'm struggling with something",
    "I want to grow spiritually",
  ],
  prayer: [
    "Create a prayer for me",
    "Pray for my family",
    "Pray for strength",
    "Pray for guidance",
  ],
  study: [
    "Explain this verse",
    "Find verses about love",
    "Find verses about faith",
    "Bible study questions",
  ],
  support: [
    "I'm feeling anxious",
    "I need encouragement",
    "I'm grateful today",
    "I have a question",
  ],
};

const PRAYER_TEMPLATES = [
  { icon: "heart", text: "Thanksgiving", prompt: "Help me write a prayer of thanksgiving" },
  { icon: "hands-pray", text: "Supplication", prompt: "I need prayer for a specific request" },
  { icon: "shield-check", text: "Protection", prompt: "Pray for protection over my life" },
  { icon: "lightbulb", text: "Wisdom", prompt: "Pray for wisdom and guidance" },
  { icon: "hospital-box", text: "Healing", prompt: "Pray for healing and health" },
  { icon: "account-group", text: "Family", prompt: "Pray for my family and loved ones" },
];

const MAX_MESSAGES = 100; // Prevent memory issues
const MAX_INPUT_LENGTH = 1000;

export default function PrayerBuddy() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const { showActionSheetWithOptions } = useActionSheet();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! 🙏 I'm your Prayer Buddy, powered by AI to support your spiritual journey.\n\nI can help you:\n• Pray for any situation\n• Understand Bible verses\n• Find encouragement\n• Answer faith questions\n• Provide spiritual guidance\n\nHow can I support you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState(QUICK_REPLIES.greeting);
  const [isOnline, setIsOnline] = useState(true);
  const [keyboardHeight] = useState(new RNAnimated.Value(0));

  // Check network status
  useEffect(() => {
    const checkNetwork = async () => {
      const online = await networkService.isOnline();
      setIsOnline(online);
    };
    checkNetwork();
    const interval = setInterval(checkNetwork, 5000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard listeners for better avoidance
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        RNAnimated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
        // Scroll to bottom when keyboard opens
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        RNAnimated.timing(keyboardHeight, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll when new messages arrive
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();

    if (!messageText || isTyping) return;

    // Validate input
    const validation = validators.chatMessage(messageText);
    if (!validation.isValid) {
      Alert.alert("Invalid Message", validation.error);
      return;
    }

    // Check network
    if (!isOnline) {
      Alert.alert(
        "No Internet Connection",
        "Prayer Buddy requires an internet connection. Please check your network and try again."
      );
      return;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMessage];
      // Keep only last MAX_MESSAGES to prevent memory issues
      return updated.slice(-MAX_MESSAGES);
    });
    setInputText("");
    setIsTyping(true);
    setShowQuickReplies(false);

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await geminiService.chatWithPrayerBuddy(
        userMessage.content,
        messages.slice(-20), // Only send last 20 messages for context
      );

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const updated = [...prev, assistantMessage];
        return updated.slice(-MAX_MESSAGES);
      });

      // Update suggestions based on conversation
      updateSuggestions(response);

      // Success haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error("Error in chat:", error);

      // Error haptic
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I'm having trouble connecting right now. This could be due to:\n• Network connectivity issues\n• Server being busy\n• API rate limits\n\nPlease try again in a moment. Your previous messages are saved.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const updateSuggestions = (response: string) => {
    const lowerResponse = response.toLowerCase();
    if (lowerResponse.includes("pray") || lowerResponse.includes("prayer")) {
      setCurrentSuggestions(QUICK_REPLIES.prayer);
    } else if (lowerResponse.includes("verse") || lowerResponse.includes("scripture")) {
      setCurrentSuggestions(QUICK_REPLIES.study);
    } else if (
      lowerResponse.includes("support") ||
      lowerResponse.includes("here for you") ||
      lowerResponse.includes("understand")
    ) {
      setCurrentSuggestions(QUICK_REPLIES.support);
    } else {
      setCurrentSuggestions(QUICK_REPLIES.greeting);
    }
    setShowQuickReplies(true);
  };

  const handleQuickReply = async (reply: string) => {
    setInputText(reply);
    await handleSend(reply);
  };

  const handlePrayerTemplate = async (template: typeof PRAYER_TEMPLATES[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await handleSend(template.prompt);
  };

  const handleMessageAction = (message: ChatMessage, index: number) => {
    const options = [
      "Copy Message",
      "Share Message",
      message.role === "assistant" ? "Retry Response" : null,
      "Delete Message",
      "Cancel",
    ].filter(Boolean) as string[];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = options.findIndex((opt) => opt === "Delete Message");

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: "Message Actions",
      },
      async (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex) return;

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        switch (options[buttonIndex]) {
          case "Copy Message":
            await Clipboard.setStringAsync(message.content);
            Alert.alert("Copied", "Message copied to clipboard");
            break;

          case "Share Message":
            try {
              await Share.share({
                message: `${message.role === "assistant" ? "Prayer Buddy" : "Me"}: ${message.content}`,
              });
            } catch (error) {
              console.error("Error sharing:", error);
            }
            break;

          case "Retry Response":
            if (index > 0) {
              const previousUserMessage = messages[index - 1];
              if (previousUserMessage.role === "user") {
                // Remove the assistant message and retry
                setMessages((prev) => prev.filter((_, i) => i !== index));
                await handleSend(previousUserMessage.content);
              }
            }
            break;

          case "Delete Message":
            setMessages((prev) => prev.filter((_, i) => i !== index));
            break;
        }
      }
    );
  };

  const handleClearChat = () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to clear all messages? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setMessages([
              {
                role: "assistant",
                content: "Chat cleared. How can I help you today?",
                timestamp: new Date().toISOString(),
              },
            ]);
            setShowQuickReplies(true);
            setCurrentSuggestions(QUICK_REPLIES.greeting);
          },
        },
      ]
    );
  };

  const handleShareConversation = async () => {
    try {
      const conversationText = messages
        .map((msg) => {
          const role = msg.role === "assistant" ? "Prayer Buddy" : "You";
          const time = formatTime(msg.timestamp);
          return `[${time}] ${role}:\n${msg.content}\n`;
        })
        .join("\n");

      await Share.share({
        message: `Prayer Buddy Conversation\n\n${conversationText}`,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error sharing conversation:", error);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const remainingChars = MAX_INPUT_LENGTH - inputText.length;

  return (
    <View style={[styles.container, { backgroundColor }]}>
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
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                onPress={handleShareConversation}
                style={{ padding: 8 }}
                accessibilityLabel="Share conversation"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearChat}
                style={{ padding: 8, marginRight: -8 }}
                accessibilityLabel="Clear chat"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      {/* Offline Indicator */}
      {!isOnline && (
        <View style={[styles.offlineBar, { backgroundColor: "#f59e0b" }]}>
          <MaterialCommunityIcons name="wifi-off" size={16} color="#fff" />
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((message, index) => (
            <TouchableOpacity
              key={index}
              onLongPress={() => handleMessageAction(message, index)}
              activeOpacity={0.7}
              accessibilityLabel={`${message.role === "assistant" ? "Prayer Buddy" : "Your"} message: ${message.content}`}
              accessibilityRole="button"
              accessibilityHint="Long press for message actions"
            >
              <Animated.View
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
            </TouchableOpacity>
          ))}

          {isTyping && (
            <Animated.View entering={FadeIn} style={styles.typingIndicator}>
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
                <ActivityIndicator size="small" color={textColor} />
                <Text style={[styles.typingText, { color: textColor }]}>
                  Prayer Buddy is typing...
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Prayer Templates */}
          {!isTyping && messages.length <= 2 && (
            <Animated.View entering={FadeInDown.delay(300)} style={styles.templatesContainer}>
              <Text style={[styles.templatesTitle, { color: textColor }]}>
                Quick Prayer Templates
              </Text>
              <View style={styles.templateGrid}>
                {PRAYER_TEMPLATES.map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.templateCard, { backgroundColor: cardBg }]}
                    onPress={() => handlePrayerTemplate(template)}
                    accessibilityLabel={`${template.text} prayer template`}
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons
                      name={template.icon as any}
                      size={24}
                      color="#a855f7"
                    />
                    <Text style={[styles.templateText, { color: textColor }]}>
                      {template.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          {/* Quick Replies */}
          {showQuickReplies && !isTyping && (
            <Animated.View entering={FadeInDown.delay(200)} style={styles.quickRepliesContainer}>
              <Text style={[styles.quickRepliesTitle, { color: textColor + "80" }]}>
                Suggested:
              </Text>
              <View style={styles.quickRepliesGrid}>
                {currentSuggestions.map((reply, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.quickReplyChip, { backgroundColor: cardBg }]}
                    onPress={() => handleQuickReply(reply)}
                    accessibilityLabel={`Quick reply: ${reply}`}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.quickReplyText, { color: textColor }]}>
                      {reply}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>

        {/* Input Bar */}
        <RNAnimated.View
          style={[
            styles.inputContainer,
            { backgroundColor: cardBg },
            {
              paddingBottom: Platform.OS === "ios" ? insets.bottom : 16,
            },
          ]}
        >
          {remainingChars < 100 && (
            <Text
              style={[
                styles.charCount,
                {
                  color: remainingChars < 20 ? "#ef4444" : textColor + "60",
                },
              ]}
            >
              {remainingChars} characters remaining
            </Text>
          )}
          <View style={[styles.inputWrapper, { backgroundColor }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: textColor }]}
              placeholder="Share what's on your heart..."
              placeholderTextColor={textColor + "50"}
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => {
                setShowQuickReplies(false);
                setTimeout(() => {
                  scrollViewRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
              multiline
              maxLength={MAX_INPUT_LENGTH}
              editable={!isTyping && isOnline}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={() => {
                if (inputText.trim()) {
                  handleSend();
                }
              }}
              accessibilityLabel="Message input"
              accessibilityHint="Type your message here"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isTyping || !isOnline) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isTyping || !isOnline}
              accessibilityLabel="Send message"
              accessibilityRole="button"
              accessibilityState={{
                disabled: !inputText.trim() || isTyping || !isOnline,
              }}
            >
              <View
                style={[
                  styles.sendButtonGradient,
                  {
                    backgroundColor:
                      !inputText.trim() || isTyping || !isOnline
                        ? "#a855f780"
                        : "#a855f7",
                  },
                ]}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialCommunityIcons name="send" size={28} color="#fff" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </RNAnimated.View>
      </KeyboardAvoidingView>
    </View>
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
  charCount: {
    fontSize: 12,
    marginBottom: 8,
    textAlign: "right",
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingTop: 16,
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
    paddingBottom: 20,
  },
  offlineBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 8,
  },
  offlineText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  quickRepliesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  quickRepliesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickRepliesTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  quickReplyChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  quickReplyText: {
    fontSize: 15,
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
  templateCard: {
    alignItems: "center",
    borderRadius: 12,
    gap: 8,
    padding: 16,
    width: "48%",
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  templateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  templatesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  timeText: {
    fontSize: 13,
  },
  typingBubble: {
    alignItems: "center",
    borderBottomLeftRadius: 4,
    borderRadius: 20,
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  typingIndicator: {
    alignItems: "flex-end",
    flexDirection: "row",
    marginBottom: 20,
  },
  typingText: {
    fontSize: 15,
    fontStyle: "italic",
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
