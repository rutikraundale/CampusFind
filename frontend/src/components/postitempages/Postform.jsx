import React, { useState } from "react";
import { uploadImage, createItem } from "../../lib/postitem";
import { account } from "../../lib/appwrite";

import { CATEGORIES } from "../../constants/category";

function Postform({ email, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    mobile: "",
    category:"",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.image) {
      setError("Image is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // 1️⃣ Upload image
      const uploadedImage = await uploadImage(form.image);

      // 2️⃣ Create item document
      await createItem({
        title: form.title,
        description: form.description,
        location: form.location,
        mobile: form.mobile,
        email: email, // verified email
        imageid: uploadedImage.$id,
        category:form.category,
        status: "unclaimed",
        createdAt: new Date().toISOString(),
      });

      // 3️⃣ Optional: delete OTP session
      await account.deleteSession("current");

      // notify parent
      onSuccess();

    } catch (err) {
      console.error(err);
      setError("Failed to post item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col gap-4"
    >
      <h2 className="text-white text-xl font-semibold text-center">
        Post Lost Item
      </h2>

      <input
        name="title"
        placeholder="Item title"
        value={form.title}
        onChange={handleChange}
        required
        className="p-2 rounded bg-gray-900 text-white border border-gray-600"
      />

      <textarea
        name="description"
        placeholder="Item description"
        value={form.description}
        onChange={handleChange}
        required
        className="p-2 rounded bg-gray-900 text-white border border-gray-600"
      />

      <input
        name="location"
        placeholder="Location found"
        value={form.location}
        onChange={handleChange}
        required
        className="p-2 rounded bg-gray-900 text-white border border-gray-600"
      />
      
    <select name="category" id="category" value={form.category} onChange={handleChange} className="p-2 rounded bg-gray-900 text-white border border-gray-600">
        <option value="">Select Category
        </option>
        {CATEGORIES.map((cat)=>{
            <option key={cat.value} value={cat.value}>{cat.label}</option>
        })}
    </select>
      <input
        name="mobile"
        placeholder="Mobile number"
        value={form.mobile}
        onChange={handleChange}
        required
        className="p-2 rounded bg-gray-900 text-white border border-gray-600"
      />

      <input
        type="file"
        name="image"
        onChange={handleChange}
        className="text-white"
        accept="image/*"
        required
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        disabled={loading}
        className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post Item"}
      </button>
    </form>
  );
}

export default Postform;
