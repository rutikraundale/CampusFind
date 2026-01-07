import { useState } from "react";
import { uploadImage, createItem } from "../lib/postitem";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from '../constants/category'
import { Link } from 'react-router-dom'

const PostItem = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return;

    const [form, setForm] = useState({
        title: "",
        category: "",
        location: "",
        mobile: "",
        image: null,
    });

    

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1️⃣ Upload image
            const imageRes = await uploadImage(form.image);
            if (!form.image) {
                alert("Image Required!!!");
                return;
            }
            

            // 2️⃣ Save item
            await createItem({
                title: form.title,
                category: form.category,
                location: form.location,
                mobile: form.mobile,
                imageid: imageRes.$id,
                ownerid: user.$id,
                status: "lost",
            });
            

            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Failed to post item");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="flex justify-center w-full px-4 py-10">
            {/* Shared container to keep button and form together */}
            <div className="relative w-full max-w-md">

                {/* Back to home button - positioned relative to the max-w-md container */}
                <div className="absolute -top-12 left-0 md:-left-8">
                    <Link to={'/'}>
                        <button className="bg-white text-black font-semibold text-xs md:text-sm px-3 py-2 rounded-xl flex items-center cursor-pointer shadow-md hover:bg-gray-200 transition whitespace-nowrap">
                            <i className="ri-arrow-left-line mr-1"></i>
                            <span className="hidden xs:inline">Back to home</span>
                            <span className="xs:hidden inline">Back</span>
                        </button>
                    </Link>
                </div>

                {/* Form Container */}
                <form
                    onSubmit={handleSubmit}
                    className="flex items-center flex-col w-full rounded-2xl bg-gray-800 p-6 shadow-xl"
                >
                    <input
                        name="title"
                        className="w-full md:w-72 h-auto text-white font-semibold flex m-3 p-2 justify-center items-center border-2 border-white bg-transparent rounded-lg"
                        placeholder="Item name"
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="category"
                        id="category"
                        className="w-full md:w-72 h-auto text-white font-semibold flex m-3 p-2 justify-center items-center border-2 border-white bg-transparent rounded-lg"
                        onChange={handleChange}
                        value={form.category}
                        required
                    >
                        <option value="" className="bg-black text-white">Select Category</option>
                        {CATEGORIES.map((cat) => (
                            <option className="bg-black text-white" key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>

                    <input
                        name="location"
                        className="w-full md:w-72 h-auto text-white font-semibold flex m-3 p-2 justify-center items-center border-2 border-white bg-transparent rounded-lg"
                        placeholder="Location"
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="mobile"
                        type="tel"
                        className="w-full md:w-72 h-auto text-white font-semibold flex m-3 p-2 justify-center items-center border-2 border-white bg-transparent rounded-lg"
                        placeholder="Mobile number"
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="file"
                        className="w-full md:w-72 text-white font-semibold flex m-3 p-2 justify-center items-center border-2 border-white cursor-pointer rounded-lg text-sm"
                        name="image"
                        onChange={handleChange}
                        required
                    />

                    <button
                        disabled={loading}
                        className="bg-white text-black font-bold w-full md:w-40 h-12 rounded-full cursor-pointer mt-4 hover:bg-gray-200 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? "Posting..." : "Post Item"}
                    </button>
                </form>
            </div>
        </div>

    );
};

export default PostItem;
