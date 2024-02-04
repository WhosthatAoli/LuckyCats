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
} from "@thirdweb-dev/react";
import { BigNumber, utils } from "ethers";
import type { NextPage } from "next";
import { useMemo, useState, useEffect } from "react";
import { parseIneligibility } from "../../utils/parseIneligibility";
import { myEditionDropContractAddress } from "../../const/yourDetails";

export default function ERC721MyCollectionCard({
  tokenId,
}: {
  tokenId: string;
}) {
  const address = useAddress();
  const { contract: ERC721contract } = useContract(
    "0xa75c8B9E93Ce5EB31223722E789c5FCb52Df5d8f"
  );
  const { data: contractMetadata } = useContractMetadata(ERC721contract);
  const { data: nft } = useNFT(ERC721contract, tokenId);

  const claimConditions = useClaimConditions(ERC721contract);
  const activeClaimCondition = useActiveClaimConditionForWallet(
    ERC721contract,
    address,
    tokenId
  );
  const claimerProofs = useClaimerProofs(
    ERC721contract,
    address || "",
    tokenId
  );

  const claimedSupply = useTotalCirculatingSupply(ERC721contract, tokenId);

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

  const isLoading = useMemo(() => {
    return (
      activeClaimCondition.isLoading ||
      claimedSupply.isLoading ||
      !ERC721contract
    );
  }, [activeClaimCondition.isLoading, ERC721contract, claimedSupply.isLoading]);

  const imgSrc: any = nft?.metadata?.image;

  useEffect(() => {
    console.log("rendered");
  }, []);

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

              <div className="name my-2">
                {/* Title of your NFT Collection */}
                <h1 className="text-xl font-bold text-center">
                  {nft?.metadata?.name}
                </h1>
                {/* Description of your NFT Collection */}
              </div>

              <div className="flex w-full justify-center">
                <Web3Button
                  style={{ minWidth: "45%" }}
                  className="text-sm"
                  contractAddress={"0xEEb244c7b13c3474c0FCB95B8BD797fE4218d8d0"}
                  action={(contract) => {
                    contract.call("withdraw", [[tokenId]]);
                  }}
                  //isDisabled={!canClaim || buttonLoading}
                  onError={(err) => {
                    console.error(err);
                    alert("Error going to work");
                  }}
                  onSuccess={() => {
                    //alert("Successfully went to work");
                  }}
                >
                  Stop Working
                </Web3Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
