'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator, 
  TrendingUp, 
  Globe, 
  Shield, 
  Zap, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Award,
  Target
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Calculator className="w-6 h-6" />,
      title: "Cálculo Fiscal Inteligente",
      description: "Motor de cálculo avançado com todos os regimes fiscais brasileiros (Simples, Presumido, Real, MEI)",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Moeda",
      description: "Conversão automática em tempo real para USD, EUR, CNY e outras moedas",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance Total",
      description: "100% em conformidade com a legislação fiscal brasileira atualizada",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Performance Ultra",
      description: "Interface otimizada com animações fluidas e carregamento instantâneo",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Análise Avançada",
      description: "Relatórios detalhados com gráficos interativos e insights inteligentes",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Simulação Comparativa",
      description: "Compare diferentes cenários fiscais e encontre a melhor estratégia",
      color: "from-teal-500 to-cyan-500"
    }
  ]

  const stats = [
    { label: "Cotações Geradas", value: "50K+", icon: <Calculator className="w-5 h-5" /> },
    { label: "Clientes Atendidos", value: "1K+", icon: <Users className="w-5 h-5" /> },
    { label: "Precisão Fiscal", value: "99.9%", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Avaliação", value: "4.9/5", icon: <Star className="w-5 h-5" /> }
  ]

  const benefits = [
    "Cálculos fiscais 100% precisos e atualizados",
    "Interface moderna e intuitiva",
    "Suporte a todos os regimes fiscais",
    "Relatórios profissionais em PDF",
    "Integração com sistemas externos",
    "Suporte técnico especializado"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-6"
            >
              <Target className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">OLV Quote Builder 2.0</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6"
            >
              Revolução na
              <span className="block text-gradient"> Cotação Fiscal</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Plataforma avançada de cotação e simulação fiscal brasileira com IA integrada. 
              Precisão absoluta, performance ultra e compliance total.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <button className="btn-primary btn-lg group">
                Começar Agora
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-outline btn-lg">
                Ver Demonstração
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Recursos Revolucionários</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tecnologia de ponta combinada com expertise fiscal brasileira
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="card hover-lift h-full">
                  <div className="card-header">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="card-title text-xl">{feature.title}</h3>
                    <p className="card-description">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Por que escolher o OLV Quote Builder?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nossa plataforma combina a mais avançada tecnologia com anos de experiência 
                no mercado fiscal brasileiro, oferecendo uma solução completa e confiável.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card p-8">
                <div className="text-center mb-6">
                  <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Certificação de Qualidade</h3>
                  <p className="text-muted-foreground">
                    Aprovado pelos principais especialistas fiscais do Brasil
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span>Precisão Fiscal</span>
                    <span className="font-bold text-green-600">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span>Tempo de Resposta</span>
                    <span className="font-bold text-blue-600">&lt; 1s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span>Uptime</span>
                    <span className="font-bold text-purple-600">99.99%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6">
              Pronto para revolucionar suas cotações?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a milhares de profissionais que já confiam no OLV Quote Builder
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary btn-lg group">
                Começar Gratuitamente
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="btn-outline btn-lg">
                Falar com Especialista
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
} 