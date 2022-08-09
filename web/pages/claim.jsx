import ClaimBadges from "src/components/ClaimBadges"
// import Minter from "src/components/BadgesMinter"
import PageTitle from "src/components/PageTitle"
import useAppContext from "src/hooks/useAppContext"

export default function Claim() {
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
