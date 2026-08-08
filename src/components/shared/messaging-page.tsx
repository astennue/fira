'use client'

import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore, type UserRole, roleDisplayNames } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  MessageCircle,
  Send,
  Search,
  ArrowLeft,
  Phone,
  Video,
  Circle,
  Loader2,
  X,
} from 'lucide-react'

// Types
interface ConversationInfo {
  id: string
  participants: string[]
  lastMessage?: {
    id: string
    conversationId: string
    senderId: string
    senderName: string
    senderRole: string
    content: string
    timestamp: string | Date
  }
  otherUser: {
    id: string
    socketId: string
    name: string
    role: string
    avatar?: string
    connectedAt: string | Date
  } | null
  unreadCount: number
  createdAt: string | Date
}

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  timestamp: string | Date
}

type RoleFilter = 'all' | 'applicant' | 'local_agency' | 'international_agency' | 'employer'

const roleColors: Record<string, string> = {
  applicant: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  local_agency: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  international_agency: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  employer: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  super_admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
}

const messageBubbleColors: Record<string, string> = {
  applicant: 'bg-emerald-600 text-white',
  local_agency: 'bg-amber-600 text-white',
  international_agency: 'bg-violet-600 text-white',
  employer: 'bg-sky-600 text-white',
  super_admin: 'bg-rose-600 text-white',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatTime(timestamp: string | Date): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatMessageTime(timestamp: string | Date): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatMessageDate(timestamp: string | Date): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export function MessagingPage() {
  const { user, language } = useAppStore()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [conversations, setConversations] = useState<ConversationInfo[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [showMobileConversations, setShowMobileConversations] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fil = language === 'fil'

  // Labels
  const labels = useMemo(() => ({
    title: fil ? 'Mensahe' : 'Messages',
    searchPlaceholder: fil ? 'Maghanap ng usapan...' : 'Search conversations...',
    typePlaceholder: fil ? 'I-type ang mensahe...' : 'Type a message...',
    send: fil ? 'Ipadala' : 'Send',
    noConversations: fil ? 'Wala pang usapan' : 'No conversations yet',
    noConversationsDesc: fil ? 'Magsimula ng bagong usapan sa pamamagitan ng pag-click sa isang user' : 'Start a new conversation by clicking on a user',
    noMessages: fil ? 'Pumili ng usapan' : 'Select a conversation',
    noMessagesDesc: fil ? 'Pumili ng usapan mula sa listahan upang magsimulang mag-chat' : 'Choose a conversation from the list to start chatting',
    all: fil ? 'Lahat' : 'All',
    applicants: fil ? 'Mga Aplikante' : 'Applicants',
    agencies: fil ? 'Mga Ahensya' : 'Agencies',
    employers: fil ? 'Mga Empleyador' : 'Employers',
    online: fil ? 'Online' : 'Online',
    offline: fil ? 'Offline' : 'Offline',
    typing: fil ? 'nag-type...' : 'typing...',
    connectError: fil ? 'Hindi maka-connect sa chat server' : 'Could not connect to chat server',
    connecting: fil ? 'Kumokonekta...' : 'Connecting...',
    unread: fil ? 'hindi pa nabasa' : 'unread',
    filterBy: fil ? 'Filter ayon sa:' : 'Filter by:',
    conversations: fil ? 'Mga Usapan' : 'Conversations',
  }), [fil])

  // Connect to socket
  useEffect(() => {
    if (!user) return

    const socketInstance = io('/?XTransformPort=3005', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 15000,
    })

    socketRef.current = socketInstance

    socketInstance.on('connect', () => {
      setIsConnected(true)
      socketInstance.emit('register', {
        userId: user.id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      })
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
    })

    socketInstance.on('conversations-list', (data: ConversationInfo[]) => {
      setConversations(data)
    })

    socketInstance.on('room-messages', (data: { conversationId: string; messages: ChatMessage[] }) => {
      setRoomMessages(data.messages)
    })

    socketInstance.on('message-sent', (msg: ChatMessage) => {
      setRoomMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    })

    socketInstance.on('typing-indicator', (data: { conversationId: string; userName: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUser(data.userName)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000)
      } else {
        setTypingUser(null)
      }
    })

    return () => {
      socketInstance.disconnect()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [user])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [roomMessages, typingUser])

  // Select a conversation
  const handleSelectConversation = useCallback(
    (convId: string) => {
      setSelectedConversation(convId)
      setShowMobileConversations(false)
      if (socketRef.current) {
        socketRef.current.emit('join-room', { conversationId: convId })
      }
    },
    []
  )

  // Send a message
  const handleSendMessage = useCallback(() => {
    if (!socketRef.current || !selectedConversation || !messageInput.trim()) return

    socketRef.current.emit('send-message', {
      conversationId: selectedConversation,
      content: messageInput.trim(),
    })
    setMessageInput('')

    // Clear typing
    socketRef.current.emit('typing', { conversationId: selectedConversation, isTyping: false })
  }, [selectedConversation, messageInput])

  // Handle typing
  const handleTyping = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessageInput(e.target.value)
      if (socketRef.current && selectedConversation) {
        socketRef.current.emit('typing', { conversationId: selectedConversation, isTyping: true })
      }
    },
    [selectedConversation]
  )

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage]
  )

  // Go back on mobile
  const handleBack = useCallback(() => {
    setShowMobileConversations(true)
    setSelectedConversation(null)
  }, [])

  // Filter conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations
    if (roleFilter !== 'all') {
      filtered = filtered.filter((c) => {
        // Filter based on the last message sender role or other user role
        if (c.otherUser) return c.otherUser.role === roleFilter
        if (c.lastMessage) return c.lastMessage.senderRole === roleFilter
        return false
      })
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter((c) => {
        const name = c.otherUser?.name || ''
        const lastMsg = c.lastMessage?.content || ''
        return name.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q)
      })
    }
    return filtered
  }, [conversations, roleFilter, searchQuery])

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: Array<{ date: string; messages: ChatMessage[] }> = []
    let currentDate = ''

    for (const msg of roomMessages) {
      const msgDate = formatMessageDate(msg.timestamp)
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msgDate, messages: [msg] })
      } else {
        groups[groups.length - 1].messages.push(msg)
      }
    }
    return groups
  }, [roomMessages])

  // Selected conversation info
  const selectedConv = useMemo(
    () => conversations.find((c) => c.id === selectedConversation),
    [conversations, selectedConversation]
  )

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">{fil ? 'Mag-sign in para makita ang mensahe' : 'Please sign in to view messages'}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-10rem)] rounded-xl border bg-card overflow-hidden shadow-sm">
      {/* Conversations List - Desktop */}
      <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col border-r">
        <ConversationsPanel
          labels={labels}
          isConnected={isConnected}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          filteredConversations={filteredConversations}
          selectedConversation={selectedConversation}
          onSelect={handleSelectConversation}
          userId={user.id}
        />
      </div>

      {/* Messages Area - Desktop & Mobile (when conversation selected) */}
      <div className={cn('flex-1 flex flex-col min-h-0', !showMobileConversations && 'flex', showMobileConversations && 'hidden lg:flex')}>
        {selectedConversation && selectedConv ? (
          <>
            {/* Chat header */}
            <ChatHeader
              conv={selectedConv}
              typingUser={typingUser}
              labels={labels}
              onBack={handleBack}
            />

            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-1">
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      <div className="flex items-center justify-center py-2">
                        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                          {group.date}
                        </span>
                      </div>
                      {group.messages.map((msg) => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOwn={msg.senderId === user.id}
                        />
                      ))}
                    </div>
                  ))}
                  {typingUser && (
                    <div className="flex items-end gap-2 mb-2">
                      <div className="bg-muted rounded-2xl px-4 py-2.5 flex items-center gap-1">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-muted-foreground ml-1">{typingUser}</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message input */}
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <Input
                  value={messageInput}
                  onChange={handleTyping}
                  onKeyDown={handleKeyPress}
                  placeholder={labels.typePlaceholder}
                  className="flex-1"
                  disabled={!isConnected}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!isConnected || !messageInput.trim()}
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyMessagesState labels={labels} />
        )}
      </div>

      {/* Empty state when no conversation is selected on desktop */}
      {selectedConversation && showMobileConversations && (
        <EmptyMessagesState labels={labels} className="hidden lg:flex" />
      )}

      {/* Mobile Conversations */}
      {showMobileConversations && (
        <div className="lg:hidden flex flex-col h-[calc(100vh-10rem)]">
          <ConversationsPanel
            labels={labels}
            isConnected={isConnected}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            filteredConversations={filteredConversations}
            selectedConversation={selectedConversation}
            onSelect={handleSelectConversation}
            userId={user.id}
          />
        </div>
      )}

      {/* Connection status indicator */}
      {!isConnected && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-lg z-10">
          <Loader2 className="h-3 w-3 animate-spin" />
          {labels.connecting}
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

interface ConversationsPanelProps {
  labels: Record<string, string>
  isConnected: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  roleFilter: RoleFilter
  setRoleFilter: (f: RoleFilter) => void
  filteredConversations: ConversationInfo[]
  selectedConversation: string | null
  onSelect: (id: string) => void
  userId: string
}

function ConversationsPanel({
  labels,
  isConnected,
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  filteredConversations,
  selectedConversation,
  onSelect,
  userId,
}: ConversationsPanelProps) {
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            {labels.title}
          </h2>
          <div className={cn(
            'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
            isConnected ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-destructive/10 text-destructive'
          )}>
            <Circle className={cn('h-2 w-2 fill-current', isConnected && 'animate-pulse')} />
            {isConnected ? 'Live' : 'Offline'}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={labels.searchPlaceholder}
            className="pl-9 h-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {[
            { key: 'all' as RoleFilter, label: labels.all },
            { key: 'applicant' as RoleFilter, label: labels.applicants },
            { key: 'local_agency' as RoleFilter, label: labels.agencies },
            { key: 'employer' as RoleFilter, label: labels.employers },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors font-medium',
                roleFilter === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">{labels.noConversations}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{labels.noConversationsDesc}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conv) => {
                const otherUser = conv.otherUser
                const lastMsg = conv.lastMessage
                const isSelected = selectedConversation === conv.id

                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelect(conv.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-150 text-left',
                      isSelected
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50 border border-transparent'
                    )}
                  >
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback
                        className={cn(
                          'text-sm font-semibold',
                          otherUser?.role && roleColors[otherUser.role]
                        )}
                      >
                        {getInitials(otherUser?.name || 'Unknown')}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold truncate">
                          {otherUser?.name || 'Unknown User'}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatTime(lastMsg.timestamp)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] px-1.5 py-0 h-4 font-normal border',
                            otherUser?.role && roleColors[otherUser.role]
                          )}
                        >
                          {otherUser?.role
                            ? roleDisplayNames[otherUser.role as UserRole]?.en || otherUser.role
                            : ''}
                        </Badge>
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {lastMsg.senderId === userId ? 'You: ' : ''}
                          {lastMsg.content}
                        </p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  )
}

interface ChatHeaderProps {
  conv: ConversationInfo
  typingUser: string | null
  labels: Record<string, string>
  onBack: () => void
}

function ChatHeader({ conv, typingUser, labels, onBack }: ChatHeaderProps) {
  const otherUser = conv.otherUser

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b bg-card">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden shrink-0"
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback
          className={cn(
            'text-xs font-semibold',
            otherUser?.role && roleColors[otherUser.role]
          )}
        >
          {getInitials(otherUser?.name || 'Unknown')}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{otherUser?.name || 'Unknown User'}</p>
        <div className="flex items-center gap-1.5">
          {otherUser ? (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1.5 py-0 h-4 font-normal border',
                roleColors[otherUser.role]
              )}
            >
              {roleDisplayNames[otherUser.role as UserRole]?.en || otherUser.role}
            </Badge>
          ) : null}
          {typingUser && (
            <span className="text-xs text-primary animate-pulse">
              {typingUser} {labels.typing}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Video className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: ChatMessage
  isOwn: boolean
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const senderColor = messageBubbleColors[message.senderRole] || 'bg-muted'

  return (
    <div className={cn('flex mb-1', isOwn ? 'justify-end' : 'justify-start')}>
      <div className="max-w-[75%] md:max-w-[60%]">
        {/* Show sender name for others */}
        {!isOwn && (
          <div className="flex items-center gap-2 mb-0.5 ml-1">
            <span className="text-[10px] font-medium text-muted-foreground">{message.senderName}</span>
            <Badge
              variant="outline"
              className={cn(
                'text-[9px] px-1 py-0 h-3.5 font-normal border',
                roleColors[message.senderRole]
              )}
            >
              {roleDisplayNames[message.senderRole as UserRole]?.en || message.senderRole}
            </Badge>
          </div>
        )}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm break-words shadow-sm',
            isOwn
              ? cn('rounded-br-md', senderColor, 'text-white')
              : 'bg-muted rounded-bl-md text-foreground'
          )}
        >
          <p className="leading-relaxed">{message.content}</p>
          <p
            className={cn(
              'text-[10px] mt-1',
              isOwn ? 'text-white/60' : 'text-muted-foreground'
            )}
          >
            {formatMessageTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  labels: Record<string, string>
  className?: string
}

function EmptyMessagesState({ labels, className }: EmptyStateProps) {
  return (
    <div className={cn('flex-1 flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
        <MessageCircle className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{labels.noMessages}</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{labels.noMessagesDesc}</p>
    </div>
  )
}
