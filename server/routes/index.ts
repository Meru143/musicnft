import { Express } from "express";
import { Server } from "http";
import marketplaceRouter from './marketplace';

export function registerRoutes(app: Express): Server {
  // Register marketplace routes
  app.use(marketplaceRouter);
  
  // Create and return HTTP server
  return new Server(app);
}
