// User Types
export type UserRole = 'maker' | 'verifier' | 'authorizer' | 'gis_processor' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  type: 'client' | 'internal';
  isActive: boolean;
  createdAt: string;
}

// Instruction Types
export type InstructionType = 'account_opening' | 'funds_transfer' | 'trade_settlement';

export type InstructionStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'callback_verification'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'returned';

export interface Instruction {
  id: string;
  instructionId: string;
  type: InstructionType;
  status: InstructionStatus;
  clientAccountNumber: string;
  currency: string;
  amount: number;
  valueDate: string;
  description?: string;
  supportingDocuments: Document[];
  submittedBy: string;
  submittedByName: string;
  submittedAt?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  authorizedBy?: string;
  authorizedAt?: string;
  processedBy?: string;
  processedAt?: string;
  callbackVerification?: CallbackVerification;
  comments: Comment[];
  auditTrail: AuditEvent[];
  organizationId: string;
  organizationName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
}

// Callback Verification
export interface CallbackVerification {
  id: string;
  status: 'pending' | 'verified' | 'failed';
  officerName: string;
  timestamp?: string;
  notes?: string;
  instructionId: string;
}

// Audit Trail
export interface AuditEvent {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  entityType: 'instruction' | 'user' | 'document' | 'system';
  entityId: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
}

export type AuditAction = 
  | 'login'
  | 'logout'
  | 'instruction_created'
  | 'instruction_submitted'
  | 'instruction_verified'
  | 'instruction_authorized'
  | 'instruction_approved'
  | 'instruction_rejected'
  | 'instruction_returned'
  | 'instruction_completed'
  | 'document_uploaded'
  | 'document_downloaded'
  | 'callback_verified'
  | 'user_created'
  | 'user_updated'
  | 'user_deactivated';

// Dashboard Metrics
export interface DashboardMetrics {
  totalInstructions: number;
  pendingApproval: number;
  approvedInstructions: number;
  rejectedInstructions: number;
  completedInstructions: number;
  callbackPending: number;
  recentInstructions: Instruction[];
  instructionsByType: { type: string; count: number }[];
  instructionsByStatus: { status: string; count: number }[];
  monthlyTrend: { month: string; submitted: number; completed: number }[];
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: string;
  createdAt: string;
}

// Form Types
export interface InstructionFormData {
  type: InstructionType;
  clientAccountNumber: string;
  currency: string;
  amount: string;
  valueDate: string;
  description?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

// Filter Types
export interface InstructionFilter {
  status?: InstructionStatus;
  type?: InstructionType;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Route Types
export type AppRoute = 
  | '/'
  | '/login'
  | '/dashboard'
  | '/instructions'
  | '/instructions/new'
  | '/instructions/:id'
  | '/workflow'
  | '/callback-verification'
  | '/audit-trail'
  | '/users'
  | '/organizations'
  | '/reports'
  | '/documents'
  | '/notifications'
  | '/profile';
