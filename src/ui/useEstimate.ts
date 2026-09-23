import { useMemo } from 'react';
import {
  calculateSlabImperial,
  calculateSlabMetric,
  calculateRectangularFootingImperial,
  calculateRectangularFootingMetric,
  calculateCylindricalFootingImperial,
  calculateCylindricalFootingMetric,
} from '../domain/engine';
import type { CalculationError, VolumeOutput } from '../domain/types';
import type { FormState } from './formState';

export type EstimateState =
  | { status: 'incomplete' }
  | { status: 'error'; error: CalculationError }
  | { status: 'ready'; data: VolumeOutput };

// Empty string means "not yet entered", not zero. This keeps a blank form on
// first load from immediately showing a validation error -- an empty field
// is an invitation to act, not something to scold (see AC-08/AC-09: an
// entered 0 is valid and returns a real zero result; an EMPTY field is a
// distinct, UI-only state that never reaches the engine at all).
function parseRequired(raw: string): number | null {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return n;
}

export function useEstimate(form: FormState): EstimateState {
  const { geometry, system, quantity, lengthOrDiameter, width, depth, wastagePercent } = form;

  return useMemo(() => {
    const needsQuantity = geometry !== 'slab';
    const needsWidth = geometry !== 'cylindricalFooting';

    const qtyRaw = needsQuantity ? parseRequired(quantity) : 1;
    const primaryRaw = parseRequired(lengthOrDiameter);
    const widthRaw = needsWidth ? parseRequired(width) : 0;
    const depthRaw = parseRequired(depth);
    const wasteRaw = parseRequired(wastagePercent);

    if (qtyRaw === null || primaryRaw === null || widthRaw === null || depthRaw === null || wasteRaw === null) {
      return { status: 'incomplete' };
    }

    const result = (() => {
      if (geometry === 'slab') {
        return system === 'imperial'
          ? calculateSlabImperial({
              system: 'imperial',
              lengthFt: primaryRaw,
              widthFt: widthRaw,
              depthInches: depthRaw,
              wastagePercent: wasteRaw,
            })
          : calculateSlabMetric({
              system: 'metric',
              lengthM: primaryRaw,
              widthM: widthRaw,
              depthCm: depthRaw,
              wastagePercent: wasteRaw,
            });
      }
      if (geometry === 'rectangularFooting') {
        return system === 'imperial'
          ? calculateRectangularFootingImperial({
              system: 'imperial',
              quantity: qtyRaw,
              lengthFt: primaryRaw,
              widthFt: widthRaw,
              depthInches: depthRaw,
              wastagePercent: wasteRaw,
            })
          : calculateRectangularFootingMetric({
              system: 'metric',
              quantity: qtyRaw,
              lengthM: primaryRaw,
              widthM: widthRaw,
              depthMm: depthRaw,
              wastagePercent: wasteRaw,
            });
      }
      // cylindricalFooting
      return system === 'imperial'
        ? calculateCylindricalFootingImperial({
            system: 'imperial',
            quantity: qtyRaw,
            diameterInches: primaryRaw,
            depthFt: depthRaw,
            wastagePercent: wasteRaw,
          })
        : calculateCylindricalFootingMetric({
            system: 'metric',
            quantity: qtyRaw,
            diameterCm: primaryRaw,
            depthM: depthRaw,
            wastagePercent: wasteRaw,
          });
    })();

    if (!result.success) {
      return { status: 'error', error: result.error };
    }
    return { status: 'ready', data: result.data };
  }, [geometry, system, quantity, lengthOrDiameter, width, depth, wastagePercent]);
}
