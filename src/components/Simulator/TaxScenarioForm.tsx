import React, { useState } from "react";
import { calcularBaseICMSST, calcularDIFAL } from "@/lib/utils/taxCalculator";
import { TaxScenario } from "@/lib/types/simulator";
import { sugerirCFOP } from "@/lib/utils/cfopSuggester";
import { sugerirCST } from "@/lib/utils/cstSuggester";

export function TaxScenarioForm() {
  const [scenario, setScenario] = useState<TaxScenario>({
    regimeTributario: "Simples Nacional",
    ufOrigem: "SP",
    ufDestino: "RJ",
    ncm: "",
    tipoOperacao: "Venda",
    produtoSujeitoST: false,
    aliquotaInterna: 18,
    aliquotaInterestadual: 12,
    tipoCliente: "Pessoa Jurídica",
    contribuinte: true,
    operacao: "Interestadual",
    valorProduto: 1000,
  });

  // Cálculo dinâmico
  const baseICMSST = scenario.produtoSujeitoST
    ? calcularBaseICMSST({
        valorProduto: scenario.valorProduto,
        mva: scenario.mva,
        ipi: scenario.ipi,
        frete: scenario.frete,
        seguro: scenario.seguro,
        despesas: scenario.despesas,
      })
    : 0;

  const valorDifal =
    scenario.operacao === "Interestadual"
      ? calcularDIFAL({
          baseCalculo: scenario.valorProduto,
          aliquotaInterna: scenario.aliquotaInterna,
          aliquotaInterestadual: scenario.aliquotaInterestadual,
        })
      : 0;

  // Cálculos adicionais
  const valorIPI = calcularIPI({
    baseCalculo: scenario.valorProduto,
    aliquotaIPI: scenario.ipi || 0,
  });
  const { pis, cofins } = calcularPISCOFINS({
    baseCalculo: scenario.valorProduto,
    aliquotaPIS: scenario.pis || 0.65,
    aliquotaCOFINS: scenario.cofins || 3,
  });
  const valorISS = scenario.tipoOperacao === "Serviço"
    ? calcularISS({ baseCalculo: scenario.valorProduto, aliquotaISS: scenario.iss || 5 })
    : 0;
  const valorFCP = scenario.fcp
    ? calcularFCP({ baseCalculo: scenario.valorProduto, aliquotaFCP: scenario.fcp })
    : 0;

  const cfopSugerido = sugerirCFOP({
    operacao: scenario.tipoOperacao,
    ufOrigem: scenario.ufOrigem,
    ufDestino: scenario.ufDestino,
    tipoCliente: scenario.tipoCliente,
    tipoOperacao: scenario.operacao,
  });
  const cstSugerido = sugerirCST({
    regimeTributario: scenario.regimeTributario,
    produtoSujeitoST: scenario.produtoSujeitoST,
  });

  return (
    <form className="space-y-4">
      {/* Campos dinâmicos conforme o modelo fiscal */}
      <div>
        <label>Produto sujeito a ICMS-ST?</label>
        <select
          value={scenario.produtoSujeitoST ? "Sim" : "Não"}
          onChange={e =>
            setScenario(s => ({
              ...s,
              produtoSujeitoST: e.target.value === "Sim",
            }))
          }
        >
          <option>Sim</option>
          <option>Não</option>
        </select>
      </div>
      <div>
        <label>CFOP:</label>
        <input
          value={scenario.cfop || cfopSugerido}
          onChange={e => setScenario(s => ({ ...s, cfop: e.target.value }))}
          className="w-32"
          title="Código Fiscal de Operações e Prestações. Sugerido automaticamente conforme o cenário."
        />
        <span className="ml-2 text-xs text-blue-600">Sugerido: {cfopSugerido}</span>
      </div>
      <div>
        <label>CST/CSOSN:</label>
        <input
          value={scenario.cst || cstSugerido}
          onChange={e => setScenario(s => ({ ...s, cst: e.target.value }))}
          className="w-24"
          title="Código de Situação Tributária. Sugerido automaticamente conforme o regime e ST."
        />
        <span className="ml-2 text-xs text-blue-600">Sugerido: {cstSugerido}</span>
      </div>
      {/* Alertas inteligentes */}
      {scenario.produtoSujeitoST && !scenario.cest && (
        <div className="text-yellow-600 text-xs mt-1">
          Atenção: Produto sujeito a ST, informe o CEST. (Obrigatório - Convênio ICMS 92/2015)
        </div>
      )}
      {scenario.operacao === "Interestadual" && scenario.tipoCliente === "Pessoa Física" && (
        <div className="text-yellow-600 text-xs mt-1">
          DIFAL obrigatório nesta operação (EC 87/2015).
        </div>
      )}
      <div>
        <label>Base de Cálculo ICMS-ST:</label>
        <span className="ml-2 font-bold">{baseICMSST.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        <span className="ml-2 text-xs text-gray-500">(Convênio ICMS 142/2018)</span>
      </div>
      <div>
        <label>Valor DIFAL:</label>
        <span className="ml-2 font-bold">{valorDifal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        <span className="ml-2 text-xs text-gray-500">(EC 87/2015)</span>
      </div>
      <div>
        <label>Valor IPI:</label>
        <span className="ml-2 font-bold">{valorIPI.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        <span className="ml-2 text-xs text-gray-500">(Decreto 7.212/2010)</span>
      </div>
      <div>
        <label>Valor PIS:</label>
        <span className="ml-2 font-bold">{pis.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        <span className="ml-2 text-xs text-gray-500">(Lei 10.637/2002)</span>
      </div>
      <div>
        <label>Valor COFINS:</label>
        <span className="ml-2 font-bold">{cofins.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        <span className="ml-2 text-xs text-gray-500">(Lei 10.833/2003)</span>
      </div>
      {scenario.tipoOperacao === "Serviço" && (
        <div>
          <label>Valor ISS:</label>
          <span className="ml-2 font-bold">{valorISS.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          <span className="ml-2 text-xs text-gray-500">(LC 116/2003)</span>
        </div>
      )}
      {scenario.fcp && (
        <div>
          <label>Valor FCP:</label>
          <span className="ml-2 font-bold">{valorFCP.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
          <span className="ml-2 text-xs text-gray-500">(Fundo de Combate à Pobreza)</span>
        </div>
      )}
      {/* ...breakdown visual dos demais tributos... */}
    </form>
  );
} 