'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  Package, 
  Globe, 
  TrendingUp,
  DollarSign,
  Percent,
  FileText,
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState('produto')
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'produto', name: 'Produto', icon: <Package className="w-4 h-4" /> },
    { id: 'servico', name: 'Serviço', icon: <Globe className="w-4 h-4" /> },
    { id: 'fiscal', name: 'Fiscal', icon: <TrendingUp className="w-4 h-4" /> },
  ]

  const fiscalRegimes = [
    { id: 'simples', name: 'Simples Nacional', description: 'Regime simplificado para pequenas empresas' },
    { id: 'presumido', name: 'Lucro Presumido', description: 'Presunção de lucro para empresas médias' },
    { id: 'real', name: 'Lucro Real', description: 'Regime completo para grandes empresas' },
    { id: 'mei', name: 'MEI', description: 'Microempreendedor Individual' },
  ]

  const handleSimulate = () => {
    setLoading(true)
    // Simular processamento
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold mb-4">Simulador Fiscal Avançado</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Calcule impostos, markup e preços com precisão absoluta usando nosso motor fiscal brasileiro
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-8"
      >
        <div className="flex bg-muted rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Dados da Simulação
              </CardTitle>
              <CardDescription>
                Preencha os dados para calcular a precificação completa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Regime Fiscal */}
              <div>
                <label className="text-sm font-medium mb-3 block">Regime Fiscal</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {fiscalRegimes.map((regime) => (
                    <div
                      key={regime.id}
                      className="flex items-center p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="regime"
                        id={regime.id}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">{regime.name}</div>
                        <div className="text-sm text-muted-foreground">{regime.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campos específicos por tipo */}
              {activeTab === 'produto' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Valor do Produto (USD)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Peso (kg)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      leftIcon={<Package className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Markup (%)</label>
                    <Input
                      type="number"
                      placeholder="30"
                      leftIcon={<Percent className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Estado de Destino</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Selecione o estado</option>
                      <option value="SP">São Paulo</option>
                      <option value="RJ">Rio de Janeiro</option>
                      <option value="MG">Minas Gerais</option>
                      <option value="RS">Rio Grande do Sul</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'servico' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Serviço</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Selecione o serviço</option>
                      <option value="import">Importação</option>
                      <option value="export">Exportação</option>
                      <option value="logistics">Logística</option>
                      <option value="consulting">Consultoria</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Valor Base (BRL)</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      leftIcon={<DollarSign className="w-4 h-4" />}
                    />
                  </div>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSimulate}
                  loading={loading}
                  className="flex-1"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Simular
                </Button>
                <Button variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Resultados
              </CardTitle>
              <CardDescription>
                Análise detalhada da precificação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumo */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Valor Base</span>
                  <span className="font-semibold">R$ 1.000,00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Impostos</span>
                  <span className="font-semibold text-red-600">R$ 180,00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm">Markup</span>
                  <span className="font-semibold text-blue-600">R$ 300,00</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Preço Final</span>
                  <span className="font-bold text-lg">R$ 1.480,00</span>
                </div>
              </div>

              {/* Breakdown de impostos */}
              <div>
                <h4 className="font-medium mb-3">Breakdown de Impostos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ICMS</span>
                    <span>R$ 120,00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IPI</span>
                    <span>R$ 30,00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>PIS/COFINS</span>
                    <span>R$ 30,00</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="space-y-2 pt-4">
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Recursos Avançados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="success" dot />
                <span className="text-sm">Cálculo automático de impostos</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" dot />
                <span className="text-sm">Multi-moeda em tempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" dot />
                <span className="text-sm">Compliance fiscal total</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" dot />
                <span className="text-sm">Relatórios profissionais</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 