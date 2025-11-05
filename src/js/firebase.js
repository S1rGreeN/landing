
import { initializeApp } from "https://www.gstatic.com/firebasejs/x.y.z/firebase-app.js";
import { getDatabase, ref, set, push, get, child } from "https://www.gstatic.com/firebasejs/x.y.z/firebase-database.js";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  domain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storage: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  sender: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

let saveVote = async (productID) => {
    try {
     let votes = ref(database,"votes/"+productID);
        let referencia = push(votes);
        await set(referencia, {
            date: new Date().toISOString(),
        });
        return {
            status: "succes",
            message: "voto guardado correctamente"
        };
    }catch(error) {
        return {
            status: "error",
            message: error.message
        };
    }
};
const getVotes = async () => {
    try{
        const referencia = ref(database);
        const snapshot = await get(child(referencia, "votes"));
        if(snapshot.exists()){
            return {
                status: true,
                data: snapshot.val()
            };
        }
         else{
                return {
                    status: false,
                    message: "no hay datos"
                };
            }
    }catch(error){
        return {
            status: error.status,
            message: error.message
        };
    }
};
export {saveVote, getVotes}