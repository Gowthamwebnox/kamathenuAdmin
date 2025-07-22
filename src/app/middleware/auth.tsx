import { useRouter } from "next/navigation";
import { useUserStore } from "../(stateManagement)/userStore";


export default function auth(){

    const router = useRouter()
    const{user,setUser,clearUser} = useUserStore()
    if(!user){
        router.push('/login')
    }
}
