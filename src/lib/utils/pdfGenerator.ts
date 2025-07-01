import jsPDF from 'jspdf';
import { CalculationResult, ClientData } from '../types/simulator';
import { formatCurrency } from './currency';

interface PDFOptions {
  title?: string;
  includeLogo?: boolean;
  includeBreakdown?: boolean;
  includeTerms?: boolean;
}

export const generateProposalPDF = async (
  calculations: CalculationResult,
  clientData: ClientData,
  options: PDFOptions = {}
): Promise<Blob> => {
  const {
    title = 'Proposta Comercial OLV Internacional',
    includeLogo = true,
    includeBreakdown = true,
    includeTerms = true
  } = options;

  // Criar documento PDF
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let yPosition = margin;

  // Função para adicionar texto com quebra de linha
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.4); // Altura aproximada das linhas
  };

  // Função para adicionar linha horizontal
  const addHorizontalLine = (y: number) => {
    doc.setDrawColor(212, 175, 55); // Dourado OLV
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // Cabeçalho
  if (includeLogo) {
    // Logo OLV (texto estilizado)
    doc.setFontSize(24);
    doc.setTextColor(212, 175, 55); // Dourado OLV
    doc.setFont('helvetica', 'bold');
    doc.text('OLV', margin, yPosition);
    
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('Internacional', margin, yPosition);
    
    yPosition += 15;
  }

  // Título da proposta
  doc.setFontSize(18);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, yPosition);
  
  yPosition += 15;
  addHorizontalLine(yPosition);
  yPosition += 10;

  // Informações do cliente
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Cliente', margin, yPosition);
  
  yPosition += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${clientData.nome}`, margin, yPosition);
  yPosition += 5;
  doc.text(`Empresa: ${clientData.empresa}`, margin, yPosition);
  yPosition += 5;
  doc.text(`CNPJ: ${clientData.cnpj}`, margin, yPosition);
  yPosition += 5;
  doc.text(`E-mail: ${clientData.email}`, margin, yPosition);
  
  if (clientData.telefone) {
    yPosition += 5;
    doc.text(`Telefone: ${clientData.telefone}`, margin, yPosition);
  }
  
  yPosition += 10;
  addHorizontalLine(yPosition);
  yPosition += 10;

  // Resumo dos serviços
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('Serviços Selecionados', margin, yPosition);
  
  yPosition += 8;

  // Tabela de serviços
  const tableHeaders = ['Serviço', 'Descrição', 'Duração', 'Valor (BRL)'];
  const tableWidths = [50, 70, 30, 40];
  const tableX = margin;
  
  // Cabeçalho da tabela
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(212, 175, 55);
  doc.rect(tableX, yPosition - 5, contentWidth, 8, 'F');
  
  let xPos = tableX + 2;
  tableHeaders.forEach((header, index) => {
    doc.text(header, xPos, yPosition);
    xPos += tableWidths[index];
  });
  
  yPosition += 8;

  // Linhas da tabela
  doc.setTextColor(50, 50, 50);
  calculations.items.forEach((item, index) => {
    // Verificar se precisa de nova página
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Linha alternada
    if (index % 2 === 0) {
      doc.setFillColor(248, 248, 248);
      doc.rect(tableX, yPosition - 5, contentWidth, 8, 'F');
    }

    xPos = tableX + 2;
    doc.text(item.name.substring(0, 20), xPos, yPosition);
    xPos += tableWidths[0];
    
    doc.text(item.description.substring(0, 25), xPos, yPosition);
    xPos += tableWidths[1];
    
    doc.text(item.duration.substring(0, 12), xPos, yPosition);
    xPos += tableWidths[2];
    
    doc.text(formatCurrency(item.valueBRL, 'BRL'), xPos, yPosition);
    
    yPosition += 8;
  });

  yPosition += 10;
  addHorizontalLine(yPosition);
  yPosition += 10;

  // Totais
  doc.setFontSize(12);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  
  const totalX = pageWidth - margin - 60;
  doc.text('Subtotal:', totalX, yPosition);
  doc.text(formatCurrency(calculations.totalBRL, 'BRL'), pageWidth - margin - 20, yPosition);
  
  yPosition += 6;
  doc.text('Total:', totalX, yPosition);
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(14);
  doc.text(formatCurrency(calculations.totalBRL, 'BRL'), pageWidth - margin - 20, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(`Duração total: ${calculations.totalDuration}`, margin, yPosition);
  
  yPosition += 5;
  doc.text(`Moeda: ${calculations.currency}`, margin, yPosition);
  
  yPosition += 5;
  doc.text(`Taxa de câmbio: ${calculations.exchangeRate.toFixed(4)}`, margin, yPosition);

  // Breakdown detalhado (se solicitado)
  if (includeBreakdown && calculations.items.length > 0) {
    yPosition += 15;
    addHorizontalLine(yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalhamento por Serviço', margin, yPosition);
    
    yPosition += 10;

    calculations.items.forEach((item) => {
      // Verificar se precisa de nova página
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(item.name, margin, yPosition);
      
      yPosition += 5;
      doc.setFont('helvetica', 'normal');
      doc.text(item.description, margin, yPosition);
      
      yPosition += 5;
      doc.text(`Valor: ${formatCurrency(item.valueBRL, 'BRL')}`, margin, yPosition);
      
      yPosition += 5;
      doc.text(`Duração: ${item.duration}`, margin, yPosition);
      
      // Breakdown do item
      if (Object.keys(item.breakdown).length > 0) {
        yPosition += 3;
        Object.entries(item.breakdown).forEach(([key, value]) => {
          doc.setFontSize(8);
          doc.text(`  • ${key}: ${formatCurrency(value, 'BRL')}`, margin + 5, yPosition);
          yPosition += 3;
        });
      }
      
      yPosition += 8;
    });
  }

  // Termos e condições (se solicitado)
  if (includeTerms) {
    yPosition += 10;
    addHorizontalLine(yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('Termos e Condições', margin, yPosition);
    
    yPosition += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    
    const terms = [
      '1. Esta proposta tem validade de 30 dias a partir da data de emissão.',
      '2. Os valores apresentados estão em Reais (BRL) e podem ser convertidos para outras moedas.',
      '3. O prazo de execução pode variar conforme a complexidade do projeto.',
      '4. Pagamento conforme acordado em contrato específico.',
      '5. A OLV Internacional se reserva o direito de ajustar valores conforme necessidade.',
      '6. Esta proposta não constitui contrato, apenas orçamento preliminar.'
    ];

    terms.forEach(term => {
      const lineHeight = addText(term, margin, yPosition, contentWidth, 9);
      yPosition += lineHeight + 2;
    });
  }

  // Rodapé
  const footerY = pageHeight - 20;
  addHorizontalLine(footerY);
  
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  doc.text('OLV Internacional - Transformando PMEs em players globais', margin, footerY + 5);
  doc.text(`Proposta gerada em: ${new Date().toLocaleDateString('pt-BR')}`, margin, footerY + 10);
  doc.text('www.olvinternacional.com.br', pageWidth - margin - 60, footerY + 5);

  // Gerar blob
  return doc.output('blob');
};

// Função para download do PDF
export const downloadProposalPDF = async (
  calculations: CalculationResult,
  clientData: ClientData,
  filename?: string
): Promise<void> => {
  try {
    const blob = await generateProposalPDF(calculations, clientData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `proposta-olv-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error('Falha ao gerar PDF da proposta');
  }
};

// Função para visualizar PDF em nova aba
export const viewProposalPDF = async (
  calculations: CalculationResult,
  clientData: ClientData
): Promise<void> => {
  try {
    const blob = await generateProposalPDF(calculations, clientData);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  } catch (error) {
    console.error('Erro ao visualizar PDF:', error);
    throw new Error('Falha ao visualizar PDF da proposta');
  }
}; 