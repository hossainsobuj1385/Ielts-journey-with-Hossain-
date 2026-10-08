import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PeerUser, ChatRequestItem, DirectChatMessage } from '../types';
import { api } from '../api/client';
import {
  Users,
  UserPlus,
  UserCheck,
  MessageSquare,
  Send,
  ShieldCheck,
  Check,
  X,
  Award,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Ban,
  Phone,
  Share2,
  ExternalLink
} from 'lucide-react';

export const PeersView: React.FC = () => {
  const { user } = useAuth();
  const [peers, setPeers] = useState<PeerUser[]>([]);
  const [chatRequests, setChatRequests] = useState<ChatRequestItem[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'requests' | 'active_chats' | 'blocked'>('discover');
  const [loading, setLoading] = useState(true);

  // Modal for sending chat request
  const [targetPeerForRequest, setTargetPeerForRequest] = useState<PeerUser | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);

  // Active chat session
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatThread, setChatThread] = useState<{ request: any; other_user: any; messages: DirectChatMessage[] } | null>(null);
  const [newChatText, setNewChatText] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const fetchPeersAndRequests = async () => {
    try {
      setLoading(true);
      const [peersData, requestsData] = await Promise.all([
        api.get<PeerUser[]>('/api/peers'),
        api.get<ChatRequestItem[]>('/api/chat-requests')
      ]);
      setPeers(peersData);
      setChatRequests(requestsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeersAndRequests();
  }, [user]);

  const fetchChatThread = async (id: number) => {
    try {
      const data = await api.get<{ request: any; other_user: any; messages: DirectChatMessage[] }>(`/api/chat-requests/${id}/messages`);
      setChatThread(data);
    } catch (err: any) {
      alert(err.message || 'Failed to open chat');
    }
  };

  useEffect(() => {
    if (activeChatId) {
      fetchChatThread(activeChatId);
    } else {
      setChatThread(null);
    }
  }, [activeChatId]);

  const handleToggleFollow = async (peer: PeerUser) => {
    try {
      const res = await api.post<{ is_followed: boolean; followers_count: number }>(`/api/peers/${peer.id}/follow`);
      setPeers(prev => prev.map(p => p.id === peer.id ? {
        ...p,
        is_followed_by_me: res.is_followed,
        followers_count: res.followers_count
      } : p));
    } catch (err: any) {
      alert(err.message || 'Follow failed');
    }
  };

  const handleToggleBlock = async (peerId: number) => {
    const isCurrentlyBlocked = peers.find(p => p.id === peerId)?.is_blocked_by_me;
    const confirmText = isCurrentlyBlocked
      ? 'আপনি কি এই ইউজারকে আনব্লক করতে চান?'
      : 'আপনি কি এই ইউজারকে ব্লক করতে চান? ব্লক করলে সে আর আপনাকে মেসেজ বা রিকুয়েষ্ট পাঠাতে পারবে না।';
    
    if (!confirm(confirmText)) return;

    try {
      const res = await api.post<{ is_blocked: boolean; message: string }>(`/api/peers/${peerId}/block`);
      alert(res.message);
      if (activeChatId && chatThread?.other_user?.id === peerId) {
        setActiveChatId(null);
      }
      fetchPeersAndRequests();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const handleSendChatRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPeerForRequest || !requestMessage.trim() || sendingRequest) return;

    try {
      setSendingRequest(true);
      await api.post(`/api/peers/${targetPeerForRequest.id}/chat-request`, {
        initial_message: requestMessage.trim()
      });
      alert(`চ্যাট রিকুয়েষ্ট সফলভাবে পাঠানো হয়েছে ${targetPeerForRequest.first_name} এর কাছে!`);
      setTargetPeerForRequest(null);
      setRequestMessage('');
      fetchPeersAndRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleRespondRequest = async (reqId: number, action: 'accepted' | 'rejected') => {
    try {
      await api.put(`/api/chat-requests/${reqId}/respond`, { action });
      await fetchPeersAndRequests();
      if (action === 'accepted') {
        setActiveChatId(reqId);
      }
    } catch (err: any) {
      alert(err.message || 'Response failed');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatId || !newChatText.trim() || sendingMsg) return;

    try {
      setSendingMsg(true);
      const sent = await api.post<DirectChatMessage>(`/api/chat-requests/${activeChatId}/messages`, {
        message: newChatText.trim()
      });
      setChatThread(prev => prev ? {
        ...prev,
        messages: [...prev.messages, sent]
      } : null);
      setNewChatText('');
    } catch (err: any) {
      alert(err.message || 'Message failed');
    } finally {
      setSendingMsg(false);
    }
  };

  const incomingRequests = chatRequests.filter(r => r.is_incoming && r.status === 'pending');
  const acceptedChats = chatRequests.filter(r => r.status === 'accepted');
  const blockedPeers = peers.filter(p => p.is_blocked_by_me);

  return (
    <div className="space-y-4 pb-24 pt-2 animate-fade-in">
      {/* If in an active chat session */}
      {activeChatId && chatThread ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveChatId(null)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Partners</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#0A192F]">
                {chatThread.other_user.name}
              </span>
              <button
                onClick={() => handleToggleBlock(chatThread.other_user.id)}
                className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold flex items-center gap-1 border border-rose-200"
                title="বিরক্ত করলে ব্লক করুন"
              >
                <Ban className="w-3 h-3 text-rose-600" />
                <span>ব্লক করুন</span>
              </button>
            </div>
          </div>

          {/* Chat Messages Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col h-[65vh]">
            {/* Header */}
            <div className="p-3.5 bg-[#0A192F] text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={chatThread.other_user.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={chatThread.other_user.name}
                  className="w-8 h-8 rounded-full object-cover border border-amber-400"
                />
                <div>
                  <h4 className="text-xs font-bold">{chatThread.other_user.name}</h4>
                  <p className="text-[10px] text-slate-300">English Speaking & Study Partner</p>
                </div>
              </div>

              <button
                onClick={() => handleToggleBlock(chatThread.other_user.id)}
                className="text-xs text-rose-300 hover:text-rose-100 flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>ব্লক</span>
              </button>
            </div>

            {/* Messages Scrollable Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60">
              {chatThread.messages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 shadow-2xs ${
                        isMe
                          ? 'bg-[#0A192F] text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      <div className="text-[10px] opacity-70 font-semibold">
                        {isMe ? 'You' : chatThread.other_user.name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type your practice sentence or question..."
                value={newChatText}
                onChange={e => setNewChatText(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={!newChatText.trim() || sendingMsg}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Overview Mode: Discover, Requests, Chats, Blocked */
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk'] tracking-tight">
              Study Partners & Follow Mentors
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              যে ভালো পারে তাকে ফলো করুন, স্পিকিং ও রাইটিং অনুশীলনের জন্য চ্যাট রিকুয়েষ্ট দিন।
            </p>
          </div>

          {/* Sub Tabs */}
          <div className="flex border-b border-slate-200 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-2 px-3.5 font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'discover'
                  ? 'border-amber-600 text-amber-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Discover Mentors & Peers
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-2 px-3.5 font-bold border-b-2 whitespace-nowrap transition relative ${
                activeTab === 'requests'
                  ? 'border-amber-600 text-amber-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Incoming Requests</span>
              {incomingRequests.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                  {incomingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('active_chats')}
              className={`py-2 px-3.5 font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'active_chats'
                  ? 'border-amber-600 text-amber-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Active Chats ({acceptedChats.length})
            </button>
            <button
              onClick={() => setActiveTab('blocked')}
              className={`py-2 px-3.5 font-bold border-b-2 whitespace-nowrap transition ${
                activeTab === 'blocked'
                  ? 'border-amber-600 text-amber-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Blocked ({blockedPeers.length})
            </button>
          </div>

          {/* Tab 1: Discover Mentors & Peers */}
          {activeTab === 'discover' && (
            <div className="space-y-3">
              {peers.filter(p => p.id !== user?.id && !p.is_blocked_by_me).map(peer => (
                <div
                  key={peer.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-amber-300 transition shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <img
                        src={peer.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={peer.first_name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                          <h3 className="font-bold text-sm text-[#0A192F]">
                            {peer.first_name} {peer.last_name || ''}
                          </h3>
                          {peer.is_mentor && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" /> Mentor
                            </span>
                          )}
                          {peer.is_verified && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 flex items-center gap-0.5 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {peer.username ? `@${peer.username}` : `ID: ${peer.telegram_id}`} • {peer.followers_count} Followers
                        </p>
                        <div className="inline-flex items-center space-x-1 mt-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>{peer.target_band}</span>
                        </div>
                      </div>
                    </div>

                    {/* Follow Toggle Button */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleToggleFollow(peer)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                          peer.is_followed_by_me
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-[#0A192F] hover:bg-[#1E293B] text-white shadow-2xs'
                        }`}
                      >
                        {peer.is_followed_by_me ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>

                      {/* Block button */}
                      <button
                        onClick={() => handleToggleBlock(peer.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="ব্লক করুন (Block User)"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pl-1 border-l-2 border-amber-300">
                    "{peer.bio}"
                  </p>

                  {/* Social badges: WhatsApp & Facebook */}
                  {(peer.whatsapp || peer.facebook) && (
                    <div className="flex items-center space-x-2 pt-1">
                      {peer.whatsapp && (
                        <a
                          href={`https://wa.me/${peer.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold border border-emerald-200"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp: {peer.whatsapp}</span>
                        </a>
                      )}
                      {peer.facebook && (
                        <a
                          href={peer.facebook.startsWith('http') ? peer.facebook : `https://facebook.com/${peer.facebook}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 hover:bg-blue-100 font-semibold border border-blue-200"
                        >
                          <ExternalLink className="w-3 h-3 text-blue-600" />
                          <span>Facebook Profile</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Chat Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {peer.chat_request_status === 'accepted'
                        ? 'Connected as Study Partner'
                        : peer.chat_request_status === 'pending'
                        ? 'Request Pending'
                        : 'Practice English together'}
                    </span>

                    {peer.chat_request_status === 'accepted' ? (
                      <button
                        onClick={() => peer.chat_request_id && setActiveChatId(peer.chat_request_id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Chat</span>
                      </button>
                    ) : peer.chat_request_status === 'pending' ? (
                      <span className="text-amber-700 font-semibold text-xs px-2 py-1 rounded bg-amber-50">
                        Request Sent ⏳
                      </span>
                    ) : (
                      <button
                        onClick={() => setTargetPeerForRequest(peer)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send Chat Request</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: Incoming Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {incomingRequests.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No incoming chat requests</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    When other learners want to practice English with you, their requests will appear here.
                  </p>
                </div>
              ) : (
                incomingRequests.map(req => (
                  <div
                    key={req.id}
                    className="bg-white p-4 rounded-2xl border border-amber-300 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={req.other_user.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt={req.other_user.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-xs text-[#0A192F]">{req.other_user.name}</h4>
                          <p className="text-[10px] text-slate-400">{req.other_user.level}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleBlock(req.other_user.id)}
                        className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1"
                      >
                        <Ban className="w-3 h-3" />
                        <span>ব্লক করুন</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-700 bg-amber-50 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                      "{req.initial_message}"
                    </p>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        onClick={() => handleRespondRequest(req.id, 'rejected')}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRespondRequest(req.id, 'accepted')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Chat (গ্রহণ করুন)</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Active Chats */}
          {activeTab === 'active_chats' && (
            <div className="space-y-2.5">
              {acceptedChats.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No active chat sessions</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Send a chat request from the Discover tab to connect with mentors or practice partners.
                  </p>
                </div>
              ) : (
                acceptedChats.map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-amber-400 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <img
                        src={chat.other_user.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={chat.other_user.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[#0A192F] truncate">{chat.other_user.name}</h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{chat.last_message}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 4: Blocked Users (ব্লক তালিকা ও আনব্লক অপশন) */}
          {activeTab === 'blocked' && (
            <div className="space-y-2.5">
              {blockedPeers.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                  <Ban className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">কোনো ব্লক করা ইউজার নেই</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    কাউকে বিরক্তিকর মনে হলে ব্লক করতে পারেন, এবং পরে এখান থেকে যে কোনো সময় আনব্লক করতে পারবেন।
                  </p>
                </div>
              ) : (
                blockedPeers.map(peer => (
                  <div
                    key={peer.id}
                    className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={peer.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={peer.first_name}
                        className="w-10 h-10 rounded-xl object-cover grayscale opacity-70"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-[#0A192F]">{peer.first_name} {peer.last_name || ''}</h4>
                        <span className="text-[10px] text-rose-600 font-semibold">ব্লক করা ইউজার</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleBlock(peer.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
                    >
                      আনব্লক করুন
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Send Chat Request Modal */}
      {targetPeerForRequest && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-3.5 border border-slate-200 shadow-2xl">
            <h3 className="font-bold text-sm text-[#0A192F]">
              Send Chat Request to {targetPeerForRequest.first_name}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Introduce yourself and write what you want to practice together (Speaking Cue Cards, Essay review, etc.):
            </p>
            <form onSubmit={handleSendChatRequest} className="space-y-3">
              <textarea
                value={requestMessage}
                onChange={e => setRequestMessage(e.target.value)}
                rows={3}
                placeholder="Hi, I would love to practice IELTS speaking for 15 minutes daily..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500"
                required
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setTargetPeerForRequest(null)}
                  className="px-3.5 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!requestMessage.trim() || sendingRequest}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
                >
                  {sendingRequest ? 'Sending...' : 'Send Request (রিকুয়েষ্ট পাঠান)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
