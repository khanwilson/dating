import { Ionicons } from '@expo/vector-icons';
import { AppText } from 'components/text/AppText';
import { Image } from 'expo-image';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_CANDIDATES, Candidate } from 'src/data/mockCandidates';
import { ITheme, useAppTheme } from 'theme/index';
import ZustandPersist from 'zustand/persist';
import { useShallow } from 'zustand/react/shallow';

const { width: SCREEN_W } = Dimensions.get('window');

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: MessageStatus;
}

interface ConversationData {
  candidate: Candidate;
  messages: Message[];
  typing: boolean;
}

const candidateMap = new Map(ALL_CANDIDATES.map((c) => [c.id, c]));

function buildInitialConversations(iLiked: string[]): Map<string, ConversationData> {
  const map = new Map<string, ConversationData>();
  const matched = iLiked.slice(0, 8);
  const now = Date.now();

  for (let i = 0; i < matched.length; i++) {
    const c = candidateMap.get(matched[i]);
    if (!c) continue;
    const msgs: Message[] = [];
    if (i < 4) {
      msgs.push(
        { id: `${c.id}-1`, senderId: c.id, text: `Hey! I'm ${c.displayName} 👋`, timestamp: now - 3600000 * (i + 1), status: 'read' },
        { id: `${c.id}-2`, senderId: 'me', text: 'Hi! Nice to meet you 😊', timestamp: now - 3500000 * (i + 1), status: 'read' },
      );
      if (i < 2) {
        msgs.push(
          { id: `${c.id}-3`, senderId: c.id, text: 'What do you do for fun?', timestamp: now - 1800000, status: 'delivered' },
        );
      }
    }
    map.set(c.id, { candidate: c, messages: msgs, typing: false });
  }
  return map;
}

let msgCounter = Date.now();

export default function ChatScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const iLikedRaw = ZustandPersist(useShallow((s) => s.iLiked));
  const iLiked = useMemo(() => iLikedRaw ?? [], [iLikedRaw]);

  const [conversations, setConversations] = useState(() => buildInitialConversations(iLiked));
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const sortedConvos = useMemo(() => {
    const arr = [...conversations.values()];
    arr.sort((a, b) => {
      const aLast = a.messages.at(-1)?.timestamp ?? 0;
      const bLast = b.messages.at(-1)?.timestamp ?? 0;
      return bLast - aLast;
    });
    return arr;
  }, [conversations]);

  const activeConvo = activeChatId ? conversations.get(activeChatId) : null;

  const sendMessage = useCallback((text: string) => {
    if (!activeChatId) return;
    const id = String(msgCounter++);
    const msg: Message = { id, senderId: 'me', text, timestamp: Date.now(), status: 'sending' };

    setConversations((prev) => {
      const next = new Map(prev);
      const convo = next.get(activeChatId);
      if (!convo) return prev;
      const updated = { ...convo, messages: [...convo.messages, msg], typing: true };
      next.set(activeChatId, updated);
      return next;
    });

    // Simulate status transitions
    setTimeout(() => {
      setConversations((prev) => {
        const next = new Map(prev);
        const convo = next.get(activeChatId);
        if (!convo) return prev;
        const msgs = convo.messages.map((m) => m.id === id ? { ...m, status: 'sent' as const } : m);
        next.set(activeChatId, { ...convo, messages: msgs });
        return next;
      });
    }, 500);

    setTimeout(() => {
      setConversations((prev) => {
        const next = new Map(prev);
        const convo = next.get(activeChatId);
        if (!convo) return prev;
        const msgs = convo.messages.map((m) => m.id === id ? { ...m, status: 'delivered' as const } : m);
        next.set(activeChatId, { ...convo, messages: msgs });
        return next;
      });
    }, 1200);

    setTimeout(() => {
      setConversations((prev) => {
        const next = new Map(prev);
        const convo = next.get(activeChatId);
        if (!convo) return prev;
        const msgs = convo.messages.map((m) => m.id === id ? { ...m, status: 'read' as const } : m);
        next.set(activeChatId, { ...convo, messages: msgs, typing: false });
        return next;
      });
    }, 2500);
  }, [activeChatId]);

  if (activeConvo) {
    return (
      <ChatDetail
        convo={activeConvo}
        styles={styles}
        theme={theme}
        insets={insets}
        onBack={() => setActiveChatId(null)}
        onSend={sendMessage}
      />
    );
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.header}>Chat</AppText>
      {sortedConvos.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={56} color={theme.color.neutral[600]} />
          <AppText style={styles.emptyTitle}>No conversations yet</AppText>
          <AppText style={styles.emptySubtitle}>Match with someone to start chatting</AppText>
        </View>
      ) : (
        <FlatList
          data={sortedConvos}
          keyExtractor={(c) => c.candidate.id}
          renderItem={({ item }) => (
            <ConversationRow
              convo={item}
              styles={styles}
              theme={theme}
              onPress={() => setActiveChatId(item.candidate.id)}
            />
          )}
        />
      )}
    </View>
  );
}

function ConversationRow({
  convo,
  styles,
  theme,
  onPress,
}: {
  convo: ConversationData;
  styles: ReturnType<typeof createStyles>;
  theme: ITheme;
  onPress: () => void;
}) {
  const lastMsg = convo.messages.at(-1);
  const unread = convo.messages.filter((m) => m.senderId !== 'me' && m.status !== 'read').length;
  const time = lastMsg ? formatTime(lastMsg.timestamp) : '';
  const isMe = lastMsg?.senderId === 'me';

  const statusIcon = isMe ? getStatusIcon(lastMsg?.status) : null;

  return (
    <TouchableOpacity style={styles.convoRow} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: convo.candidate.photos[0] }} style={styles.avatar} contentFit="cover" />
      <View style={styles.convoInfo}>
        <View style={styles.convoTop}>
          <AppText style={styles.convoName} numberOfLines={1}>{convo.candidate.displayName}</AppText>
          <AppText style={styles.convoTime}>{time}</AppText>
        </View>
        <View style={styles.convoBottom}>
          {statusIcon && <Ionicons name={statusIcon} size={14} color={theme.color.neutral[400]} style={{ marginRight: 4 }} />}
          <AppText style={[styles.convoPreview, unread > 0 && styles.convoPreviewBold]} numberOfLines={1}>
            {lastMsg?.text ?? 'Say hi!'}
          </AppText>
          {unread > 0 && (
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{unread}</AppText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ChatDetail({
  convo,
  styles,
  theme,
  insets,
  onBack,
  onSend,
}: {
  convo: ConversationData;
  styles: ReturnType<typeof createStyles>;
  theme: ITheme;
  insets: { top: number; bottom: number };
  onBack: () => void;
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.chatHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={styles.chatBackBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.color.textColor.white} />
        </TouchableOpacity>
        <Image source={{ uri: convo.candidate.photos[0] }} style={styles.chatHeaderAvatar} contentFit="cover" />
        <AppText style={styles.chatHeaderName}>{convo.candidate.displayName}</AppText>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={convo.messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMe = item.senderId === 'me';
          return (
            <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                <AppText style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</AppText>
              </View>
              {isMe && (
                <AppText style={styles.statusText}>{item.status}</AppText>
              )}
            </View>
          );
        }}
        ListFooterComponent={
          convo.typing ? (
            <View style={styles.typingRow}>
              <AppText style={styles.typingText}>typing...</AppText>
            </View>
          ) : null
        }
      />

      {/* Input bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
        <TextInput
          style={styles.chatInput}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={theme.color.neutral[500]}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color={text.trim() ? theme.color.primary[500] : theme.color.neutral[600]} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function getStatusIcon(status?: MessageStatus): keyof typeof Ionicons.glyphMap | null {
  switch (status) {
    case 'sending': return 'time-outline';
    case 'sent': return 'checkmark';
    case 'delivered': return 'checkmark-done';
    case 'read': return 'checkmark-done';
    default: return null;
  }
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

const createStyles = (theme: ITheme, insets: { top: number; bottom: number }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.color.neutral[900], paddingTop: insets.top },
    header: {
      fontSize: 28, fontWeight: 'bold', color: theme.color.textColor.white,
      paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
    },
    // Conversation list
    convoRow: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20,
      paddingVertical: 12, gap: 12,
    },
    avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.color.neutral[800] },
    convoInfo: { flex: 1 },
    convoTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    convoName: { fontSize: 16, fontWeight: '600', color: theme.color.textColor.white, flex: 1 },
    convoTime: { fontSize: 12, color: theme.color.neutral[400] },
    convoBottom: { flexDirection: 'row', alignItems: 'center' },
    convoPreview: { fontSize: 14, color: theme.color.neutral[400], flex: 1 },
    convoPreviewBold: { color: theme.color.textColor.white, fontWeight: '600' },
    badge: {
      backgroundColor: theme.color.primary[500], borderRadius: 10,
      minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 6, marginLeft: 8,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
    // Chat detail header
    chatHeader: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
      paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: theme.color.neutral[700],
      backgroundColor: theme.color.neutral[900],
    },
    chatBackBtn: { padding: 8 },
    chatHeaderAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
    chatHeaderName: { fontSize: 18, fontWeight: '600', color: theme.color.textColor.white },
    // Messages
    messagesList: { padding: 16, paddingBottom: 8 },
    bubbleRow: { marginBottom: 8 },
    bubbleRowMe: { alignItems: 'flex-end' },
    bubble: { maxWidth: SCREEN_W * 0.72, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 },
    bubbleMe: { backgroundColor: theme.color.primary[500], borderBottomRightRadius: 4 },
    bubbleOther: { backgroundColor: theme.color.neutral[700], borderBottomLeftRadius: 4 },
    bubbleText: { fontSize: 15, color: theme.color.textColor.white, lineHeight: 20 },
    bubbleTextMe: { color: '#fff' },
    statusText: { fontSize: 11, color: theme.color.neutral[500], marginTop: 2, marginRight: 4 },
    typingRow: { paddingLeft: 4, marginTop: 4 },
    typingText: { fontSize: 13, color: theme.color.neutral[500], fontStyle: 'italic' },
    // Input bar
    inputBar: {
      flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8,
      borderTopWidth: 0.5, borderTopColor: theme.color.neutral[700],
      backgroundColor: theme.color.neutral[900],
    },
    chatInput: {
      flex: 1, backgroundColor: theme.color.neutral[800], borderRadius: 20,
      paddingHorizontal: 16, paddingVertical: 10, fontSize: 15,
      color: theme.color.textColor.white,
    },
    sendBtn: { padding: 10 },
    // Empty
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.color.textColor.white, marginTop: 16 },
    emptySubtitle: { fontSize: 14, color: theme.color.neutral[400], marginTop: 8, textAlign: 'center' },
  });
