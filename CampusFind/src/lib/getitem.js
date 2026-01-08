import { databases, storage } from "./appwrite";
import { Query } from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_ITEMS_COLLECTION_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;

export const getItems = async (search = "") => {
  const queries = [];

  if (search.trim()) {
    queries.push(
      Query.or([
        Query.search("title", search),
        Query.search("location", search),
      ])
    );
  }

  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_ID,
    queries
  );
};

export const FetchItemDetail=async(id)=>{
    return databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      id
    )
}
export const getFileView = (fileId) => {
  if (!fileId) return "";
  return storage.getFileView(BUCKET_ID, fileId);
};
