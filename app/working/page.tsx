"use client";
import React, { use } from "react";
import { useState, useEffect } from "react";
import {
  useAddress,
  useContract,
  useContractRead,
  Web3Button,
} from "@thirdweb-dev/react";
import ERC721IsWorkingCard from "../components/ERC721IsWorkingCard";

export default function Working() {
  const [rewards, setRewards] = useState("0");
  const [stakeList, setStakeList] = useState([]);
  const address = useAddress();
  const { contract } = useContract(
    "0xEEb244c7b13c3474c0FCB95B8BD797fE4218d8d0"
  );

  const { data, isLoading } = useContractRead(contract, "getStakeInfo", [
    address,
  ]);

  // console.log("reward", data);
  // console.log(data[1]._hex);

  useEffect(() => {
    if (!isLoading && data) {
      let hexString = data[1]._hex;
      let decimalNumber = parseInt(hexString, 16) / 1000000000000000000;
      let rewardsFromApi = decimalNumber.toFixed(2);
      setRewards(rewardsFromApi);

      console.log("stakeList", data[0]);
      let stakeListFromApi: any = [];
      for (let i = 0; i < data[0].length; i++) {
        console.log(data[0][i]._hex);
        let hexString = data[0][i]._hex;
        let decimalNumber = parseInt(hexString, 16);
        stakeListFromApi.push(decimalNumber);
      }
      console.log(stakeListFromApi);
      setStakeList(stakeListFromApi);
    }
  }, [data]);

  return (
    <div className="mx-4">
      <div className="text-white text-center flex my-4 items-center">
        <div className="ml-2 mr-2">Rewards:</div>
        <div className="mr-8">{rewards} 🪙</div>
        {/* <button className="ml-8  bg-blue-500 text-white py-1 px-4 rounded">
          Claim
        </button> */}
        <Web3Button
          contractAddress="0xEEb244c7b13c3474c0FCB95B8BD797fE4218d8d0"
          action={(contract) => {
            contract.call("claimRewards", []);
          }}
        >
          claimRewards
        </Web3Button>
      </div>

      {stakeList.map((id) => {
        return (
          <div className="mx-2">
            <ERC721IsWorkingCard tokenId={id} />
          </div>
        );
      })}
    </div>
  );
}
