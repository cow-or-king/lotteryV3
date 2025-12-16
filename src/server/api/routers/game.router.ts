/**
 * Game Router
 * Routes tRPC pour la gestion des jeux
 * Ce fichier merge tous les sous-routers
 */

import { createTRPCRouter } from '../trpc';
import { gameCrudRouter } from './game/game-crud.router';
import { gamePlayRouter } from './game/game-play.router';
import { gameDesignRouter } from './game/game-design.router';
import { gamePublicRouter } from './game/game-public.router';

export const gameRouter = createTRPCRouter({
  // CRUD operations
  create: gameCrudRouter.create,
  list: gameCrudRouter.list,
  getById: gameCrudRouter.getById,
  update: gameCrudRouter.update,
  delete: gameCrudRouter.delete,

  // Play & stats operations
  recordPlay: gamePlayRouter.recordPlay,
  getStats: gamePlayRouter.getStats,
  getPublicGame: gamePlayRouter.getPublicGame,

  // Design operations
  saveSlotMachineDesign: gameDesignRouter.saveSlotMachineDesign,
  saveWheelMiniDesign: gameDesignRouter.saveWheelMiniDesign,

  // Public operations (no auth required)
  play: gamePublicRouter.play,
  getCampaignPublic: gamePublicRouter.getCampaignPublic,
});
