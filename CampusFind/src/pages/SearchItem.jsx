import React from 'react'

const SearchItem = () => {
  return (
    <div className='flex w-full h-auto  justify-center items-center'>
      <header className="w-90 md:w-full flex flex-col h-auto  md:flex-wrap justify-center  text-center items-center">
        <div
          className=" w-full  bg-[#0f0a1e] h-auto  rounded-3xl flex justify-center items-center flex-col flex-wrap md:w-[890px]  border border-white  ">
          <div className='flex justify-center items-center'>
            <p className="p-2 m-2 text-white  text-xl font-brandScript md:px-2 md:m-4 md:text-3xl">Find your lost
              things !!</p>
          </div>
          <div >
            <form className="flex flex-col w-full items-center p-4 m-4 md:flex-row md:flex-wrap" action="#">
              <input
                className="w-full h-7 m-2 p-2 md:w-[350px] md:h-10 bg-transparent rounded-md text-white placeholder:text-gray-400 border border-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                type="search" placeholder="Search by keywords..." name="search" id="cat-search"/>
            </form>
          </div>
          <div className="w-full h-auto m-4 p-2 flex flex-wrap justify-center items-center ">
            <select name="category" id="cate"
              className="w-full max-w-[110px] h-9 m-2 p-2 md:max-w-[180px] md:h-10 md:p-2 md:m-3 rounded-md text-white bg-black text-base bg-opacity-50 border border-white focus:outline-none focus:ring-2 focus:ring-white ">
              <option className="bg-black text-white" value="Select Category">Select Cateogory</option>
              <option className="bg-black text-white" value="Electronic devices">Electronic devices</option>
              <option className="bg-black text-white" value="Bags">Bagpack</option>
              <option className="bg-black text-white" value="Document">Document</option>
              <option className="bg-black text-white" value="keys">Keys</option>
              <option className="bg-black text-white" value="Bottels/Tiffins">Bottels/Tiffens</option>
              <option className="bg-black text-white" value="Identity Card">Identity Card</option>
              <option className="bg-black text-white" value="Cloths/Garments">Cloths/Garments</option>
              <option className="bg-black text-white" value="Staff Items">Staff items</option>
            </select>

            <input type="date" name="date" id="date_find"
              className="w-full max-w-[110px] h-9 m-2 p-2 md:max-w-[180px] md:h-10 md:p-2 md:m-3 rounded-md text-black  bg-gray-500 text-base bg-opacity-50 border border-white focus:outline-none focus:ring-2 focus:ring-white"/>

              <select name="location" id="location"
                className="w-full max-w-[110px] h-9 m-2 p-2 md:max-w-[180px] md:h-10 md:p-2 md:m-3 rounded-md text-white bg-black text-base bg-opacity-50 border border-white focus:outline-none focus:ring-2 focus:ring-white">
                <option className="bg-black text-white" value="Select location">Select location</option>
                <option className="bg-black text-white" value="Four Square">Four Square</option>
                <option className="bg-black text-white" value="Basketball Court">Basketball Court</option>
                <option className="bg-black text-white" value="Parking">Parking</option>
                <option className="bg-black text-white" value="Front Gate">Front Gate</option>
                <option className="bg-black text-white" value="Main Ground">Main Ground</option>
                <option className="bg-black text-white" value="C-Building">C-Building</option>
                <option className="bg-black text-white" value="B-Building">B-Building</option>
                <option className="bg-black text-white" value="A-Building">A-Building</option>
              </select>

              <button type="submit"
                className="flex items-center gap-1 px-3 py-2 m-2 rounded-md bg-white text-black text-sm md:text-base font-medium border border-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black transition">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM8 14a6 6 0 100-12 6 6 0 000 12z"
                    clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>

          </div>

        </div>
      </header>
    </div>
  )
}

export default SearchItem