import React from 'react'

const Signup = () => {
  return (
    <div className='w-full h-auto flex justify-center items-center'>
        <div className='flex flex-wrap flex-col w-[400px] md:w-[500px]  h-auto justify-center itmes-center bg-black rounded-3xl gap-2 border-2 border-white'>
                <p className='text-xl mt-4 px-2 py-2 text-white flex justify-center items-center font-bold md:text-3xl'>Sign Up</p>
                <form action="" className='flex flex-col w-full h-auto justify-center items-center m-2 p-2 '>
                    <div className='flex w-full items-center justify-center'>
                        <i className="flex text-white   ri-user-line"></i>
                        <input type="email" placeholder='Enter your email' className='w-1/2 h-auto text-white font-semibold flex m-4 p-2 justify-center items-center border-2 border-pink-400 ' />
                    </div>
                    <div className='flex w-full items-center justify-center'>
                          <i className="flex text-white  ri-lock-2-line"></i>
                          <input type="password" name="password" id="pass" className='w-1/2 h-auto  text-white font-semibold flex m-4 p-2 justify-center items-center border-2 border-pink-400' placeholder='Enter Password' />
                    </div>
                    <div className='flex w-full items-center justify-center'>
                          <i className="flex text-white  ri-lock-2-line"></i>
                          <input type="password" name="cpassword" id="cpass" className='w-1/2 h-auto  text-white font-semibold m-4 p-2 justify-center items-center border-2 border-pink-400 ' placeholder='Confirm Password'/>
                    </div>
                    
                    <button className='m-4 p-2 flex justify-center items-center bg-white text-black hover:bg-black hover:text-white hover:border-2  text-lg  w-27 h-12 font-semibold rounded-2xl' type="submit">Submit</button>
                </form>
        </div>

    </div>
  )
}

export default Signup