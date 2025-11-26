import React from 'react'
import { useState } from 'react'
const Navbar = () => {
    const [isMenu, setIsmenu] = useState(false)

    return (
        <div className='h-auto w-full m-3 p-3 flex justify-between items-center'>
            <div className="flex justify-center items-center m-2 p-2">
                    <img className='w-20 h-20 rounded-full object-cover md:w-[100px] md:h-[100px]' src="public/image/backtoownerlogo.png" alt="" />
                    <p class="text-white font-poppins text-xl font-bold m-2 p-2 md:text-3xl ">BackToOwner</p>
            </div>
            <ul class="md:flex hidden font-semibold gap-2">
                <li
                    class="mx-3.5 text-white font-poppins cursor-pointer text-[19px] hover:underline underline-offset-4">
                    Home</li>
                <li
                    class="mx-3.5 text-white font-poppins cursor-pointer text-[19px] hover:underline underline-offset-4">
                    Browse Items</li>
                <li
                    class="mx-[3.5 text-white font-poppins cursor-pointer text-[19px] hover:underline underline-offset-4">
                    About us</li>
            </ul>
            <div class=" hidden md:flex  items-center gap-2">
                <a class="mx-3.5 text-white text-[19px] font-poppins cursor-pointer font-semibold m-2 p-2 hover:border border-white rounded-md e-28 block md:w-auto"
                    href="#">Sign in</a>
                <a class="mx-3.5 text-[19px] text-white font-poppins cursor-pointer font-semibold m-2 p-2 hover:border border-white rounded-md w-25 block md:w-auto "
                    href="#">Sign up</a>
            </div>
        </div>
    )
}

export default Navbar