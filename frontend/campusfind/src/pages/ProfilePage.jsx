import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authAPI } from "../api/services";
import Toast from "../components/Toast";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    college_id: user?.college_id || "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      setUser(data.data);
      setToast({ message: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Update failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-2xl mx-auto animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

        {/* Profile header */}
        <div className="bg-gradient-to-r from-[#6c63ff]/20 to-[#a78bfa]/20 border border-[#6c63ff]/30 rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_32px_rgba(108,99,255,0.4)]">
            {(user?.username || user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.username}</h2>
            <p className="text-[#8892a4] text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-[#6c63ff]/20 text-[#a78bfa] px-2.5 py-1 rounded-full capitalize font-medium">{user?.role}</span>
              {user?.isEmailVerified && (
                <span className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">✓ Verified</span>
              )}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-8">
          <h3 className="text-white font-semibold mb-6">Edit Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {user?.role !== "admin" && [
              { name: "username", label: "Username", type: "text" },
              { name: "college_id", label: "College ID", type: "text" },
              { name: "mobile", label: "Mobile", type: "tel" },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-[#8892a4] mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all hover:shadow-[0_0_24px_rgba(108,99,255,0.4)] flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : "Save Changes"
              }
            </button>
          </form>
        </div>

        {/* Info box */}
        {user?.college_id && (
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-5 mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-[#8892a4]">College ID</span>
              <p className="text-white font-mono font-semibold mt-1">{user.college_id}</p>
            </div>
            <div>
              <span className="text-[#8892a4]">Mobile</span>
              <p className="text-white font-semibold mt-1">{user.mobile || "—"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
