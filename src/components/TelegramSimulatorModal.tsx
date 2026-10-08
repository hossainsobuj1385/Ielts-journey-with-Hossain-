import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, User, RefreshCw, Smartphone } from 'lucide-react';

interface TelegramSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramSimulatorModal: React.FC<TelegramSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { user, switchUser, setActiveView } = useAuth();
  const [customId, setCustomId] = useState('');
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const mockUsers = [
    {
      id: 123456789,
      first_name: 'Hossain',
      last_name: 'Ahmad',
      username: 'hossain_ielts',
      role: 'Chief Instructor & Admin',
      isAdmin: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    {
      id: 987654321,
      first_name: 'Tanvir',
      last_name: 'Hasan',
      username: 'tanvir_study',
      role: 'IELTS Student (Band 7 Aspirant)',
      isAdmin: false,
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
    },
    {
      id: 555123456,
      first_name: 'Nusrat',
      last_name: 'Jahan',
      username: 'nusrat_jahan',
      role: 'IELTS Student (Speaking Focus)',
      isAdmin: false,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    }
  ];

  const handleSelect = async (mUser: typeof mockUsers[0]) => {
    await switchUser({
      id: mUser.id,
      first_name: mUser.first_name,
      last_name: mUser.last_name,
      username: mUser.username
    });
    onClose();
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(customId.trim(), 10);
    if (!id || !customName.trim()) return;

    await switchUser({
      id,
      first_name: customName.trim(),
      username: 'custom_' + id
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Telegram Account Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            In a live Telegram client, authentication occurs automatically via Telegram WebApp initData.
            Below, you can simulate different Telegram users to test student & admin functionalities:
          </p>

          {/* Quick User List */}
          <div className="space-y-2">
            {mockUsers.map((m) => {
              const isCurrent = user?.telegram_id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m)}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    isCurrent
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={m.avatar}
                      alt={m.first_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-semibold text-sm text-[#0A192F]">{m.first_name} {m.last_name}</span>
                        {m.isAdmin && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">@{m.username} • ID: {m.id}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.role}</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-semibold text-amber-600 px-2 py-0.5 bg-amber-100/70 rounded-full">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Telegram ID form */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Simulate Custom Telegram User</h4>
            <form onSubmit={handleCustomSubmit} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Telegram ID"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={!customId || !customName}
                className="w-full py-2 bg-[#0A192F] hover:bg-[#1E293B] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition"
              >
                Log In As Custom Telegram User
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
