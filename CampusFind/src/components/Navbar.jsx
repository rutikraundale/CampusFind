import React from 'react'
import { useState, useEffect} from 'react'
import { Link, NavLink ,useNavigate} from 'react-router-dom'
import {useAuth} from '../context/Authcontext'


const Navbar = () => {
    const [isMenu, setIsmenu] = useState(false);
    const {loading,user,logout} =useAuth();
    const navigate=useNavigate();
   
    if (loading) {
        return null;
    }
    const handleLogout = async () => {
        try {
            await logout();
            setUser(null);
            navigate("/signin")
        } catch (error) {
            console.log(error);

        }
    }
  

    return (
        <div className='h-auto w-full m-3 p-3 flex justify-between items-center'>


            <div className='flex justify-center items-center m-2 p-2'>

                <p className="text-white font-poppins text-xl font-bold m-2 p-2 md:text-4xl ">CampusFind.</p>
            </div>

            <div className='hidden md:flex w-full justify-between items-center ' >
                <div className='flex w-full justify-center items-center md:m-4 md:p-2'>
                    <ul className="md:flex hidden font-semibold gap-2">
                        <li>
                            <NavLink className={({ isActive }) =>

                                `mx-3.5 text-white font-poppins cursor-pointer text-[19px] ${isActive ? "underline" : "hover:underline "}  underline-offset-4`
                            } to={'/'}>
                                Home
                            </NavLink>

                        </li>

                        <li>
                            <NavLink className={({ isActive }) =>

                                `mx-3.5 text-white font-poppins cursor-pointer text-[19px] ${isActive ? "underline " : "hover:underline "} underline-offset-4`
                            } to={'/browse'}>
                                Browse item
                            </NavLink>
                        </li>
                        <li>
                            <NavLink className={({ isActive }) =>

                                `mx-3.5 text-white font-poppins cursor-pointer text-[19px] ${isActive ? "underline " : "hover:underline"}  underline-offset-4`
                            } to={'/postitem'}>
                                Report Found
                            </NavLink>
                        </li>
                        <li>
                            <NavLink className={({ isActive }) =>
                                `mx-3.5 text-white font-poppins cursor-pointer text-[19px] ${isActive ? "underline" : "hover:underline"} hover:underline underline-offset-4`
                            } to={'/about'}>
                                Contact Us
                            </NavLink>
                        </li>

                    </ul>
                </div>
                {user ? (

                    <div className=' flex w-auto h-auto m-2 p-2 justify-center items-center md:m-4 md:p-2 gap-4'>
                        <p className='flex w-auto text-white '>{user.email.trim()}</p>
                        <button className='flex bg-white text-black w-32 h-10 text-xl cursor-pointer rounded-xl justify-center items-center  ' onClick={handleLogout} >Logout</button>

                    </div>


                ) : (
                    <>
                        <div className=" flex w-auto h-auto m-2 p-2 justify-center items-center md:m-4 md:p-2 gap-4">
                            <Link className='flex items-center justify-center mx-3.5 text-white text-[19px] font-poppins cursor-pointer  w-[100px] h-11 font-semibold m-2 p-2 border-2 border-white rounded-md' to={'/signin'}>
                                Sign in
                            </Link>
                            <Link className='flex items-center  justify-center mx-3.5 text-[19px] text-black rounded-md bg-white font-poppins cursor-pointer  w-[100px] h-11 font-semibold m-2 p-2 ' to={'/signup'}>
                                Sign up
                            </Link>

                        </div>
                    </>
                )}


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
                    {user ? (

                        <div className=' flex w-auto h-auto m-2 p-2 justify-center items-center md:m-4 md:p-2 gap-4'>
                            <p className='flex w-auto text-white '>{user.email.trim()}</p>
                            <button className='flex bg-white text-black w-32 h-10 text-xl cursor-pointer rounded-xl justify-center items-center  ' onClick={handleLogout} >Logout</button>

                        </div>


                    ) : (
                        <>
                            <div className=" flex w-auto h-auto m-2 p-2 justify-center items-center md:m-4 md:p-2 gap-4">
                                <Link className='flex items-center justify-center mx-3.5 text-white text-[19px] font-poppins cursor-pointer  w-[100px] h-11 font-semibold m-2 p-2 border-2 border-white rounded-md' to={'/signin'}>
                                    Sign in
                                </Link>
                                <Link className='flex items-center  justify-center mx-3.5 text-[19px] text-black rounded-md bg-white font-poppins cursor-pointer  w-[100px] h-11 font-semibold m-2 p-2 ' to={'/signup'}>
                                    Sign up
                                </Link>

                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Navbar