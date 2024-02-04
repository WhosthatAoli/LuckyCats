"use client";

import React, { createContext, useState, useEffect } from "react";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

// Create a context

const MyContext = createContext({});

// Create a provider component
function MyContextProvider({ children }: { children: React.ReactNode }) {
  const contextValue = {};

  console.log("context", contextValue);

  return (
    <MyContext.Provider value={contextValue}>
      <ThirdwebProvider
        activeChain={"avalanche-fuji"}
        clientId="c820c95463731221d550c29c29b00586"
      >
        {children}
      </ThirdwebProvider>
    </MyContext.Provider>
  );
}

export { MyContext, MyContextProvider };
