// Funções de cálculo fiscal com base na legislação brasileira

// Base de cálculo ICMS-ST (Convênio ICMS 142/2018)
export function calcularBaseICMSST({
  valorProduto,
  frete = 0,
  seguro = 0,
  despesas = 0,
  mva = 0,
  ipi = 0,
}: {
  valorProduto: number;
  frete?: number;
  seguro?: number;
  despesas?: number;
  mva?: number;
  ipi?: number;
}) {
  // Base = (Valor + Frete + Seguro + Despesas) * (1 + MVA) + IPI
  return (valorProduto + frete + seguro + despesas) * (1 + mva / 100) + ipi;
}

// Cálculo DIFAL (EC 87/2015, Ajuste SINIEF 03/2015)
export function calcularDIFAL({
  baseCalculo,
  aliquotaInterna,
  aliquotaInterestadual,
}: {
  baseCalculo: number;
  aliquotaInterna: number;
  aliquotaInterestadual: number;
}) {
  // DIFAL = (Base * Alíquota Interna) - (Base * Alíquota Interestadual)
  const valorDifal = baseCalculo * (aliquotaInterna / 100) - baseCalculo * (aliquotaInterestadual / 100);
  return valorDifal;
}

// IPI (Regulamento IPI, Decreto 7.212/2010)
export function calcularIPI({
  baseCalculo,
  aliquotaIPI,
}: {
  baseCalculo: number;
  aliquotaIPI: number;
}) {
  return baseCalculo * (aliquotaIPI / 100);
}

// PIS/COFINS (Lei 10.637/2002, Lei 10.833/2003)
export function calcularPISCOFINS({
  baseCalculo,
  aliquotaPIS,
  aliquotaCOFINS,
}: {
  baseCalculo: number;
  aliquotaPIS: number;
  aliquotaCOFINS: number;
}) {
  return {
    pis: baseCalculo * (aliquotaPIS / 100),
    cofins: baseCalculo * (aliquotaCOFINS / 100),
  };
}

// ISS (Lei Complementar 116/2003)
export function calcularISS({
  baseCalculo,
  aliquotaISS,
}: {
  baseCalculo: number;
  aliquotaISS: number;
}) {
  return baseCalculo * (aliquotaISS / 100);
}

// FCP (Fundo de Combate à Pobreza)
export function calcularFCP({
  baseCalculo,
  aliquotaFCP,
}: {
  baseCalculo: number;
  aliquotaFCP: number;
}) {
  return baseCalculo * (aliquotaFCP / 100);
} 