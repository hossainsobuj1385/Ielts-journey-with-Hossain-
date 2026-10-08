import React, { useEffect, useState } from 'react';
import { Category } from '../../types';
import { api } from '../../api/client';
import { BookOpen, Plus, Edit, Trash2, X, Move } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.get<Category[]>('/api/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      icon: 'book-open',
      display_order: categories.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || submitting) return;

    try {
      setSubmitting(true);
      if (editingCategory.id) {
        await api.put(`/api/admin/categories/${editingCategory.id}`, editingCategory);
      } else {
        await api.post('/api/admin/categories', editingCategory);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Error saving category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete category? Lessons in this category should be reassigned.')) return;
    try {
      await api.delete(`/api/admin/categories/${id}`);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
            Curriculum Categories
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize modules: Grammar, Vocabulary, Writing, Reading, Speaking, Listening.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 bg-[#0A192F] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-2xs transition"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>New Category</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading categories...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Slug</th>
                <th className="p-3.5">Lessons</th>
                <th className="p-3.5">PDFs</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5 font-bold text-amber-700">{cat.display_order}</td>
                  <td className="p-3.5 font-bold text-[#0A192F]">{cat.name}</td>
                  <td className="p-3.5 text-slate-400 font-mono text-[11px]">{cat.slug}</td>
                  <td className="p-3.5">{cat.lessons_count || 0}</td>
                  <td className="p-3.5">{cat.pdfs_count || 0}</td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1 rounded text-slate-500 hover:text-amber-700 hover:bg-slate-100"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
      )}

      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-[#0A192F] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingCategory.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="e.g. IELTS Writing"
                  className="w-full p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Slug (URL friendly)</label>
                <input
                  type="text"
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                  placeholder="e.g. writing"
                  className="w-full p-2.5 border border-slate-200 rounded-lg font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={editingCategory.display_order || 1}
                  onChange={(e) => setEditingCategory({ ...editingCategory, display_order: Number(e.target.value) })}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 border border-slate-200 rounded-lg"
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
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
