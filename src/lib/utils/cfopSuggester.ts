export function sugerirCFOP({
  operacao,
  ufOrigem,
  ufDestino,
  tipoCliente,
  tipoOperacao,
}: {
  operacao: "Venda" | "Compra" | "Revenda" | "Industrialização";
  ufOrigem: string;
  ufDestino: string;
  tipoCliente: "Pessoa Física" | "Pessoa Jurídica";
  tipoOperacao: "Interna" | "Interestadual";
}) {
  if (ufOrigem !== ufDestino) {
    if (tipoCliente === "Pessoa Jurídica" && operacao === "Venda") return "6.101";
    if (tipoCliente === "Pessoa Física" && operacao === "Venda") return "6.108";
    if (operacao === "Revenda") return "6.102";
  } else {
    if (operacao === "Venda") return "5.101";
    if (operacao === "Revenda") return "5.102";
  }
  return "";
} 