"use client";

import {
  ThirdwebProvider,
  ConnectWallet,
  metamaskWallet,
  embeddedWallet,
} from "@thirdweb-dev/react";

export default function ConnectWalletComponent() {
  return (
    <ConnectWallet
      theme={"dark"}
      switchToActiveChain={true}
      modalSize={"wide"}
    />
  );
}
