import {databases,storage} from './appwrite';


const DATABASE_ID=import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID=import.meta.env.VITE_APPWRITE_ITEMS_COLLECTION_ID;
const BUCKET_ID=import.meta.env.VITE_APPWRITE_BUCKET_ID;
export const getItems = async () => {
  return await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID
  );
};
export const getFileView=(fileid)=>{
    if (!fileid) return "";

    return  storage.getFileView(BUCKET_ID,fileid);
}
