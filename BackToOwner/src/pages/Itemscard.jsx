import { Link, useNavigate } from "react-router-dom";

// Reusable Card Component


const FoundItemCard = ({ img, category, location,status,date }) => (
  

  <div className="w-80 md:w-[350px] m-4 rounded-lg flex flex-col shadow-md bg-gray-800 text-white">
    <img src={img} alt={category} className="w-full h-[200px] object-cover rounded-t-xl" />
    
    <div className="m-2 p-1 flex-col flex-wrap items-center">
      <p className="text-base"><span className="text-white text-base">Category: </span>{category}</p>
      <p className="text-red-600 font-semibold"><span className="text-white text-base">Location: </span> {location}</p>
      <p className="text-white text-base"><span>Status: </span>{status} </p>
      <p className="text-white text-base"><span>Post on: </span>{date} </p>
    </div>

    <div className="w-full flex flex-wrap justify-between items-center gap-2">
      <button className="w-[100px] h-9 rounded-lg bg-green-600 border border-black m-2 hover:bg-transparent hover:border-white">
        Claim item
      </button>
       <button className="w-[100px] h-9 rounded-lg text-black bg-white border border-black m-2">
        View details
      </button>
    </div>
  </div>
);

// Data Array
const items = [
  { img: "/image/card1.jpg", category: "Electronic Devices", location: "A-Building" ,status:"Claimed" ,date:"18/08/2024"},
  { img: "/image/card2.jpg", category: "BagPack", location: "C-Building",status:"Returned",date:"18/08/2024" },
  { img: "/image/card3.jpg", category: "Electronic Devices", location: "A-Building",status: "Found",date:"18/08/2024"},
  { img: "/image/card5.jpg", category: "Identity Card", location: "Parking",status: "Found",date:"18/08/2024"},
  { img: "/image/card4.jpg", category: "Keys", location: "Parking",status:"Claimed ",date:"18/08/2024"},
  { img: "/image/card6.jpg", category: "Garments", location: "Four Square",status:"Returned",date:"18/08/2024"},
];

// Main Section
export default function FoundItems() {
  const navigate=useNavigate();
  const handleclick=()=>{
        navigate('./itemdetails')
  }
  return (
    

    <main className="w-full h-auto flex flex-col md:flex-row flex-wrap">
      <div className="w-full flex text-xl gap-4 justify-start items-center m-4 p-2 text-white font-poppins font-semibold md:text-3xl overflow-auto">
        <p>Latest found items.</p>
      </div>

      <div className="w-full grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4 justify-items-center cursor-pointer" onClick={()=>{
          handleclick()
      }}>
        {items.map((item, idx) => (
          <FoundItemCard key={idx} {...item} />
        ))}
      </div>
    </main>
  );
}