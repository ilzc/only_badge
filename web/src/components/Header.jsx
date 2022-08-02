import Link from "next/link"
import {useRouter} from "next/router"
import HeaderDropdown from "src/components/HeaderDropdown"
import HeaderFLOWBalance from "src/components/HeaderFLOWBalance"
import HeaderLink from "src/components/HeaderLink"
import {paths} from "src/global/constants"
import useAppContext from "src/hooks/useAppContext"
import useLogin from "src/hooks/useLogin"
import HeaderMessage from "./HeaderMessage"
import TransactionsIndicator from "./Transactions"

export default function Header() {
  const {currentUser} = useAppContext()
  const router = useRouter()
  const logIn = useLogin()
  const isAdminPath = router.pathname === paths.adminMint

  return (
    <header className="bg-white border-gray-300">
      <HeaderMessage>
      </HeaderMessage>
      <div className="bg-white">
        <div className="flex justify-between py-4 main-container max-w-2">
          <Link href={paths.root} passHref>
           <a className="flex items-center hover:opacity-80">
             <div className="flex w-full sm:w-auto">
             <svg className="w-10 h-10" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient cx="21.152%" cy="86.063%" fx="21.152%" fy="86.063%" r="79.941%" id="header-logo">
                    <stop stopColor="#4FD1C5" offset="0%" />
                    <stop stopColor="#81E6D9" offset="44.871%" />
                    <stop stopColor="#337CF5" offset="100%" />
                  </radialGradient>
                </defs>
                <rect width="32" height="32" rx="16" fill="url(#header-logo)" fillRule="nonzero" />
              </svg>

              {/* <span className="font-bold text-4xl bg-clip-text text-transparent bg-gradient-to-tl from-orange-300  via-teal-300  to-pink-400  ">OnlyBadge</span> */}
              {/* <img
                 src="/images/badge-logo.svg"
                 alt="Kitty Items"
                 width="150"
                 height="150"
               /> */}
             </div>
           </a>
         </Link>
         <div className="flex items-center">
           {!isAdminPath && (
             <>
               <div className="mr-2 md:mr-4">
                 <HeaderLink  href={paths.root}>
                   Home
                  </HeaderLink>
                 {/* <HeaderLink href={paths.root}>Store</HeaderLink> */}
                 <HeaderLink href={paths.marketplace}>
                   Marketplace
                   </HeaderLink>
                  <HeaderLink href={paths.githubRepo}>
                   About
                  </HeaderLink>


                
               </div>
               {!!currentUser && (
                 <div className="hidden mr-2 md:flex">
                   <HeaderLink href={paths.profile(currentUser.addr)}>My Badges</HeaderLink>
                   <HeaderFLOWBalance />
                 </div>
               )}
               {currentUser ? (
                 <HeaderDropdown />
               ) : (
                 <button 
                   onClick={logIn}
                   className=" text-gray-500 bg-teal-200 rounded-full py-2 px-4 font-semibold mr-2 md:mr-4 ring-opacity-50 text-sm sm:text-lg md:text-xl transform motion-safe:hover:scale-110  "
                 >
                   Log In
                 </button>
               )}
             </>
           )}
           <TransactionsIndicator />
         </div>

        </div>
      </div>
    </header>

    

  )
}