import { useState, useCallback, useEffect } from "react";
import { createCoinbaseWalletSDK } from "@coinbase/wallet-sdk";
import { ethers } from "ethers";

interface WalletConfig {
  appName: string;
  appLogoUrl?: string;
}

export function useWallet(config: WalletConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [coinbaseWallet, setCoinbaseWallet] = useState<ReturnType<
    typeof createCoinbaseWalletSDK
  > | null>(null);

  useEffect(() => {
    const wallet = createCoinbaseWalletSDK({
      appName: config.appName,
      appLogoUrl: config.appLogoUrl,
    });
    setCoinbaseWallet(wallet);
  }, [config.appName, config.appLogoUrl]);

  const connect = useCallback(async () => {
    if (!coinbaseWallet) return;

    try {
      const provider = coinbaseWallet.getProvider();

      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts && accounts[0]) {
        const formattedAddress = ethers.getAddress(accounts[0]);
        setAddress(formattedAddress);
        setIsConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setIsConnected(false);
      setAddress("");
    }
  }, [coinbaseWallet]);

  const disconnect = useCallback(async () => {
    try {
      if (coinbaseWallet) {
        const provider = coinbaseWallet.getProvider();
        if (typeof (provider as any).close === "function") {
          await (provider as any).close();
        }
      }
      setAddress("");
      setIsConnected(false);
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  }, [coinbaseWallet]);

  return {
    connect,
    disconnect,
    address,
    isConnected,
  };
}
