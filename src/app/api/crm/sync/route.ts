import { NextRequest, NextResponse } from 'next/server';
import { CRMIntegration, CRMContact, CRMDeal } from '@/lib/crmIntegration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { crmConfig, contact, deal } = body;

    if (!crmConfig || !contact || !deal) {
      return NextResponse.json(
        { error: 'Configuração do CRM, contato e proposta são obrigatórios' },
        { status: 400 }
      );
    }

    const crm = new CRMIntegration(crmConfig);
    const result = await crm.syncQuoteToCRM(contact, deal);

    return NextResponse.json({
      success: true,
      message: 'Sincronização com CRM realizada com sucesso',
      data: result
    });

  } catch (error) {
    console.error('CRM sync error:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao sincronizar com CRM',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const crmType = searchParams.get('type');
    const apiKey = searchParams.get('apiKey');
    const baseUrl = searchParams.get('baseUrl');

    if (!crmType || !apiKey) {
      return NextResponse.json(
        { error: 'Tipo de CRM e API Key são obrigatórios' },
        { status: 400 }
      );
    }

    const crmConfig = {
      type: crmType as 'hubspot' | 'salesforce' | 'pipedrive',
      apiKey,
      baseUrl: baseUrl || undefined
    };

    // Test connection
    let testUrl = '';
    let headers: Record<string, string> = {};

    switch (crmType) {
      case 'hubspot':
        testUrl = 'https://api.hubapi.com/crm/v3/objects/contacts?limit=1';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        break;
      case 'salesforce':
        if (!baseUrl) {
          return NextResponse.json(
            { error: 'URL base é obrigatória para Salesforce' },
            { status: 400 }
          );
        }
        testUrl = `${baseUrl}/services/data/v58.0/sobjects/Contact/describe`;
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        break;
      case 'pipedrive':
        testUrl = 'https://api.pipedrive.com/v1/persons?limit=1';
        headers = {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Tipo de CRM não suportado' },
          { status: 400 }
        );
    }

    const response = await fetch(testUrl, { headers });
    
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Conexão com CRM estabelecida com sucesso'
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Falha na conexão com CRM',
          status: response.status,
          statusText: response.statusText
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('CRM test error:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao testar conexão com CRM',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
} 