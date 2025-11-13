import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MessageCircle, Send, Paperclip, Clock, CheckCircle, X, Loader2 } from 'lucide-react';

interface SupportSession {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  assigned_to_admin_id: string | null;
  created_at: string;
  last_message_at: string;
  unread_count?: number;
  last_message_preview?: string;
}

interface Message {
  id: string;
  session_id: string;
  sender_type: 'visitor' | 'admin';
  sender_name: string;
  message_text: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface AdminSupportChatProps {
  adminName: string;
  adminId: string;
}

export default function AdminSupportChat({ adminName, adminId }: AdminSupportChatProps) {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'assigned' | 'closed'>('open');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
    subscribeToSessions();
  }, [filter]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages();
      subscribeToMessages();
      markMessagesAsRead();
    }
  }, [selectedSession]);

  async function loadSessions() {
    setLoading(true);
    try {
      let query = supabase
        .from('support_sessions')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (filter === 'open') {
        query = query.eq('status', 'open');
      } else if (filter === 'assigned') {
        query = query.eq('assigned_to_admin_id', adminId);
      } else if (filter === 'closed') {
        query = query.eq('status', 'closed');
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get unread counts and last message preview for each session
      const sessionsWithMeta = await Promise.all(
        (data || []).map(async (session) => {
          const { data: unreadData } = await supabase.rpc('get_support_unread_count', {
            p_session_id: session.id,
            p_for_sender_type: 'admin',
          });

          const { data: lastMsg } = await supabase
            .from('support_messages')
            .select('message_text')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...session,
            unread_count: unreadData || 0,
            last_message_preview: lastMsg?.message_text || 'No messages yet',
          };
        })
      );

      setSessions(sessionsWithMeta);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToSessions() {
    const channel = supabase
      .channel('admin_support_sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_sessions',
        },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function loadMessages() {
    if (!selectedSession) return;

    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('session_id', selectedSession.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  }

  function subscribeToMessages() {
    if (!selectedSession) return;

    const channel = supabase
      .channel(`admin_support_messages:${selectedSession.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages',
          filter: `session_id=eq.${selectedSession.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function markMessagesAsRead() {
    if (!selectedSession) return;

    await supabase.rpc('mark_support_messages_read', {
      p_session_id: selectedSession.id,
      p_sender_type: 'admin',
    });

    loadSessions(); // Refresh to update unread counts
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || sending || !selectedSession) return;

    setSending(true);

    try {
      const { error } = await supabase.from('support_messages').insert({
        session_id: selectedSession.id,
        sender_type: 'admin',
        sender_name: adminName,
        message_text: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  }

  async function handleAssignToMe(session: SupportSession) {
    try {
      await supabase
        .from('support_sessions')
        .update({
          assigned_to_admin_id: adminId,
          status: 'assigned',
        })
        .eq('id', session.id);

      loadSessions();
    } catch (error) {
      console.error('Error assigning session:', error);
    }
  }

  async function handleCloseSession(session: SupportSession) {
    try {
      await supabase
        .from('support_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
        })
        .eq('id', session.id);

      loadSessions();
      if (selectedSession?.id === session.id) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  }

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  }

  const openCount = sessions.filter((s) => s.status === 'open').length;
  const assignedToMeCount = sessions.filter((s) => s.assigned_to_admin_id === adminId).length;

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Sessions List */}
      <div className="w-1/3 bg-white border border-gray-200 rounded-lg flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Support Chat</h2>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilter('open')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                filter === 'open'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Open ({openCount})
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                filter === 'assigned'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mine ({assignedToMeCount})
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                filter === 'closed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Closed
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle className="h-12 w-12 mb-3" />
              <p className="font-medium">No sessions</p>
              <p className="text-sm">Waiting for customer inquiries</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedSession(session)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                    selectedSession?.id === session.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="font-semibold text-gray-900">
                      {session.visitor_name || 'Anonymous Visitor'}
                    </span>
                    {session.unread_count! > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {session.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {session.last_message_preview}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(session.last_message_at)}</span>
                    {session.status === 'assigned' && session.assigned_to_admin_id === adminId && (
                      <span className="ml-auto text-blue-600 font-semibold">Assigned to you</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg flex flex-col">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Select a chat to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {selectedSession.visitor_name || 'Anonymous Visitor'}
                </h3>
                {selectedSession.visitor_email && (
                  <p className="text-sm text-gray-600">{selectedSession.visitor_email}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedSession.assigned_to_admin_id !== adminId && selectedSession.status !== 'closed' && (
                  <button
                    onClick={() => handleAssignToMe(selectedSession)}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Assign to Me
                  </button>
                )}
                {selectedSession.status !== 'closed' && (
                  <button
                    onClick={() => handleCloseSession(selectedSession)}
                    className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Resolve
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => {
                const isOwn = message.sender_type === 'admin';
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%]`}>
                      <div className="flex items-end gap-2">
                        {!isOwn && (
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {message.sender_name[0].toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isOwn
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          {!isOwn && (
                            <p className="text-xs font-semibold mb-1 text-gray-600">
                              {message.sender_name}
                            </p>
                          )}
                          {message.image_url && (
                            <img
                              src={message.image_url}
                              alt="Attachment"
                              className="rounded-lg mb-2 max-w-full cursor-pointer"
                              onClick={() => window.open(message.image_url!, '_blank')}
                            />
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.message_text}
                          </p>
                          <div
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSession.status !== 'closed' && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
