import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  time: string;
}

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Xin chào! Bạn cần hỗ trợ gì?', sender: 'other', time: '10:30 AM' },
    { id: '2', text: 'Tôi muốn hỏi về đơn hàng của mình', sender: 'me', time: '10:32 AM' },
    { id: '3', text: 'Vâng, bạn vui lòng cung cấp mã đơn hàng để tôi kiểm tra giúp', sender: 'other', time: '10:33 AM' },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        text: message,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'me' ? styles.myMessage : styles.otherMessage]}>
      <View style={[styles.messageBubble, item.sender === 'me' ? styles.myBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, item.sender === 'me' ? styles.myText : styles.otherText]}>
          {item.text}
        </Text>
        <Text style={[styles.timeText, item.sender === 'me' ? styles.myTime : styles.otherTime]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://placehold.co/40x40' }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Hỗ trợ khách hàng</Text>
          <Text style={styles.statusText}>Đang trực tuyến</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
  },
  headerInfo: {
    marginLeft: spacing[3],
  },
  headerName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    color: colors.success[500],
  },
  messagesList: {
    flex: 1,
    padding: spacing[3],
  },
  messageContainer: {
    marginBottom: spacing[3],
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: spacing[3],
    borderRadius: radius.md,
  },
  myBubble: {
    backgroundColor: colors.brand.red[500],
  },
  otherBubble: {
    backgroundColor: colors.neutral[100],
  },
  messageText: {
    fontSize: typography.body.md.fontSize,
    marginBottom: spacing[1],
  },
  myText: {
    color: colors.neutral[50],
  },
  otherText: {
    color: semanticColors.text.primary,
  },
  timeText: {
    fontSize: typography.caption.fontSize,
    alignSelf: 'flex-end',
  },
  myTime: {
    color: colors.neutral[200],
  },
  otherTime: {
    color: semanticColors.text.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing[3],
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.divider,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    fontSize: typography.body.md.fontSize,
  },
  sendButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default ChatScreen;