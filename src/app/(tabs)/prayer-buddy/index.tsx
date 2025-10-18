import { Stack } from "expo-router";
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
  useColorScheme,
  Modal,
} from "react-native";

import { useThemeColor } from "@/components/Themed";
import { theme } from "@/theme";
import { appleDesign } from "@/theme/appleDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { geminiService, ChatMessage } from "@/services/geminiService";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { validators } from "@/utils/validation";
import { networkService } from "@/utils/network";
import Markdown from "react-native-markdown-display";
import { useSpeechToText } from "@/utils/speechToText";
import { colors } from "@/theme/colors";

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
  {
    icon: "heart",
    text: "Thanksgiving",
    prompt: "Help me write a prayer of thanksgiving",
  },
  {
    icon: "hands-pray",
    text: "Supplication",
    prompt: "I need prayer for a specific request",
  },
  {
    icon: "shield-check",
    text: "Protection",
    prompt: "Pray for protection over my life",
  },
  { icon: "lightbulb", text: "Wisdom", prompt: "Pray for wisdom and guidance" },
  {
    icon: "hospital-box",
    text: "Healing",
    prompt: "Pray for healing and health",
  },
  {
    icon: "account-group",
    text: "Family",
    prompt: "Pray for my family and loved ones",
  },
];

const EMOJI_REACTIONS = ["🙏", "❤️", "✝️", "🕊️", "⭐", "💫"];

const MAX_MESSAGES = 100; // Prevent memory issues
const MAX_INPUT_LENGTH = 1000;

// Markdown styles for beautiful AI responses
const getMarkdownStyles = (
  colorScheme: "light" | "dark" | null,
  textColor: string,
) => ({
  body: {
    color: textColor,
    fontSize: 17,
    lineHeight: 26,
  },
  heading1: {
    color: textColor,
    fontSize: 26,
    fontWeight: "700" as const,
    marginTop: 10,
    marginBottom: 14,
  },
  heading2: {
    color: textColor,
    fontSize: 22,
    fontWeight: "700" as const,
    marginTop: 10,
    marginBottom: 10,
  },
  heading3: {
    color: textColor,
    fontSize: 19,
    fontWeight: "600" as const,
    marginTop: 8,
    marginBottom: 8,
  },
  strong: {
    color: colors.secondary, // Purple for emphasis
    fontWeight: "700" as const,
  },
  em: {
    fontStyle: "italic" as const,
    color: textColor,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 14,
    color: textColor,
    fontSize: 17,
    lineHeight: 26,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 12,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 12,
  },
  list_item: {
    flexDirection: "row" as const,
    marginBottom: 6,
  },
  bullet_list_icon: {
    color: colors.secondary,
    fontSize: 16,
    marginLeft: 0,
    marginRight: 8,
  },
  ordered_list_icon: {
    color: colors.secondary,
    fontSize: 16,
    marginLeft: 0,
    marginRight: 8,
  },
  blockquote: {
    backgroundColor:
      colorScheme === "dark" ? colors.secondaryLight : colors.secondaryLight,
    borderLeftColor: colors.secondary,
    borderLeftWidth: 4,
    marginLeft: 0,
    marginRight: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
    borderRadius: 8,
  },
  code_inline: {
    backgroundColor:
      colorScheme === "dark" ? colors.dark.card : colors.background.tertiary,
    color: colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 15,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  code_block: {
    backgroundColor:
      colorScheme === "dark" ? colors.dark.card : colors.background.tertiary,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  fence: {
    backgroundColor:
      colorScheme === "dark" ? colors.dark.card : colors.background.tertiary,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  hr: {
    backgroundColor: textColor + "20",
    height: 1,
    marginVertical: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: textColor + "20",
    borderRadius: 8,
    marginVertical: 8,
  },
  thead: {
    backgroundColor:
      colorScheme === "dark" ? colors.dark.card : colors.background.tertiary,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: textColor + "20",
  },
  th: {
    padding: 12,
    fontWeight: "700" as const,
    color: textColor,
  },
  td: {
    padding: 12,
    color: textColor,
  },
  link: {
    color: colors.primary,
    textDecorationLine: "underline" as const,
  },
  text: {
    color: textColor,
  },
});

export default function PrayerBuddy() {
  const colorScheme = useColorScheme() as "light" | "dark" | null;
  const backgroundColor = useThemeColor(theme.color.background);
  const textColor = useThemeColor(theme.color.text);
  const textSecondary = useThemeColor(theme.color.textSecondary);
  const cardBg = useThemeColor(theme.color.backgroundSecondary);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const { showActionSheetWithOptions } = useActionSheet();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: Date.now().toString(),
      role: "assistant",
      content:
        'Hello! 🙏 I\'m your **Prayer Buddy**, powered by AI to support your spiritual journey.\n\n**I can help you with:**\n\n• **Personalized Prayer** - Create prayers for any situation\n• **Bible Study** - Explain verses and provide context\n• **Spiritual Guidance** - Offer Biblical wisdom and encouragement\n• **Faith Questions** - Answer spiritual inquiries\n• **Prayer Strategies** - Provide practical next steps\n\n> *"For where two or three gather in my name, there am I with them."* - Matthew 18:20\n\n**How can I support your spiritual walk today?**',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [currentSuggestions, setCurrentSuggestions] = useState(
    QUICK_REPLIES.greeting,
  );
  const [isOnline, setIsOnline] = useState(true);
  const [keyboardHeight] = useState(new RNAnimated.Value(0));

  // New states for enhanced features
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showSavedMessages, setShowSavedMessages] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  // Speech-to-text
  const { isListening, startListening, stopListening, resetTranscript } =
    useSpeechToText({
      onResult: (text, isFinal) => {
        if (isFinal) {
          setInputText((prev) => (prev ? `${prev} ${text}` : text));
          resetTranscript();
        }
      },
      onError: (error) => {
        Alert.alert("Voice Input Error", error.message);
      },
    });

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
      },
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (e) => {
        RNAnimated.timing(keyboardHeight, {
          toValue: 0,
          duration: e.duration || 250,
          useNativeDriver: false,
        }).start();
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [keyboardHeight]);

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
        "Prayer Buddy requires an internet connection. Please check your network and try again.",
      );
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
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
        id: (Date.now() + 1).toString(),
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
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now. This could be due to:\n\n• **Network connectivity issues**\n• **Server being busy**\n• **API rate limits**\n\n**Don't worry** - Your previous messages are saved. Please try again in a moment.\n\n> *\"Cast all your anxiety on Him because He cares for you.\"* - 1 Peter 5:7",
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
    } else if (
      lowerResponse.includes("verse") ||
      lowerResponse.includes("scripture")
    ) {
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

  const handlePrayerTemplate = async (
    template: (typeof PRAYER_TEMPLATES)[0],
  ) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await handleSend(template.prompt);
  };

  const toggleSaveMessage = async (messageId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, isSaved: !msg.isSaved } : msg,
      ),
    );
  };

  const addReaction = async (messageId: string, emoji: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const reactions = msg.reactions || [];
          const hasReaction = reactions.includes(emoji);
          return {
            ...msg,
            reactions: hasReaction
              ? reactions.filter((r) => r !== emoji)
              : [...reactions, emoji],
          };
        }
        return msg;
      }),
    );
  };

  const handleMessageAction = (message: ChatMessage, index: number) => {
    const options = [
      message.isSaved ? "Unsave Message" : "Save Message",
      "Add Reaction",
      "Copy Message",
      "Share Message",
      message.role === "assistant" ? "Retry Response" : null,
      "Delete Message",
      "Cancel",
    ].filter(Boolean) as string[];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = options.findIndex(
      (opt) => opt === "Delete Message",
    );

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: "Message Actions",
      },
      async (buttonIndex) => {
        if (buttonIndex === undefined || buttonIndex === cancelButtonIndex)
          return;

        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        switch (options[buttonIndex]) {
          case "Save Message":
          case "Unsave Message":
            if (message.id) {
              toggleSaveMessage(message.id);
            }
            break;

          case "Add Reaction":
            showReactionPicker(message.id || "");
            break;

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
      },
    );
  };

  const showReactionPicker = (messageId: string) => {
    showActionSheetWithOptions(
      {
        options: [...EMOJI_REACTIONS, "Cancel"],
        cancelButtonIndex: EMOJI_REACTIONS.length,
        title: "Choose Reaction",
      },
      async (buttonIndex) => {
        if (buttonIndex !== undefined && buttonIndex < EMOJI_REACTIONS.length) {
          await addReaction(messageId, EMOJI_REACTIONS[buttonIndex]);
        }
      },
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
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            );
            setMessages([
              {
                id: Date.now().toString(),
                role: "assistant",
                content:
                  "**Chat cleared.** 🙏\n\nI'm here to support you in your spiritual journey. How can I help you today?",
                timestamp: new Date().toISOString(),
              },
            ]);
            setShowQuickReplies(true);
            setCurrentSuggestions(QUICK_REPLIES.greeting);
          },
        },
      ],
    );
  };

  const handleExportConversation = async () => {
    try {
      const conversationText = messages
        .map((msg) => {
          const role = msg.role === "assistant" ? "Prayer Buddy" : "You";
          const time = formatTime(msg.timestamp);
          const saved = msg.isSaved ? " [Saved]" : "";
          const reactions = msg.reactions?.length
            ? ` Reactions: ${msg.reactions.join(" ")}`
            : "";
          return `[${time}] ${role}${saved}:\n${msg.content}${reactions}\n`;
        })
        .join("\n");

      // Share directly without writing to file system
      await Share.share({
        message: `Prayer Buddy Conversation\n${"=".repeat(50)}\n\n${conversationText}`,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error exporting conversation:", error);
      Alert.alert("Error", "Failed to export conversation");
    }
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

  const generateInsights = async () => {
    if (messages.length <= 1) {
      Alert.alert(
        "Not Enough Data",
        "Have a longer conversation to generate insights.",
      );
      return;
    }

    setIsGeneratingInsights(true);
    setShowInsights(true);

    try {
      const conversationInsights =
        await geminiService.generateConversationInsights(messages);
      setInsights(conversationInsights);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error generating insights:", error);
      Alert.alert("Error", "Failed to generate insights");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const toggleVoiceInput = async () => {
    if (isListening) {
      await stopListening();
    } else {
      try {
        await startListening();
      } catch (error: any) {
        Alert.alert("Voice Input Error", error.message);
      }
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getSavedMessages = () => messages.filter((msg) => msg.isSaved);

  const getFilteredMessages = () => {
    if (!searchQuery) return messages;
    return messages.filter((msg) =>
      msg.content.toLowerCase().includes(searchQuery.toLowerCase()),
    );
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
          headerLargeTitle: true,
          headerTransparent: false,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => setShowSearch(!showSearch)}
                style={styles.headerButton}
                accessibilityLabel="Search conversation"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={24}
                  color={showSearch ? colors.secondary : textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowSavedMessages(true)}
                style={styles.headerButton}
                accessibilityLabel="View saved messages"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="bookmark"
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={generateInsights}
                style={styles.headerButton}
                accessibilityLabel="Generate insights"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="chart-bar"
                  size={24}
                  color={textColor}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  showActionSheetWithOptions(
                    {
                      options: [
                        "Share Conversation",
                        "Export to File",
                        "Clear Chat",
                        "Cancel",
                      ],
                      cancelButtonIndex: 3,
                      destructiveButtonIndex: 2,
                      title: "Chat Options",
                    },
                    async (buttonIndex) => {
                      if (buttonIndex === 0) await handleShareConversation();
                      else if (buttonIndex === 1)
                        await handleExportConversation();
                      else if (buttonIndex === 2) handleClearChat();
                    },
                  );
                }}
                style={styles.headerButtonLast}
                accessibilityLabel="More options"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="dots-vertical"
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
        <View style={[styles.offlineBar, { backgroundColor: colors.warning }]}>
          <MaterialCommunityIcons
            name="wifi-off"
            size={16}
            color={colors.text.inverse}
          />
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}

      {/* Search Bar */}
      {showSearch && (
        <View style={[styles.searchBar, { backgroundColor: cardBg }]}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={textColor + "60"}
          />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search messages..."
            placeholderTextColor={textColor + "50"}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={textColor + "60"}
              />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Chat Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
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
          {getFilteredMessages().map((message, index) => (
            <TouchableOpacity
              key={message.id || index}
              onLongPress={() => handleMessageAction(message, index)}
              activeOpacity={0.7}
              accessibilityLabel={`${message.role === "assistant" ? "Prayer Buddy" : "Your"} message: ${message.content}`}
              accessibilityRole="button"
              accessibilityHint="Long press for message actions"
            >
              <View
                style={[
                  styles.messageWrapper,
                  message.role === "user"
                    ? styles.userMessageWrapper
                    : styles.assistantMessageWrapper,
                ]}
              >
                {message.role === "assistant" && (
                  <View style={styles.avatarContainer}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: colors.secondary },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="hands-pray"
                        size={26}
                        color={colors.text.inverse}
                      />
                    </View>
                  </View>
                )}
                <View style={styles.messageContentContainer}>
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === "user"
                        ? styles.userBubble
                        : [styles.assistantBubble, { backgroundColor: cardBg }],
                    ]}
                  >
                    {message.role === "assistant" && (
                      <View style={styles.prayerEmojiHeader}>
                        <Text style={styles.prayerEmoji}>🙏</Text>
                      </View>
                    )}
                    {message.isSaved && (
                      <View style={styles.savedBadge}>
                        <MaterialCommunityIcons
                          name="bookmark"
                          size={14}
                          color={colors.secondary}
                        />
                        <Text style={styles.savedText}>Saved</Text>
                      </View>
                    )}
                    {message.role === "user" ? (
                      <Text
                        style={[styles.messageText, styles.userMessageText]}
                      >
                        {message.content}
                      </Text>
                    ) : (
                      <Markdown
                        style={getMarkdownStyles(colorScheme, textColor) as any}
                      >
                        {message.content}
                      </Markdown>
                    )}
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
                  {message.reactions && message.reactions.length > 0 && (
                    <View style={styles.reactionsContainer}>
                      {message.reactions.map((reaction, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.reactionBubble,
                            { backgroundColor: cardBg },
                          ]}
                          onPress={() =>
                            message.id && addReaction(message.id, reaction)
                          }
                        >
                          <Text style={styles.reactionText}>{reaction}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
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
                        color={colors.text.inverse}
                      />
                    </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {isTyping && (
            <View style={styles.typingIndicator}>
              <View style={styles.avatarContainer}>
                <View
                  style={[styles.avatar, { backgroundColor: colors.secondary }]}
                >
                  <MaterialCommunityIcons
                    name="hands-pray"
                    size={26}
                    color={colors.text.inverse}
                  />
                </View>
              </View>
              <View style={[styles.typingBubble, { backgroundColor: cardBg }]}>
                <Text style={styles.typingEmoji}>🙏</Text>
                <ActivityIndicator size="small" color={textColor} />
                <Text style={[styles.typingText, { color: textColor }]}>
                  Prayer Buddy is typing...
                </Text>
              </View>
            </View>
          )}

          {/* Enhanced Prayer Templates */}
          {!isTyping && messages.length <= 2 && (
            <View style={styles.templatesContainer}>
              <View style={styles.templatesHeader}>
                <Text style={[styles.templatesTitle, { color: textColor }]}>
                  Quick Prayer Templates
                </Text>
                <Text
                  style={[styles.templatesSubtitle, { color: textSecondary }]}
                >
                  Get started with guided prayers
                </Text>
              </View>
              <View style={styles.templateGrid}>
                {PRAYER_TEMPLATES.map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.templateCard, { backgroundColor: cardBg }]}
                    onPress={() => handlePrayerTemplate(template)}
                    accessibilityLabel={`${template.text} prayer template`}
                    accessibilityRole="button"
                  >
                    <View style={styles.templateIcon}>
                      <MaterialCommunityIcons
                        name={template.icon as any}
                        size={24}
                        color={colors.secondary}
                      />
                    </View>
                    <Text style={[styles.templateText, { color: textColor }]}>
                      {template.text}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color={textSecondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Enhanced Quick Replies */}
          {showQuickReplies && !isTyping && (
            <View style={styles.quickRepliesContainer}>
              <Text
                style={[styles.quickRepliesTitle, { color: textSecondary }]}
              >
                💬 Suggested responses
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
                    <MaterialCommunityIcons
                      name="send"
                      size={14}
                      color={colors.secondary}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.spacer} />
        </ScrollView>

        {/* Input Bar */}
        <RNAnimated.View
          style={[
            styles.inputContainer,
            { backgroundColor: cardBg },
            styles.inputPadding,
          ]}
        >
          {isListening && (
            <View style={styles.listeningIndicator}>
              <ActivityIndicator size="small" color={colors.error} />
              <Text style={[styles.listeningText, { color: colors.error }]}>
                Listening... Tap mic to stop
              </Text>
            </View>
          )}
          {remainingChars < 100 && (
            <Text
              style={[
                styles.charCount,
                {
                  color: remainingChars < 20 ? colors.error : textColor + "60",
                },
              ]}
            >
              {remainingChars} characters remaining
            </Text>
          )}
          <View style={[styles.inputWrapper, { backgroundColor }]}>
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={toggleVoiceInput}
              accessibilityLabel={
                isListening ? "Stop voice input" : "Start voice input"
              }
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name={isListening ? "microphone" : "microphone-outline"}
                size={26}
                color={isListening ? colors.error : textColor}
              />
            </TouchableOpacity>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: textColor }]}
              placeholder="🙏 Share what's on your heart..."
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
                        ? colors.secondaryLight80
                        : colors.secondary,
                  },
                ]}
              >
                {isTyping ? (
                  <ActivityIndicator size="small" color={colors.text.inverse} />
                ) : (
                  <MaterialCommunityIcons
                    name="send"
                    size={30}
                    color={colors.text.inverse}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </RNAnimated.View>
      </KeyboardAvoidingView>

      {/* Saved Messages Modal */}
      <Modal
        visible={showSavedMessages}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSavedMessages(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Saved Messages
            </Text>
            <TouchableOpacity onPress={() => setShowSavedMessages(false)}>
              <MaterialCommunityIcons
                name="close"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {getSavedMessages().length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons
                  name="bookmark-outline"
                  size={64}
                  color={textColor + "40"}
                />
                <Text
                  style={[styles.emptyStateText, { color: textColor + "60" }]}
                >
                  No saved messages yet
                </Text>
                <Text
                  style={[
                    styles.emptyStateSubtext,
                    { color: textColor + "40" },
                  ]}
                >
                  Long press any message and select &quot;Save Message&quot;
                </Text>
              </View>
            ) : (
              getSavedMessages().map((msg, idx) => (
                <View
                  key={msg.id || idx}
                  style={[styles.savedMessageCard, { backgroundColor: cardBg }]}
                >
                  <View style={styles.savedMessageHeader}>
                    <MaterialCommunityIcons
                      name={msg.role === "assistant" ? "hand-peace" : "account"}
                      size={20}
                      color={colors.secondary}
                    />
                    <Text
                      style={[styles.savedMessageRole, { color: textColor }]}
                    >
                      {msg.role === "assistant" ? "Prayer Buddy" : "You"}
                    </Text>
                    <Text
                      style={[
                        styles.savedMessageTime,
                        { color: textColor + "60" },
                      ]}
                    >
                      {formatTime(msg.timestamp)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.savedMessageContent, { color: textColor }]}
                  >
                    {msg.content}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Insights Modal */}
      <Modal
        visible={showInsights}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInsights(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor }]}>
          <View style={[styles.modalHeader, { backgroundColor: cardBg }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Conversation Insights
            </Text>
            <TouchableOpacity onPress={() => setShowInsights(false)}>
              <MaterialCommunityIcons
                name="close"
                size={28}
                color={textColor}
              />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {isGeneratingInsights ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.secondary} />
                <Text style={[styles.loadingText, { color: textColor }]}>
                  Analyzing your conversation...
                </Text>
              </View>
            ) : insights ? (
              <View>
                <View style={[styles.insightCard, { backgroundColor: cardBg }]}>
                  <Text
                    style={[styles.insightLabel, { color: textColor + "80" }]}
                  >
                    Summary
                  </Text>
                  <Text style={[styles.insightText, { color: textColor }]}>
                    {insights.summary}
                  </Text>
                </View>

                <View style={[styles.insightCard, { backgroundColor: cardBg }]}>
                  <Text
                    style={[styles.insightLabel, { color: textColor + "80" }]}
                  >
                    Key Topics
                  </Text>
                  <View style={styles.tagsContainer}>
                    {insights.keyTopics.map((topic: string, idx: number) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {insights.prayersDiscussed.length > 0 && (
                  <View
                    style={[styles.insightCard, { backgroundColor: cardBg }]}
                  >
                    <Text
                      style={[styles.insightLabel, { color: textColor + "80" }]}
                    >
                      Prayers Discussed
                    </Text>
                    {insights.prayersDiscussed.map(
                      (prayer: string, idx: number) => (
                        <Text
                          key={idx}
                          style={[styles.insightListItem, { color: textColor }]}
                        >
                          • {prayer}
                        </Text>
                      ),
                    )}
                  </View>
                )}

                {insights.versesMentioned.length > 0 && (
                  <View
                    style={[styles.insightCard, { backgroundColor: cardBg }]}
                  >
                    <Text
                      style={[styles.insightLabel, { color: textColor + "80" }]}
                    >
                      Verses Mentioned
                    </Text>
                    {insights.versesMentioned.map(
                      (verse: string, idx: number) => (
                        <Text
                          key={idx}
                          style={[
                            styles.insightListItem,
                            { color: colors.primary },
                          ]}
                        >
                          • {verse}
                        </Text>
                      ),
                    )}
                  </View>
                )}

                <View style={[styles.insightCard, { backgroundColor: cardBg }]}>
                  <Text
                    style={[styles.insightLabel, { color: textColor + "80" }]}
                  >
                    Suggested Next Steps
                  </Text>
                  {insights.suggestedNextSteps.map(
                    (step: string, idx: number) => (
                      <Text
                        key={idx}
                        style={[styles.insightListItem, { color: textColor }]}
                      >
                        {idx + 1}. {step}
                      </Text>
                    ),
                  )}
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
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
    borderRadius: appleDesign.borderRadius.round,
    height: appleDesign.button.height.medium,
    justifyContent: "center",
    width: appleDesign.button.height.medium,
    ...appleDesign.shadows.sm,
  },
  avatarContainer: {
    marginHorizontal: appleDesign.spacing.md,
  },
  charCount: {
    fontSize: appleDesign.typography.fontSize.caption1,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.caption1,
    marginBottom: appleDesign.spacing.sm,
    paddingHorizontal: appleDesign.spacing.xl,
    textAlign: "right",
  },
  container: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  headerButton: {
    padding: appleDesign.spacing.sm,
  },
  headerButtonLast: {
    marginRight: -appleDesign.spacing.sm,
    padding: appleDesign.spacing.sm,
  },
  headerButtons: {
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.title3,
    maxHeight: 140,
    minHeight: 60,
    paddingVertical: appleDesign.spacing.md,
  },
  inputContainer: {
    borderTopColor: colors.border.light,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  inputPadding: {
    paddingBottom: Platform.OS === "ios" ? 69 : 65,
  },
  inputWrapper: {
    alignItems: "flex-end",
    borderRadius: 28,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  insightCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  insightListItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
  },
  keyboardContainer: {
    flex: 1,
  },
  listeningIndicator: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  listeningText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 20,
  },
  messageBubble: {
    borderRadius: appleDesign.borderRadius.xl,
    padding: appleDesign.spacing.xxl,
    ...appleDesign.shadows.xs,
  },
  messageContentContainer: {
    flex: 1,
    maxWidth: "75%",
  },
  messageText: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.title2,
    marginBottom: appleDesign.spacing.xs,
  },
  messageWrapper: {
    alignItems: "flex-end",
    flexDirection: "row",
    marginBottom: appleDesign.spacing.xl,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: appleDesign.spacing.xl,
    paddingHorizontal: appleDesign.spacing.xl,
    paddingTop: appleDesign.spacing.xl,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    padding: appleDesign.spacing.xl,
  },
  modalHeader: {
    alignItems: "center",
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: appleDesign.spacing.xl,
  },
  modalTitle: {
    fontSize: appleDesign.typography.fontSize.title2,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title2,
  },
  offlineBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 8,
  },
  offlineText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: "600",
  },
  prayerEmoji: {
    fontSize: 20,
  },
  prayerEmojiHeader: {
    alignItems: "flex-start",
    marginBottom: 8,
  },
  quickRepliesContainer: {
    marginBottom: 8,
    marginTop: 16,
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
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.xl,
    flexDirection: "row",
    gap: appleDesign.spacing.sm,
    justifyContent: "space-between",
    paddingHorizontal: appleDesign.spacing.lg,
    paddingVertical: appleDesign.spacing.md,
  },
  quickReplyText: {
    flex: 1,
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.medium,
    lineHeight: appleDesign.typography.lineHeight.callout,
  },
  reactionBubble: {
    borderRadius: 12,
    marginRight: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reactionText: {
    fontSize: 16,
  },
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 8,
    marginTop: 4,
  },
  savedBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
  },
  savedMessageCard: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  savedMessageContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  savedMessageHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  savedMessageRole: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  savedMessageTime: {
    fontSize: 13,
  },
  savedText: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: "600",
  },
  searchBar: {
    alignItems: "center",
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: 32,
    overflow: "hidden",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    alignItems: "center",
    height: 64,
    justifyContent: "center",
    width: 64,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  spacer: {
    height: 20,
  },
  tag: {
    backgroundColor: colors.secondaryLight,
    borderRadius: 16,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  templateCard: {
    alignItems: "center",
    borderRadius: appleDesign.borderRadius.lg,
    flexDirection: "row",
    gap: appleDesign.spacing.md,
    justifyContent: "space-between",
    padding: appleDesign.spacing.lg,
    width: "48%",
    ...appleDesign.shadows.sm,
  },
  templateGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: appleDesign.spacing.md,
  },
  templateIcon: {
    alignItems: "center",
    backgroundColor: colors.secondaryLight + "20",
    borderRadius: appleDesign.borderRadius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  templateText: {
    flex: 1,
    fontSize: appleDesign.typography.fontSize.callout,
    fontWeight: appleDesign.typography.fontWeight.semibold,
    lineHeight: appleDesign.typography.lineHeight.callout,
  },
  templatesContainer: {
    marginBottom: appleDesign.spacing.lg,
    marginTop: appleDesign.spacing.xl,
  },
  templatesHeader: {
    marginBottom: appleDesign.spacing.lg,
  },
  templatesSubtitle: {
    fontSize: appleDesign.typography.fontSize.subheadline,
    fontWeight: appleDesign.typography.fontWeight.regular,
    lineHeight: appleDesign.typography.lineHeight.subheadline,
    marginTop: appleDesign.spacing.xs,
  },
  templatesTitle: {
    fontSize: appleDesign.typography.fontSize.title3,
    fontWeight: appleDesign.typography.fontWeight.bold,
    lineHeight: appleDesign.typography.lineHeight.title3,
  },
  timeText: {
    fontSize: 14,
  },
  typingBubble: {
    alignItems: "center",
    borderBottomLeftRadius: 4,
    borderRadius: 22,
    flexDirection: "row",
    gap: 12,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  typingEmoji: {
    fontSize: 18,
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
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  userMessageText: {
    color: colors.text.inverse,
  },
  userMessageWrapper: {
    justifyContent: "flex-end",
  },
  userTimeText: {
    color: colors.text.inverseSecondary,
  },
  voiceButton: {
    padding: 8,
  },
});
