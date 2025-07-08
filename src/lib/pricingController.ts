import { Simulacao, ItemSimulacao, ImpostoSimulacao, DespesaSimulacao, RegimeTributario } from './types/simulator';
import { calculateTaxes } from './utils/calculations';

interface PricingResult {
  precoCusto: number;
  precoVenda: number;
  markup: number;
  margemBruta: number;
  margemLiquida: number;
  impostos: ImpostoSimulacao[];
  despesasTotais: number;
  custoItens: number;
}

export function calcularSimulacao(simulacao: Simulacao, uf: string = 'SP'): PricingResult {
  // 1. Calcular custo total dos itens
  const custoItens = simulacao.itens.reduce((sum, item) => sum + (item.custoUnitario * item.quantidade), 0);

  // 2. Calcular despesas totais
  const despesasTotais = simulacao.despesas.reduce((sum, d) => sum + d.valor, 0);

  // 3. Base para impostos
  const baseImpostos = custoItens + despesasTotais;

  // 4. Calcular impostos (cascata)
  const impostosCalculados = calculateTaxes(baseImpostos, uf as any, simulacao.impostos as any);

  // 5. Preço de custo total
  const precoCusto = baseImpostos + impostosCalculados.subtotal;

  // 6. Calcular preço de venda sugerido (com markup)
  const precoVenda = precoCusto * (1 + simulacao.markup / 100);

  // 7. Margem bruta
  const margemBruta = precoVenda > 0 ? ((precoVenda - precoCusto) / precoVenda) * 100 : 0;

  // 8. Margem líquida (considerando outras despesas, se houver)
  // Para simplificação, igual à margem bruta neste exemplo
  const margemLiquida = margemBruta;

  // 9. Mapear impostos para ImpostoSimulacao
  const impostos: ImpostoSimulacao[] = (impostosCalculados.taxes || []).map((tax, idx) => ({
    id: tax.code || String(idx),
    nome: tax.code || 'Imposto',
    percentual: tax.rate,
    valor: (tax as any).value ?? 0,
    tipo: 'federal', // TODO: mapear corretamente conforme o código do imposto
    codigo: tax.code,
  }));

  return {
    precoCusto,
    precoVenda,
    markup: simulacao.markup,
    margemBruta,
    margemLiquida,
    impostos,
    despesasTotais,
    custoItens,
  };
} 