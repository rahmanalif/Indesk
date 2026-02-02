import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ManagePermissionsModal } from '../components/modals/ManagePermissionsModal';
import { Check, Shield, User, Lock, Settings } from 'lucide-react';
import { MOCK_CLINICIANS, PERMISSION_KEYS } from '../lib/mockData';
import { useData } from '../context/DataContext';

export function RolesPage() {
    const { globalPermissions, updateGlobalPermissions } = useData();
    const [_lastUpdate, setLastUpdate] = useState(Date.now());

    // Calculate dynamic counts
    const clinicianCount = MOCK_CLINICIANS.length;
    // Assume 1 admin for now or define MOCK_ADMINS
    const adminCount = 1;

    // Dynamic Roles Data
    const roles = [
        { id: 1, name: 'Admin', users: adminCount, access: 'all', desc: 'Full system control and access to all data.' },
        { id: 2, name: 'Clinician', users: clinicianCount, access: 'Restricted', desc: 'Can only access pages enabled below.' },
    ];

    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleManagePermissions = (roleName: string) => {
        setSelectedRole(roleName);
        setIsPermissionModalOpen(true);
    };

    const handlePermissionSave = (newPermissions: string[]) => {
        if (selectedRole) {
            updateGlobalPermissions(selectedRole, newPermissions);
            setLastUpdate(Date.now());
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Roles & Permissions</h1>
                    <p className="text-muted-foreground mt-1">Manage system access levels.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {roles.map(role => (
                    <Card key={role.id} className={`shadow-md hover:shadow-lg transition-all ${role.name === 'Admin' ? 'border-primary/20 bg-primary/5' : ''}`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    {role.name === 'Admin' ? <Shield className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-muted-foreground" />}
                                    {role.name}
                                </CardTitle>
                                <Badge variant="outline">{role.users} Users</Badge>
                            </div>
                            <CardDescription className="mt-2">{role.desc}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="pt-4 border-t border-border/50">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Key Capabilities</h4>
                                <ul className="space-y-2 text-sm">
                                    {role.name === 'Admin' ? (
                                        <>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Full access to specific dashboards</li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> Manage all billing & subscriptions</li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> User & Role management</li>
                                        </>
                                    ) : (
                                        <>
                                            {/* Show dynamic top 3 enabled permissions */}
                                            {(globalPermissions['Clinician'] || []).slice(0, 3).map(permId => {
                                                const label = PERMISSION_KEYS.find(k => k.id === permId)?.label || permId;
                                                return <li key={permId} className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600" /> {label}</li>
                                            })}
                                            {/* Show locked example */}
                                            <li className="flex items-center gap-2 text-muted-foreground"><Lock className="h-3 w-3" /> No access to restricted areas</li>
                                        </>
                                    )}
                                </ul>
                            </div>

                            {role.name === 'Clinician' && (
                                <div className="mt-6 pt-4 border-t border-border/50">
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={() => handleManagePermissions(role.name)}
                                    >
                                        <Settings className="h-4 w-4" />
                                        Manage Permission
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Access Matrix</CardTitle>
                    <CardDescription>Detailed permission breakdown (Updates Automatically)</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="py-3 px-4 font-medium text-muted-foreground w-1/3">Permission Context</th>
                                    <th className="py-3 px-4 text-center font-semibold text-primary">Admin</th>
                                    <th className="py-3 px-4 text-center font-semibold text-foreground">Clinician</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {PERMISSION_KEYS.map(p => {
                                    const adminHasIds = globalPermissions['Admin'] || [];
                                    const clinicianHasIds = globalPermissions['Clinician'] || [];

                                    return (
                                        <tr key={p.id} className="hover:bg-muted/5">
                                            <td className="py-3 px-4 font-medium">{p.label}</td>

                                            {/* ADMIN COLUMN */}
                                            <td className="py-3 px-4 text-center">
                                                {adminHasIds.includes(p.id) ? (
                                                    <div className="flex justify-center"><Check className="h-5 w-5 text-green-600" /></div>
                                                ) : (
                                                    <div className="flex justify-center"><Lock className="h-4 w-4 text-muted-foreground/40" /></div>
                                                )}
                                            </td>

                                            {/* CLINICIAN COLUMN */}
                                            <td className="py-3 px-4 text-center">
                                                {clinicianHasIds.includes(p.id) ? (
                                                    <div className="flex justify-center"><Check className="h-5 w-5 text-green-600" /></div>
                                                ) : (
                                                    <div className="flex justify-center"><Lock className="h-4 w-4 text-muted-foreground/40" /></div>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {selectedRole && (
                <ManagePermissionsModal
                    isOpen={isPermissionModalOpen}
                    onClose={() => setIsPermissionModalOpen(false)}
                    title={`Manage Role: ${selectedRole}`}
                    description={`Select which pages ${selectedRole}s can access.`}
                    initialPermissions={globalPermissions[selectedRole] || []}
                    onSave={handlePermissionSave}
                />
            )}
        </div>
    );
}
