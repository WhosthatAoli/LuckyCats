"use client";

import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
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
} from "@thirdweb-dev/react";
import Card from "./components/card";
import ERC721card from "./components/ERC721card";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const activeChain = "avalanche-fuji";
  return (
    <div className="flex flex-row justify-between">
      <div>
        <div className="flex mx-4">
          <ERC721card />
        </div>
      </div>
    </div>
  );
}
