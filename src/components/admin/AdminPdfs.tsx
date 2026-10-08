import React, { useEffect, useState } from 'react';
import { PdfItem, Category } from '../../types';
import { api } from '../../api/client';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  X,
  AlertCircle,
  Check
} from 'lucide-react';

export const AdminPdfs: React.FC = () => {
  const [pdfs, setPdfs] = useState<PdfItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPdf, setEditingPdf] = useState<Partial<PdfItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [urlWarning, setUrlWarning] = useState<string | null>(null);

  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const [pData, cData] = await Promise.all([
        api.get<PdfItem[]>('/api/admin/pdfs'),
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
  }, []);

  const handleOpenCreate = () => {
    setUrlWarning(null);
    setEditingPdf({
      title: '',
      description: '',
      category_id: categories[0]?.id || 1,
      google_drive_url: '',
      file_size_text: 'PDF Guide',
      status: 'published'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pdf: PdfItem) => {
    setUrlWarning(null);
    setEditingPdf({ ...pdf });
    setIsModalOpen(true);
  };

  const handleUrlChange = (val: string) => {
    if (!editingPdf) return;
    setEditingPdf({ ...editingPdf, google_drive_url: val });

    const trimmed = val.trim();
    if (trimmed && !trimmed.startsWith('https://drive.google.com') && !trimmed.startsWith('https://docs.google.com')) {
      setUrlWarning('Warning: Link should be a valid Google Drive sharing URL (e.g. https://drive.google.com/file/d/...)');
    } else {
      setUrlWarning(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPdf || submitting) return;

    try {
      setSubmitting(true);
      if (editingPdf.id) {
        await api.put(`/api/admin/pdfs/${editingPdf.id}`, editingPdf);
      } else {
        await api.post('/api/admin/pdfs', editingPdf);
      }
      setIsModalOpen(false);
      setEditingPdf(null);
      await fetchPdfs();
    } catch (err: any) {
      alert(err.message || 'Error saving PDF');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this PDF resource from the library?')) return;
    try {
      await api.delete(`/api/admin/pdfs/${id}`);
      setPdfs(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting PDF');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
            Google Drive PDF Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add Cambridge test books and speaking prediction PDFs using external Google Drive links.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-2xs transition"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>Add PDF</span>
        </button>
      </div>

      {/* PDF Table */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading PDF library...</div>
      ) : pdfs.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No PDFs uploaded yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">File Info</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Downloads</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {pdfs.map((pdf) => (
                  <tr key={pdf.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5 font-semibold text-[#0A192F] max-w-[240px] truncate">
                      {pdf.title}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {pdf.category_name}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {pdf.file_size_text}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        pdf.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pdf.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {pdf.downloads_count}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <a
                        href={pdf.google_drive_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block p-1 text-slate-400 hover:text-blue-600"
                        title="Test Drive Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleOpenEdit(pdf)}
                        className="p-1 rounded text-slate-500 hover:text-amber-700 hover:bg-slate-100"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pdf.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && editingPdf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingPdf.id ? 'Edit PDF Entry' : 'Add Google Drive PDF'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              {/* Permission reminder */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Important:</strong> Ensure file sharing on Google Drive is set to <em>"Anyone with the link can view"</em>. If the file is private, students will see an access denied error.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingPdf.title || ''}
                  onChange={(e) => setEditingPdf({ ...editingPdf, title: e.target.value })}
                  placeholder="e.g. Cambridge IELTS 19 Academic Test Book"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={editingPdf.category_id || 1}
                    onChange={(e) => setEditingPdf({ ...editingPdf, category_id: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-lg bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">File Info Text</label>
                  <input
                    type="text"
                    value={editingPdf.file_size_text || ''}
                    onChange={(e) => setEditingPdf({ ...editingPdf, file_size_text: e.target.value })}
                    placeholder="e.g. 15.4 MB PDF"
                    className="w-full p-2.5 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Google Drive Sharing URL</label>
                <input
                  type="url"
                  value={editingPdf.google_drive_url || ''}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1BxiMVs.../view?usp=sharing"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-mono text-xs"
                  required
                />
                {urlWarning && (
                  <p className="text-[11px] text-amber-700 mt-1">{urlWarning}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={editingPdf.description || ''}
                  onChange={(e) => setEditingPdf({ ...editingPdf, description: e.target.value })}
                  rows={3}
                  placeholder="Summary of chapters, topics, or test papers included..."
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-2xs"
                >
                  {submitting ? 'Saving...' : 'Save PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
