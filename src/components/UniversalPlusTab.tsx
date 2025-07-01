"use client";
import React, { useState } from 'react';
import { UniversalItem } from '@/lib/types/simulator';
import { v4 as uuidv4 } from 'uuid';

const defaultItem = (): UniversalItem => ({
  id: uuidv4(),
  label: '',
  value: 0,
  type: 'percent',
  description: '',
});

export default function UniversalPlusTab({
  items,
  onChange,
}: {
  items: UniversalItem[];
  onChange: (items: UniversalItem[]) => void;
}) {
  const [localItems, setLocalItems] = useState<UniversalItem[]>(items.length ? items : [defaultItem()]);

  const handleItemChange = (idx: number, field: keyof UniversalItem, value: any) => {
    const updated = [...localItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setLocalItems(updated);
    onChange(updated);
  };

  const addItem = () => {
    const updated = [...localItems, defaultItem()];
    setLocalItems(updated);
    onChange(updated);
  };

  const removeItem = (idx: number) => {
    const updated = localItems.filter((_, i) => i !== idx);
    setLocalItems(updated);
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-accent-dark mb-2">Universal+</h2>
      <p className="text-sm text-txt-light dark:text-txt-dark mb-4">Adicione taxas, percentuais, observações ou itens customizados para propostas universais.</p>
      <div className="space-y-4">
        {localItems.map((item, idx) => (
          <div key={item.id} className="flex flex-col md:flex-row md:items-end gap-2 bg-bg-light-secondary dark:bg-bg-dark-secondary p-4 rounded-lg shadow border border-accent-light dark:border-accent-dark">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1 text-txt-light dark:text-txt-dark">Descrição</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded border border-accent-light dark:border-accent-dark bg-bg-light-tertiary dark:bg-bg-dark-tertiary text-txt-light dark:text-txt-dark"
                value={item.label}
                onChange={e => handleItemChange(idx, 'label', e.target.value)}
                placeholder="Ex: Taxa administrativa, Observação, etc."
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-txt-light dark:text-txt-dark">Tipo</label>
              <select
                className="px-2 py-2 rounded border border-accent-light dark:border-accent-dark bg-bg-light-tertiary dark:bg-bg-dark-tertiary text-txt-light dark:text-txt-dark"
                value={item.type}
                onChange={e => handleItemChange(idx, 'type', e.target.value)}
              >
                <option value="percent">% Percentual</option>
                <option value="fixed">Valor Fixo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-txt-light dark:text-txt-dark">Valor</label>
              <input
                type="number"
                className="w-24 px-2 py-2 rounded border border-accent-light dark:border-accent-dark bg-bg-light-tertiary dark:bg-bg-dark-tertiary text-txt-light dark:text-txt-dark"
                value={item.value}
                onChange={e => handleItemChange(idx, 'value', parseFloat(e.target.value))}
                min={0}
                step={item.type === 'percent' ? 0.01 : 1}
                placeholder={item.type === 'percent' ? '0.00%' : 'R$ 0,00'}
              />
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <button
                type="button"
                className="px-3 py-2 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 text-xs font-semibold"
                onClick={() => removeItem(idx)}
                disabled={localItems.length === 1}
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 px-4 py-2 rounded bg-accent-light dark:bg-accent-dark text-white font-bold hover:bg-accent-light-hover dark:hover:bg-accent-dark-hover shadow"
        onClick={addItem}
      >
        + Adicionar Item
      </button>
    </div>
  );
} 