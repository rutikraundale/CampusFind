import React from 'react'
import Itemscard from './Itemscard'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className='flex flex-col w-full h-auto overflow-auto justify-center items-center gap-4 mt-4 py-4'>
      <h2 className='font-bold text-white text-xl text-center italic md:text-3xl'><span className=' underline'>Lost something</span> on campus?
      </h2>
      <p className='flex  text-2xl md:text-4xl text-white font-bold italic'>OR</p>
      <h2 className='font-bold text-white text-xl text-center italic md:text-3xl'><span className=' underline'>Found an item</span> and want to return it?</h2>
      <section className="w-full h-auto flex flex-wrap flex-col md:flex md:flex-row mt-4 py-2">
        <div
          className='w-full h-auto flex flex-col  justify-center items-center text-center flex-wrap gap-2 mx-4 p-2 md:flex md:flex-row md:p-2 md:m-4'>
          <Link to={'./postitem'}>
            <button
              className='flex items-center justify-center w-[250px] h-auto m-4 p-1 text-base text-center bg-white text-black rounded-xl font-semibold  hover:bg-gray-400  md:p-2 md:m-4 md:w-[200px] md:h-11 md:text-xl cursor-pointer'>Report Found Item</button>
          </Link>
          <Link to={'./browse'}>
          <button
            className='flex items-center justify-center w-[250px] h-auto m-4 p-1 text-base text-center bg-black text-white  rounded-xl font-semibold border-2  transition-all  ease-in-out border-white hover:bg-gray-600  md:p-2 md:m-4 md:w-[200px] md:h-11 md:text-xl cursor-pointer'>Browse Lost Items</button>
          </Link>
          
        </div>
      </section>

      {/* Main section of cards */}
      <div className='flex-col w-full h-auto  items-center md:flex-row'>
        <div className='flex w-full h-auto'>
            <Itemscard />
        </div>
        
      </div>
      
    </div>
  )
}

export default Home