import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

interface LinhaAdicional {
  descricao: string;
  valor: string;
}

interface Props {
  values: Record<string, any>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}

export default function ServicosAdicionaisTable({ values, setValues }: Props) {
  // Inicializa linhas adicionais se não existir
  const linhas: LinhaAdicional[] = values.linhasAdicionais || [
    { descricao: '', valor: '' }
  ];

  // Adiciona nova linha
  const adicionarLinha = () => {
    setValues((prev) => ({
      ...prev,
      linhasAdicionais: [...linhas, { descricao: '', valor: '' }]
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
        i === idx ? { ...linha, [campo]: valor } : linha
      )
    }));
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-olvblue dark:text-ourovelho mb-4 flex items-center gap-2">
        <span className="text-ourovelho"><FaPlus /></span> Serviços Adicionais
      </h3>
      <table className="w-full text-sm mb-2">
        <thead>
          <tr className="bg-ourovelho/20">
            <th className="p-2 text-left">Descrição <span title='Descreva o serviço adicional. Exemplo: "Despacho aduaneiro".' className='text-xs text-ourovelho'>🛈</span></th>
            <th className="p-2 text-left">Valor (BRL) <span title='Informe o valor do serviço adicional em reais.' className='text-xs text-ourovelho'>🛈</span></th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, idx) => (
            <tr key={idx} className="even:bg-olvblue/80 dark:even:bg-bg-dark-tertiary">
              <td className="p-2">
                <input
                  type="text"
                  value={linha.descricao}
                  onChange={e => atualizarLinha(idx, 'descricao', e.target.value)}
                  className="w-full px-2 py-1 rounded border border-ourovelho bg-olvblue/80 dark:bg-bg-dark-tertiary text-white dark:text-ourovelho"
                  placeholder="Descrição do serviço"
                  title="Descreva o serviço adicional. Exemplo: 'Despacho aduaneiro'."
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
                  title="Informe o valor do serviço adicional em reais."
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
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={adicionarLinha}
        className="bg-ourovelho text-olvblue font-bold px-4 py-2 rounded hover:bg-yellow-400 flex items-center gap-2"
        title="Adicionar novo serviço adicional"
      >
        <FaPlus /> Adicionar Serviço Adicional
      </button>
    </div>
  );
} 