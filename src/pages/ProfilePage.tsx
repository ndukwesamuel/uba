import { useState } from 'react';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Key,
  Edit2,
  CheckCircle,
  Camera
} from 'lucide-react';
import { useAuthStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const roleLabels: Record<string, string> = {
  maker: 'Client Maker',
  verifier: 'Client Verifier',
  authorizer: 'Client Authorizer',
  gis_processor: 'GIS Processor',
  admin: 'Administrator',
};

const roleColors: Record<string, string> = {
  maker: 'bg-blue-500',
  verifier: 'bg-yellow-500',
  authorizer: 'bg-purple-500',
  gis_processor: 'bg-green-500',
  admin: 'bg-red-500',
};

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    // Simulate save
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password changed successfully');
    setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-white/50 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white",
                roleColors[user?.role || 'maker']
              )}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#D92027] rounded-full flex items-center justify-center hover:bg-[#B51C22] transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Info */}
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                <Badge className={cn("text-white", roleColors[user?.role || 'maker'])}>
                  {roleLabels[user?.role || 'maker']}
                </Badge>
                <Badge variant="outline" className="border-green-500 text-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-white/50">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {user?.organizationName}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/10"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <User className="w-5 h-5 text-[#D92027]" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-white/50">
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Full Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email Address</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Organization</Label>
              <Input
                value={user?.organizationName}
                disabled
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Role</Label>
              <Input
                value={roleLabels[user?.role || 'maker']}
                disabled
                className="bg-white/5 border-white/10 text-white disabled:opacity-50"
              />
            </div>
            {isEditing && (
              <Button 
                onClick={handleSave}
                className="w-full bg-[#D92027] hover:bg-[#B51C22] text-white"
              >
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-[#1A1A1A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#D92027]" />
              Security
            </CardTitle>
            <CardDescription className="text-white/50">
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Current Password</Label>
              <Input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">New Password</Label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Confirm New Password</Label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <Button 
              onClick={handlePasswordChange}
              disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
              className="w-full bg-[#D92027] hover:bg-[#B51C22] text-white disabled:opacity-50"
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>

            <Separator className="bg-white/10" />

            {/* Security Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-white">Security Settings</h3>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-white/50">Add an extra layer of security</p>
                </div>
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  Coming Soon
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">Session Management</p>
                  <p className="text-sm text-white/50">Manage active sessions</p>
                </div>
                <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="bg-[#1A1A1A] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Activity Summary</CardTitle>
          <CardDescription className="text-white/50">
            Your recent activity in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <p className="text-3xl font-bold text-[#D92027]">12</p>
              <p className="text-sm text-white/50 mt-1">Instructions Created</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-500">8</p>
              <p className="text-sm text-white/50 mt-1">Approved</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-500">24</p>
              <p className="text-sm text-white/50 mt-1">Total Logins</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
