"use client"

import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { useNavigation, useRoute } from "@react-navigation/native"
import Ionicons from "react-native-vector-icons/Ionicons"

import { colors } from "@/constants/colors"
import Avatar from "@/components/Avatar"
import Button from "@/components/Button"

interface Message {
  id: string
  sender: {
    id: string
    name: string
    avatar: string
  }
  text: string
  timestamp: string
  isCurrentUser: boolean
  isSystem?: boolean
}

const ChatScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { id } = route.params as { id: string }
  const [message, setMessage] = useState("")
  const scrollViewRef = useRef<ScrollView>(null)

  // Sample messages data
  const messages: Message[] = [
    {
      id: "1",
      sender: {
        id: "1",
        name: "Maria Santos",
        avatar: "https://via.placeholder.com/40",
      },
      text: "Hey everyone! So excited for our La Union trip! 🏄‍♀️",
      timestamp: "10:30 AM",
      isCurrentUser: false,
    },
    {
      id: "2",
      sender: {
        id: "2",
        name: "Juan Dela Cruz",
        avatar: "https://via.placeholder.com/40",
      },
      text: "Same here! I've been checking the weather and it looks perfect for the weekend.",
      timestamp: "10:32 AM",
      isCurrentUser: false,
    },
    {
      id: "3",
      sender: {
        id: "3",
        name: "Ana Reyes",
        avatar: "https://via.placeholder.com/40",
      },
      text: "I've booked our rooms at Flotsam & Jetsam. We got the beachfront cottage!",
      timestamp: "10:35 AM",
      isCurrentUser: false,
    },
    {
      id: "4",
      sender: {
        id: "4",
        name: "Carlo Aquino",
        avatar: "https://via.placeholder.com/40",
      },
      text: "Nice! What time are we leaving Manila?",
      timestamp: "10:40 AM",
      isCurrentUser: false,
    },
    {
      id: "5",
      sender: {
        id: "1",
        name: "Maria Santos",
        avatar: "https://via.placeholder.com/40",
      },
      text: "I created a poll for that. Looks like most people want to leave at 6 AM.",
      timestamp: "10:42 AM",
      isCurrentUser: false,
    },
    {
      id: "6",
      sender: {
        id: "5",
        name: "Bianca Gonzalez",
        avatar: "https://via.placeholder.com/40",
      },
      text: "That works for me! Who's driving?",
      timestamp: "10:45 AM",
      isCurrentUser: false,
    },
    {
      id: "7",
      sender: {
        id: "2",
        name: "Juan Dela Cruz",
        avatar: "https://via.placeholder.com/40",
      },
      text: "I can drive my SUV. It can fit 7 people comfortably.",
      timestamp: "10:47 AM",
      isCurrentUser: false,
    },
    {
      id: "8",
      sender: {
        id: "current",
        name: "You",
        avatar: "https://via.placeholder.com/40",
      },
      text: "Perfect! I'll bring some snacks for the road trip. Any requests?",
      timestamp: "10:50 AM",
      isCurrentUser: true,
    },
    {
      id: "9",
      sender: {
        id: "3",
        name: "Ana Reyes",
        avatar: "https://via.placeholder.com/40",
      },
      text: "Chips and soda please! And maybe some sandwiches?",
      timestamp: "10:52 AM",
      isCurrentUser: false,
    },
    {
      id: "10",
      sender: {
        id: "4",
        name: "Carlo Aquino",
        avatar: "https://via.placeholder.com/40",
      },
      text: "Don't forget the sunscreen! I got burned last time 😅",
      timestamp: "10:55 AM",
      isCurrentUser: false,
    },
    {
      id: "11",
      sender: {
        id: "system",
        name: "System",
        avatar: "",
      },
      text: "Maria Santos has updated the event details. Departure time is now set to 6:00 AM.",
      timestamp: "11:00 AM",
      isCurrentUser: false,
      isSystem: true,
    },
  ]

  // Scroll to bottom of messages
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false })
    }, 100)
  }, [])

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real app, you would send the message to the server here
      setMessage("")
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>La Union Beach Trip</Text>
            <Text style={styles.headerSubtitle}>8 participants</Text>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => {
            const isFirstInGroup = index === 0 || messages[index - 1].sender.id !== msg.sender.id
            const isLastInGroup = index === messages.length - 1 || messages[index + 1].sender.id !== msg.sender.id

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.isCurrentUser ? styles.messageRowRight : styles.messageRowLeft,
                  !isLastInGroup && styles.messageRowNoMargin,
                ]}
              >
                {msg.isSystem ? (
                  <View style={styles.systemMessage}>
                    <Text style={styles.systemMessageText}>{msg.text}</Text>
                  </View>
                ) : (
                  <View style={[styles.messageContainer, msg.isCurrentUser ? styles.messageRight : styles.messageLeft]}>
                    {isLastInGroup && !msg.isCurrentUser && (
                      <Avatar source={{ uri: msg.sender.avatar }} name={msg.sender.name} size="sm" />
                    )}
                    {!isLastInGroup && !msg.isCurrentUser && <View style={styles.avatarPlaceholder} />}
                    <View
                      style={[
                        styles.messageBubble,
                        isFirstInGroup && styles.messageBubbleFirst,
                        isLastInGroup && styles.messageBubbleLast,
                        msg.isCurrentUser ? styles.messageBubbleCurrentUser : styles.messageBubbleOtherUser,
                      ]}
                    >
                      {isFirstInGroup && !msg.isCurrentUser && (
                        <Text style={styles.messageSender}>{msg.sender.name}</Text>
                      )}
                      <Text style={[styles.messageText, msg.isCurrentUser && styles.messageTextCurrentUser]}>
                        {msg.text}
                      </Text>
                      <Text
                        style={[
                          styles.messageTimestamp,
                          msg.isCurrentUser ? styles.messageTimestampCurrentUser : styles.messageTimestampOtherUser,
                        ]}
                      >
                        {msg.timestamp}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )
          })}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="image-outline" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.inputButton}>
            <Ionicons name="attach-outline" size={20} color={colors.gray[500]} />
          </TouchableOpacity>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            style={styles.input}
            placeholderTextColor={colors.gray[400]}
            multiline
          />
          <Button
            onPress={handleSendMessage}
            disabled={!message.trim()}
            style={styles.sendButton}
            icon={<Ionicons name="send" size={20} color={colors.white} />}
            title=""
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  backButton: {
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.gray[500],
  },
  infoButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  messagesContent: {
    padding: 16,
  },
  messageRow: {
    marginBottom: 16,
    flexDirection: "row",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowNoMargin: {
    marginBottom: 2,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    maxWidth: "80%",
  },
  messageRight: {
    flexDirection: "row-reverse",
  },
  messageLeft: {},
  avatarPlaceholder: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "100%",
  },
  messageBubbleFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  messageBubbleLast: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  messageBubbleCurrentUser: {
    backgroundColor: colors.green[600],
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  messageBubbleOtherUser: {
    backgroundColor: colors.gray[200],
    borderBottomLeftRadius: 4,
    marginRight: 8,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: colors.gray[900],
  },
  messageTextCurrentUser: {
    color: colors.white,
  },
  messageTimestamp: {
    fontSize: 10,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  messageTimestampCurrentUser: {
    color: colors.green[200],
  },
  messageTimestampOtherUser: {
    color: colors.gray[500],
  },
  systemMessage: {
    backgroundColor: colors.gray[100],
    padding: 8,
    borderRadius: 8,
    alignSelf: "center",
    maxWidth: "80%",
  },
  systemMessageText: {
    fontSize: 12,
    color: colors.gray[500],
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  inputButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
  },
})

export default ChatScreen
