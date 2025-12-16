/**
 * Game Design Types Index
 * Re-exports all game design types from individual modules
 * IMPORTANT: ZERO any types
 */

// =====================
// COMMON TYPES
// =====================
export { ColorModeEnum, type ColorMode } from './common.types';

// =====================
// WHEEL GAME TYPES
// =====================
export {
  type WheelSegmentDesign,
  type WheelDesignConfig,
  DEFAULT_WHEEL_DESIGNS,
  generateRandomColor,
  generateRandomHexColor,
  generateSegments,
  generateRandomBiColors,
  getDefaultWheelDesign,
  WheelMiniStyleEnum,
  type WheelMiniStyle,
  type WheelMiniDesignConfig,
  DEFAULT_WHEEL_MINI_DESIGNS,
  getDefaultWheelMiniDesign,
} from './wheel-game.types';

// =====================
// SCRATCH CARD TYPES
// =====================
export {
  ScratchWinPatternEnum,
  type ScratchWinPattern,
  ScratchAnimationEnum,
  type ScratchAnimation,
  type ScratchZone,
  type ScratchDesignConfig,
  DEFAULT_SCRATCH_DESIGNS,
  getDefaultScratchDesign,
} from './scratch-card.types';

// =====================
// SLOT MACHINE TYPES
// =====================
export {
  SlotSpinEasingEnum,
  type SlotSpinEasing,
  type SlotSymbol,
  type SlotWinPattern,
  type SlotMachineDesignConfig,
  DEFAULT_SLOT_MACHINE_DESIGNS,
  getDefaultSlotMachineDesign,
} from './slot-machine.types';
