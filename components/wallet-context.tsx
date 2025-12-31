"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BASE_SEPOLIA_CHAIN_ID = "0x14a34"; // 84532 in hex

interface WalletContextType {
  account: string;
  balance: string;
  isConnecting: boolean;
  error: string;
  isCorrectNetwork: boolean;
  isMetaMaskInstalled: boolean;
  connectWallet: () => Promise<void>;
  switchToBaseSepolia: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const isMetaMaskInstalled = typeof window !== "undefined" && window.ethereum;

  // Check current network
  const checkNetwork = async () => {
    if (!window.ethereum) return;

    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setIsCorrectNetwork(chainId === BASE_SEPOLIA_CHAIN_ID);
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  // Switch to Base Sepolia network
  const switchToBaseSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID }],
      });
      setIsCorrectNetwork(true);
      setError("");
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: BASE_SEPOLIA_CHAIN_ID,
                chainName: "Base Sepolia",
                nativeCurrency: {
                  name: "Sepolia Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: ["https://sepolia.base.org"],
                blockExplorerUrls: ["https://sepolia.basescan.org"],
              },
            ],
          });
          setIsCorrectNetwork(true);
          setError("");
        } catch (addError) {
          setError("Failed to add Base Sepolia network");
        }
      } else {
        setError("Failed to switch to Base Sepolia network");
      }
    }
  };

  // Get ETH balance
  const getBalance = async (address: string) => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      setBalance(parseFloat(formattedBalance).toFixed(4));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError("Please install MetaMask to connect your wallet");
      return;
    }

    setIsConnecting(true);
    setError("");

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const account = accounts[0];
      setAccount(account);

      // Check network
      await checkNetwork();

      // Get balance if on correct network
      if (isCorrectNetwork) {
        await getBalance(account);
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError("User rejected the request");
      } else {
        setError("Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Listen to account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        setAccount("");
        setBalance("");
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        if (isCorrectNetwork) {
          await getBalance(newAccount);
        }
      }
    };

    const handleChainChanged = async (chainId: string) => {
      setIsCorrectNetwork(chainId === BASE_SEPOLIA_CHAIN_ID);
      if (chainId === BASE_SEPOLIA_CHAIN_ID && account) {
        await getBalance(account);
      } else {
        setBalance("");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Check initial network
    checkNetwork();

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [account, isCorrectNetwork]);

  const value: WalletContextType = {
    account,
    balance,
    isConnecting,
    error,
    isCorrectNetwork,
    isMetaMaskInstalled,
    connectWallet,
    switchToBaseSepolia,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
