import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemsAPI } from "../api/services";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

const CATEGORIES = ["electronics", "clothing", "accessories", "books", "documents", "other"];

export default function PostItemPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "", description: "", foundAt: "", category: "other",
    contactPhone: "", contactEmail: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setToast({ message: "Please upload an image", type: "error" });
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      fd.append("image", image);
      await itemsAPI.post(fd);
      setToast({ message: "Item posted successfully!", type: "success" });
      setTimeout(() => navigate("/items/my-posts"), 1000);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to post item.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Post Found Item</h1>
          <p className="text-[#8892a4]">Help return lost items to their owners</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-8 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[#8892a4] mb-2">Item Photo <span className="text-red-400">*</span></label>
            <div
              className="relative border-2 border-dashed border-[#2a2d3e] rounded-xl overflow-hidden cursor-pointer hover:border-[#6c63ff]/50 transition-colors group"
              onClick={() => document.getElementById("imageInput").click()}
            >
              {preview ? (
                <img src={preview} className="w-full h-52 object-cover" alt="Preview" />
              ) : (
                <div className="h-52 flex flex-col items-center justify-center gap-3 text-[#8892a4] group-hover:text-[#6c63ff] transition-colors">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Click to upload image</p>
                  <p className="text-xs">JPEG, PNG or WebP · Max 5MB</p>
                </div>
              )}
              <input id="imageInput" type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Title <span className="text-red-400">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Blue Water Bottle" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Description <span className="text-red-400">*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={3} placeholder="Describe the item in detail..." className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all resize-none" />
          </div>

          {/* Found At + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Found At <span className="text-red-400">*</span></label>
              <input name="foundAt" value={form.foundAt} onChange={handleChange} required placeholder="Library 2nd Floor" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6c63ff] transition-all">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Contact Phone <span className="text-red-400">*</span></label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} required placeholder="+91 9876543210" className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Contact Email</label>
              <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder={user?.email || "your@email.com"} className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] disabled:opacity-60 text-white py-3.5 rounded-xl font-medium transition-all hover:shadow-[0_0_24px_rgba(108,99,255,0.4)] flex items-center justify-center gap-2 mt-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Post Item
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
