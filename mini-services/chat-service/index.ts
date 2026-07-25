import { createServer } from 'http'
import { Server } from 'socket.io'

// Types
interface ConnectedUser {
  id: string
  socketId: string
  name: string
  role: string
  avatar?: string
  connectedAt: Date
}

interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  timestamp: Date
}

interface Conversation {
  id: string
  participants: string[]
  lastMessage?: ChatMessage
  createdAt: Date
}

// In-memory stores
const connectedUsers = new Map<string, ConnectedUser>()
const conversations = new Map<string, Conversation>()
const messages = new Map<string, ChatMessage[]>()
const typingUsers = new Map<string, { [socketId: string]: { userName: string; timestamp: number } }>()

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

// Create HTTP server and Socket.io instance
const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Get or create conversation between two users
function getOrCreateConversation(userId1: string, userId2: string): Conversation {
  // Check if a conversation already exists between these two users
  for (const [convId, conv] of conversations.entries()) {
    if (
      conv.participants.includes(userId1) &&
      conv.participants.includes(userId2) &&
      conv.participants.length === 2
    ) {
      return conv
    }
  }

  // Create a new conversation
  const convId = generateId()
  const conversation: Conversation = {
    id: convId,
    participants: [userId1, userId2],
    createdAt: new Date(),
  }
  conversations.set(convId, conversation)
  messages.set(convId, [])
  return conversation
}

// Get all conversations for a user
function getUserConversations(userId: string): Array<Conversation & { otherUser: ConnectedUser | null; unreadCount: number }> {
  const result: Array<Conversation & { otherUser: ConnectedUser | null; unreadCount: number }> = []

  for (const [convId, conv] of conversations.entries()) {
    if (conv.participants.includes(userId)) {
      const otherUserId = conv.participants.find(p => p !== userId)
      const otherUser = otherUserId ? connectedUsers.get(otherUserId) || null : null
      const convMessages = messages.get(convId) || []
      // Count unread: messages not sent by this user (simple heuristic)
      const unreadCount = 0 // We track this on client side via unread status

      result.push({
        ...conv,
        otherUser,
        unreadCount,
      })
    }
  }

  // Sort by last message timestamp (most recent first)
  result.sort((a, b) => {
    const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : new Date(a.createdAt).getTime()
    const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : new Date(b.createdAt).getTime()
    return bTime - aTime
  })

  return result
}

io.on('connection', (socket) => {
  console.log(`[Chat] User connected: ${socket.id}`)

  // Register user with their info
  socket.on('register', (data: { userId: string; name: string; role: string; avatar?: string }) => {
    const { userId, name, role, avatar } = data

    // Remove any existing connection for this user
    const existing = connectedUsers.get(userId)
    if (existing) {
      // Disconnect old socket
      io.sockets.sockets.get(existing.socketId)?.disconnect(true)
    }

    // Store connected user
    const user: ConnectedUser = {
      id: userId,
      socketId: socket.id,
      name,
      role,
      avatar,
      connectedAt: new Date(),
    }
    connectedUsers.set(userId, user)
    console.log(`[Chat] User registered: ${name} (${role}) [${userId}]`)

    // Get user's conversations
    const userConvs = getUserConversations(userId)

    // Create demo conversations if user has none (for demo purposes)
    if (userConvs.length === 0) {
      createDemoConversations(userId, name, role)
    }

    // Send conversations list
    const finalConvs = getUserConversations(userId)
    socket.emit('conversations-list', finalConvs)

    // Join all conversation rooms for this user
    for (const conv of finalConvs) {
      socket.join(`conversation:${conv.id}`)
    }
  })

  // Join a specific conversation room
  socket.on('join-room', (data: { conversationId: string }) => {
    const { conversationId } = data
    socket.join(`conversation:${conversationId}`)

    // Send messages for this conversation
    const convMessages = messages.get(conversationId) || []
    socket.emit('room-messages', {
      conversationId,
      messages: convMessages,
    })
  })

  // Send a message
  socket.on('send-message', (data: { conversationId: string; content: string }) => {
    const user = findUserBySocketId(socket.id)
    if (!user) {
      console.log(`[Chat] Cannot send message: user not registered for socket ${socket.id}`)
      return
    }

    const { conversationId, content } = data

    // Verify conversation exists
    const conversation = conversations.get(conversationId)
    if (!conversation) {
      console.log(`[Chat] Cannot send message: conversation ${conversationId} not found`)
      return
    }

    // Verify user is a participant
    if (!conversation.participants.includes(user.id)) {
      console.log(`[Chat] Cannot send message: user ${user.id} not in conversation ${conversationId}`)
      return
    }

    // Create message
    const message: ChatMessage = {
      id: generateId(),
      conversationId,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      content,
      timestamp: new Date(),
    }

    // Store message
    const convMessages = messages.get(conversationId) || []
    convMessages.push(message)
    messages.set(conversationId, convMessages)

    // Update conversation's last message
    conversation.lastMessage = message

    // Broadcast message to room
    io.to(`conversation:${conversationId}`).emit('message-sent', message)

    // Send updated conversation lists to all participants
    for (const participantId of conversation.participants) {
      const participantSocket = findSocketIdByUserId(participantId)
      if (participantSocket) {
        const userConvs = getUserConversations(participantId)
        io.to(participantSocket).emit('conversations-list', userConvs)
      }
    }

    console.log(`[Chat] Message sent in ${conversationId}: ${user.name}: ${content.substring(0, 50)}`)
  })

  // Typing indicator
  socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
    const user = findUserBySocketId(socket.id)
    if (!user) return

    const { conversationId, isTyping } = data

    // Update typing status
    const typingMap = typingUsers.get(conversationId) || {}

    if (isTyping) {
      typingMap[socket.id] = { userName: user.name, timestamp: Date.now() }
    } else {
      delete typingMap[socket.id]
    }

    typingUsers.set(conversationId, typingMap)

    // Broadcast typing status to other users in the room (excluding sender)
    socket.to(`conversation:${conversationId}`).emit('typing-indicator', {
      conversationId,
      userName: user.name,
      isTyping,
    })
  })

  // Disconnect
  socket.on('disconnect', () => {
    const user = findUserBySocketId(socket.id)
    if (user) {
      connectedUsers.delete(user.id)
      console.log(`[Chat] User disconnected: ${user.name} (${user.role}) [${user.id}]`)

      // Notify all conversation rooms that this user is offline
      for (const [convId, conv] of conversations.entries()) {
        if (conv.participants.includes(user.id)) {
          socket.to(`conversation:${convId}`).emit('user-offline', {
            conversationId: convId,
            userId: user.id,
          })
        }
      }
    } else {
      console.log(`[Chat] Unregistered socket disconnected: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`[Chat] Socket error (${socket.id}):`, error)
  })
})

// Helper: find user by socket ID
function findUserBySocketId(socketId: string): ConnectedUser | undefined {
  for (const user of connectedUsers.values()) {
    if (user.socketId === socketId) return user
  }
  return undefined
}

// Helper: find socket ID by user ID
function findSocketIdByUserId(userId: string): string | undefined {
  const user = connectedUsers.get(userId)
  return user?.socketId
}

// Create demo conversations with mock users
function createDemoConversations(userId: string, userName: string, userRole: string) {
  const demoUsers: Array<{ id: string; name: string; role: string }> = [
    { id: 'demo-maria', name: 'Maria Santos', role: 'applicant' },
    { id: 'demo-agency-ph', name: 'Manila Prime Agency', role: 'local_agency' },
    { id: 'demo-fira-admin', name: 'FIRA Admin', role: 'international_agency' },
    { id: 'demo-employer-dubai', name: 'Al Fardan Group', role: 'employer' },
  ]

  // Filter out the user's own role to avoid duplicate self-conversations
  const filteredDemo = demoUsers.filter(u => u.id !== userId)

  for (const demoUser of filteredDemo) {
    const conversation = getOrCreateConversation(userId, demoUser.id)

    // Add a demo message
    const greetings = [
      `Hello ${userName}! Welcome to FIRA. How can I help you today?`,
      `Hi! I'm interested in discussing job opportunities. Can we chat?`,
      `Good day! I have some questions about the application process.`,
      `Welcome aboard! Feel free to ask me anything about available positions.`,
    ]

    const demoMessage: ChatMessage = {
      id: generateId(),
      conversationId: conversation.id,
      senderId: demoUser.id,
      senderName: demoUser.name,
      senderRole: demoUser.role,
      content: greetings[filteredDemo.indexOf(demoUser)] || greetings[0],
      timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
    }

    const convMessages = messages.get(conversation.id) || []
    convMessages.push(demoMessage)
    messages.set(conversation.id, convMessages)
    conversation.lastMessage = demoMessage
  }
}

// Start server
const PORT = 3005
httpServer.listen(PORT, () => {
  console.log(`[Chat] FIRA Chat Service running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Chat] Received SIGTERM, shutting down...')
  httpServer.close(() => {
    console.log('[Chat] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[Chat] Received SIGINT, shutting down...')
  httpServer.close(() => {
    console.log('[Chat] Server closed')
    process.exit(0)
  })
})
