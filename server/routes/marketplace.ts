import { Router } from 'express';
import { z } from 'zod';

const router = Router();

// Schema for marketplace listing
const ListingSchema = z.object({
  tokenId: z.number(),
  price: z.string(), // Price in ETH
});

// In-memory storage for listings (replace with database in production)
const listings = new Map();

// Get all active listings
router.get('/api/marketplace/listings', (req, res) => {
  const activeListings = Array.from(listings.values());
  res.json(activeListings);
});

// Create new listing
router.post('/api/marketplace/listings', async (req, res) => {
  try {
    const listing = ListingSchema.parse(req.body);
    listings.set(listing.tokenId, {
      ...listing,
      seller: req.user?.address,
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ message: 'Listing created successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid listing data' });
  }
});

// Remove listing
router.delete('/api/marketplace/listings/:tokenId', (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  if (listings.has(tokenId)) {
    listings.delete(tokenId);
    res.json({ message: 'Listing removed successfully' });
  } else {
    res.status(404).json({ message: 'Listing not found' });
  }
});

export default router;
