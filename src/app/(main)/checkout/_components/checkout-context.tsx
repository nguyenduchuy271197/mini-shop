"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface CheckoutContextType {
  selectedShippingMethod: string;
  setSelectedShippingMethod: (method: string) => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined
);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState("standard");

  return (
    <CheckoutContext.Provider
      value={{
        selectedShippingMethod,
        setSelectedShippingMethod,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckoutContext() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error(
      "useCheckoutContext must be used within a CheckoutProvider"
    );
  }
  return context;
}
