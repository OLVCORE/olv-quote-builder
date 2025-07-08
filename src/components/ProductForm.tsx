"use client";
import React, { useState, useMemo } from 'react';
import { Simulacao, ItemSimulacao, ImpostoSimulacao, DespesaSimulacao } from '@/lib/types/simulator';
import { calcularSimulacao } from '@/lib/pricingController';
import Collapsible from './UI/Collapsible';
import { FaBoxOpen, FaPlus, FaTrash, FaChartBar, FaReceipt, FaPercent, FaMoneyBillWave } from 'react-icons/fa';

interface Props {
  initialData?: Partial<Simulacao>;
}

export default function ProductForm({ initialData }: Props) {
  // Estado do formulário
  const [nome, setNome] = useState(initialData?.nome || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [markup, setMarkup] = useState(initialData?.markup || 30);
  const [itens, setItens] = useState<ItemSimulacao[]>(initialData?.itens || [
    { id: '1', nome: '', tipo: 'produto', quantidade: 1, custoUnitario: 0, precoUnitario: 0 }
  ]);
  const [despesas, setDespesas] = useState<DespesaSimulacao[]>(initialData?.despesas || []);
  const [impostos, setImpostos] = useState<ImpostoSimulacao[]>(initialData?.impostos || [
    { id: 'iss', nome: 'ICMS', percentual: 18, valor: 0, tipo: 'estadual', codigo: 'ICMS' }
  ]);

  // Atualização de itens
  const handleItemChange = (idx: number, field: keyof ItemSimulacao, value: any) => {
    setItens(items => items.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const addItem = () => setItens(items => [...items, { id: String(Date.now()), nome: '', tipo: 'produto', quantidade: 1, custoUnitario: 0, precoUnitario: 0 }]);
  const removeItem = (idx: number) => setItens(items => items.filter((_, i) => i !== idx));

  // Atualização de despesas
  const handleDespesaChange = (idx: number, field: keyof DespesaSimulacao, value: any) => {
    setDespesas(ds => ds.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };
  const addDespesa = () => setDespesas(ds => [...ds, { id: String(Date.now()), nome: '', valor: 0, tipo: 'fixa' }]);
  const removeDespesa = (idx: number) => setDespesas(ds => ds.filter((_, i) => i !== idx));

  // Atualização de impostos
  const handleImpostoChange = (idx: number, field: keyof ImpostoSimulacao, value: any) => {
    setImpostos(imps => imps.map((imp, i) => i === idx ? { ...imp, [field]: value } : imp));
  };
  const addImposto = () => setImpostos(imps => [...imps, { id: String(Date.now()), nome: '', percentual: 0, valor: 0, tipo: 'federal', codigo: '' }]);
  const removeImposto = (idx: number) => setImpostos(imps => imps.filter((_, i) => i !== idx));

  // Simulação (controller)
  const simulacao: Simulacao = useMemo(() => ({
    id: 'sim-produto',
    tipo: 'produto',
    nome,
    descricao,
    itens,
    despesas,
    impostos,
    markup,
    precoCusto: 0,
    precoVenda: 0,
    margemBruta: 0,
    margemLiquida: 0,
    regimeTributario: 'simples',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  }), [nome, descricao, itens, despesas, impostos, markup]);

  const resultado = useMemo(() => calcularSimulacao(simulacao), [simulacao]);

  // Renderização
  return (
    <div className="space-y-8">
      <Collapsible title="1. Dados do Produto" expanded icon={<FaBoxOpen className="text-white" />} color="blue">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">Nome do Produto</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300 placeholder:text-blue-400 dark:placeholder:text-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg" placeholder="Ex: Produto XYZ" />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">Descrição</label>
            <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300 placeholder:text-blue-400 dark:placeholder:text-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg" placeholder="Descrição detalhada" />
          </div>
        </div>
      </Collapsible>

      <Collapsible title="2. Itens do Produto" expanded icon={<FaBoxOpen className="text-white" />} color="blue">
        <div className="space-y-4">
          {itens.map((item, idx) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end bg-blue-50/40 dark:bg-slate-700/40 p-4 rounded-xl">
              <input type="text" value={item.nome} onChange={e => handleItemChange(idx, 'nome', e.target.value)} placeholder="Nome do item" className="col-span-2 px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <input type="number" value={item.quantidade} min={1} onChange={e => handleItemChange(idx, 'quantidade', Number(e.target.value))} placeholder="Qtd" className="px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <input type="number" value={item.custoUnitario} min={0} onChange={e => handleItemChange(idx, 'custoUnitario', Number(e.target.value))} placeholder="Custo Unit." className="px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <input type="number" value={item.precoUnitario} min={0} onChange={e => handleItemChange(idx, 'precoUnitario', Number(e.target.value))} placeholder="Preço Unit." className="px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <button type="button" onClick={() => removeItem(idx)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-110"><FaTrash size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg transition-all duration-300 hover:scale-105"><FaPlus size={16} />Adicionar Item</button>
        </div>
      </Collapsible>

      <Collapsible title="3. Despesas" expanded icon={<FaMoneyBillWave className="text-white" />} color="blue">
        <div className="space-y-4">
          {despesas.map((d, idx) => (
            <div key={d.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end bg-blue-50/40 dark:bg-slate-700/40 p-4 rounded-xl">
              <input type="text" value={d.nome} onChange={e => handleDespesaChange(idx, 'nome', e.target.value)} placeholder="Nome da despesa" className="col-span-2 px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <input type="number" value={d.valor} min={0} onChange={e => handleDespesaChange(idx, 'valor', Number(e.target.value))} placeholder="Valor" className="px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <select value={d.tipo} onChange={e => handleDespesaChange(idx, 'tipo', e.target.value)} className="px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300">
                <option value="fixa">Fixa</option>
                <option value="variavel">Variável</option>
              </select>
              <button type="button" onClick={() => removeDespesa(idx)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-110"><FaTrash size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={addDespesa} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg transition-all duration-300 hover:scale-105"><FaPlus size={16} />Adicionar Despesa</button>
        </div>
      </Collapsible>

      <Collapsible title="4. Impostos" expanded icon={<FaReceipt className="text-white" />} color="blue">
        <div className="space-y-4">
          {impostos.map((imp, idx) => (
            <div key={imp.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-blue-50/40 dark:bg-slate-700/40 p-4 rounded-xl">
              <input type="text" value={imp.nome} onChange={e => handleImpostoChange(idx, 'nome', e.target.value)} placeholder="Nome do imposto" className="col-span-2 px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <input type="text" value={imp.codigo} onChange={e => handleImpostoChange(idx, 'codigo', e.target.value)} placeholder="Código" className="px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <input type="number" value={imp.percentual} min={0} max={100} step={0.01} onChange={e => handleImpostoChange(idx, 'percentual', Number(e.target.value))} placeholder="%" className="px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
              <select value={imp.tipo} onChange={e => handleImpostoChange(idx, 'tipo', e.target.value)} className="px-3 py-2 rounded-lg border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300">
                <option value="federal">Federal</option>
                <option value="estadual">Estadual</option>
                <option value="municipal">Municipal</option>
              </select>
              <button type="button" onClick={() => removeImposto(idx)} className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-110"><FaTrash size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={addImposto} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-lg transition-all duration-300 hover:scale-105"><FaPlus size={16} />Adicionar Imposto</button>
        </div>
      </Collapsible>

      <Collapsible title="5. Markup e Margens" expanded icon={<FaPercent className="text-white" />} color="blue">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">Markup (%)</label>
            <input type="number" value={markup} min={0} max={1000} step={0.01} onChange={e => setMarkup(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">Margem Bruta (%)</label>
            <input type="number" value={resultado.margemBruta.toFixed(2)} readOnly className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <label className="block text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">Margem Líquida (%)</label>
            <input type="number" value={resultado.margemLiquida.toFixed(2)} readOnly className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 dark:border-blue-600 bg-white/90 dark:bg-slate-800/90 text-blue-700 dark:text-blue-300" />
          </div>
        </div>
      </Collapsible>

      <Collapsible title="6. Breakdown e Resultado" expanded icon={<FaChartBar className="text-white" />} color="blue">
        <div className="bg-white/95 dark:bg-slate-800/95 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400 mb-4">Resumo da Simulação</h3>
          <ul className="space-y-2 text-blue-900 dark:text-blue-200">
            <li><b>Preço de Custo:</b> R$ {resultado.precoCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
            <li><b>Preço de Venda Sugerido:</b> R$ {resultado.precoVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
            <li><b>Markup:</b> {resultado.markup.toFixed(2)}%</li>
            <li><b>Margem Bruta:</b> {resultado.margemBruta.toFixed(2)}%</li>
            <li><b>Margem Líquida:</b> {resultado.margemLiquida.toFixed(2)}%</li>
            <li><b>Despesas Totais:</b> R$ {resultado.despesasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
            <li><b>Custo dos Itens:</b> R$ {resultado.custoItens.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</li>
            <li><b>Impostos:</b> {resultado.impostos.map(imp => `${imp.nome} (${imp.percentual}%): R$ ${imp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`).join(' | ')}</li>
          </ul>
        </div>
      </Collapsible>
    </div>
  );
} 