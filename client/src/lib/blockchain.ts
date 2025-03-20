import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';

const IDENTITY_CONTRACT_ABI = [
  "function storeIdentity(string memory hash) public returns (bool)",
  "function verifyIdentity(string memory hash) public view returns (bool)",
];

const IDENTITY_CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";

export class BlockchainService {
  private static instance: BlockchainService;
  private provider: ethers.providers.Web3Provider | null = null;
  private contract: ethers.Contract | null = null;

  private constructor() {}

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.provider.send("eth_requestAccounts", []);
        
        const signer = this.provider.getSigner();
        this.contract = new ethers.Contract(
          IDENTITY_CONTRACT_ADDRESS,
          IDENTITY_CONTRACT_ABI,
          signer
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize blockchain:', error);
      return false;
    }
  }

  async storeIdentity(hash: string): Promise<boolean> {
    try {
      if (!this.contract) return false;
      const tx = await this.contract.storeIdentity(hash);
      await tx.wait();
      return true;
    } catch (error) {
      console.error('Failed to store identity:', error);
      return false;
    }
  }

  async verifyIdentity(hash: string): Promise<boolean> {
    try {
      if (!this.contract) return false;
      return await this.contract.verifyIdentity(hash);
    } catch (error) {
      console.error('Failed to verify identity:', error);
      return false;
    }
  }
}

export function useBlockchain() {
  const { toast } = useToast();
  const blockchain = BlockchainService.getInstance();

  const connectWallet = async () => {
    const success = await blockchain.initialize();
    if (success) {
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to blockchain network",
      });
    } else {
      toast({
        title: "Connection Failed",
        description: "Please install MetaMask to use blockchain features",
        variant: "destructive",
      });
    }
    return success;
  };

  return {
    connectWallet,
    storeIdentity: blockchain.storeIdentity.bind(blockchain),
    verifyIdentity: blockchain.verifyIdentity.bind(blockchain),
  };
}
