import type {
  Result,
  VolumeOutput,
  BagDemand,
  SlabImperialInput,
  SlabMetricInput,
  CylindricalFootingImperialInput,
  CylindricalFootingMetricInput,
  RectangularFootingImperialInput,
  RectangularFootingMetricInput,
} from './types';
import { CONVERSION_FACTORS, VERIFIED_BAG_SPECS } from './constants';

function validateDimension(value: number, field: string): Result<number> {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return {
      success: false,
      error: {
        code: 'INVALID_DIMENSION_NAN',
        field,
        message: `Field '${field}' must be a valid finite number.`,
        rejectedValue: value,
      },
    };
  }
  if (value < 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_DIMENSION_NEGATIVE',
        field,
        message: `Field '${field}' cannot be negative.`,
        rejectedValue: value,
      },
    };
  }
  return { success: true, data: value };
}

// Corrected order, exactly as the agent proposed in its remediation message.
export function validateQuantity(value: number, field: string): Result<number> {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return {
      success: false,
      error: {
        code: 'INVALID_DIMENSION_NAN',
        field,
        message: `Field '${field}' must be a valid finite number.`,
        rejectedValue: value,
      },
    };
  }

  if (!Number.isInteger(value)) {
    return {
      success: false,
      error: {
        code: 'INVALID_QUANTITY_NON_INTEGER',
        field,
        message: `Field '${field}' must be a whole integer.`,
        rejectedValue: value,
      },
    };
  }

  if (value < 0) {
    return {
      success: false,
      error: {
        code: 'INVALID_QUANTITY_NEGATIVE',
        field,
        message: `Field '${field}' cannot be negative.`,
        rejectedValue: value,
      },
    };
  }

  return { success: true, data: value };
}

function validateWastage(value: number): Result<number> {
  if (Number.isNaN(value) || !Number.isFinite(value) || value < 0.0 || value > 100.0) {
    return {
      success: false,
      error: {
        code: 'INVALID_WASTAGE_RANGE',
        field: 'wastagePercent',
        message: 'Wastage percent must be between 0.0 and 100.0.',
        rejectedValue: value,
      },
    };
  }
  return { success: true, data: value };
}

function computeBagDemands(grossM3: number, grossFt3: number): readonly BagDemand[] {
  if (grossM3 <= 0) {
    return VERIFIED_BAG_SPECS.map((spec) => ({ spec, fractional: 0, wholeBags: 0 }));
  }
  return VERIFIED_BAG_SPECS.map((spec) => {
    const fractional = spec.weightUnit === 'kg' ? grossM3 / spec.yieldM3 : grossFt3 / spec.yieldFt3;
    return { spec, fractional, wholeBags: Math.ceil(fractional) };
  });
}

function assembleOutput(netFt3: number, wastagePercent: number): VolumeOutput {
  const netYd3 = netFt3 / CONVERSION_FACTORS.FT3_PER_YD3;
  const netM3 = netFt3 * CONVERSION_FACTORS.FT3_TO_M3;
  const wastageMultiplier = wastagePercent / 100.0;
  const wasteFt3 = netFt3 * wastageMultiplier;
  const wasteYd3 = netYd3 * wastageMultiplier;
  const wasteM3 = netM3 * wastageMultiplier;
  const grossFt3 = netFt3 + wasteFt3;
  const grossYd3 = netYd3 + wasteYd3;
  const grossM3 = netM3 + wasteM3;

  return {
    netVolumeFt3: netFt3, netVolumeYd3: netYd3, netVolumeM3: netM3,
    wastageVolumeFt3: wasteFt3, wastageVolumeYd3: wasteYd3, wastageVolumeM3: wasteM3,
    grossVolumeFt3: grossFt3, grossVolumeYd3: grossYd3, grossVolumeM3: grossM3,
    bagDemands: computeBagDemands(grossM3, grossFt3),
  };
}

export function calculateSlabImperial(input: SlabImperialInput): Result<VolumeOutput> {
  const vL = validateDimension(input.lengthFt, 'lengthFt'); if (!vL.success) return vL;
  const vW = validateDimension(input.widthFt, 'widthFt'); if (!vW.success) return vW;
  const vD = validateDimension(input.depthInches, 'depthInches'); if (!vD.success) return vD;
  const vWaste = validateWastage(input.wastagePercent); if (!vWaste.success) return vWaste;
  const netFt3 = input.lengthFt * input.widthFt * (input.depthInches / CONVERSION_FACTORS.INCHES_PER_FT);
  return { success: true, data: assembleOutput(netFt3, input.wastagePercent) };
}

export function calculateSlabMetric(input: SlabMetricInput): Result<VolumeOutput> {
  const vL = validateDimension(input.lengthM, 'lengthM'); if (!vL.success) return vL;
  const vW = validateDimension(input.widthM, 'widthM'); if (!vW.success) return vW;
  const vD = validateDimension(input.depthCm, 'depthCm'); if (!vD.success) return vD;
  const vWaste = validateWastage(input.wastagePercent); if (!vWaste.success) return vWaste;
  const netM3 = input.lengthM * input.widthM * (input.depthCm / CONVERSION_FACTORS.CM_PER_M);
  const netFt3 = netM3 * CONVERSION_FACTORS.M3_TO_FT3;
  return { success: true, data: assembleOutput(netFt3, input.wastagePercent) };
}

export function calculateCylindricalFootingImperial(input: CylindricalFootingImperialInput): Result<VolumeOutput> {
  const vN = validateQuantity(input.quantity, 'quantity'); if (!vN.success) return vN;
  const vDia = validateDimension(input.diameterInches, 'diameterInches'); if (!vDia.success) return vDia;
  const vH = validateDimension(input.depthFt, 'depthFt'); if (!vH.success) return vH;
  const vWaste = validateWastage(input.wastagePercent); if (!vWaste.success) return vWaste;
  const radiusFt = (input.diameterInches / 2) / CONVERSION_FACTORS.INCHES_PER_FT;
  const volumePerFootingFt3 = Math.PI * Math.pow(radiusFt, 2) * input.depthFt;
  const totalNetFt3 = input.quantity * volumePerFootingFt3;
  return { success: true, data: assembleOutput(totalNetFt3, input.wastagePercent) };
}

export function calculateCylindricalFootingMetric(input: CylindricalFootingMetricInput): Result<VolumeOutput> {
  const vN = validateQuantity(input.quantity, 'quantity'); if (!vN.success) return vN;
  const vDia = validateDimension(input.diameterCm, 'diameterCm'); if (!vDia.success) return vDia;
  const vH = validateDimension(input.depthM, 'depthM'); if (!vH.success) return vH;
  const vWaste = validateWastage(input.wastagePercent); if (!vWaste.success) return vWaste;
  const radiusM = (input.diameterCm / 2) / CONVERSION_FACTORS.CM_PER_M;
  const volumePerFootingM3 = Math.PI * Math.pow(radiusM, 2) * input.depthM;
  const totalNetM3 = input.quantity * volumePerFootingM3;
  const totalNetFt3 = totalNetM3 * CONVERSION_FACTORS.M3_TO_FT3;
  return { success: true, data: assembleOutput(totalNetFt3, input.wastagePercent) };
}

export function calculateRectangularFootingImperial(input: RectangularFootingImperialInput): Result<VolumeOutput> {
  const vN = validateQuantity(input.quantity, 'quantity'); if (!vN.success) return vN;
  const vL = validateDimension(input.lengthFt, 'lengthFt'); if (!vL.success) return vL;
  const vW = validateDimension(input.widthFt, 'widthFt'); if (!vW.success) return vW;
  const vD = validateDimension(input.depthInches, 'depthInches'); if (!vD.success) return vD;
  const vWaste = validateWastage(input.wastagePercent); if (!vWaste.success) return vWaste;
  const netFt3Single = input.lengthFt * input.widthFt * (input.depthInches / CONVERSION_FACTORS.INCHES_PER_FT);
  const totalNetFt3 = input.quantity * netFt3Single;
  return { success: true, data: assembleOutput(totalNetFt3, input.wastagePercent) };
}

export function calculateRectangularFootingMetric(input: RectangularFootingMetricInput): Result<VolumeOutput> {
  const vN = validateQuantity(input.quantity, 'quantity'); if (!vN.success) return vN;
  const vL = validateDimension(input.lengthM, 'lengthM'); if (!vL.success) return vL;
  const vW = validateDimension(input.widthM, 'widthM'); if (!vW.success) return vW;
  const vD = validateDimension(input.depthMm, 'depthMm'); if (!vD.success) return vD;
  const vWaste = validateWastage(input.wastagePercent); if (!vWaste.success) return vWaste;
  const depthM = input.depthMm / 1000.0;
  const netM3Single = input.lengthM * input.widthM * depthM;
  const totalNetM3 = input.quantity * netM3Single;
  const totalNetFt3 = totalNetM3 * CONVERSION_FACTORS.M3_TO_FT3;
  return { success: true, data: assembleOutput(totalNetFt3, input.wastagePercent) };
}
