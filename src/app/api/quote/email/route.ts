import { NextRequest, NextResponse } from 'next/server';
import { generateProposalPDF } from '@/lib/utils/pdfGenerator';
import { CalculationResult, ClientData } from '@/lib/types/simulator';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, calculations, clientData } = await request.json();

    // Validar dados obrigatórios
    if (!to || !subject || !calculations || !clientData) {
      return NextResponse.json(
        { error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Gerar PDF
    const pdfBlob = await generateProposalPDF(calculations, clientData);
    const pdfBuffer = await pdfBlob.arrayBuffer();

    // Configuração do e-mail (usando Resend ou similar)
    const emailData = {
      from: 'propostas@olvinternacional.com.br',
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d4af37;">OLV Internacional</h2>
          <p>${message || 'Prezado cliente, segue em anexo nossa proposta comercial detalhada.'}</p>
          <p><strong>Serviço:</strong> ${calculations.items[0]?.name || 'Proposta Comercial'}</p>
          <p><strong>Valor Total:</strong> R$ ${calculations.totalBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          <hr style="border: 1px solid #d4af37; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Esta proposta tem validade de 30 dias.<br>
            Para dúvidas, entre em contato: contato@olvinternacional.com.br
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `proposta-olv-${Date.now()}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf'
        }
      ]
    };

    // Enviar e-mail (implementação depende do serviço escolhido)
    // Exemplo com Resend:
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      throw new Error('Falha no envio do e-mail');
    }

    return NextResponse.json(
      { success: true, message: 'E-mail enviado com sucesso' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 