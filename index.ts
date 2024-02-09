// index.ts
import dotenv from "dotenv";
import { MorphoBlueMarkets } from "./utils/market";
import { fetchMarketData } from "./src/fetcher";
import { calculateHealthFactor } from "./src/healthFactor";

dotenv.config();

export const run = async () => {
  try {
    const marketData = await fetchMarketData(MorphoBlueMarkets.whitelistedIds);

    marketData.markets.forEach((market) => {
      console.log("Market ID:", market.id);
      calculateHealthFactor(
        market.lltv,
        market.borrowedToken,
        market.inputToken,
        market.positions
      );
    });
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};

run().then(() => process.exit(0));
