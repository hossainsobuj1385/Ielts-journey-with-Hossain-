import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { MessageSquare, Users, CheckCircle2, Clock } from 'lucide-react';

export const AdminChatRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const data = await api.get<any[]>('/api/admin/chat-requests');
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
          Peer Study & Mentorship Connections
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          শিক্ষার্থীদের পারস্পরিক ফলো ও পার্টনার চ্যাট রিকুয়েষ্টের লাইভ ট্র্যাকিং।
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading chat requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No chat requests yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Sender ID</th>
                <th className="p-3.5">Receiver ID</th>
                <th className="p-3.5">Initial Message</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {requests.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-bold text-[#0A192F]">User #{r.sender_id}</td>
                  <td className="p-3.5 font-bold text-amber-700">User #{r.receiver_id}</td>
                  <td className="p-3.5 max-w-[240px] truncate text-slate-600">{r.initial_message}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      r.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
