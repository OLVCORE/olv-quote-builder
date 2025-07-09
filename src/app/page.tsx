"use client";
import Link from "next/link";
import { FaCalculator, FaChartLine, FaGlobe, FaBoxOpen, FaHistory, FaFilePdf, FaFileExcel, FaShieldAlt, FaRocket, FaLightbulb, FaArrowRight } from "react-icons/fa";

export default function Home() {
  const quickActions = [
    {
      title: "Simular Produto",
      description: "Precificação completa com impostos brasileiros",
      icon: FaBoxOpen,
      href: "/admin/simulator?type=produto",
      color: "from-blue-500 to-indigo-600",
      features: ["ICMS, IPI, PIS/COFINS", "Markup dinâmico", "Breakdown detalhado"]
    },
    {
      title: "Simular Serviço",
      description: "Serviços COMEX e logística",
      icon: FaGlobe,
      href: "/admin/simulator?type=servico",
      color: "from-green-500 to-emerald-600",
      features: ["ISS, ICMS-ST", "8 serviços OLV", "Exportação PDF/Excel"]
    },
    {
      title: "Cenários Fiscais",
      description: "Comparar diferentes regimes tributários",
      icon: FaChartLine,
      href: "/admin/simulator?type=fiscal",
      color: "from-purple-500 to-violet-600",
      features: ["Simples vs Presumido", "DIFAL, ICMS-ST", "Otimização fiscal"]
    },
    {
      title: "Histórico",
      description: "Visualizar simulações anteriores",
      icon: FaHistory,
      href: "/admin/quote-incompany/history",
      color: "from-orange-500 to-red-600",
      features: ["Comparação temporal", "Exportação em lote", "Análise de tendências"]
    }
  ];

  const features = [
    {
      icon: FaShieldAlt,
      title: "Compliance Fiscal",
      description: "Cálculos baseados na legislação brasileira vigente, incluindo ICMS, IPI, PIS/COFINS, ISS, DIFAL e ICMS-ST."
    },
    {
      icon: FaLightbulb,
      title: "Inteligência de Preços",
      description: "Algoritmos avançados para otimização de markup, margens e competitividade de preços."
    },
    {
      icon: FaRocket,
      title: "Simulação Avançada",
      description: "Compare múltiplos cenários, regimes tributários e estratégias de precificação em tempo real."
    },
    {
      icon: FaFilePdf,
      title: "Relatórios Profissionais",
      description: "Exportação em PDF e Excel com breakdown detalhado, justificativas legais e recomendações."
    }
  ];

  const stats = [
    { label: "Regimes Tributários", value: "4", description: "Simples, Presumido, Real, MEI" },
    { label: "Impostos Cobertos", value: "12+", description: "ICMS, IPI, PIS, COFINS, ISS, DIFAL" },
    { label: "Serviços OLV", value: "8", description: "COMEX, Logística, Consultoria" },
    { label: "Estados Brasileiros", value: "27", description: "Alíquotas e regras específicas" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-olvblue via-blue-800 to-olvblue opacity-95"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="p-3 sm:p-4 bg-ourovelho/20 rounded-2xl">
                <FaCalculator className="text-3xl sm:text-4xl text-ourovelho" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-2 drop-shadow-lg">
                  OLV Quote Builder
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-ourovelho">
                  Precificação Inteligente & Compliance Fiscal
                </h2>
              </div>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-6 sm:mb-8">
              Plataforma avançada de precificação com engine fiscal brasileiro completo.
              Simule produtos e serviços com cálculo automático de impostos, markup dinâmico
              e relatórios profissionais para sua empresa.
            </p>
            
            {/* Stats - Responsivo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl font-bold text-ourovelho">{stat.value}</div>
                  <div className="text-white font-semibold text-xs sm:text-sm">{stat.label}</div>
                  <div className="text-white/70 text-xs hidden sm:block">{stat.description}</div>
                </div>
              ))}
            </div>

            {/* CTA Principal */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/admin/simulator" 
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-ourovelho to-ourovelho-dark text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <FaRocket className="text-lg sm:text-xl" />
                Começar Simulação
                <FaArrowRight className="text-sm sm:text-base" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Responsivo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-6 sm:mb-8 text-center">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {quickActions.map((action, idx) => {
            const IconComponent = action.icon;
            return (
              <Link key={idx} href={action.href} className="group">
                <div className={`relative overflow-hidden bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 h-full`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                  <div className="relative p-4 sm:p-6 h-full flex flex-col">
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 bg-gradient-to-br ${action.color} rounded-xl text-white flex-shrink-0`}>
                        <IconComponent className="text-xl sm:text-2xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-1">{action.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300 text-sm">{action.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-1 mt-auto">
                      {action.features.map((feature, featureIdx) => (
                        <li key={featureIdx} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Features - Responsivo */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-6 sm:mb-8 text-center">
            Recursos Avançados
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <div key={idx} className="flex gap-3 sm:gap-4">
                  <div className="flex-shrink-0 p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white">
                    <IconComponent className="text-xl sm:text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 