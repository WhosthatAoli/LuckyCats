"use client";

import {
  useActiveClaimConditionForWallet,
  useAddress,
  useClaimConditions,
  useClaimerProofs,
  useClaimIneligibilityReasons,
  useContract,
  useContractMetadata,
  useTotalCirculatingSupply,
  Web3Button,
  useNFT,
  useNFTs,
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import { useState, useMemo } from "react";
import { parseIneligibility } from "../../utils/parseIneligibility";

export default function ERC721card() {
  const address = useAddress();
  const [quantity, setQuantity] = useState(1);
  const { contract: erc721contract } = useContract(
    "0xa75c8B9E93Ce5EB31223722E789c5FCb52Df5d8f"
  );
  const { data: contractMetadata } = useContractMetadata(erc721contract);
  const { data: nft } = useNFTs(erc721contract);

  console.log(contractMetadata);

  console.log(nft);

  const claimConditions = useClaimConditions(erc721contract);
  const activeClaimCondition = useActiveClaimConditionForWallet(
    erc721contract,
    address
  );

  const claimerProofs = useClaimerProofs(erc721contract, address || "");
  const claimIneligibilityReasons = useClaimIneligibilityReasons(
    erc721contract,
    {
      quantity,
      walletAddress: address || "",
    }
  );

  const claimedSupply = useTotalCirculatingSupply(erc721contract);

  const totalAvailableSupply = useMemo(() => {
    try {
      return BigNumber.from(activeClaimCondition.data?.availableSupply || 0);
    } catch {
      return BigNumber.from(1_000_000);
    }
  }, [activeClaimCondition.data?.availableSupply]);

  const numberClaimed = useMemo(() => {
    return BigNumber.from(claimedSupply.data || 0).toString();
  }, [claimedSupply]);

  const numberTotal = useMemo(() => {
    const n = totalAvailableSupply.add(BigNumber.from(claimedSupply.data || 0));
    if (n.gte(1_000_000)) {
      return "";
    }
    return n.toString();
  }, [totalAvailableSupply, claimedSupply]);

  const priceToMint = useMemo(() => {
    const bnPrice = BigNumber.from(
      activeClaimCondition.data?.currencyMetadata.value || 0
    );
    return `${utils.formatUnits(
      bnPrice.mul(quantity).toString(),
      activeClaimCondition.data?.currencyMetadata.decimals || 18
    )} ${activeClaimCondition.data?.currencyMetadata.symbol}`;
  }, [
    activeClaimCondition.data?.currencyMetadata.decimals,
    activeClaimCondition.data?.currencyMetadata.symbol,
    activeClaimCondition.data?.currencyMetadata.value,
    quantity,
  ]);

  const maxClaimable = useMemo(() => {
    let bnMaxClaimable;
    try {
      bnMaxClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimableSupply || 0
      );
    } catch (e) {
      bnMaxClaimable = BigNumber.from(1_000_000);
    }

    let perTransactionClaimable;
    try {
      perTransactionClaimable = BigNumber.from(
        activeClaimCondition.data?.maxClaimablePerWallet || 0
      );
    } catch (e) {
      perTransactionClaimable = BigNumber.from(1_000_000);
    }

    if (perTransactionClaimable.lte(bnMaxClaimable)) {
      bnMaxClaimable = perTransactionClaimable;
    }

    const snapshotClaimable = claimerProofs.data?.maxClaimable;

    if (snapshotClaimable) {
      if (snapshotClaimable === "0") {
        // allowed unlimited for the snapshot
        bnMaxClaimable = BigNumber.from(1_000_000);
      } else {
        try {
          bnMaxClaimable = BigNumber.from(snapshotClaimable);
        } catch (e) {
          // fall back to default case
        }
      }
    }

    let max;
    if (totalAvailableSupply.lt(bnMaxClaimable)) {
      max = totalAvailableSupply;
    } else {
      max = bnMaxClaimable;
    }

    if (max.gte(1_000_000)) {
      return 1_000_000;
    }
    return max.toNumber();
  }, [
    claimerProofs.data?.maxClaimable,
    totalAvailableSupply,
    activeClaimCondition.data?.maxClaimableSupply,
    activeClaimCondition.data?.maxClaimablePerWallet,
  ]);

  const isSoldOut = useMemo(() => {
    try {
      return (
        (activeClaimCondition.isSuccess &&
          BigNumber.from(activeClaimCondition.data?.availableSupply || 0).lte(
            0
          )) ||
        numberClaimed === numberTotal
      );
    } catch (e) {
      return false;
    }
  }, [
    activeClaimCondition.data?.availableSupply,
    activeClaimCondition.isSuccess,
    numberClaimed,
    numberTotal,
  ]);

  const canClaim = useMemo(() => {
    return (
      activeClaimCondition.isSuccess &&
      claimIneligibilityReasons.isSuccess &&
      claimIneligibilityReasons.data?.length === 0 &&
      !isSoldOut
    );
  }, [
    activeClaimCondition.isSuccess,
    claimIneligibilityReasons.data?.length,
    claimIneligibilityReasons.isSuccess,
    isSoldOut,
  ]);

  const isLoading = useMemo(() => {
    return activeClaimCondition.isLoading || !erc721contract;
  }, [activeClaimCondition.isLoading, erc721contract]);

  const buttonLoading = useMemo(
    () => isLoading || claimIneligibilityReasons.isLoading,
    [claimIneligibilityReasons.isLoading, isLoading]
  );
  const buttonText = useMemo(() => {
    if (isSoldOut) {
      return "Sold Out";
    }

    if (canClaim) {
      const pricePerToken = BigNumber.from(
        activeClaimCondition.data?.currencyMetadata.value || 0
      );
      if (pricePerToken.eq(0)) {
        return "Mint (Free)";
      }
      return `Mint (${priceToMint})`;
    }
    if (claimIneligibilityReasons.data?.length) {
      return parseIneligibility(claimIneligibilityReasons.data, quantity);
    }
    if (buttonLoading) {
      return "Checking eligibility...";
    }

    return "Claiming not available";
  }, [
    isSoldOut,
    canClaim,
    claimIneligibilityReasons.data,
    buttonLoading,
    activeClaimCondition.data?.currencyMetadata.value,
    priceToMint,
    quantity,
  ]);

  const imgSrc: any = contractMetadata?.image;

  return (
    <div className="w-72 border rounded-lg shadow-lg p-4  bg-gray-800 text-white ">
      <div className="relative flex justify-center">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="mb-4 flex flex-col justify-center items-center">
              {/* Image Preview of NFTs */}
              <img
                className="w-64 h-64 rounded-lg"
                src={imgSrc}
                alt={`${contractMetadata?.name} preview image`}
              />

              {/* Amount claimed so far */}
              <div>
                <div className="name my-2">
                  {/* Title of your NFT Collection */}
                  <h1 className="text-xl font-bold text-center">
                    {contractMetadata?.name}
                  </h1>
                  {/* Description of your NFT Collection */}
                </div>
              </div>

              <div className="mint-btn mt-2">
                {isSoldOut ? (
                  <div>
                    <h2>Sold Out</h2>
                  </div>
                ) : (
                  <Web3Button
                    contractAddress={erc721contract?.getAddress() || ""}
                    action={(cntr) => cntr.erc721.claim(quantity)}
                    isDisabled={!canClaim || buttonLoading}
                    onError={(err) => {
                      console.error(err);
                      alert("Error claiming NFTs");
                    }}
                    onSuccess={() => {
                      setQuantity(1);
                      alert("Successfully claimed NFTs");
                    }}
                  >
                    {buttonLoading ? "Loading..." : buttonText}
                  </Web3Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
