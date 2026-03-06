import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { account } from "../lib/appwrite";
import { createClaim, FetchItemDetail, updateItemStatus } from "../lib/getitem";

const Claimitem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [message, setMessage] = useState("");
  const [mobile, setMobile] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        const res = await FetchItemDetail(id);
        setItem(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadItem();
  }, [id]);

  const handleClaim = async () => {
    if (!message.trim()) {
      alert("Please enter claim message");
      return;
    }
    if (!mobile.trim()) {
      alert("Mobile number is required");
      return;
    }

    try {
      setSubmitting(true);

      const user = await account.get();

      await createClaim({
        itemid: item.$id,
        title: item.title,
        claimerId: user.$id,
        claimerName: user.name,
        claimerEmail: user.email,
        message,
        mobile,
        status: "pending"
      });

      
      await updateItemStatus(item.$id, "claimed");

      alert("Claim submitted successfully");
      navigate("/browse");

    } catch (err) {
      console.error(err);
      alert("You must be logged in to claim");
    } finally {
      setSubmitting(false);
    }
  };



  if (loading) return <p className="text-center">Loading...</p>;
  if (!item) return <p className="text-center">Item not found</p>;

  const isUnavailable = item.status !== "available";

  return (
    <div className="max-w-lg mx-auto p-6 bg-white dark:bg-gray-900 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        Claim Item: {item.title}
      </h2>

      {isUnavailable && (
        <p className="text-red-600 mb-3 font-semibold">
          This item has already been claimed
        </p>
      )}

      <textarea
        disabled={isUnavailable}
        className="w-full border p-2 rounded"
        rows="5"
        placeholder="Explain why this item belongs to you"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter your mobile number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />


      <button
        onClick={handleClaim}
        disabled={isUnavailable || submitting}
        className={`mt-4 px-4 py-2 rounded text-white 
          ${isUnavailable ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {submitting ? "Submitting..." : "Submit Claim"}
      </button>
    </div>
  );
};

export default Claimitem;
