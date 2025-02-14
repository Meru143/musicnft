import * as PinataSDK from "@pinata/sdk";

class IPFSService {
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY;
    this.apiSecret = import.meta.env.VITE_PINATA_API_SECRET;

    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Pinata API credentials not configured');
    }
  }

  async uploadFile(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.apiKey,
          'pinata_secret_api_key': this.apiSecret,
        },
        body: formData,
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(`Failed to upload to IPFS: ${error}`);
      }

      const data = await res.json();
      return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      throw error;
    }
  }
}

export const ipfsService = new IPFSService();