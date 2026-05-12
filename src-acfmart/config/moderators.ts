export interface Moderator {
  id: string;
  name: string;
  zaloId: string;
  role: 'admin' | 'moderator' | 'supervisor';
  active: boolean;
  notifyOn?: string[]; // ['new_seller', 'sla_warning', 'urgent', 'all']
}

export const MODERATORS: Moderator[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    zaloId: '35791357902468',
    role: 'admin',
    active: true,
    notifyOn: ['all']
  },
  {
    id: '2',
    name: 'Trần Thị B',
    zaloId: '98765432101234',
    role: 'moderator',
    active: true,
    notifyOn: ['new_seller', 'urgent']
  },
  {
    id: '3',
    name: 'Lê Văn C',
    zaloId: '11223344556677',
    role: 'supervisor',
    active: true,
    notifyOn: ['sla_warning', 'urgent']
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    zaloId: '55667788990011',
    role: 'moderator',
    active: false, // Tạm khóa không nhận tin
    notifyOn: ['new_seller']
  }
];

// Helper function to get moderators by event type
export function getModeratorsByEvent(eventType: string): Moderator[] {
  return MODERATORS.filter(mod => 
    mod.active && 
    (mod.notifyOn?.includes('all') || mod.notifyOn?.includes(eventType))
  );
}

// Helper function to get moderators by role
export function getModeratorsByRole(role: string): Moderator[] {
  return MODERATORS.filter(mod => 
    mod.active && mod.role === role
  );
}

// Helper function to get all active moderators
export function getActiveModerators(): Moderator[] {
  return MODERATORS.filter(mod => mod.active);
}

// Helper function to get moderator by ID
export function getModeratorById(id: string): Moderator | undefined {
  return MODERATORS.find(mod => mod.id === id);
}

// Event types constants
export const NOTIFICATION_EVENTS = {
  NEW_SELLER: 'new_seller',
  SLA_WARNING: 'sla_warning',
  SELLER_APPROVED: 'seller_approved',
  SELLER_REJECTED: 'seller_rejected',
  URGENT: 'urgent',
  ALL: 'all'
} as const;

export type NotificationEvent = typeof NOTIFICATION_EVENTS[keyof typeof NOTIFICATION_EVENTS];
