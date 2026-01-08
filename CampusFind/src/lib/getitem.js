import { databases, storage } from "./appwrite";
import { Query ,ID} from "appwrite";

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_ITEMS_COLLECTION_ID;
const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID;
const CLAIM_COLLECTION_ID = import.meta.env.VITE_APPWRITE_CLAIMS_COLLECTION_ID;
const ITEMS_COLLECTION_ID=import.meta.env.VITE_APPWRITE_ITEMS_COLLECTION_ID;

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

export const FetchItemDetail = async (id) => {
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

export const createClaim = async ({
  itemid,
  title,
  claimerId,
  claimerName,
  claimerEmail,
  message,
  mobile
  
}) => {
  // 1. Create claim
  const claim = await databases.createDocument(
    DATABASE_ID,
    CLAIM_COLLECTION_ID,
    ID.unique(),
    {
      itemid,
      title,
      claimerId,
      claimerName,
      claimerEmail,
      mobile,
      message,
      
      status: "pending",
    }
  );

  // 2. Update item status (SOURCE OF TRUTH)
  

  return claim;
};

  export const submitClaim = async (itemId, message,mobile) => {
    const user = await account.get();

    return databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      itemId,
      {
        isClaim: true,
        claimBy: user.$id,
        claimedAt: new Date().toISOString(),
        claimMessage: message,
        mobile:mobile
      }
    );
  };
  export const updateItemStatus = async (itemId, status) => {
  return databases.updateDocument(
    DATABASE_ID,
    COLLECTION_ID,
    itemId,
    { status }
  );
};
