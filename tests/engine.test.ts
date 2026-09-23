import { describe, it, expect } from 'vitest';
import {
  calculateSlabImperial,
  calculateSlabMetric,
  calculateCylindricalFootingImperial,
  calculateCylindricalFootingMetric,
  calculateRectangularFootingImperial,
  calculateRectangularFootingMetric,
} from '../src/domain/engine';
import { VERIFIED_BAG_SPECS } from '../src/domain/constants';

describe('Concrete Engine - Pure Functional & Boundary Verification', () => {
  const RELATIVE_TOLERANCE = 1e-5;

  function assertRelativeClose(actual: number, expected: number, label: string) {
    if (expected === 0) {
      expect(actual).toBeCloseTo(0, 6);
      return;
    }
    const relError = Math.abs((actual - expected) / expected);
    expect(relError, `${label} relative error ${relError} exceeded tolerance ${RELATIVE_TOLERANCE}`)
      .toBeLessThanOrEqual(RELATIVE_TOLERANCE);
  }

  it('Scope Gate: 25 kg bag must not exist in verified bag specifications', () => {
    const has25kg = VERIFIED_BAG_SPECS.some(b => b.id === '25kg' || b.nominalWeight === 25);
    expect(has25kg).toBe(false);
  });

  it('Scope Gate: All registered bag specs must possess a non-empty citation', () => {
    VERIFIED_BAG_SPECS.forEach(spec => {
      expect(spec.citation.length).toBeGreaterThan(10);
    });
  });

  it('UT-01: Standard Residential Patio (Imperial)', () => {
    const res = calculateSlabImperial({
      system: 'imperial', lengthFt: 12, widthFt: 10, depthInches: 4, wastagePercent: 10,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    assertRelativeClose(res.data.netVolumeFt3, 40.0, 'Net Ft3');
    assertRelativeClose(res.data.netVolumeYd3, 40 / 27, 'Net Yd3');
    assertRelativeClose(res.data.grossVolumeFt3, 44.0, 'Gross Ft3');
    assertRelativeClose(res.data.grossVolumeYd3, 44 / 27, 'Gross Yd3');
    const demand80 = res.data.bagDemands.find(b => b.spec.id === '80lb');
    const demand60 = res.data.bagDemands.find(b => b.spec.id === '60lb');
    expect(demand80?.wholeBags).toBe(74);
    expect(demand60?.wholeBags).toBe(98);
  });

  it('UT-02: Foundation Pad (Metric, 20 kg Boral standard only)', () => {
    const res = calculateSlabMetric({
      system: 'metric', lengthM: 6.0, widthM: 4.0, depthCm: 15.0, wastagePercent: 5,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    assertRelativeClose(res.data.netVolumeM3, 3.600, 'Net M3');
    assertRelativeClose(res.data.grossVolumeM3, 3.780, 'Gross M3');
    const demand20kg = res.data.bagDemands.find(b => b.spec.id === '20kg');
    expect(demand20kg?.wholeBags).toBe(409);
    assertRelativeClose(demand20kg!.fractional, 408.24, 'Fractional 20kg');
  });

  it('UT-03: Deck Footings - Cylindrical (Imperial)', () => {
    const res = calculateCylindricalFootingImperial({
      system: 'imperial', quantity: 6, diameterInches: 12, depthFt: 4, wastagePercent: 10,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    const expectedNetFt3 = 6 * Math.PI;
    assertRelativeClose(res.data.netVolumeFt3, expectedNetFt3, 'Net Ft3');
    assertRelativeClose(res.data.grossVolumeFt3, expectedNetFt3 * 1.10, 'Gross Ft3');
    const demand80 = res.data.bagDemands.find(b => b.spec.id === '80lb');
    expect(demand80?.wholeBags).toBe(35);
  });

  it('UT-04: Pier Array - Cylindrical (Metric, 20 kg Boral standard only)', () => {
    const res = calculateCylindricalFootingMetric({
      system: 'metric', quantity: 12, diameterCm: 30, depthM: 1.2, wastagePercent: 8,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    const expectedNetM3 = 0.324 * Math.PI;
    const expectedGrossM3 = expectedNetM3 * 1.08;
    assertRelativeClose(res.data.netVolumeM3, expectedNetM3, 'Net M3');
    assertRelativeClose(res.data.grossVolumeM3, expectedGrossM3, 'Gross M3');
    const demand20kg = res.data.bagDemands.find(b => b.spec.id === '20kg');
    expect(demand20kg?.wholeBags).toBe(119);
  });

  it('UT-05: Zero Boundary Handling', () => {
    const res = calculateSlabImperial({
      system: 'imperial', lengthFt: 0, widthFt: 10, depthInches: 4, wastagePercent: 10,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.netVolumeFt3).toBe(0);
    expect(res.data.grossVolumeFt3).toBe(0);
    res.data.bagDemands.forEach(b => {
      expect(b.wholeBags).toBe(0);
      expect(b.fractional).toBe(0);
    });
  });

  it('UT-06: Typed Result Error on Negative Dimension', () => {
    const res = calculateSlabImperial({
      system: 'imperial', lengthFt: -5, widthFt: 10, depthInches: 4, wastagePercent: 10,
    });
    expect(res.success).toBe(false);
    if (res.success) return;
    expect(res.error.code).toBe('INVALID_DIMENSION_NEGATIVE');
    expect(res.error.field).toBe('lengthFt');
    expect(res.error.rejectedValue).toBe(-5);
  });

  it('UT-07: Out-of-Range Wastage Protection', () => {
    const res = calculateSlabImperial({
      system: 'imperial', lengthFt: 10, widthFt: 10, depthInches: 4, wastagePercent: 125,
    });
    expect(res.success).toBe(false);
    if (res.success) return;
    expect(res.error.code).toBe('INVALID_WASTAGE_RANGE');
    expect(res.error.rejectedValue).toBe(125);
  });
});

describe('Rectangular Footings & Quantity Zero Verification', () => {
  const RELATIVE_TOLERANCE = 1e-5;

  function assertRelativeClose(actual: number, expected: number, label: string) {
    if (expected === 0) {
      expect(actual).toBeCloseTo(0, 6);
      return;
    }
    const relError = Math.abs((actual - expected) / expected);
    expect(relError, `${label} relative error ${relError} exceeded tolerance ${RELATIVE_TOLERANCE}`)
      .toBeLessThanOrEqual(RELATIVE_TOLERANCE);
  }

  it('O-08: Commercial Rectangular Footing Array (Metric)', () => {
    const res = calculateRectangularFootingMetric({
      system: 'metric', quantity: 4, lengthM: 0.6, widthM: 0.6, depthMm: 900, wastagePercent: 0,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    assertRelativeClose(res.data.netVolumeM3, 1.296000, 'Net M3');
    assertRelativeClose(res.data.grossVolumeM3, 1.296000, 'Gross M3');
  });

  it('O-08w: Rectangular Footing with Wastage Factor (Metric)', () => {
    const res = calculateRectangularFootingMetric({
      system: 'metric', quantity: 4, lengthM: 0.6, widthM: 0.6, depthMm: 900, wastagePercent: 10,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    assertRelativeClose(res.data.netVolumeM3, 1.296000, 'Net M3');
    assertRelativeClose(res.data.grossVolumeM3, 1.425600, 'Gross M3 (1.296 * 1.10)');
  });

  it('Rectangular Footing (Imperial)', () => {
    const res = calculateRectangularFootingImperial({
      system: 'imperial', quantity: 2, lengthFt: 2, widthFt: 2, depthInches: 12, wastagePercent: 0,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    assertRelativeClose(res.data.netVolumeFt3, 8.0, 'Net Ft3');
    assertRelativeClose(res.data.netVolumeYd3, 8.0 / 27.0, 'Net Yd3');
  });

  it('AC-08 Boundary: Quantity = 0 returns zero volume without error (Cylindrical)', () => {
    const res = calculateCylindricalFootingMetric({
      system: 'metric', quantity: 0, diameterCm: 30, depthM: 1.2, wastagePercent: 10,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.netVolumeM3).toBe(0);
    expect(res.data.grossVolumeM3).toBe(0);
    res.data.bagDemands.forEach(b => {
      expect(b.wholeBags).toBe(0);
      expect(b.fractional).toBe(0);
    });
  });

  it('AC-08 Boundary: Quantity = 0 returns zero volume without error (Rectangular)', () => {
    const res = calculateRectangularFootingImperial({
      system: 'imperial', quantity: 0, lengthFt: 5, widthFt: 5, depthInches: 12, wastagePercent: 10,
    });
    expect(res.success).toBe(true);
    if (!res.success) return;
    expect(res.data.netVolumeFt3).toBe(0);
    expect(res.data.grossVolumeFt3).toBe(0);
    res.data.bagDemands.forEach(b => {
      expect(b.wholeBags).toBe(0);
      expect(b.fractional).toBe(0);
    });
  });

  it('Negative Quantity Rejection: Quantity < 0 returns typed error', () => {
    const res = calculateRectangularFootingImperial({
      system: 'imperial', quantity: -1, lengthFt: 2, widthFt: 2, depthInches: 12, wastagePercent: 10,
    });
    expect(res.success).toBe(false);
    if (res.success) return;
    expect(res.error.code).toBe('INVALID_QUANTITY_NEGATIVE');
    expect(res.error.field).toBe('quantity');
    expect(res.error.rejectedValue).toBe(-1);
  });
});
