import { BrowserProvider, type JsonRpcSigner } from "ethers";

export type WalletStatus = "connected" | "disconnected" | "connecting" | "error";

export interface Web3State {
  status: WalletStatus;
  address: string | null;
  error?: string;
  signer?: JsonRpcSigner;
  chainId?: number;
}

class Web3Client {
  private state: Web3State = {
    status: "disconnected",
    address: null,
  };

  private listeners: ((state: Web3State) => void)[] = [];
  private provider?: BrowserProvider;

  constructor() {
    // Listen for account and network changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        this.disconnect();
      });

      window.ethereum.on('chainChanged', () => {
        this.disconnect();
      });
    }
  }

  subscribe(listener: (state: Web3State) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private setState(newState: Partial<Web3State>) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async connect() {
    try {
      if (!window.ethereum) {
        throw new Error("No Web3 wallet found. Please install MetaMask from metamask.io");
      }

      this.setState({ status: "connecting" });

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      // Create ethers provider
      this.provider = new BrowserProvider(window.ethereum);
      const signer = await this.provider.getSigner();

      // Get current chain ID
      const network = await this.provider.getNetwork();
      const chainId = Number(network.chainId);

      this.setState({
        status: "connected",
        address: accounts[0],
        signer,
        chainId,
        error: undefined,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.setState({
        status: "error",
        error: error instanceof Error ? error.message : "Failed to connect wallet",
      });
    }
  }

  async switchToSepolia() {
    try {
      if (!window.ethereum) {
        throw new Error("No Web3 wallet found. Please install MetaMask.");
      }

      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
      });

      // Reconnect after switching
      await this.connect();
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, try to add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia',
            nativeCurrency: {
              name: 'Sepolia ETH',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        });
        await this.connect();
      } else {
        throw error;
      }
    }
  }

  async disconnect() {
    this.setState({
      status: "disconnected",
      address: null,
      signer: undefined,
      chainId: undefined,
      error: undefined,
    });
  }

  getSigner() {
    return this.state.signer;
  }

  getChainId() {
    return this.state.chainId;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const web3Client = new Web3Client();