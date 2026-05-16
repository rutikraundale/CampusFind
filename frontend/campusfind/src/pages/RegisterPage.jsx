import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", college_id: "", email: "", password: "", mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      setToast({ message: "Registered! Please verify your email.", type: "success" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Registration failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "username", label: "Username", type: "text", placeholder: "john_doe" },
    { name: "college_id", label: "College ID", type: "text", placeholder: "CS2021001" },
    { name: "email", label: "Email", type: "email", placeholder: "john@campus.edu" },
    { name: "mobile", label: "Mobile", type: "tel", placeholder: "+91 9876543210" },
    { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 py-20">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-8 shadow-[0_0_60px_rgba(108,99,255,0.08)]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#a78bfa] flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-[0_0_24px_rgba(108,99,255,0.4)]">
              CF
            </div>
            <h1 className="text-2xl font-bold text-white">Create Account</h1>
            <p className="text-[#8892a4] text-sm mt-1">Join CampusFind as a student</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-[#8892a4] mb-1.5">{f.label}</label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  placeholder={f.placeholder}
                  className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] disabled:opacity-60 text-white py-3 rounded-xl font-medium transition-all hover:shadow-[0_0_24px_rgba(108,99,255,0.4)] flex items-center justify-center mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#8892a4] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#6c63ff] hover:text-[#a78bfa] font-medium transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
