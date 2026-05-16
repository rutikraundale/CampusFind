import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState("Student");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { password: form.password, role };
      if (role === "admin") {
        payload.email = form.email;
      } else {
        payload.username = form.username || undefined;
        payload.email = form.email || undefined;
      }
      const user = await login(payload);
      setToast({ message: "Logged in successfully!", type: "success" });
      setTimeout(() => navigate(user.role === "admin" ? "/admin/dashboard" : "/dashboard"), 700);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Login failed. Try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 pt-16">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md animate-fade-in">
        {/* Card */}
        <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-8 shadow-[0_0_60px_rgba(108,99,255,0.08)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-[0_0_24px_rgba(108,99,255,0.4)]">
              CF
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-[#8892a4] text-sm mt-1">Sign in to your CampusFind account</p>
          </div>

          {/* Role Switcher */}
          <div className="flex bg-[#0f1117] rounded-xl p-1 mb-6">
            {["Student", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  role === r
                    ? "bg-[#6c63ff] text-white shadow-[0_0_12px_rgba(108,99,255,0.35)]"
                    : "text-[#8892a4] hover:text-white"
                }`}
              >
                {r === "admin" ? "Admin" : "Student"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {role === "Student" && (
              <div>
                <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="your_username"
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
                />
              </div>
            )}
            {role === "admin" && (
              <div>
                <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@campus.edu"
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all hover:shadow-[0_0_24px_rgba(108,99,255,0.4)] flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {role === "Student" && (
            <p className="text-center text-sm text-[#8892a4] mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#6c63ff] hover:text-[#a78bfa] font-medium transition-colors">
                Register
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
