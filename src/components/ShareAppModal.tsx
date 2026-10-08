import React, { useState } from 'react';
import { X, Share2, Copy, Check, Download, Send, Smartphone } from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareAppModal: React.FC<ShareAppModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://botkeep.cloud';
  const shareText = encodeURIComponent('Join IELTS Journey with Hossain! Master Grammar, Speaking & Cambridge PDFs in this Telegram Learning App:');
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${shareText}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadBackup = async () => {
    try {
      setDownloading(true);
      const res = await fetch('/api/export-backup');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ielts_journey_full_backup_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to download backup: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">টেলিগ্রাম অ্যাপ শেয়ার ও ব্যাকআপ ডাউনলোড</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Telegram Share Button */}
          <div>
            <h4 className="font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
              <Send className="w-4 h-4 text-sky-500" />
              <span>১. টেলিগ্রামে বন্ধুদের সাথে শেয়ার করুন:</span>
            </h4>
            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition shadow-2xs"
            >
              <Smartphone className="w-4 h-4" />
              <span>Share Directly on Telegram</span>
            </a>
          </div>

          {/* Copy WebApp Link */}
          <div>
            <h4 className="font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
              <Copy className="w-4 h-4 text-amber-600" />
              <span>২. ওয়েব অ্যাপ লিঙ্ক কপি করুন:</span>
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2.5 bg-[#0A192F] hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center space-x-1"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Download Complete Code / Data Backup */}
          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1.5 flex items-center space-x-1.5">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>৩. সমস্ত ডাটাবেজ ও কনফিগারেশন ডাউনলোড:</span>
            </h4>
            <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
              প্ল্যাটফর্মের সমস্ত লেসন, ক্যাটাগরি, রোডম্যাপ এক্সারসাইজ, ইউজার ও কমেন্ট ডাটা ব্যাকআপ হিসেবে এক ক্লিকে ডাউনলোড করুন:
            </p>
            <button
              onClick={handleDownloadBackup}
              disabled={downloading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition shadow-2xs"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'ডাউনলোড হচ্ছে...' : 'Download Full Data Backup (JSON)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
