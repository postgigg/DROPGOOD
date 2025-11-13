import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Check, CheckCheck, Loader2, Minimize2, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  session_id: string;
  sender_type: 'visitor' | 'admin';
  sender_name: string;
  message_text: string;
  image_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface SupportSession {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  assigned_to_admin_id: string | null;
}

interface ChatActivity {
  visitor_typing: boolean;
  admin_typing: boolean;
  visitor_last_seen: string | null;
  admin_last_seen: string | null;
}

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>('');
  const [visitorName, setVisitorName] = useState('');
  const [hasSetName, setHasSetName] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activity, setActivity] = useState<ChatActivity>({
    visitor_typing: false,
    admin_typing: false,
    visitor_last_seen: null,
    admin_last_seen: null,
  });
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize visitor ID and check for existing session
  useEffect(() => {
    let vid = localStorage.getItem('dropgood_visitor_id');
    if (!vid) {
      vid = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('dropgood_visitor_id', vid);
    }
    setVisitorId(vid);

    // Check for existing session
    const savedSessionId = localStorage.getItem('dropgood_support_session');
    if (savedSessionId) {
      checkExistingSession(savedSessionId);
    }

    // Check for saved name
    const savedName = localStorage.getItem('dropgood_visitor_name');
    if (savedName) {
      setVisitorName(savedName);
      setHasSetName(true);
    }
  }, []);

  // Load messages when session is set
  useEffect(() => {
    if (sessionId && isOpen) {
      loadMessages();
      subscribeToMessages();
      subscribeToActivity();
      updateLastSeen();

      const lastSeenInterval = setInterval(updateLastSeen, 30000);

      return () => {
        clearInterval(lastSeenInterval);
      };
    }
  }, [sessionId, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      markMessagesAsRead();
    }
  }, [messages, isOpen]);

  // Count unread messages when minimized
  useEffect(() => {
    if (!isOpen) {
      const unread = messages.filter(
        (m) => m.sender_type === 'admin' && !m.is_read
      ).length;
      setUnreadCount(unread);
    } else {
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  async function checkExistingSession(sid: string) {
    try {
      const { data: session } = await supabase
        .from('support_sessions')
        .select('*')
        .eq('id', sid)
        .eq('status', 'open')
        .single();

      if (session) {
        setSessionId(sid);
        if (session.visitor_name) {
          setVisitorName(session.visitor_name);
          setHasSetName(true);
        }
      } else {
        localStorage.removeItem('dropgood_support_session');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      localStorage.removeItem('dropgood_support_session');
    }
  }

  async function createNewSession() {
    try {
      const { data, error } = await supabase
        .from('support_sessions')
        .insert({
          visitor_id: visitorId,
          visitor_name: visitorName || null,
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      setSessionId(data.id);
      localStorage.setItem('dropgood_support_session', data.id);

      // Send automatic greeting
      setTimeout(() => {
        sendAutomaticMessage(
          "Hi there! 👋 Thanks for reaching out to DropGood. How can we help you today?"
        );
      }, 500);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to start chat. Please try again.');
    }
  }

  async function sendAutomaticMessage(text: string) {
    if (!sessionId) return;

    await supabase.from('support_messages').insert({
      session_id: sessionId,
      sender_type: 'admin',
      sender_name: 'DropGood Support',
      message_text: text,
    });
  }

  async function loadMessages() {
    if (!sessionId) return;

    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  }

  function subscribeToMessages() {
    if (!sessionId) return;

    const channel = supabase
      .channel(`support_messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              const exists = prev.some((msg) => msg.id === newMsg.id);
              if (exists) return prev;

              const hasTempMsg = prev.some((msg) =>
                msg.id.toString().startsWith('temp-')
              );
              if (hasTempMsg && newMsg.sender_type === 'visitor') {
                return prev;
              }

              return [...prev, newMsg];
            });
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function subscribeToActivity() {
    if (!sessionId) return;

    const channel = supabase
      .channel(`support_activity:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_session_activity',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          if (payload.new) {
            setActivity(payload.new as ChatActivity);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  async function updateLastSeen() {
    if (!sessionId) return;

    await supabase.from('support_session_activity').upsert({
      session_id: sessionId,
      visitor_last_seen: new Date().toISOString(),
    });
  }

  async function updateTypingStatus(typing: boolean) {
    if (!sessionId) return;

    await supabase.from('support_session_activity').upsert({
      session_id: sessionId,
      visitor_typing: typing,
    });
  }

  async function markMessagesAsRead() {
    if (!sessionId) return;

    await supabase.rpc('mark_support_messages_read', {
      p_session_id: sessionId,
      p_sender_type: 'visitor',
    });
  }

  function handleTyping(text: string) {
    setNewMessage(text);

    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 1000);
  }

  async function handleSendMessage() {
    if ((!newMessage.trim() && !imageFile) || sending) return;

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      id: tempId,
      session_id: sessionId!,
      sender_type: 'visitor',
      sender_name: visitorName || 'You',
      message_text: messageText,
      image_url: imagePreview,
      is_read: false,
      read_at: null,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    const currentImage = imageFile;
    const currentPreview = imagePreview;
    setImageFile(null);
    setImagePreview(null);
    setIsTyping(false);
    updateTypingStatus(false);

    setSending(true);

    try {
      let uploadedImageUrl = null;

      if (currentImage) {
        const fileExt = currentImage.name.split('.').pop();
        const fileName = `${sessionId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, currentImage);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);

        uploadedImageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          session_id: sessionId,
          sender_type: 'visitor',
          sender_name: visitorName || 'You',
          message_text: messageText,
          image_url: uploadedImageUrl,
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => prev.map((msg) => (msg.id === tempId ? data : msg)));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(messageText);
      setImageFile(currentImage);
      setImagePreview(currentPreview);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  function handleOpen() {
    setIsOpen(true);
    setIsMinimized(false);

    if (!sessionId && visitorId) {
      createNewSession();
    }
  }

  function handleSetName() {
    if (visitorName.trim()) {
      setHasSetName(true);
      localStorage.setItem('dropgood_visitor_name', visitorName.trim());

      if (sessionId) {
        supabase
          .from('support_sessions')
          .update({ visitor_name: visitorName.trim() })
          .eq('id', sessionId)
          .then();
      }
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-2xl hover:bg-blue-700 transition z-50 flex items-center gap-2"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 text-white rounded-full px-6 py-3 shadow-2xl hover:bg-blue-700 transition flex items-center gap-2"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">Support Chat</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md">
      <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-2xl shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Chat with Us</h3>
            <p className="text-xs text-blue-100">We typically respond within a few minutes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-blue-600 rounded transition"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-600 rounded transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Name prompt if not set */}
        {!hasSetName && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <p className="text-sm text-gray-700 mb-2">What's your name? (Optional)</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSetName();
                }}
                placeholder="Enter your name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSetName}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
              >
                Set
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Start a conversation</p>
              <p className="text-sm text-gray-400 mt-1">
                Our support team is here to help
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_type === 'visitor';
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-end gap-2">
                      {!isOwn && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
                          className={`flex items-center gap-1 mt-1 text-xs ${
                            isOwn ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          <span>{formatTime(message.created_at)}</span>
                          {isOwn && (
                            <>
                              {message.is_read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {activity.admin_typing && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  S
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {imagePreview && (
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 bg-white rounded-b-2xl">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              disabled={sending}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
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
              disabled={(!newMessage.trim() && !imageFile) || sending}
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
      </div>
    </div>
  );
}
