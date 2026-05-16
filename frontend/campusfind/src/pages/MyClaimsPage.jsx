import { useEffect, useState } from "react";
import { claimsAPI } from "../api/services";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

const STATUS_STYLES = {
  true:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  false: "bg-amber-500/15 text-amber-400 border-amber-500/30",
};

export default function MyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    claimsAPI.getMyClaims()
      .then(({ data }) => setClaims(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (claimId, itemId) => {
    try {
      await claimsAPI.cancel(claimId);
      setClaims((prev) => prev.filter((c) => c._id !== claimId));
      setToast({ message: "Claim cancelled.", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to cancel.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white mb-2">My Claims</h1>
          <p className="text-[#8892a4]">Track all your item claim requests</p>
        </div>

        {loading ? (
          <Spinner size="lg" />
        ) : claims.length === 0 ? (
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-16 text-center text-[#8892a4]">
            <div className="text-5xl mb-4">🏷️</div>
            <h3 className="text-white font-semibold text-lg mb-2">No claims yet</h3>
            <p className="text-sm mb-6">Browse items and claim your lost belongings.</p>
            <a href="/items" className="inline-block bg-[#6c63ff] hover:bg-[#5a52e0] text-white px-6 py-3 rounded-xl font-medium transition-all">Browse Items</a>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim._id} className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl p-5 hover:border-[#6c63ff]/30 transition-all animate-fade-in">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Image */}
                  <div className="w-full sm:w-20 h-20 rounded-xl bg-[#2a2d3e] overflow-hidden flex-shrink-0">
                    {claim.itemId?.image ? (
                      <img src={claim.itemId.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h3 className="text-white font-semibold text-lg line-clamp-1">{claim.itemId?.title || "Unknown Item"}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[String(claim.isVerified)]}`}>
                        {claim.isVerified ? "Verified ✓" : "Pending OTP"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-4">
                      <span className="text-[#8892a4]">Location: <span className="text-white">{claim.itemId?.foundAt || "—"}</span></span>
                      <span className="text-[#8892a4]">Category: <span className="text-white capitalize">{claim.itemId?.category || "—"}</span></span>
                      <span className="text-[#8892a4]">Contact: <span className="text-white">{claim.itemId?.contactPhone || "—"}</span></span>
                      <span className="text-[#8892a4]">Claimed: <span className="text-white">{new Date(claim.createdAt).toLocaleDateString()}</span></span>
                    </div>
                    {!claim.isVerified && (
                      <button
                        onClick={() => handleCancel(claim._id, claim.itemId?._id)}
                        className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
                      >
                        Cancel Claim
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
