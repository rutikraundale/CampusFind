import { Link, useNavigate } from "react-router-dom";
import Claimitem from "./Claimitem";

export default function FoundItems() {

  return (



    <div className="flex-col w-auto h-auto md:flex-row">
      <div className="w-full flex text-xl gap-4 justify-start items-center m-4 p-2 text-white font-poppins font-semibold md:text-3xl ">
        <p>Latest found items.</p>
      </div>


      <div className="flex-col md:flex-row w-full h-auto items-center" >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 justify-items-center w-auto">
          {items.map((item, idx) => (
            <FoundItemCard key={idx} {...item} />
          ))}
        </div>
      </div>

    </div>




  );
}


function FoundItemCard({ img, category, location, status, date }) {


  const navigate = useNavigate();
  const handle = () => {
    navigate('./itemdetails')
  }
  return (
    <div className="w-full m-4 rounded-lg flex flex-col shadow-md bg-gray-800 text-white">
      <img src={img} alt={category} className="w-full h-[200px] object-cover rounded-t-xl" />

      <div className="m-2 p-1 flex-col flex-wrap items-center">
        <p className="text-base"><span className="text-white text-base">Category: </span>{category}</p>
        <p className="text-red-600 font-semibold"><span className="text-white text-base">Location: </span> {location}</p>
        <p className="text-white text-base"><span>Status: </span>{status} </p>
        <p className="text-white text-base"><span>Post on: </span>{date} </p>
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

// Data Array
const items = [
  { img: "/image/card1.jpg", category: "Electronic Devices", location: "A-Building", status: "Claimed", date: "18/08/2024" },
  { img: "/image/card2.jpg", category: "BagPack", location: "C-Building", status: "Returned", date: "18/08/2024" },
  { img: "/image/card3.jpg", category: "Electronic Devices", location: "A-Building", status: "Found", date: "18/08/2024" },

];


