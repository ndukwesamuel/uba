import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  UserRole,
  Instruction,
  InstructionStatus,
  Notification,
  AuditEvent,
  DashboardMetrics,
} from "@/types";

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  canPerformAction: (action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock users for demo
        const mockUsers: Record<string, User> = {
          "maker@client.com": {
            id: "1",
            email: "maker@client.com",
            name: "Adefusi Maker",
            role: "maker",
            organizationId: "org1",
            organizationName: "Global Investments Ltd",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          "verifier@client.com": {
            id: "2",
            email: "verifier@client.com",
            name: "Oluwakemi Verifier",
            role: "verifier",
            organizationId: "org1",
            organizationName: "Global Investments Ltd",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          "authorizer@client.com": {
            id: "3",
            email: "authorizer@client.com",
            name: "Michael Authorizer",
            role: "authorizer",
            organizationId: "org1",
            organizationName: "Global Investments Ltd",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          "processor@gis.com": {
            id: "4",
            email: "processor@gis.com",
            name: "Chukwuebuka Processor",
            role: "gis_processor",
            organizationId: "org2",
            organizationName: "UBA GIS Team",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          "admin@uba.com": {
            id: "5",
            email: "admin@uba.com",
            name: "Admin User",
            role: "admin",
            organizationId: "org2",
            organizationName: "UBA GIS Team",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        };

        const user = mockUsers[email.toLowerCase()];

        if (user && password === "password") {
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        }

        set({ isLoading: false });
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },

      canPerformAction: (action: string) => {
        const { user } = get();
        if (!user) return false;

        const rolePermissions: Record<UserRole, string[]> = {
          maker: ["create_instruction", "view_own_instructions", "edit_draft"],
          verifier: ["verify_instruction", "view_instructions", "add_comment"],
          authorizer: [
            "authorize_instruction",
            "view_instructions",
            "add_comment",
          ],
          gis_processor: [
            "process_instruction",
            "callback_verify",
            "view_all_instructions",
            "add_comment",
            "approve",
            "reject",
            "return",
          ],
          admin: ["*"],
        };

        const permissions = rolePermissions[user.role];
        return permissions.includes("*") || permissions.includes(action);
      },
    }),
    {
      name: "auth-storage",
    },
  ),
);

// Instructions Store
interface InstructionsState {
  instructions: Instruction[];
  selectedInstruction: Instruction | null;
  isLoading: boolean;
  fetchInstructions: () => Promise<void>;
  getInstructionById: (id: string) => Instruction | undefined;
  createInstruction: (data: Partial<Instruction>) => Promise<Instruction>;
  updateInstruction: (id: string, data: Partial<Instruction>) => Promise<void>;
  submitInstruction: (id: string) => Promise<void>;
  verifyInstruction: (id: string, comment?: string) => Promise<void>;
  authorizeInstruction: (id: string, comment?: string) => Promise<void>;
  processInstruction: (
    id: string,
    action: "approve" | "reject" | "return",
    comment?: string,
  ) => Promise<void>;
  addComment: (instructionId: string, text: string) => Promise<void>;
  uploadDocument: (instructionId: string, file: File) => Promise<void>;
}

export const useInstructionsStore = create<InstructionsState>()((set, get) => ({
  instructions: [],
  selectedInstruction: null,
  isLoading: false,

  fetchInstructions: async () => {
    set({ isLoading: true });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate mock instructions
    const mockInstructions: Instruction[] = generateMockInstructions();
    set({ instructions: mockInstructions, isLoading: false });
  },

  getInstructionById: (id: string) => {
    return get().instructions.find((i) => i.id === id);
  },

  createInstruction: async (data: Partial<Instruction>) => {
    const newInstruction: Instruction = {
      id: Math.random().toString(36).substr(2, 9),
      instructionId: `INS-${Date.now()}`,
      type: data.type || "funds_transfer",
      status: "draft",
      clientAccountNumber: data.clientAccountNumber || "",
      currency: data.currency || "USD",
      amount: data.amount || 0,
      valueDate: data.valueDate || new Date().toISOString().split("T")[0],
      description: data.description || "",
      supportingDocuments: [],
      submittedBy: useAuthStore.getState().user?.id || "",
      submittedByName: useAuthStore.getState().user?.name || "",
      comments: [],
      auditTrail: [],
      organizationId: useAuthStore.getState().user?.organizationId || "",
      organizationName: useAuthStore.getState().user?.organizationName || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      instructions: [newInstruction, ...state.instructions],
    }));

    return newInstruction;
  },

  updateInstruction: async (id: string, data: Partial<Instruction>) => {
    set((state) => ({
      instructions: state.instructions.map((i) =>
        i.id === id
          ? { ...i, ...data, updatedAt: new Date().toISOString() }
          : i,
      ),
    }));
  },

  submitInstruction: async (id: string) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      instructions: state.instructions.map((i) =>
        i.id === id
          ? {
              ...i,
              status: "submitted",
              submittedAt: new Date().toISOString(),
              auditTrail: [
                ...i.auditTrail,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  userId: user?.id || "",
                  userName: user?.name || "",
                  userRole: user?.role || "maker",
                  action: "instruction_submitted",
                  entityType: "instruction",
                  entityId: id,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : i,
      ),
    }));
  },

  verifyInstruction: async (id: string, comment?: string) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      instructions: state.instructions.map((i) => {
        if (i.id !== id) return i;

        const updatedComments = comment
          ? [
              ...i.comments,
              {
                id: Math.random().toString(36).substr(2, 9),
                text: comment,
                authorId: user?.id || "",
                authorName: user?.name || "",
                authorRole: user?.role || "verifier",
                createdAt: new Date().toISOString(),
              },
            ]
          : i.comments;

        return {
          ...i,
          status: "under_review",
          verifiedBy: user?.id,
          verifiedAt: new Date().toISOString(),
          comments: updatedComments,
          auditTrail: [
            ...i.auditTrail,
            {
              id: Math.random().toString(36).substr(2, 9),
              userId: user?.id || "",
              userName: user?.name || "",
              userRole: user?.role || "verifier",
              action: "instruction_verified",
              entityType: "instruction",
              entityId: id,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }),
    }));
  },

  authorizeInstruction: async (id: string, comment?: string) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      instructions: state.instructions.map((i) => {
        if (i.id !== id) return i;

        const updatedComments = comment
          ? [
              ...i.comments,
              {
                id: Math.random().toString(36).substr(2, 9),
                text: comment,
                authorId: user?.id || "",
                authorName: user?.name || "",
                authorRole: user?.role || "authorizer",
                createdAt: new Date().toISOString(),
              },
            ]
          : i.comments;

        return {
          ...i,
          status: "callback_verification",
          authorizedBy: user?.id,
          authorizedAt: new Date().toISOString(),
          comments: updatedComments,
          auditTrail: [
            ...i.auditTrail,
            {
              id: Math.random().toString(36).substr(2, 9),
              userId: user?.id || "",
              userName: user?.name || "",
              userRole: user?.role || "authorizer",
              action: "instruction_authorized",
              entityType: "instruction",
              entityId: id,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }),
    }));
  },

  processInstruction: async (
    id: string,
    action: "approve" | "reject" | "return",
    comment?: string,
  ) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      instructions: state.instructions.map((i) => {
        if (i.id !== id) return i;

        const statusMap: Record<string, InstructionStatus> = {
          approve: "approved",
          reject: "rejected",
          return: "returned",
        };

        const actionMap: Record<string, AuditEvent["action"]> = {
          approve: "instruction_approved",
          reject: "instruction_rejected",
          return: "instruction_returned",
        };

        const updatedComments = comment
          ? [
              ...i.comments,
              {
                id: Math.random().toString(36).substr(2, 9),
                text: comment,
                authorId: user?.id || "",
                authorName: user?.name || "",
                authorRole: user?.role || "gis_processor",
                createdAt: new Date().toISOString(),
              },
            ]
          : i.comments;

        return {
          ...i,
          status: statusMap[action],
          processedBy: user?.id,
          processedAt: new Date().toISOString(),
          comments: updatedComments,
          auditTrail: [
            ...i.auditTrail,
            {
              id: Math.random().toString(36).substr(2, 9),
              userId: user?.id || "",
              userName: user?.name || "",
              userRole: user?.role || "gis_processor",
              action: actionMap[action],
              entityType: "instruction",
              entityId: id,
              timestamp: new Date().toISOString(),
            },
          ],
        };
      }),
    }));
  },

  addComment: async (instructionId: string, text: string) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      instructions: state.instructions.map((i) =>
        i.id === instructionId
          ? {
              ...i,
              comments: [
                ...i.comments,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  text,
                  authorId: user?.id || "",
                  authorName: user?.name || "",
                  authorRole: user?.role || "maker",
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : i,
      ),
    }));
  },

  uploadDocument: async (instructionId: string, file: File) => {
    const user = useAuthStore.getState().user;
    set((state) => ({
      instructions: state.instructions.map((i) =>
        i.id === instructionId
          ? {
              ...i,
              supportingDocuments: [
                ...i.supportingDocuments,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  url: URL.createObjectURL(file),
                  uploadedBy: user?.id || "",
                  uploadedAt: new Date().toISOString(),
                },
              ],
            }
          : i,
      ),
    }));
  },
}));

// Notifications Store
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">,
  ) => void;
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    // Generate mock notifications
    const mockNotifications: Notification[] = [
      {
        id: "1",
        userId: "1",
        title: "Instruction Submitted",
        message: "Your instruction INS-001 has been submitted successfully.",
        type: "success",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        userId: "1",
        title: "Instruction Approved",
        message: "Instruction INS-002 has been approved by GIS.",
        type: "success",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "3",
        userId: "1",
        title: "Action Required",
        message: "Please review the returned instruction INS-003.",
        type: "warning",
        isRead: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    set({
      notifications: mockNotifications,
      unreadCount: mockNotifications.filter((n) => !n.isRead).length,
    });
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));

// Dashboard Store
interface DashboardState {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  fetchMetrics: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  metrics: null,
  isLoading: false,

  fetchMetrics: async () => {
    set({ isLoading: true });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockMetrics: DashboardMetrics = {
      totalInstructions: 156,
      pendingApproval: 23,
      approvedInstructions: 89,
      rejectedInstructions: 12,
      completedInstructions: 67,
      callbackPending: 8,
      recentInstructions: generateMockInstructions().slice(0, 5),
      instructionsByType: [
        { type: "Account Opening", count: 45 },
        { type: "Funds Transfer", count: 78 },
        { type: "Trade Settlement", count: 33 },
      ],
      instructionsByStatus: [
        { status: "Draft", count: 5 },
        { status: "Submitted", count: 12 },
        { status: "Under Review", count: 8 },
        { status: "Callback Verification", count: 8 },
        { status: "Approved", count: 45 },
        { status: "Completed", count: 67 },
        { status: "Rejected", count: 11 },
      ],
      monthlyTrend: [
        { month: "Jan", submitted: 12, completed: 10 },
        { month: "Feb", submitted: 18, completed: 15 },
        { month: "Mar", submitted: 25, completed: 22 },
        { month: "Apr", submitted: 22, completed: 20 },
        { month: "May", submitted: 30, completed: 28 },
        { month: "Jun", submitted: 35, completed: 32 },
      ],
    };

    set({ metrics: mockMetrics, isLoading: false });
  },
}));

// Helper function to generate mock instructions
function generateMockInstructions(): Instruction[] {
  const types = [
    "account_opening",
    "funds_transfer",
    "trade_settlement",
  ] as const;
  const statuses = [
    "draft",
    "submitted",
    "under_review",
    "callback_verification",
    "approved",
    "rejected",
    "completed",
  ] as const;
  const currencies = ["USD", "EUR", "GBP", "NGN"];

  return Array.from({ length: 20 }, (_, i) => ({
    id: `ins-${i + 1}`,
    instructionId: `INS-2024-${String(i + 1).padStart(4, "0")}`,
    type: types[Math.floor(Math.random() * types.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    clientAccountNumber: `ACC-${Math.floor(Math.random() * 1000000)}`,
    currency: currencies[Math.floor(Math.random() * currencies.length)],
    amount: Math.floor(Math.random() * 1000000) + 10000,
    valueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    description: `Sample instruction ${i + 1}`,
    supportingDocuments: [],
    submittedBy: `user-${Math.floor(Math.random() * 5) + 1}`,
    submittedByName: [
      "Adefusi Maker",
      "Oluwakemi Verifier",
      "Michael Authorizer",
    ][Math.floor(Math.random() * 3)],
    submittedAt: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    comments: [],
    auditTrail: [],
    organizationId: "org1",
    organizationName: "Global Investments Ltd",
    createdAt: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}
