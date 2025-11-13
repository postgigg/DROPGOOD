import { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X, Check, CheckCheck, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  booking_id: string;
  sender_type: 'customer' | 'admin';
  sender_name: string;
  message_text: string | null;
  image_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

interface ChatActivity {
  customer_typing: boolean;
  admin_typing: boolean;
  customer_last_seen: string | null;
  admin_last_seen: string | null;
}

interface BookingChatProps {
  bookingId: string;
  senderType: 'customer' | 'admin';
  senderName: string;
}

export default function BookingChat({ bookingId, senderType, senderName }: BookingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [activity, setActivity] = useState<ChatActivity>({
    customer_typing: false,
    admin_typing: false,
    customer_last_seen: null,
    admin_last_seen: null,
  });
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const otherType = senderType === 'customer' ? 'admin' : 'customer';
  const isOtherTyping = senderType === 'customer' ? activity.admin_typing : activity.customer_typing;

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
    subscribeToActivity();
    updateLastSeen();

    const lastSeenInterval = setInterval(updateLastSeen, 30000);

    return () => {
      clearInterval(lastSeenInterval);
    };
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    markMessagesAsRead();
  }, [messages]);

  async function loadMessages() {
    const { data } = await supabase
      .from('booking_messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel(`booking_messages:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message;
            setMessages((prev) => {
              const exists = prev.some(msg => msg.id === newMsg.id);
              if (exists) return prev;

              const hasTempMsg = prev.some(msg => msg.id.toString().startsWith('temp-'));
              if (hasTempMsg && newMsg.sender_type === senderType) {
                return prev;
              }

              return [...prev, newMsg];
            });
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? (payload.new as Message) : msg))
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
    const channel = supabase
      .channel(`booking_chat_activity:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_chat_activity',
          filter: `booking_id=eq.${bookingId}`,
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
    const field = senderType === 'customer' ? 'customer_last_seen' : 'admin_last_seen';
    await supabase
      .from('booking_chat_activity')
      .upsert({
        booking_id: bookingId,
        [field]: new Date().toISOString(),
      });
  }

  async function updateTypingStatus(typing: boolean) {
    const field = senderType === 'customer' ? 'customer_typing' : 'admin_typing';
    await supabase
      .from('booking_chat_activity')
      .upsert({
        booking_id: bookingId,
        [field]: typing,
      });
  }

  async function markMessagesAsRead() {
    await supabase.rpc('mark_messages_read', {
      p_booking_id: bookingId,
      p_sender_type: senderType,
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
      booking_id: bookingId,
      sender_type: senderType,
      sender_name: senderName,
      message_text: messageText || null,
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
        const fileName = `${bookingId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, currentImage);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);

        uploadedImageUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase.from('booking_messages').insert({
        booking_id: bookingId,
        sender_type: senderType,
        sender_name: senderName,
        message_text: messageText || null,
        image_url: uploadedImageUrl,
      }).select().single();

      if (error) throw error;

      setMessages((prev) => prev.map(msg =>
        msg.id === tempId ? data : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => prev.filter(msg => msg.id !== tempId));
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
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-lg shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-t-lg">
        <h3 className="font-bold text-lg">Chat with DropGood Support</h3>
        <p className="text-xs text-blue-100">We typically respond within a few minutes</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No messages yet</p>
            <p className="text-sm text-gray-400 mt-1">Start a conversation with our support team</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_type === senderType;
            return (
              <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
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
                      {message.message_text && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message_text}
                        </p>
                      )}
                      <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
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

        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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

      <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
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
            disabled={uploading || sending}
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
  );
}
