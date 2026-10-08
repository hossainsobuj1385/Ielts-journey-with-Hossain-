import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Settings, Save, CheckCircle2, Database } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const data = await api.get<Record<string, string>>('/api/admin/settings');
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/api/admin/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-xl animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
          Platform Configuration & Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Customize student announcement banners, official support links, and platform details.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Platform Brand Title</label>
          <input
            type="text"
            value={settings.site_title || ''}
            onChange={(e) => setSettings({ ...settings, site_title: e.target.value })}
            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Top Home Announcement Banner</label>
          <textarea
            value={settings.announcement_banner || ''}
            onChange={(e) => setSettings({ ...settings, announcement_banner: e.target.value })}
            rows={2}
            className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
          />
          <p className="text-[10px] text-slate-400 mt-1">Displayed to students at the very top of their home feed.</p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Official Telegram Support Handle</label>
          <input
            type="text"
            value={settings.support_telegram_username || ''}
            onChange={(e) => setSettings({ ...settings, support_telegram_username: e.target.value })}
            placeholder="@HossainIELTS_Official"
            className="w-full p-2.5 border border-slate-200 rounded-lg"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Telegram Community Channel URL</label>
          <input
            type="url"
            value={settings.telegram_channel_url || ''}
            onChange={(e) => setSettings({ ...settings, telegram_channel_url: e.target.value })}
            placeholder="https://t.me/ielts_journey_hossain"
            className="w-full p-2.5 border border-slate-200 rounded-lg"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-[#0A192F] hover:bg-[#1E293B] disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-2xs transition"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
