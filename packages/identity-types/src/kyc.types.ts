export type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'expired';

export type KycProvider = 'prembly' | 'smile_identity' | 'dojah' | 'custom';

export interface KycVerification {
  id: string;
  identityId: string;
  provider: KycProvider;
  status: KycStatus;
  level: KycLevel;
  verifiedFields: string[];
  submittedAt: string | null;
  completedAt: string | null;
  expiresAt: string | null;
  rejectionReason: string | null;
  providerReference: string | null;
  metadata: Record<string, unknown>;
}

export type KycLevel = 'basic' | 'advanced' | 'full' | 'corporate';

export interface KycRequirement {
  level: KycLevel;
  requiredFields: string[];
  description: string;
}

export const KYC_REQUIREMENTS: Record<KycLevel, KycRequirement> = {
  basic: {
    level: 'basic',
    requiredFields: ['full_name', 'date_of_birth', 'country'],
    description: 'Basic identity information',
  },
  advanced: {
    level: 'advanced',
    requiredFields: ['full_name', 'date_of_birth', 'country', 'id_document', 'selfie'],
    description: 'Government ID verification',
  },
  full: {
    level: 'full',
    requiredFields: ['full_name', 'date_of_birth', 'country', 'id_document', 'selfie', 'address_proof', 'phone'],
    description: 'Full KYC with address verification',
  },
  corporate: {
    level: 'corporate',
    requiredFields: ['business_name', 'registration_number', 'director_details', 'shareholder_details', 'bank_statement'],
    description: 'Corporate/business verification',
  },
};

export interface IKycProvider {
  readonly providerName: KycProvider;
  submitVerification(identityId: string, data: Record<string, unknown>): Promise<{ reference: string; status: KycStatus }>;
  checkStatus(reference: string): Promise<{ status: KycStatus; verifiedFields: string[]; metadata: Record<string, unknown> }>;
}

export interface IKycRepository {
  findByIdentity(identityId: string): Promise<KycVerification | null>;
  update(id: string, data: Partial<KycVerification>): Promise<KycVerification>;
  create(data: Omit<KycVerification, 'id'>): Promise<KycVerification>;
}