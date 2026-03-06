import React, { useState } from "react";
import { account } from "../../lib/appwrite";

function Otpstep({ userId, onVerified, onBack }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verifyOtp = async () => {
    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await account.createSession(userId, otp);


      // notify parent
      onVerified();

    } catch (err) {
      console.error(err);
      setError("Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full p-2 mb-3 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 tracking-widest text-center"
      />

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

      <div className="flex gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-1/3 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded"
          >
            Back
          </button>
        )}

        <button
          onClick={verifyOtp}
          disabled={loading}
          className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
}

export default Otpstep;
