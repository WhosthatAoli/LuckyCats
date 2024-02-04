"use client";
import React from "react";
import {
  useNFTBalance,
  useContract,
  useAddress,
  useOwnedNFTs,
} from "@thirdweb-dev/react";
import { myEditionDropContractAddress } from "@/const/yourDetails";
import CardMyCollection from "../components/myCollectionCard";
import ERC721MyCollectionCard from "../components/ERC721MyCollectionCard";

export default function MyCollection() {
  const address = useAddress();
  const { contract } = useContract(
    "0xa75c8B9E93Ce5EB31223722E789c5FCb52Df5d8f"
  );
  const { data, isLoading, error } = useOwnedNFTs(contract, address);
  console.log(data);

  return (
    <div>
      <div className="flex mx-4">
        {data?.map((item) => (
          <div key={item.metadata.id} className="mx-2">
            <ERC721MyCollectionCard tokenId={item.metadata.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
