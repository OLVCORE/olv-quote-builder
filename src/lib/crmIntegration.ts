// CRM Integration System
export interface CRMContact {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface CRMDeal {
  id?: string;
  title: string;
  amount: number;
  currency: string;
  stage: string;
  contactId: string;
  description?: string;
  closeDate?: string;
  probability?: number;
}

export interface CRMConfig {
  type: 'hubspot' | 'salesforce' | 'pipedrive';
  apiKey: string;
  baseUrl?: string;
  customFields?: Record<string, string>;
}

export class CRMIntegration {
  private config: CRMConfig;

  constructor(config: CRMConfig) {
    this.config = config;
  }

  // HubSpot Integration
  private async hubspotCreateContact(contact: CRMContact): Promise<string> {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          email: contact.email,
          firstname: contact.firstName,
          lastname: contact.lastName,
          company: contact.company,
          phone: contact.phone,
          address: contact.address,
          city: contact.city,
          state: contact.state,
          country: contact.country,
          zip: contact.zipCode,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async hubspotCreateDeal(deal: CRMDeal): Promise<string> {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          dealname: deal.title,
          amount: deal.amount.toString(),
          dealstage: deal.stage,
          description: deal.description,
          closedate: deal.closeDate,
          pipeline: 'default',
        },
        associations: [
          {
            to: { id: deal.contactId },
            types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  // Salesforce Integration
  private async salesforceCreateContact(contact: CRMContact): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/services/data/v58.0/sobjects/Contact`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Email: contact.email,
        FirstName: contact.firstName,
        LastName: contact.lastName,
        Company: contact.company,
        Phone: contact.phone,
        MailingAddress: contact.address,
        MailingCity: contact.city,
        MailingState: contact.state,
        MailingCountry: contact.country,
        MailingPostalCode: contact.zipCode,
      })
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  private async salesforceCreateOpportunity(deal: CRMDeal): Promise<string> {
    const response = await fetch(`${this.config.baseUrl}/services/data/v58.0/sobjects/Opportunity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Name: deal.title,
        Amount: deal.amount,
        CurrencyIsoCode: deal.currency,
        StageName: deal.stage,
        Description: deal.description,
        CloseDate: deal.closeDate,
        Probability: deal.probability,
        ContactId: deal.contactId,
      })
    });

    if (!response.ok) {
      throw new Error(`Salesforce API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  // Pipedrive Integration
  private async pipedriveCreatePerson(contact: CRMContact): Promise<string> {
    const response = await fetch('https://api.pipedrive.com/v1/persons', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${contact.firstName} ${contact.lastName}`,
        email: [contact.email],
        phone: [contact.phone],
        org_name: contact.company,
        address: contact.address,
        visible: 1
      })
    });

    if (!response.ok) {
      throw new Error(`Pipedrive API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.id.toString();
  }

  private async pipedriveCreateDeal(deal: CRMDeal): Promise<string> {
    const response = await fetch('https://api.pipedrive.com/v1/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: deal.title,
        value: deal.amount,
        currency: deal.currency,
        stage_id: this.getPipedriveStageId(deal.stage),
        person_id: parseInt(deal.contactId),
        close_date: deal.closeDate,
        probability: deal.probability,
      })
    });

    if (!response.ok) {
      throw new Error(`Pipedrive API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.id.toString();
  }

  private getPipedriveStageId(stage: string): number {
    // Mapeamento básico de estágios do Pipedrive
    const stageMap: Record<string, number> = {
      'qualification': 1,
      'proposal': 2,
      'negotiation': 3,
      'closed_won': 4,
      'closed_lost': 5,
    };
    return stageMap[stage] || 1;
  }

  // Public methods
  async createContact(contact: CRMContact): Promise<string> {
    switch (this.config.type) {
      case 'hubspot':
        return await this.hubspotCreateContact(contact);
      case 'salesforce':
        return await this.salesforceCreateContact(contact);
      case 'pipedrive':
        return await this.pipedriveCreatePerson(contact);
      default:
        throw new Error(`Unsupported CRM type: ${this.config.type}`);
    }
  }

  async createDeal(deal: CRMDeal): Promise<string> {
    switch (this.config.type) {
      case 'hubspot':
        return await this.hubspotCreateDeal(deal);
      case 'salesforce':
        return await this.salesforceCreateOpportunity(deal);
      case 'pipedrive':
        return await this.pipedriveCreateDeal(deal);
      default:
        throw new Error(`Unsupported CRM type: ${this.config.type}`);
    }
  }

  async syncQuoteToCRM(contact: CRMContact, deal: CRMDeal): Promise<{ contactId: string; dealId: string }> {
    try {
      const contactId = await this.createContact(contact);
      const dealWithContact = { ...deal, contactId };
      const dealId = await this.createDeal(dealWithContact);
      
      return { contactId, dealId };
    } catch (error) {
      console.error('CRM sync error:', error);
      throw new Error(`Failed to sync to CRM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Utility functions
export function validateCRMConfig(config: CRMConfig): boolean {
  if (!config.apiKey || config.apiKey.trim() === '') {
    return false;
  }

  if (!['hubspot', 'salesforce', 'pipedrive'].includes(config.type)) {
    return false;
  }

  if (config.type === 'salesforce' && !config.baseUrl) {
    return false;
  }

  return true;
}

export function getCRMStageMapping(crmType: string, stage: string): string {
  const mappings: Record<string, Record<string, string>> = {
    hubspot: {
      'new': 'appointmentscheduled',
      'qualified': 'qualifiedtobuy',
      'proposal': 'presentationscheduled',
      'negotiation': 'contractsent',
      'closed_won': 'closedwon',
      'closed_lost': 'closedlost',
    },
    salesforce: {
      'new': 'Prospecting',
      'qualified': 'Qualification',
      'proposal': 'Proposal/Price Quote',
      'negotiation': 'Negotiation/Review',
      'closed_won': 'Closed Won',
      'closed_lost': 'Closed Lost',
    },
    pipedrive: {
      'new': 'qualification',
      'qualified': 'proposal',
      'proposal': 'negotiation',
      'negotiation': 'negotiation',
      'closed_won': 'closed_won',
      'closed_lost': 'closed_lost',
    }
  };

  return mappings[crmType]?.[stage] || stage;
} 