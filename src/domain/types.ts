export type UnitSystem = 'imperial' | 'metric';

export type CalculationErrorCode =
  | 'INVALID_DIMENSION_NEGATIVE'
  | 'INVALID_DIMENSION_NAN'
  | 'INVALID_QUANTITY_NON_INTEGER'
  | 'INVALID_QUANTITY_NEGATIVE'
  | 'INVALID_WASTAGE_RANGE';

export interface CalculationError {
  readonly code: CalculationErrorCode;
  readonly field: string;
  readonly message: string;
  readonly rejectedValue: unknown;
}

export type Result<T, E = CalculationError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export interface BagYieldSpec {
  readonly id: string;
  readonly label: string;
  readonly weightUnit: 'lb' | 'kg';
  readonly nominalWeight: number;
  readonly yieldM3: number;
  readonly yieldFt3: number;
  readonly yieldYd3: number;
  readonly citation: string;
}

export interface SlabImperialInput {
  readonly system: 'imperial';
  readonly lengthFt: number;
  readonly widthFt: number;
  readonly depthInches: number;
  readonly wastagePercent: number;
}

export interface SlabMetricInput {
  readonly system: 'metric';
  readonly lengthM: number;
  readonly widthM: number;
  readonly depthCm: number;
  readonly wastagePercent: number;
}

export interface CylindricalFootingImperialInput {
  readonly system: 'imperial';
  readonly quantity: number;
  readonly diameterInches: number;
  readonly depthFt: number;
  readonly wastagePercent: number;
}

export interface CylindricalFootingMetricInput {
  readonly system: 'metric';
  readonly quantity: number;
  readonly diameterCm: number;
  readonly depthM: number;
  readonly wastagePercent: number;
}

export interface RectangularFootingImperialInput {
  readonly system: 'imperial';
  readonly quantity: number;
  readonly lengthFt: number;
  readonly widthFt: number;
  readonly depthInches: number;
  readonly wastagePercent: number;
}

export interface RectangularFootingMetricInput {
  readonly system: 'metric';
  readonly quantity: number;
  readonly lengthM: number;
  readonly widthM: number;
  readonly depthMm: number;
  readonly wastagePercent: number;
}

export interface BagDemand {
  readonly spec: BagYieldSpec;
  readonly fractional: number;
  readonly wholeBags: number;
}

export interface VolumeOutput {
  readonly netVolumeM3: number;
  readonly netVolumeYd3: number;
  readonly netVolumeFt3: number;
  readonly wastageVolumeM3: number;
  readonly wastageVolumeYd3: number;
  readonly wastageVolumeFt3: number;
  readonly grossVolumeM3: number;
  readonly grossVolumeYd3: number;
  readonly grossVolumeFt3: number;
  readonly bagDemands: readonly BagDemand[];
}
