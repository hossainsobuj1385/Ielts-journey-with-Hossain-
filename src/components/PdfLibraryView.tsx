import React, { useEffect, useState } from 'react';
import { PdfItem, Category } from '../types';
import { api } from '../api/client';
import {
  FileText,
  Search,
  ExternalLink,
  Download,
  Eye,
  Info,
  X,
  Share2,
  Check
} from 'lucide-react';

export const PdfLibraryView: React.FC = () => {
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewPdf, setPreviewPdf] = useState<PdfItem | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | undefined> = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [pData, cData] = await Promise.all([
        api.get<PdfItem[]>('/api/pdfs', params),
        api.get<Category[]>('/api/categories')
      ]);
      setPdfs(pData);
      setCategories(cData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPdfs();
  };

  const handlePdfAction = async (pdf: PdfItem, openNewTab: boolean = false) => {
    try {
      // Record download count
      api.post(`/api/pdfs/${pdf.id}/download-click`).catch(() => {});
      setPdfs(prev => prev.map(p => p.id === pdf.id ? { ...p, downloads_count: (p.downloads_count || 0) + 1 } : p));

      if (openNewTab) {
        window.open(pdf.google_drive_url, '_blank', 'noopener,noreferrer');
      } else {
        setPreviewPdf(pdf);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDriveEmbedUrl = (url: string) => {
    if (url.includes('/view')) {
      return url.replace('/view', '/preview');
    }
    return url;
  };

  const copyLink = (pdf: PdfItem) => {
    navigator.clipboard.writeText(pdf.google_drive_url);
    setCopiedId(pdf.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 pb-24 pt-2 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk'] tracking-tight">
          Google Drive PDF Library
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Authentic Cambridge test answer keys, high-scoring essay collections, and predicted speaking cue cards.
        </p>
      </div>

      {/* Google Drive Permission Notice */}
      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start space-x-2 text-xs text-blue-950">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Direct Cloud Storage:</strong> All files are securely opened from official Google Drive servers. If a file does not preview in the frame, click <em>"Open Directly in Google Drive"</em>.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search study guides, Cambridge editions, templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-20 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0A192F] text-white text-[11px] font-semibold rounded-lg hover:bg-slate-800 transition"
        >
          Search
        </button>
      </form>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
            selectedCategory === undefined
              ? 'bg-[#0A192F] text-white shadow-2xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
          }`}
        >
          All Resources
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
              selectedCategory === c.id
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* PDF List */}
      {loading ? (
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-200 animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : pdfs.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-2">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No PDFs found</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-amber-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/60 text-red-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-[11px] mb-1">
                    <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {pdf.category_name}
                    </span>
                    <span className="text-slate-400 font-medium">
                      {pdf.file_size_text}
                    </span>
                    <span className="text-slate-400">
                      • {pdf.downloads_count} views
                    </span>
                  </div>
                  <h3 className="font-bold text-sm md:text-base text-[#0A192F] group-hover:text-amber-900 transition leading-snug">
                    {pdf.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {pdf.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  onClick={() => handlePdfAction(pdf, false)}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <a
                  href={pdf.google_drive_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => api.post(`/api/pdfs/${pdf.id}/download-click`).catch(() => {})}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-2xs transition"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  <span>Google Drive</span>
                </a>

                <button
                  onClick={() => copyLink(pdf)}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition"
                  title="Copy Link"
                >
                  {copiedId === pdf.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-3xl h-[88vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-3.5 bg-[#0A192F] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-xs truncate max-w-sm sm:max-w-md">{previewPdf.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={previewPdf.google_drive_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-300 hover:underline flex items-center space-x-1"
                >
                  <span>Open Full Screen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setPreviewPdf(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe */}
            <div className="flex-1 bg-slate-100 relative">
              <iframe
                src={getDriveEmbedUrl(previewPdf.google_drive_url)}
                title={previewPdf.title}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
