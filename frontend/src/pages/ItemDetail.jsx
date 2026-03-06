import { useEffect, useState } from 'react'
import { FetchItemDetail, getFileView } from '../lib/getitem'
import { useParams, useNavigate, Link } from 'react-router-dom'
const ItemDetail = () => {
  const { id } = useParams();
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loaditem = async () => {
      try {
        const res = await FetchItemDetail(id);
        setItems(res);
      } catch (error) {
        console.log(error);

      } finally {
        setLoading(false);
      }
    }
    loaditem();
  }, [id])
  if (loading) return <p className="text-white text-center">Loading item...</p>;
  if (!items) return <p className="text-white text-center">Item not found</p>;

  const isoString = items.$createdAt;
  const date = new Date(isoString);

  const formatted = date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-black shadow-md rounded-lg overflow-hidden">

        {/* First Column: Image */}
        <div className="flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-900">
          <img
            src={getFileView(items.imageid)}
            alt={items.title}
            className="w-64 h-auto object-cover"
          />
        </div>

        {/* Second Column: Details */}
        <div className="flex flex-col justify-between p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {items.title}
          </h2>

          {/* Category */}
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Category:</span> {items.category}
          </p>

          {/* Mobile No */}
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Mobile No(founder):</span>{items.mobile}
          </p>

          {/* Status */}
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Status:</span>{items.status}
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            <span className="font-medium">Posted On:</span>{formatted}
          </p>


          {/* Claim Button */}
          <div className="mt-auto flex justify-center gap-4">

            <button
              disabled={items.status !== "available"}
              className={`px-4 py-2 rounded-lg text-white 
    ${items.status === "available"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"}`}
            >
              {items.status === "available" ? "Claim" : "Already Claimed"}
            </button>


            <Link to={"/browse"} >
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200">
                Back to browse
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>

  )
}

export default ItemDetail


