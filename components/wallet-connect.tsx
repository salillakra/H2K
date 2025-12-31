"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Wallet, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const BASE_SEPOLIA_CHAIN_ID = "0x14a34"; // 84532 in hex

export default function WalletConnect() {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>("");
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  // Check if MetaMask is installed
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

  if (!isMetaMaskInstalled) {
    return (
      <Button
        className="bg-red-600 hover:bg-red-700"
        onClick={() => window.open("https://metamask.io/download/", "_blank")}
      >
        Install MetaMask
        <Wallet className="w-4 h-4 ml-2" />
      </Button>
    );
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        {!isCorrectNetwork && (
          <Button
            size="sm"
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
            onClick={switchToBaseSepolia}
          >
            Switch to Base Sepolia
            <AlertCircle className="w-4 h-4 ml-1" />
          </Button>
        )}

        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-white">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
            {isCorrectNetwork && balance && (
              <div className="text-xs text-gray-400">{balance} ETH</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
        <Wallet className="w-4 h-4 ml-2" />
      </Button>

      {error && (
        <div className="text-red-400 text-sm flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
