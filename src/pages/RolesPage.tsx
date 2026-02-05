import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ManagePermissionsModal } from '../components/modals/ManagePermissionsModal';
import { Check, Shield, User, Lock, Settings } from 'lucide-react';
import { PERMISSION_KEYS } from '../lib/mockData';
import { checkUserPermission } from '../hooks/permissions';
import { useGetClinicQuery, usePatchClinicPermissionsMutation } from '../redux/api/clientsApi';

export function RolesPage() {
    const { data: clinicResponse, isLoading: clinicLoading, isError: clinicError, refetch } = useGetClinicQuery();
    const [patchClinicPermissions, { isLoading: isSavingPermissions }] = usePatchClinicPermissionsMutation();
    const clinic = clinicResponse?.response?.data;

    // Calculate dynamic counts
    const clinicianCount = clinic?.members?.filter(m => m.role === 'clinician').length || 0;
    const adminCount = clinic?.members?.filter(m => m.role === 'admin' || m.role === 'superAdmin').length || 1;

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

    const clinicianPermissionsObj = clinic?.permissions || {};
    const clinicianHasPermission = (permissionId: string) =>
        checkUserPermission({ permissions: clinicianPermissionsObj }, permissionId);

    const clinicianEnabledLabels = useMemo(
        () =>
            PERMISSION_KEYS.filter(p => clinicianHasPermission(p.id))
                .slice(0, 3)
                .map(p => p.label),
        [clinic?.permissions]
    );

    const permissionToClinicianKey: Record<string, string> = {
        page_dashboard: 'clinician_dashboard',
        page_roles: 'clinician_permissions',
        page_ai: 'clinician_ai',
        page_clients: 'clinician_clients',
        page_clinic: 'clinician_clinicians',
        page_invoices: 'clinician_invoices',
        page_sessions: 'clinician_sessions',
        page_forms: 'clinician_forms',
        page_money: 'clinician_money',
        page_subscription: 'clinician_subscription',
        page_integrations: 'clinician_integrations',
    };

    const clinicianInitialPermissions = useMemo(
        () => PERMISSION_KEYS.filter(p => clinicianHasPermission(p.id)).map(p => p.id),
        [clinic?.permissions]
    );

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
                                            {clinicianEnabledLabels.map(label => (
                                                <li key={label} className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-600" /> {label}
                                                </li>
                                            ))}
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
                {clinicLoading && (
                    <div className="text-sm text-muted-foreground">Loading clinic permissions...</div>
                )}
                {clinicError && (
                    <div className="text-sm text-destructive">Failed to load clinic permissions.</div>
                )}
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
                                    const adminHas = true;
                                    const clinicianHas = clinicianHasPermission(p.id);

                                    return (
                                        <tr key={p.id} className="hover:bg-muted/5">
                                            <td className="py-3 px-4 font-medium">{p.label}</td>

                                            {/* ADMIN COLUMN */}
                                            <td className="py-3 px-4 text-center">
                                                {adminHas ? (
                                                    <div className="flex justify-center"><Check className="h-5 w-5 text-green-600" /></div>
                                                ) : (
                                                    <div className="flex justify-center"><Lock className="h-4 w-4 text-muted-foreground/40" /></div>
                                                )}
                                            </td>

                                            {/* CLINICIAN COLUMN */}
                                            <td className="py-3 px-4 text-center">
                                                {clinicianHas ? (
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
                    description={`Select which pages Clinicians can access.`}
                    initialPermissions={selectedRole === 'Clinician' ? clinicianInitialPermissions : []}
                    onSave={async (selectedPermissions) => {
                        if (selectedRole !== 'Clinician') {
                            setIsPermissionModalOpen(false);
                            return;
                        }

                        const payload: Record<string, boolean> = {};
                        PERMISSION_KEYS.forEach((perm) => {
                            const key = permissionToClinicianKey[perm.id];
                            if (key) {
                                payload[key] = selectedPermissions.includes(perm.id);
                            }
                        });

                        await patchClinicPermissions(payload).unwrap();
                        await refetch();
                    }}
                />
            )}
        </div>
    );
}
