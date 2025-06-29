import { pmeServices } from './pmeServices';

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

export const services: ServiceConfig[] = [
  {
    slug: 'pme-comex',
    name: 'Programa PME COMEX Ready',
    description: 'Internacionalize em até 90 dias com baixo risco',
    inputs: [
      { key: 'cif', label: 'CIF anual (R$)', type: 'number', default: 500000 },
      { key: 'import_volume', label: 'TEU por ano', type: 'number', default: 50 },
      {
        key: 'support_plan',
        label: 'Adicionar suporte continuado (PME Growth)',
        type: 'checkbox',
        default: false,
        multiplier: 5000,
      },
    ],
    calculate(values) {
      const base = 15000; // exemplo book + setup
      const retainer = 7000;
      const extras = values.support_plan ? 5000 : 0;
      const total = base + retainer + extras;
      return {
        total,
        breakdown: { base, retainer, extras },
      };
    },
  },
  {
    slug: 'comex-on-demand',
    name: 'Especialistas COMEX On-Demand',
    description: 'Contratação pay-as-you-go de especialistas',
    inputs: [
      {
        key: 'service_level',
        label: 'Escolha o SLA',
        type: 'select',
        default: 'start',
        options: [
          { value: 'start', label: 'Start (R$ 390/h)' },
          { value: 'pro', label: 'Pro (R$ 490/h)' },
          { value: 'critical', label: 'Critical (R$ 650/h)' },
        ],
      },
      { key: 'hours', label: 'Horas estimadas', type: 'number', default: 5 },
    ],
    calculate(values) {
      const rates: Record<string, number> = { start: 390, pro: 490, critical: 650 };
      const total = rates[values.service_level] * values.hours;
      return { total, breakdown: { horas: values.hours, rate: rates[values.service_level] } };
    },
  },
];

export const allServices: ServiceConfig[] = [...services, ...pmeServices]; 