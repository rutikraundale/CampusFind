import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFileView, getItems } from "../lib/getitem";

const SearchItem = () => {
  const [items, setItems] = useState([]);
  const [searchitem, setSearchitem] = useState("");
  const [loading, setLoading] = useState(true);


  const loadItems = async (searchText = "") => {
    setLoading(true);
    try {
      const res = await getItems(searchText);
      setItems(res.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const FoundItemCard = ({ item }) => {
    const navigate = useNavigate();
    const isoString = item.$createdAt;
    const date = new Date(isoString);

    const formatted = date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });


    return (
      <div className="w-full rounded-lg shadow-md bg-gray-800 text-white">
        <div className="h-[200px] overflow-hidden rounded-t-lg">
          <img
            src={getFileView(item.imageid)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-3">
          <p><strong>Title:</strong> {item.title}</p>
          <p><strong>Category:</strong> {item.category}</p>
          <p className="text-red-400"><strong>Location:</strong> {item.location}</p>
          <p><strong>Status:</strong> {item.status}</p>
          <p><strong>Posted on:</strong> {formatted}</p>
        </div>

        <div className="flex justify-between p-3">
          
            <button className="bg-green-600 px-3 py-1 rounded cursor-pointer "
            onClick={()=> navigate(`/claim/${item.$id}`)}
            >Claim</button>
          
          <button
            onClick={() => navigate(`/items/${item.$id}`)}
            className="bg-white text-black px-3 py-1 rounded cursor-pointer"
          >
            View
          </button>
        </div>
      </div>
    );
  };



  useEffect(() => {
    const timer = setTimeout(() => {
      loadItems(searchitem);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchitem]);





  return (
    <div className="flex w-full h-auto justify-center items-center relative">
      <header className="w-full flex flex-col items-center">


        <div className="w-full bg-[#0f0a1e] rounded-3xl flex flex-col items-center border border-white relative md:w-[890px]">
          <Link to="/">
            <button className="absolute top-4 left-4 bg-white text-black font-semibold px-4 py-2 rounded-xl">
              Back to home
            </button>
          </Link>

          <p className="mt-12 text-white text-3xl">Find your lost things !!</p>


          <input
            className="w-full md:w-[350px] h-10 m-4 p-2 bg-transparent text-white border border-white rounded-md"
            type="search"
            value={searchitem}
            onChange={(e) => setSearchitem(e.target.value)}
            placeholder="Search by keywords..."
          />
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {loading && (
            <p className="col-span-full text-white text-center m-4 p-4 text-2xl font-bold">
              Loading items...
            </p>
          )}

          {!loading && items.length === 0 && (
            <p className="col-span-full text-white text-center ">
              No items found
            </p>
          )}

          {!loading &&
            items.length > 0 &&
            items.map((item) => (
              <FoundItemCard key={item.$id} item={item} />
            ))}
        </div>

      </header>
    </div>
  );
};

export default SearchItem;
