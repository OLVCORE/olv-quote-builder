export type InputFieldBase = {
  key: string;
  label: string;
  multiplier?: number; // price for checkbox
  price?: number; // price per unit for number/select
  editablePrice?: boolean;
  /** When true, this item can receive per-item discounts */
  discountable?: boolean;
};

export type InputField =
  | (InputFieldBase & { type: 'number'; default: number; min?: number; max?: number })
  | (InputFieldBase & { type: 'select'; options: { value: string; label: string }[]; default: string })
  | (InputFieldBase & { type: 'checkbox'; default: boolean });

export interface ServiceConfig {
  slug: string;
  name: string;
  description: string;
  inputs: InputField[];
  calculate: (values: Record<string, any>) => { total: number; breakdown: Record<string, number> };
} 