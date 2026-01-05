import React,{useState} from 'react'
import {useNavigate} from 'react-router-dom'
import { account } from '../lib/appwrite'
import { ID } from 'appwrite';
import {useAuth} from "../context/Authcontext"

const emailregex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordregex=/^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const Signup = () => {

      const {login}=useAuth();
      const navigate=useNavigate();
      const [name,SetName]=useState("");
      const [email,setEmail]=useState("");
      const [password,setPassword]=useState("");
      const [confirmPass,setConfirmPass]=useState("");

      const handleSignup=async(e)=>{
        e.preventDefault();

        if(!emailregex.test(email)){
            alert("Enter valid email!");
            return;
        }
        if(!passwordregex.test(password)){
            alert("Enter valid password!");
            return;
        }
        if(confirmPass !==password){
          alert("Confirm password does not match!");
          return;
        }

        //appwrite for account creation
        try {
            await account.create(ID.unique(),email,password);
            await login(email,password);
            navigate("/");
        } catch (error) {
          alert("Invalid Credentials")
        }
      }
  return (
    <div className='w-full h-auto flex justify-center items-center'>
        <div className='flex flex-wrap flex-col w-[400px] md:w-[500px]  h-auto justify-center itmes-center bg-black rounded-3xl gap-2 border-2 border-white'>
                <p className='text-xl mt-4 px-2 py-2 text-white flex justify-center items-center font-bold md:text-3xl'>Sign Up</p>
                <form onSubmit={handleSignup} className='flex flex-col w-full h-auto justify-center items-center m-2 p-2 '>
                    <div className='flex w-full items-center justify-center'>
                        <i className="flex text-white   ri-user-line"></i>
                        <input type="text" placeholder='Enter your name' required value={name} onChange={(e)=>SetName(e.target.value)} className='w-1/2 h-auto text-white font-semibold flex m-4 p-2 justify-center items-center border-2 border-pink-400 ' />
                    </div>
                    <div className='flex w-full items-center justify-center'>
                        <i className="flex text-white   ri-user-line"></i>
                        <input type="email" placeholder='Enter your email' required value={email} onChange={(e)=>setEmail(e.target.value)} className='w-1/2 h-auto text-white font-semibold flex m-4 p-2 justify-center items-center border-2 border-pink-400 ' />
                    </div>
                    <div className='flex w-full items-center justify-center'>
                          <i className="flex text-white  ri-lock-2-line"></i>
                          <input type="password" name="password" id="pass" required value={password} onChange={(e)=>setPassword(e.target.value)} className='w-1/2 h-auto  text-white font-semibold flex m-4 p-2 justify-center items-center border-2 border-pink-400' placeholder='Enter Password' />
                    </div>
                    <div className='flex w-full items-center justify-center'>
                          <i className="flex text-white  ri-lock-2-line"></i>
                          <input type="password" name="cpassword" id="cpass" required value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)} className='w-1/2 h-auto  text-white font-semibold m-4 p-2 justify-center items-center border-2 border-pink-400 ' placeholder='Confirm Password'/>
                    </div>
                    
                    <button className='m-4 p-2 flex justify-center items-center bg-white text-black hover:bg-black hover:text-white hover:border-2  text-lg  w-27 h-12 font-semibold rounded-2xl' type="submit">Submit</button>
                </form>
        </div>

    </div>
  )
}

export default Signup