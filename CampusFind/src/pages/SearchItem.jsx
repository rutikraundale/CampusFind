import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getFileView, getItems } from '../lib/getitem'
import { storage } from '../lib/appwrite'

const SearchItem = () => {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const res = await getItems();
        console.log("FULL DOCUMENT:", res.documents[0]);
        setItems(res.documents);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);
  if (loading) return <p>Loading items...</p>;
  if (items.length === 0) return <p>No items found</p>;

  console.log(
    storage.getFileView(
      import.meta.env.VITE_APPWRITE_BUCKET_ID,
      items[0].imageid
    )
  );





  function FoundItemCard({ item }) {


    const navigate = useNavigate();
    const handle = () => {
      navigate('./itemdetails')
    }
    return (
      <div className="w-full m-4 rounded-lg flex flex-col shadow-md bg-gray-800 text-white">
        <div className="w-full h-[200px] overflow-hidden rounded-t-xl">
          <img
            src={getFileView(item.imageid)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="m-2 p-1 flex-col flex-wrap items-center">
          <p className="text-base"><span className="text-white text-base">Title: </span>{item.title}</p>
          <p className="text-base"><span className="text-white text-base">Category: </span>{item.category}</p>
          <p className="text-red-600 font-semibold"><span className="text-white text-base">Location: </span> {item.location}</p>
          <p className="text-white text-base"><span>Status: </span>{item.status} </p>
        </div>
        <div className="w-full flex flex-wrap justify-between items-center gap-2">
          <Link to={'./claim'}><button className="w-[100px] h-9 rounded-lg bg-green-600 border border-black m-2 hover:bg-transparent hover:border-white">
            Claim item
          </button></Link>
          <button onClick={() => {
            handle()
          }} className="w-[100px] h-9 rounded-lg text-black bg-white border border-black m-2 cursor-pointer">
            View details
          </button>
        </div>
      </div>
    );

  }

  return (
    <div className="flex w-full h-auto justify-center items-center relative">
      <header className="w-90 md:w-full flex flex-col h-auto md:flex-wrap justify-center text-center items-center">
        <div className="w-full bg-[#0f0a1e] h-auto rounded-3xl flex justify-center items-center flex-col flex-wrap md:w-[890px] border border-white relative">


          <Link to={'/'}>
            <button className="absolute top-4 left-4 bg-white text-sm md:text-lg text-black font-semibold px-3 py-1 md:px-4 md:py-2 rounded-xl flex items-center cursor-pointer">
              <i className="ri-arrow-left-line mr-1"></i> Back to home
            </button>
          </Link>

          <div className="flex justify-center items-center mt-12">
            <p className="p-2 m-2 text-white text-xl font-brandScript md:px-2 md:m-4 md:text-3xl">
              Find your lost things !!
            </p>
          </div>

          <div>
            <form className="flex flex-col w-full items-center p-4 m-4 md:flex-row md:flex-wrap" action="#">
              <input
                className="w-full h-7 m-2 p-2 md:w-[350px] md:h-10 bg-transparent rounded-md text-white placeholder:text-gray-400 border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                type="search"
                placeholder="Search by keywords..."
                name="search"
                id="cat-search"
              />
            </form>
          </div>
        </div>
        <div className="flex-col md:flex-row w-full h-auto items-center" >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 justify-items-center w-auto">
            {items.map((item) => (
              <FoundItemCard key={item.$id} item={item} />
            ))}
          </div>
        </div>
      </header>
    </div>
  )
}

export default SearchItem