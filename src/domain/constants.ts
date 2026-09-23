import type { BagYieldSpec } from './types';

export const CONVERSION_FACTORS = {
  FT3_PER_YD3: 27,
  INCHES_PER_FT: 12,
  CM_PER_M: 100,
  M3_TO_YD3: 1.3079506193143922,
  YD3_TO_M3: 0.764554857984,
  FT3_TO_M3: 0.028316846592,
  M3_TO_FT3: 35.31466672148859,
} as const;

export const VERIFIED_BAG_SPECS: readonly BagYieldSpec[] = [
  {
    id: '80lb',
    label: '80 lb Bag',
    weightUnit: 'lb',
    nominalWeight: 80,
    yieldFt3: 0.6000,
    yieldYd3: 0.6000 / 27,
    yieldM3: 0.6000 * CONVERSION_FACTORS.FT3_TO_M3,
    citation: 'ASTM C387 / QUIKRETE Concrete Mix #1101 Spec-Data Sheet',
  },
  {
    id: '60lb',
    label: '60 lb Bag',
    weightUnit: 'lb',
    nominalWeight: 60,
    yieldFt3: 0.4500,
    yieldYd3: 0.4500 / 27,
    yieldM3: 0.4500 * CONVERSION_FACTORS.FT3_TO_M3,
    citation: 'ASTM C387 / QUIKRETE Concrete Mix #1101 Spec-Data Sheet',
  },
  {
    id: '40lb',
    label: '40 lb Bag',
    weightUnit: 'lb',
    nominalWeight: 40,
    yieldFt3: 0.3000,
    yieldYd3: 0.3000 / 27,
    yieldM3: 0.3000 * CONVERSION_FACTORS.FT3_TO_M3,
    citation: 'ASTM C387 / QUIKRETE Concrete Mix #1101 Spec-Data Sheet',
  },
  {
    id: '20kg',
    label: '20 kg Bag',
    weightUnit: 'kg',
    nominalWeight: 20,
    yieldM3: 1.0 / 108.0,
    yieldFt3: (1.0 / 108.0) * CONVERSION_FACTORS.M3_TO_FT3,
    yieldYd3: (1.0 / 108.0) * CONVERSION_FACTORS.M3_TO_YD3,
    citation: 'Boral Blue Circle Concrete Mix Product Data Sheet (108 bags per 1.0 m³)',
  },
] as const;
