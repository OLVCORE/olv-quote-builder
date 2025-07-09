export function sugerirCST({
  regimeTributario,
  produtoSujeitoST,
}: {
  regimeTributario: "Simples Nacional" | "Lucro Presumido" | "Lucro Real" | "MEI";
  produtoSujeitoST: boolean;
}) {
  if (regimeTributario === "Simples Nacional") {
    return produtoSujeitoST ? "500" : "102"; // 500: ST, 102: sem permissão de crédito
  }
  // Lucro Presumido/Real
  return produtoSujeitoST ? "060" : "000"; // 060: ST, 000: tributação integral
} 