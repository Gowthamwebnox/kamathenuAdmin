import { create } from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";



type UserInterface={
    userId:string;
    userToken:string;
    userName:string;
    userEmail:string;
}

type UserStore={
    user:UserInterface|null;
    setUser:(user:UserInterface)=>void;
    clearUser:()=>void;
}

export const useUserStore=create<UserStore>()(
    persist(
        (set)=>({
            user:null,
            setUser:(user:UserInterface)=>set({user}),
            clearUser:()=>set({user:null}),
        }) ,
        {
            name:'user-store',
            storage:createJSONStorage(()=>localStorage),    
        }
       )
)

