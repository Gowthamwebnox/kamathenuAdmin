import { cn } from "@/lib/utils"
import Image from "next/image";

interface LogoProps {
  expanded?: boolean
  className?: string
}

export function Logo({ expanded = true, className }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      {expanded ? (
         <div className="flex items-center">
         <Image
           src="/assets/kamathenuLogo.png"
           alt="Make Easy Logo"
           width={50} 
           height={10}
           className="rounded-full"
         />
         <h1 className="text-1xl text-gray-800 font-bold">Kamathenu</h1>
       </div>
     ) : (
       <div className="flex justify-center items-center w-8 h-8">
         <Image
           src="/assets/logo.svg"
           alt="Make Easy Logo"
           width={50}
           height={50}
           className="rounded-full"
         />
       </div>
      )}
    </div>
  )
}
