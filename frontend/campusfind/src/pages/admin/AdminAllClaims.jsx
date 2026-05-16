import { useEffect, useState } from "react";
import { claimsAPI } from "../../api/services";
import Spinner from "../../components/Spinner";

export default function AdminAllClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | verified | pending

  useEffect(() => {
    const params = filter !== "all" ? { verified: filter === "verified" } : {};
    claimsAPI.getAll(params)
      .then(({ data }) => setClaims(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">All Claims</h1>
          <p className="text-[#8892a4]">Monitor all claim requests from students</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "verified"].map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setLoading(true); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f
                  ? "bg-[#6c63ff] text-white shadow-[0_0_12px_rgba(108,99,255,0.3)]"
                  : "bg-[#1e2130] border border-[#2a2d3e] text-[#8892a4] hover:text-white hover:border-[#6c63ff]/40"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <Spinner size="lg" /> : claims.length === 0 ? (
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-16 text-center text-[#8892a4]">
            <div className="text-5xl mb-4">🏷️</div>
            <p>No claims found for this filter.</p>
          </div>
        ) : (
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2a2d3e]">
                    {["Item", "Student", "College ID", "Initiated", "OTP Expires", "Status", "Claim ID"].map((h) => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-[#8892a4] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim, i) => (
                    <tr key={claim._id} className={`border-b border-[#2a2d3e] hover:bg-[#2a2d3e]/50 transition-colors ${i === claims.length - 1 ? "border-none" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#2a2d3e] overflow-hidden flex-shrink-0">
                            {claim.itemId?.image
                              ? <img src={claim.itemId.image} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">📦</div>
                            }
                          </div>
                          <span className="text-white text-sm font-medium max-w-36 truncate">{claim.itemId?.title || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-[#8892a4]">{claim.student_id?.username || "—"}</td>
                      <td className="px-5 py-4 text-sm text-[#8892a4] font-mono">{claim.student_id?.college_id || "—"}</td>
                      <td className="px-5 py-4 text-sm text-[#8892a4]">{new Date(claim.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-sm text-[#8892a4]">{new Date(claim.opt_expiresAt).toLocaleTimeString()}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${claim.isVerified ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}`}>
                          {claim.isVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-[#6c63ff] font-mono bg-[#6c63ff]/10 px-2 py-1 rounded">{claim._id.slice(-8)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
