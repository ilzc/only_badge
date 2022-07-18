import HomeEmptyMessage from "src/components/HomeEmptyMessage"
import LatestMarketplaceItems from "src/components/LatestMarketplaceItems"
import LatestStoreItems from "src/components/LatestStoreItems"
import PopularMerchants from "src/components/PopularMerchants"
import PageTitle from "src/components/PageTitle"
import useApiListings from "src/hooks/useApiListings"

export default function Home() {
  const {listings, isLoading} = useApiListings()

  return (
    <div>
      <PageTitle>Home</PageTitle>
      <main>
        {!isLoading &&
          (listings && listings.length > 0 ? (
            <>
              <PopularMerchants items={listings} />
              <LatestStoreItems items={listings} />
              <LatestMarketplaceItems items={listings} />
            </>
          ) : (
            <HomeEmptyMessage />
          ))}
      </main>
    </div>
  )
}
