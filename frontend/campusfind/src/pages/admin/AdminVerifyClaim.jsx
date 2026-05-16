import { useState } from "react";
import { adminAPI } from "../../api/services";
import Toast from "../../components/Toast";

export default function AdminVerifyClaim() {
  const [form, setForm] = useState({ claimId: "", otp_code: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const { data } = await adminAPI.verifyClaim(form);
      setResult({ success: true, message: data.message || "Item handed over successfully!" });
      setToast({ message: "Claim verified! Item marked as claimed.", type: "success" });
      setForm({ claimId: "", otp_code: "" });
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed.";
      setResult({ success: false, message: msg });
      setToast({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Verify OTP Claim</h1>
          <p className="text-[#8892a4]">Enter the Claim ID and student's OTP to hand over the item</p>
        </div>

        {/* Steps */}
        <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Process</h3>
          <div className="space-y-3">
            {[
              "Student initiates claim → receives OTP via email",
              "Student visits admin desk and shows the OTP",
              "Admin enters Claim ID and OTP below",
              "Item is marked as claimed and returned",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-[#6c63ff]/20 border border-[#6c63ff]/30 flex items-center justify-center text-[#6c63ff] text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span className="text-[#8892a4]">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#8892a4] mb-1.5">Claim ID <span className="text-red-400">*</span></label>
            <input
              value={form.claimId}
              onChange={(e) => setForm({ ...form, claimId: e.target.value })}
              required
              placeholder="MongoDB Claim Object ID"
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-sm placeholder-[#4a5568] font-mono focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#8892a4] mb-1.5">OTP Code <span className="text-red-400">*</span></label>
            <input
              value={form.otp_code}
              onChange={(e) => setForm({ ...form, otp_code: e.target.value })}
              required
              placeholder="6-digit OTP"
              maxLength={6}
              className="w-full bg-[#0f1117] border border-[#2a2d3e] rounded-xl px-4 py-3 text-white text-2xl font-mono text-center tracking-[0.5em] placeholder-[#4a5568] focus:outline-none focus:border-[#6c63ff] focus:shadow-[0_0_0_3px_rgba(108,99,255,0.15)] transition-all"
            />
          </div>

          {result && (
            <div className={`rounded-xl p-4 text-sm font-medium ${result.success ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
              {result.success ? "✅ " : "❌ "}{result.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] disabled:opacity-60 text-white py-3.5 rounded-xl font-medium transition-all hover:shadow-[0_0_24px_rgba(108,99,255,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Verify & Hand Over
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
