import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus,
  Building2,
  Mail,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { User as UserType, UserRole } from '@/types';

const roleColors: Record<UserRole, string> = {
  maker: 'bg-blue-500',
  verifier: 'bg-yellow-500',
  authorizer: 'bg-purple-500',
  gis_processor: 'bg-green-500',
  admin: 'bg-red-500',
};

const roleLabels: Record<UserRole, string> = {
  maker: 'Client Maker',
  verifier: 'Client Verifier',
  authorizer: 'Client Authorizer',
  gis_processor: 'GIS Processor',
  admin: 'Administrator',
};

// Mock organizations
const organizations = [
  { id: 'org1', name: 'Global Investments Ltd' },
  { id: 'org2', name: 'UBA GIS Team' },
  { id: 'org3', name: 'Apex Capital' },
  { id: 'org4', name: 'Summit Finance' },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '' as UserRole | '',
    organizationId: '',
  });

  useEffect(() => {
    // Mock users data
    const mockUsers: UserType[] = [
      {
        id: '1',
        email: 'maker@client.com',
        name: 'John Maker',
        role: 'maker',
        organizationId: 'org1',
        organizationName: 'Global Investments Ltd',
        isActive: true,
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: '2',
        email: 'verifier@client.com',
        name: 'Sarah Verifier',
        role: 'verifier',
        organizationId: 'org1',
        organizationName: 'Global Investments Ltd',
        isActive: true,
        lastLogin: new Date(Date.now() - 7200000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
      },
      {
        id: '3',
        email: 'authorizer@client.com',
        name: 'Michael Authorizer',
        role: 'authorizer',
        organizationId: 'org1',
        organizationName: 'Global Investments Ltd',
        isActive: true,
        lastLogin: new Date(Date.now() - 1800000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
      },
      {
        id: '4',
        email: 'processor@gis.com',
        name: 'Lisa Processor',
        role: 'gis_processor',
        organizationId: 'org2',
        organizationName: 'UBA GIS Team',
        isActive: true,
        lastLogin: new Date(Date.now() - 900000).toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
      {
        id: '5',
        email: 'admin@uba.com',
        name: 'Admin User',
        role: 'admin',
        organizationId: 'org2',
        organizationName: 'UBA GIS Team',
        isActive: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ];

    setUsers(mockUsers);
    setIsLoading(false);
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.organizationId) {
      toast.error('Please fill in all fields');
      return;
    }

    const org = organizations.find(o => o.id === newUser.organizationId);
    const user: UserType = {
      id: Math.random().toString(36).substr(2, 9),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as UserRole,
      organizationId: newUser.organizationId,
      organizationName: org?.name || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [user, ...prev]);
    setCreateDialog(false);
    setNewUser({ name: '', email: '', role: '', organizationId: '' });
    toast.success('User created successfully');
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    ));
    toast.success('User status updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-white/50 mt-1">
            Manage system users and their permissions
          </p>
        </div>
        <Button 
          onClick={() => setCreateDialog(true)}
          className="bg-[#D92027] hover:bg-[#B51C22] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-sm text-white/50">Total Users</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-green-500">
              {users.filter(u => u.isActive).length}
            </p>
            <p className="text-sm text-white/50">Active</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-red-500">
              {users.filter(u => !u.isActive).length}
            </p>
            <p className="text-sm text-white/50">Inactive</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-500">
              {users.filter(u => u.lastLogin && new Date(u.lastLogin) > new Date(Date.now() - 86400000)).length}
            </p>
            <p className="text-sm text-white/50">Active Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">All Users</CardTitle>
          <CardDescription className="text-white/50">
            {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full bg-white/10" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      roleColors[user.role]
                    )}>
                      <span className="text-lg font-semibold text-white">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{user.name}</h3>
                        {user.isActive ? (
                          <Badge variant="outline" className="border-green-500 text-green-500 text-xs">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-500 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/50 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {user.organizationName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={cn("text-white", roleColors[user.role])}>
                      {roleLabels[user.role]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4 text-white/60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10">
                        <DropdownMenuItem 
                          onClick={() => toggleUserStatus(user.id)}
                          className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                        >
                          {user.isActive ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2 text-red-500" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="bg-[#1A1A1A] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New User</DialogTitle>
            <DialogDescription className="text-white/50">
              Add a new user to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white">Full Name</Label>
              <Input
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email Address</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Role</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(v) => setNewUser(prev => ({ ...prev, role: v as UserRole }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Organization</Label>
              <Select 
                value={newUser.organizationId} 
                onValueChange={(v) => setNewUser(prev => ({ ...prev, organizationId: v }))}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-white/10">
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCreateDialog(false)}
              className="border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser}
              className="bg-[#D92027] hover:bg-[#B51C22] text-white"
            >
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
