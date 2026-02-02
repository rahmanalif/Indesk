import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Shield, Key, Calendar } from 'lucide-react';
import { useState } from 'react';
import { ChangePasswordModal } from '../components/modals/ChangePasswordModal';
import { useData } from '../context/DataContext';

export function UserProfilePage() {
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const { currentUser } = useData();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{currentUser?.role === 'Clinician' ? 'Clinician Profile' : 'Admin Profile'}</h1>
                <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Profile Info */}
                <Card className="lg:col-span-1 shadow-lg border-primary/10">
                    <CardContent className="pt-8 flex flex-col items-center text-center">
                        <Avatar
                            fallback={currentUser?.name?.[0] || 'U'}
                            className="w-32 h-32 text-4xl bg-primary/10 text-primary border-4 border-white shadow-xl mb-4"
                        />
                        <h2 className="text-2xl font-bold text-foreground">{currentUser?.name || 'User Profile'}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant={currentUser?.role === 'Admin' ? 'success' : 'secondary'} className={currentUser?.role === 'Admin' ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}>
                                <Shield className="w-3 h-3 mr-1" /> {currentUser?.role || 'User'}
                            </Badge>
                            {currentUser?.role === 'Clinician' && <Badge variant="outline">Therapist</Badge>}
                        </div>

                        <div className="w-full mt-8 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-md shadow-sm text-muted-foreground">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="text-left w-full overflow-hidden">
                                        <p className="text-xs text-muted-foreground font-medium uppercase">Email Address</p>
                                        <p className="text-sm font-semibold truncate max-w-[200px]" title={currentUser?.email}>{currentUser?.email || 'N/A'}</p>
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
                                        <p className="text-sm font-semibold">#{currentUser?.id || '000'}</p>
                                    </div>
                                </div>
                            </div>
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
                                <label className="text-sm font-medium text-muted-foreground">Department</label>
                                <p className="font-medium">Clinical Psychology</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                                <p className="font-medium">ID-882910</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Join Date</label>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <p className="font-medium">Jan 12, 2022</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                                <p className="font-mono text-sm">Today, 09:41 AM</p>
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
        </div>
    );
}
