import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
const Navbar = () => {
    const [isMenu, setIsmenu] = useState(false)

    return (
        <div className='h-auto w-full m-3 p-3 flex justify-between items-center'>

            
                <div className='flex justify-center items-center m-2 p-2'>

                    <p className="text-white font-poppins text-xl font-bold m-2 p-2 md:text-4xl ">CampusFind.</p>
                </div>

                <div className='hidden md:flex w-full justify-between items-center ' >
                    <div className='flex w-full justify-center items-center md:m-4 md:p-2'>
                        <ul className="md:flex hidden font-semibold gap-2">
                            <li>
                                <Link className='mx-3.5 text-white font-poppins cursor-pointer text-[19px] hover:underline underline-offset-4' to={'/'}>
                                    Home
                                </Link>

                            </li>
                            
                                                        <li>
                                <Link className='mx-3.5 text-white font-poppins cursor-pointer text-[19px] hover:underline underline-offset-4' to={'/browse'}>
                                    Browse item
                                </Link>
                            </li>
                            <li>
                                <Link className='mx-3.5 text-white font-poppins cursor-pointer text-[19px] hover:underline underline-offset-4' to={'/about'}>
                                    Report Found
                                </Link>
                            </li>
                            <li>
                                <Link className='mx-3.5 text-white font-poppins cursor-pointer text-[19px] hover:underline underline-offset-4' to={'/about'}>
                                    Contact Us
                                </Link>
                            </li>

                        </ul>
                    </div>
                    <div className=" flex w-auto h-auto m-2 p-2 justify-center items-center md:m-4 md:p-2 gap-4">
                        <Link className='flex items-center justify-center mx-3.5 text-white text-[19px] font-poppins cursor-pointer  w-[100px] h-11 font-semibold m-2 p-2 hover:border border-white rounded-md' to={'/signin'}>
                            Sign in
                        </Link>
                        <Link className='flex items-center  justify-center mx-3.5 text-[19px] text-black rounded-md bg-white font-poppins cursor-pointer  w-[100px] h-11 font-semibold m-2 p-2 ' to={'/signup'}>
                            Sign up
                        </Link>
                        
                    </div>

                </div>

            




            <div className='md:hidden flex justify-center items-center m-4 px-4 py-2'>
                <i onClick={() => {
                    setIsmenu(!isMenu)
                }} className=" text-white bg-black text-3xl  ri-menu-line cursor-pointer"></i>
            </div>
            {isMenu && (
                <div className='flex flex-col w-1/2 h-screen absolute right-0 top-0 bg-black backdrop-blur-2xl text-white'>
                    <div className='flex m-2 p-2 '><i onClick={() => {
                        setIsmenu(false)
                    }}
                        className="flex justify-center items-center border-2 border-white rounded w-[100px] h-12 text-white text-3xl m-4 px-3 py-4 ri-arrow-right-long-line"></i></div>
                    <div className='flex w-full flex-col  h-auto justify-center items-center'>
                        <ul className="flex flex-col gap-6">
                            <li >
                                <Link className='text-white  text-2xl font-bold cursor-pointer hover:underline' to={'/'}>
                                    Dashboard
                                </Link>
                            </li>
                            <hr />
                            <li >
                                <Link className='text-white text-2xl font-bold cursor-pointer hover:underline' to={'/browse'}>
                                    Browse Items
                                </Link>
                            </li>
                            <hr />
                            <li >
                                <Link className='text-white text-2xl font-bold cursor-pointer hover:underline' to={'/about'}>
                                    About us
                                </Link>
                            </li>
                            <hr />

                        </ul>
                    </div>
                    <div className=" flex w-full h-auto m-2 p-2 justify-center items-center md:m-4 md:p-2 gap-4">
                        <Link className='flex items-center justify-center mx-2.5 bg-white text-black text-[14px] font-poppins cursor-pointer  w-auto h-11 font-semibold m-2 p-2 hover:border border-white rounded-md' to={'/signin'}>
                            Sign in
                        </Link>
                        <Link className='flex items-center justify-center mx-2.5 bg-white text-black text-[14px] font-poppins cursor-pointer  w-auto h-11 font-semibold m-2 p-2 hover:border border-white rounded-md' to={'/signup'}>
                            Sign up
                        </Link>

                    </div>
                </div>
            )}
        </div>
    )
}

export default Navbar