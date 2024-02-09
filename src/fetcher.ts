import { gqlFetch } from "./gqlFetcher";
import { MarketUniqueResponse, MorphoBlueMarkets } from "../utils/market";
import { Position } from "../utils/interfaces";

const endpoint =
  "https://api.thegraph.com/subgraphs/name/morpho-association/morpho-blue";

async function fetchAllPositionsForMarket(
  marketId: string,
  accumulatedPositions: Position[] = [],
  skip = 0
): Promise<Position[]> {
  const first = 1000; // Adjust based on your GraphQL server's limits
  const response = await gqlFetch<MarketUniqueResponse>({
    endpoint: endpoint,
    query: MorphoBlueMarkets.MARKET_UNIQUE_QUERY,
    variables: { ids: [marketId], first, skip },
  });

  // Use type assertion to explicitly define the type returned by flatMap
  const newPositions = response.markets.flatMap(
    (market) => market.positions
  ) as Position[];
  const allPositions = accumulatedPositions.concat(newPositions);

  if (newPositions.length < first) {
    // If we got fewer positions than requested, we've reached the end
    return allPositions;
  } else {
    // Otherwise, fetch the next batch
    return fetchAllPositionsForMarket(marketId, allPositions, skip + first);
  }
}

export const fetchMarketData = async (
  marketIds: string[]
): Promise<MarketUniqueResponse> => {
  let allMarketsData: MarketUniqueResponse["markets"] = [];

  const first = 1000; // Define the number of items to fetch in each request
  let skip = 0; // Initialize the skip variable

  for (const marketId of marketIds) {
    let hasMoreItems = true;
    const marketData = await gqlFetch<MarketUniqueResponse>({
      endpoint: endpoint,
      query: MorphoBlueMarkets.MARKET_UNIQUE_QUERY,
      variables: { ids: [marketId], first, skip }, // Pass first and skip variables
    });

    // Assuming marketData.markets[0] exists and matches the marketId
    const market = marketData.markets.find((m) => m.id === marketId);
    if (market) {
      const positions = await fetchAllPositionsForMarket(marketId);
      allMarketsData.push({
        ...market,
        positions,
      });

      hasMoreItems = market.positions.length === first;
    }
    if (hasMoreItems) {
      skip += first;
    }
  }

  return { markets: allMarketsData };
};
