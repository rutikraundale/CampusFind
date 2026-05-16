import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authAPI } from "../api/services";
import Spinner from "../components/Spinner";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setTimeout(() => navigate("/login"), 3000))
      .catch(() => {});
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 pt-16">
      <div className="text-center animate-fade-in">
        <div className="text-6xl mb-6">📧</div>
        <h1 className="text-2xl font-bold text-white mb-3">Verifying your email...</h1>
        <p className="text-[#8892a4] mb-6">Please wait while we verify your account.</p>
        <Spinner />
        <p className="text-[#8892a4] text-sm mt-6">You'll be redirected to login shortly.</p>
      </div>
    </div>
  );
}
