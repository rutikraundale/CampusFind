import {Navigate} from 'react-router-dom';
import { useAuth } from '../context/Authcontext';

const Protectedroutes=({children})=>{
    const {user,loading}=useAuth();
    if(loading) return null;
    if(!user){
        return <Navigate to={"/signin"} replace></Navigate>
    }
    return children;
}
export default Protectedroutes;