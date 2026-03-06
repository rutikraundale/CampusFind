import React, { useState } from "react";
import { account } from "../../lib/appwrite";
import { ID } from "appwrite";

function Emailstep({ onOtpSent }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await account.createEmailToken(ID.unique(), email);

      // notify parent
      onOtpSent({
        email,
        userId: response.userId,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
      <h2 className="text-xl font-semibold mb-4">Email Verification</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-3 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
      />

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

      <button
        onClick={sendOtp}
        disabled={loading}
        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
      >
        {loading ? "Sending OTP..." : "Get OTP"}
      </button>
    </div>
  );
}

export default Emailstep;
