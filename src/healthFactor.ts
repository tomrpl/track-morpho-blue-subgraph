import { formatEther } from "ethers";
import { Token, Position } from "../utils/interfaces";
import { WAD } from "../utils/constants";
import * as WadMath from "evm-maths/lib/wad";

export const calculateHealthFactor = (
  lltv: string,
  borrowedToken: Token,
  inputToken: Token,
  positions: Position[]
) => {
  console.log("LLTV:", lltv);

  const lltvBigInt = BigInt(lltv);
  const borrowedTokenPriceBigInt = BigInt(
    Math.round(parseFloat(borrowedToken.lastPriceUSD) * 1e18)
  );
  const inputTokenPriceBigInt = BigInt(
    Math.round(parseFloat(inputToken.lastPriceUSD) * 1e18)
  );

  const uniqueAccounts = Array.from(
    new Set(positions.map((p) => p.account.id))
  );

  uniqueAccounts.forEach((accountId) => {
    const collateralPosition = positions.find(
      (p) => p.side === "COLLATERAL" && p.account.id === accountId
    );
    const borrowerPosition = positions.find(
      (p) => p.side === "BORROWER" && p.account.id === accountId
    );

    if (!collateralPosition || !borrowerPosition) {
      console.log(`Missing position for account ID: ${accountId}`);
      return;
    }

    const collateralBalanceBigInt = BigInt(collateralPosition.balance);
    const borrowerBalanceBigInt = BigInt(borrowerPosition.balance);

    if (borrowerBalanceBigInt === BigInt(0)) {
      console.log(`Account ID: ${accountId}, Health Factor: Infinity`);
      return;
    }

    // doing +1n as we don't want division by zero
    const numerator =
      WadMath.wadMul(
        WadMath.wadMul(lltvBigInt, inputTokenPriceBigInt),
        collateralBalanceBigInt
      ) + 1n;
    const denominator =
      WadMath.wadMul(borrowedTokenPriceBigInt, borrowerBalanceBigInt) + 1n;

    const hf: bigint = WadMath.wadDiv(numerator, denominator);
    const borrowCapacity: bigint =
      WadMath.wadDiv(denominator, numerator) * 100n;

    console.log(
      `Account ID: ${accountId}, Health Factor: ${formatEther(
        hf
      )}, Collateral to Seize in USD: ${
        (collateralBalanceBigInt * inputTokenPriceBigInt) /
        (WAD * BigInt(10) ** BigInt(inputToken.decimals))
      }`
    );
    console.log(`borrowCapacity Percentage: ${formatEther(borrowCapacity)}`);
    console.log(" ");
  });
};
