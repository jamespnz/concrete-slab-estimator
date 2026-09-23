export type GeometryKind = 'slab' | 'rectangularFooting' | 'cylindricalFooting';
export type UnitSystem = 'imperial' | 'metric';

// All fields are strings because they are raw, possibly-invalid text input.
// Parsing and validation happen in useEstimate, using the domain engine's
// own Result<T, E> -- never duplicated or re-implemented here.
export interface FormState {
  geometry: GeometryKind;
  system: UnitSystem;
  quantity: string;
  lengthOrDiameter: string;
  width: string;
  depth: string;
  wastagePercent: string;
}

export const initialFormState: FormState = {
  geometry: 'slab',
  system: 'imperial',
  quantity: '1',
  lengthOrDiameter: '',
  width: '',
  depth: '',
  wastagePercent: '10',
};
