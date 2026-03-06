
import {databases,storage,} from "./appwrite"
import {ID} from "appwrite";

const DATABASE_ID=import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID=import.meta.env.VITE_APPWRITE_ITEMS_COLLECTION_ID;
const BUCKET_ID=import.meta.env.VITE_APPWRITE_BUCKET_ID;

export const uploadImage=async(file)=>{
    return await storage.createFile(
        BUCKET_ID,
        ID.unique(),
        file
    )
}
export const createItem=async(data)=>{
        return await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            data
        )
}