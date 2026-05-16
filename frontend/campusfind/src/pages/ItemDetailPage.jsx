import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { itemsAPI, claimsAPI } from "../api/services";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

const STATUS_STYLES = {
  available: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pending:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
  claimed:   "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    itemsAPI.getById(id)
      .then(({ data }) => setItem(data.data))
      .catch(() => navigate("/items"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleClaim = async () => {
    if (!user) return navigate("/login");
    setClaiming(true);
    try {
      await claimsAPI.initiate(id);
      setToast({ message: "Claim initiated! Check your email for OTP.", type: "success" });
      setItem((prev) => ({ ...prev, status: "pending" }));
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to claim.", type: "error" });
    } finally {
      setClaiming(false);
    }
  };

  const isOwner = user && item?.postedBy?._id === user._id;
  const canClaim = user && !isOwner && item?.status === "available" && user.role !== "admin";

  if (loading) return <div className="min-h-screen bg-[#0f1117] pt-20"><Spinner size="lg" /></div>;
  if (!item) return null;

  return (
    <div className="min-h-screen bg-[#0f1117] pt-20 pb-12 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#8892a4] hover:text-white transition-colors mb-6 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-2xl overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.title} className="w-full h-80 lg:h-96 object-cover" />
            ) : (
              <div className="w-full h-80 lg:h-96 flex items-center justify-center text-6xl bg-[#2a2d3e]">📦</div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[item.status]}`}>
                  {item.status}
                </span>
                <span className="text-xs text-[#8892a4] bg-[#2a2d3e] px-2.5 py-1 rounded-full capitalize">{item.category}</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">{item.title}</h1>
              <p className="text-[#8892a4] leading-relaxed">{item.description}</p>
            </div>

            <div className="bg-[#1e2130] border border-[#2a2d3e] rounded-xl p-5 space-y-3">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Details</h3>
              {[
                { icon: "📍", label: "Found At", value: item.foundAt },
                { icon: "👤", label: "Posted By", value: item.postedBy?.username || "Unknown" },
                { icon: "📅", label: "Posted On", value: new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                { icon: "📞", label: "Contact", value: item.contactPhone },
                { icon: "📧", label: "Email", value: item.contactEmail },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="text-lg flex-shrink-0">{icon}</span>
                  <span className="text-[#8892a4]">{label}:</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {canClaim && (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full bg-[#6c63ff] hover:bg-[#5a52e0] disabled:opacity-60 text-white py-3.5 rounded-xl font-medium transition-all hover:shadow-[0_0_24px_rgba(108,99,255,0.4)] flex items-center justify-center gap-2"
              >
                {claiming ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Claim This Item
                  </>
                )}
              </button>
            )}

            {!user && (
              <a href="/login" className="block w-full text-center bg-[#6c63ff] hover:bg-[#5a52e0] text-white py-3.5 rounded-xl font-medium transition-all">
                Login to Claim
              </a>
            )}

            {isOwner && (
              <div className="text-center text-sm text-[#8892a4] bg-[#2a2d3e] rounded-xl py-3">
                This is your post
              </div>
            )}

            {item.status !== "available" && !isOwner && (
              <div className="text-center text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl py-3">
                This item is {item.status} and cannot be claimed
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
