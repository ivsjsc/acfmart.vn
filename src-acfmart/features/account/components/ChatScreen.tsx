import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
}

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Xin chào, mình có thể giúp gì cho bạn?', sender: 'other', timestamp: '10:30 AM', status: 'read' },
    { id: '2', text: 'Mình muốn hỏi về sản phẩm son dưỡng môi bạn đăng', sender: 'user', timestamp: '10:32 AM', status: 'read' },
    { id: '3', text: 'Dạ, sản phẩm của shop cam kết chính hãng 100%, có tem chống giả nhé!', sender: 'other', timestamp: '10:33 AM', status: 'read' },
    { id: '4', text: 'Tuyệt vời! Mình sẽ đặt ngay', sender: 'user', timestamp: '10:35 AM', status: 'delivered' },
    { id: '5', text: 'Cảm ơn bạn! Nếu có thắc mắc gì thêm cứ hỏi shop nhé', sender: 'other', timestamp: '10:36 AM', status: 'delivered' },
  ]);
  
  const [contacts] = useState<ChatContact[]>([
    { id: 'c1', name: 'Natural Beauty Shop', avatar: 'https://via.placeholder.com/40', lastMessage: 'Cảm ơn bạn! Nếu có thắc mắc gì thêm cứ hỏi shop nhé', timestamp: '10:36 AM', unread: 0, isOnline: true },
    { id: 'c2', name: 'Hỗ trợ khách hàng', avatar: 'https://via.placeholder.com/40', lastMessage: 'Xác nhận đơn hàng của bạn đã thành công', timestamp: 'Hôm qua', unread: 2, isOnline: true },
    { id: 'c3', name: 'Electronics Pro', avatar: 'https://via.placeholder.com/40', lastMessage: 'Giao hàng dự kiến ngày mai', timestamp: 'Hôm qua', unread: 0, isOnline: false },
    { id: 'c4', name: 'Fashion Hub', avatar: 'https://via.placeholder.com/40', lastMessage: 'Sản phẩm bạn quan tâm đã về hàng', timestamp: '2 ngày trước', unread: 0, isOnline: false },
  ]);
  
  const [newMessage, setNewMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chats' | 'messages'>('chats');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    
    setMessages([...messages, message]);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.otherMessage]}>
      <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.otherText]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, item.sender === 'user' ? styles.userTimestamp : styles.otherTimestamp]}>
            {item.timestamp}
          </Text>
          {item.sender === 'user' && item.status && (
            <Text style={styles.sendStatus}>
              {item.status === 'sent' ? '✓' : item.status === 'delivered' ? '✓✓' : '✓✓✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderContact = ({ item }: { item: ChatContact }) => (
    <TouchableOpacity style={styles.contactItem}>
      <View style={styles.contactAvatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.contactInfo}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactTime}>{item.timestamp}</Text>
        </View>
        <View style={styles.contactBottom}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.headerTitle}>Tin nhắn</Text>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}
        >
          <Text style={[styles.tabText, activeTab === 'chats' && styles.activeTabText]}>Cuộc trò chuyện</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'messages' && styles.activeTab]}
          onPress={() => setActiveTab('messages')}
        >
          <Text style={[styles.tabText, activeTab === 'messages' && styles.activeTabText]}>Tin nhắn</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'chats' ? (
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactsList}
        />
      ) : (
        <>
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesList}
          />
          
          {/* Message Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Nhập tin nhắn..."
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
    paddingTop: spacing[6],
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing[4],
    borderRadius: radius.md,
    marginBottom: spacing[4},
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3},
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.brand.red[500],
  },
  tabText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.neutral[50],
  },
  contactsList: {
    paddingHorizontal: spacing[4},
    paddingBottom: spacing[10},
  },
  contactItem: {
    flexDirection: 'row',
    paddingVertical: spacing[3},
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  contactAvatarContainer: {
    marginRight: spacing[3},
    position: 'relative',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: radius.full,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: radius.full,
    backgroundColor: colors.success[500],
    borderWidth: 2,
    borderColor: colors.neutral[50],
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1},
  },
  contactName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  contactTime: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  contactBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  unreadBadge: {
    backgroundColor: colors.brand.red[500],
    minWidth: 20,
    height: 20,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2},
  },
  unreadText: {
    color: colors.neutral[50],
    fontSize: typography.caption.fontSize,
    fontWeight: 'bold',
  },
  messagesList: {
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[3},
    flex: 1,
  },
  messageContainer: {
    marginBottom: spacing[3},
    maxWidth: Dimensions.get('window').width * 0.8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: radius.md,
    padding: spacing[3},
  },
  userBubble: {
    backgroundColor: colors.brand.red[500],
  },
  otherBubble: {
    backgroundColor: colors.neutral[100],
  },
  messageText: {
    fontSize: typography.body.md.fontSize,
    marginBottom: spacing[1},
  },
  userText: {
    color: colors.neutral[50],
  },
  otherText: {
    color: semanticColors.text.primary,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: typography.caption.fontSize,
  },
  userTimestamp: {
    color: colors.neutral[200],
  },
  otherTimestamp: {
    color: semanticColors.text.muted,
  },
  sendStatus: {
    marginLeft: spacing[2},
    fontSize: typography.caption.fontSize,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing[4},
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.divider,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.full,
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[3},
    marginRight: spacing[2},
    maxHeight: 100,
    fontSize: typography.body.md.fontSize,
  },
  sendButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[3},
    borderRadius: radius.full,
  },
  sendButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default ChatScreen;