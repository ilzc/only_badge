import ClaimBadges from "src/components/ClaimBadges"
// import Minter from "src/components/BadgesMinter"
import PageTitle from "src/components/PageTitle"
import useAppContext from "src/hooks/useAppContext"

export default function Claim() {
//   const {isLoggedInAsAdmin, setShowAdminLoginDialog} = useAppContext()

//   const onAdminLoginClick = () => {
//     setShowAdminLoginDialog(true)
//   }

//   if (!isLoggedInAsAdmin) {
//     return (
//       <div className="flex items-center justify-center mt-14">
//         <button onClick={onAdminLoginClick}>Log In to Admin View</button>
//       </div>
//     )
//   }

  return (
    <div>
      <PageTitle>Claim badges</PageTitle>
      <main>
        <div className="main-container py-14">
          <ClaimBadges />
        </div>
      </main>
    </div>
  )
}
