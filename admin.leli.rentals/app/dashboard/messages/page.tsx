'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { MessageSquare, Search, User, Clock, Send } from 'lucide-react'

interface ChatSession {
    id: string
    user_id: string
    participant_id: string
    participant_name: string
    participant_avatar: string | null
    last_message: string | null
    unread_count: number
    status: string
    updated_at: string
}

interface Message {
    id: string
    chat_session_id: string
    sender_id: string
    receiver_id: string
    content: string
    message_type: string
    created_at: string
}

export default function MessagesPage() {
    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loadingSessions, setLoadingSessions] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchSessions()
    }, [])

    useEffect(() => {
        if (selectedSession) {
            fetchMessages(selectedSession.id)
        }
    }, [selectedSession])

    async function fetchSessions() {
        try {
            setLoadingSessions(true)
            const response = await fetch('/api/messages/sessions')
            if (!response.ok) throw new Error('Failed to fetch sessions')
            const data = await response.json()
            setSessions(data || [])
        } catch (error) {
            console.error('Error fetching sessions:', error)
        } finally {
            setLoadingSessions(false)
        }
    }

    async function fetchMessages(sessionId: string) {
        try {
            setLoadingMessages(true)
            const response = await fetch(`/api/messages/${sessionId}`)
            if (!response.ok) throw new Error('Failed to fetch messages')
            const data = await response.json()
            setMessages(data || [])
        } catch (error) {
            console.error('Error fetching messages:', error)
        } finally {
            setLoadingMessages(false)
        }
    }

    const filteredSessions = sessions.filter(session =>
        session.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-100px)] flex gap-6">
                {/* Sidebar - Session List */}
                <div className="w-1/3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Messages
                        </h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingSessions ? (
                            <div className="p-8 text-center text-white/50">Loading...</div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="p-8 text-center text-white/50">No conversations found</div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {filteredSessions.map((session) => (
                                    <button
                                        key={session.id}
                                        onClick={() => setSelectedSession(session)}
                                        className={`w-full p-4 text-left hover:bg-white/5 transition-colors flex gap-3 ${selectedSession?.id === session.id ? 'bg-white/10' : ''
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                                            {session.participant_avatar ? (
                                                <img src={session.participant_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                session.participant_name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-medium text-white truncate">{session.participant_name}</h3>
                                                <span className="text-xs text-white/40 whitespace-nowrap">
                                                    {new Date(session.updated_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/60 truncate">
                                                {session.last_message || 'No messages yet'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content - Chat View */}
                <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col overflow-hidden">
                    {selectedSession ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                    {selectedSession.participant_avatar ? (
                                        <img src={selectedSession.participant_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        selectedSession.participant_name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedSession.participant_name}</h3>
                                    <p className="text-xs text-white/50">User ID: {selectedSession.participant_id}</p>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {loadingMessages ? (
                                    <div className="text-center text-white/50 py-8">Loading messages...</div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-white/50 py-8">No messages in this conversation</div>
                                ) : (
                                    messages.map((message) => {
                                        const isUser = message.sender_id === selectedSession.user_id // Assuming user_id is the "owner" of the session view
                                        // Actually, in admin view, we are observing. 
                                        // Usually 'sender_id' matches 'participant_id' means it's FROM the participant.
                                        // If 'sender_id' matches 'user_id' (the session owner), it's FROM the session owner.
                                        // Let's assume right-align for the session owner (user_id) and left-align for participant.

                                        const isSessionOwner = message.sender_id === selectedSession.user_id

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isSessionOwner ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${isSessionOwner
                                                            ? 'bg-blue-600 text-white rounded-br-none'
                                                            : 'bg-white/10 text-white rounded-bl-none'
                                                        }`}
                                                >
                                                    <p>{message.content}</p>
                                                    <p className={`text-[10px] mt-1 ${isSessionOwner ? 'text-blue-200' : 'text-white/40'}`}>
                                                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Input Area (Read Only for Admin usually, but maybe support?) */}
                            <div className="p-4 border-t border-white/10 bg-white/5">
                                <div className="text-center text-xs text-white/40">
                                    Read-only view. Admin cannot send messages directly from here yet.
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30">
                            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg">Select a conversation to view messages</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
