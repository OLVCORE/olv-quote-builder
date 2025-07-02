import React from 'react';

interface LinhaAdicional {
  descricao: string;
  valor: number;
}

interface Props {
  values: Record<string, any>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export default function ServicosAdicionaisTable({ values, setValues }: Props) {
  // Inicializa linhas adicionais se não existir
  const linhas: LinhaAdicional[] = values.linhasAdicionais || [
    { descricao: '', valor: 0 }
  ];

  // Adiciona nova linha
  const adicionarLinha = () => {
    setValues((prev) => ({
      ...prev,
      linhasAdicionais: [...linhas, { descricao: '', valor: 0 }]
    }));
  };

  // Remove linha
  const removerLinha = (idx: number) => {
    setValues((prev) => ({
      ...prev,
      linhasAdicionais: linhas.filter((_, i) => i !== idx)
    }));
  };

  // Atualiza campo de uma linha
  const atualizarLinha = (idx: number, campo: keyof LinhaAdicional, valor: any) => {
    setValues((prev) => ({
      ...prev,
      linhasAdicionais: linhas.map((linha, i) =>
        i === idx ? { ...linha, [campo]: campo === 'valor' ? Number(valor) : valor } : linha
      )
    }));
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4">Serviços Adicionais</h3>
      <table className="w-full text-sm mb-2">
        <thead>
          <tr className="bg-ourovelho/20">
            <th className="p-2 text-left">Descrição</th>
            <th className="p-2 text-left">Valor (BRL)</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, idx) => (
            <tr key={idx}>
              <td className="p-2">
                <input
                  type="text"
                  value={linha.descricao}
                  onChange={e => atualizarLinha(idx, 'descricao', e.target.value)}
                  className="w-full px-2 py-1 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
                  placeholder="Descrição do serviço"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  value={linha.valor}
                  onChange={e => atualizarLinha(idx, 'valor', e.target.value)}
                  className="w-full px-2 py-1 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
                  placeholder="0,00"
                  min={0}
                />
              </td>
              <td className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => removerLinha(idx)}
                  className="text-red-600 hover:text-red-800 font-bold text-lg"
                  title="Remover linha"
                  disabled={linhas.length === 1}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={adicionarLinha}
        className="bg-ourovelho text-olvblue font-bold px-4 py-2 rounded hover:bg-yellow-400"
      >
        + Adicionar Serviço Adicional
      </button>
    </div>
  );
} 