import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Shield, Key, Calendar } from 'lucide-react';
import { useState } from 'react';
import { ChangePasswordModal } from '../components/modals/ChangePasswordModal';
import { useData } from '../context/DataContext';
import { useGetSelfProfileQuery } from '../redux/api/authApi';
import { EditProfileModal } from '../components/modals/EditProfileModal';

export function UserProfilePage() {
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const { currentUser } = useData();
    const { data: selfProfileResponse, isLoading, refetch } = useGetSelfProfileQuery();

    const profile = selfProfileResponse?.response?.data;
    const apiOrigin = (() => {
        try {
            return new URL(import.meta.env.VITE_AUTH_API_BASE_URL).origin;
        } catch {
            return '';
        }
    })();
    const avatarSrc = (() => {
        const avatar = profile?.avatar;
        if (!avatar) return undefined;
        if (avatar.startsWith('http')) return avatar;
        if (!apiOrigin) return avatar;

        // Backend may return "/uploads/..." while files are served under "/public/uploads/..."
        if (avatar.startsWith('/uploads/')) {
            return `${apiOrigin}/public${avatar}`;
        }

        return `${apiOrigin}${avatar}`;
    })();
    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim() || currentUser?.name || 'User Profile';
    const displayRole = profile?.clinicMemberships?.[0]?.role || profile?.role || currentUser?.role || 'User';
    const displayEmail = profile?.email || currentUser?.email || 'N/A';
    const displayUserId = profile?.id || currentUser?.id || '000';
    const displayPhone = profile?.phoneNumber
        ? `${profile.countryCode || ''}${profile.phoneNumber}`
        : 'N/A';
    const joinedDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A';
    const lastLogin = profile?.lastLoginAt
        ? new Date(profile.lastLoginAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'N/A';
    const isClinician = String(displayRole).toLowerCase().includes('clinician');
    const titleRole = isClinician ? 'Clinician Profile' : 'Admin Profile';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{titleRole}</h1>
                <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
                <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={() => setIsEditProfileOpen(true)}>
                        Edit Profile
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Info */}
                <Card className="lg:col-span-1 shadow-lg border-primary/10">
                    <CardContent className="pt-8 flex flex-col items-center text-center">
                        <Avatar
                            src={avatarSrc}
                            fallback={fullName?.[0] || 'U'}
                            className="w-32 h-32 text-4xl bg-primary/10 text-primary border-4 border-white shadow-xl mb-4"
                        />
                        <h2 className="text-2xl font-bold text-foreground">{fullName}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={String(displayRole).toLowerCase().includes('admin') ? 'success' : 'secondary'} className={String(displayRole).toLowerCase().includes('admin') ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}>
                                <Shield className="w-3 h-3 mr-1" /> {displayRole}
                            </Badge>
                            {isClinician && <Badge variant="outline">Therapist</Badge>}
                        </div>

                        <div className="w-full mt-8 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-md shadow-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="text-left w-full overflow-hidden">
                                        <p className="text-xs text-muted-foreground font-medium uppercase">Email Address</p>
                                        <p className="text-sm font-semibold truncate max-w-[200px]" title={displayEmail}>{displayEmail}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-md shadow-sm text-muted-foreground">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-muted-foreground font-medium uppercase">User ID</p>
                                        <p className="text-sm font-semibold">#{displayUserId}</p>
                                    </div>
                                </div>
                            </div>
                            {isLoading && (
                                <p className="text-xs text-muted-foreground text-left">Loading profile...</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Details & Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>System access and history</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                <p className="font-medium">{displayPhone}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                                <p className="font-medium">{profile?.isEmailVerified ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <p className="font-medium">{joinedDate}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                                <p className="font-mono text-sm">{lastLogin}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Manage password and authentication</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Password</p>
                                        <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
                                    </div>
                                </div>
                                <Button variant="outline" onClick={() => setIsPasswordOpen(true)}>Change Password</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <ChangePasswordModal isOpen={isPasswordOpen} onClose={() => setIsPasswordOpen(false)} />
            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                firstName={profile?.firstName || ''}
                lastName={profile?.lastName || ''}
                onUpdated={() => {
                    refetch();
                }}
            />
        </div>
    );
}
