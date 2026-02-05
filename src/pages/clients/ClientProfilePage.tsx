import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Save, User, Shield, AlertCircle, Clock, Video } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DatePicker } from '../../components/ui/DatePicker';
import { Select } from '../../components/ui/Select';
import { useUpdateClientMutation } from '../../redux/api/clientsApi';

type ClientOutletContext = {
    client: {
        id: string;
        name: string;
        email: string;
        phone: string;
        status: 'Active' | 'Waiting List' | 'Inactive';
    };
    clientRaw: any;
};

export function ClientProfilePage() {
    const { client, clientRaw } = useOutletContext<ClientOutletContext>();
    const [updateClient, { isLoading }] = useUpdateClientMutation();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        countryCode: '',
        gender: '',
        status: '',
        address: {
            street: '',
            city: '',
            state: '',
            zip: '',
            country: ''
        },
        insuranceProvider: '',
        insuranceNumber: '',
        insuranceAuthorizationNumber: '',
        medicalAlerts: ''
    });
    const [dob, setDob] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (clientRaw) {
            const rawDob = clientRaw?.dateOfBirth ? new Date(clientRaw.dateOfBirth) : undefined;
            setDob(rawDob && !isNaN(rawDob.getTime()) ? rawDob : undefined);
            
            setFormData({
                firstName: clientRaw?.firstName || client.name.split(' ')[0] || '',
                lastName: clientRaw?.lastName || client.name.split(' ')[1] || '',
                email: clientRaw?.email || client.email || '',
                phoneNumber: clientRaw?.phoneNumber || client.phone || '',
                countryCode: clientRaw?.countryCode || '+1',
                gender: clientRaw?.gender || '',
                status: clientRaw?.status || 'active',
                address: {
                    street: clientRaw?.address?.street || '',
                    city: clientRaw?.address?.city || '',
                    state: clientRaw?.address?.state || '',
                    zip: clientRaw?.address?.zip || '',
                    country: clientRaw?.address?.country || ''
                },
                insuranceProvider: clientRaw?.insuranceProvider || '',
                insuranceNumber: clientRaw?.insuranceNumber || '',
                insuranceAuthorizationNumber: clientRaw?.insuranceAuthorizationNumber || '',
                medicalAlerts: clientRaw?.medicalAlerts || ''
            });
        }
    }, [clientRaw, client]);

    if (!client) return null;

    const appointments = (clientRaw?.appointments || []).map((apt: any) => {
        const start = apt?.startTime ? new Date(apt.startTime) : null;
        const end = apt?.endTime ? new Date(apt.endTime) : null;
        const duration = start && end ? Math.round((end.getTime() - start.getTime()) / 60000) : 0;
        return {
            id: apt.id,
            date: start ? start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
            time: start ? start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '-',
            duration: duration || 0,
            type: apt.meetingType ? apt.meetingType.toUpperCase() : 'Session',
            status: apt.status || 'pending',
            videoLink: apt.zoomJoinUrl || 'https://zoom.us'
        };
    });



    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.firstName || !formData.lastName) {
            alert('First name and last name are required');
            return;
        }
        
        if (!formData.email) {
            alert('Email is required');
            return;
        }
        
        try {
            const updateData = {
                clientId: client.id,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber || null,
                countryCode: formData.countryCode || '+1',
                dateOfBirth: dob ? dob.toISOString().split('T')[0] : null, // Send only date part
                gender: formData.gender ? formData.gender.toLowerCase() : null,
                status: formData.status ? formData.status.toLowerCase() : 'active',
                assignedClinicianId: clientRaw?.assignedClinicianId || null,
                address: formData.address
            };

            console.log('Updating client with data:', updateData);
            const response = await updateClient(updateData).unwrap();
            console.log('Update response:', response);
            
            if (response.success) {
                alert('Client profile updated successfully!');
            }
        } catch (error: any) {
            console.error('Failed to update client:', error);
            const errorMessage = error?.data?.message || error?.message || 'Failed to update client profile';
            alert(errorMessage);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddressChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value
            }
        }));
    };

    return (
        <form onSubmit={handleSave} className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-4">
                    {/* Personal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Basic identity details required for identification and billing.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-5">
                            <Input 
                                label="First Name" 
                                value={formData.firstName} 
                                onChange={(e) => handleInputChange('firstName', e.target.value)}
                                className="h-11 rounded-xl bg-secondary/30" 
                            />
                            <Input 
                                label="Last Name" 
                                value={formData.lastName} 
                                onChange={(e) => handleInputChange('lastName', e.target.value)}
                                className="h-11 rounded-xl bg-secondary/30" 
                            />
                            <DatePicker label="Date of Birth" date={dob} setDate={setDob} triggerClassName="h-11 rounded-xl" />
                            <Select
                                label="Gender Identity"
                                value={formData.gender}
                                onChange={(e) => handleInputChange('gender', e.target.value)}
                                triggerClassName="h-11 rounded-xl"
                                options={[
                                    { value: 'female', label: 'Female' },
                                    { value: 'male', label: 'Male' },
                                    { value: 'non-binary', label: 'Non-binary' }
                                ]}
                            />
                        </CardContent>
                    </Card>

                    {/* Address */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Address & Location</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4 sm:p-5">
                            <Input 
                                label="Street Address" 
                                value={formData.address.street} 
                                onChange={(e) => handleAddressChange('street', e.target.value)}
                                className="h-11 rounded-xl bg-secondary/30" 
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input 
                                    label="City" 
                                    value={formData.address.city} 
                                    onChange={(e) => handleAddressChange('city', e.target.value)}
                                    className="h-11 rounded-xl bg-secondary/30" 
                                />
                                <Input 
                                    label="State/Province" 
                                    value={formData.address.state} 
                                    onChange={(e) => handleAddressChange('state', e.target.value)}
                                    className="h-11 rounded-xl bg-secondary/30" 
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input 
                                    label="Postal Code" 
                                    value={formData.address.zip} 
                                    onChange={(e) => handleAddressChange('zip', e.target.value)}
                                    className="h-11 rounded-xl bg-secondary/30" 
                                />
                                <Input 
                                    label="Country" 
                                    value={formData.address.country} 
                                    onChange={(e) => handleAddressChange('country', e.target.value)}
                                    className="h-11 rounded-xl bg-secondary/30" 
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {/* Upcoming Appointments Card */}
                    <Card className="border-primary/20 shadow-md shadow-primary/5">
                        <CardHeader className="pb-3 text-primary/80">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Upcoming Sessions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {appointments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No upcoming sessions found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map(apt => (
                                        <div key={apt.id} className="p-3 rounded-lg border border-border/50 bg-muted/5 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-semibold text-sm">{apt.date}</p>
                                            <p className="text-xs text-muted-foreground">{apt.time} ({apt.duration} min)</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px]">{apt.status}</Badge>
                                    </div>
                                    <p className="text-xs font-medium text-primary">{apt.type}</p>
                                    <Button
                                                size="sm"
                                                variant="secondary"
                                                className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                                onClick={() => window.open(apt.videoLink || 'https://zoom.us', '_blank')}
                                            >
                                                <Video className="h-4 w-4 mr-2" />
                                                Join Zoom
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Insurance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                Insurance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input 
                                label="Provider" 
                                value={formData.insuranceProvider} 
                                onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                                className="h-11 rounded-xl" 
                            />
                            <Input 
                                label="Member ID" 
                                value={formData.insuranceNumber} 
                                onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                                className="h-11 rounded-xl" 
                            />
                            <Input 
                                label="Authorisation Code" 
                                value={formData.insuranceAuthorizationNumber} 
                                onChange={(e) => handleInputChange('insuranceAuthorizationNumber', e.target.value)}
                                className="h-11 rounded-xl" 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Medical Alert */}
            <Card className="border-l-4 border-l-red-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Medical Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                        placeholder="List any critical allergies, conditions, or risks here..."
                        value={formData.medicalAlerts}
                        onChange={(e) => handleInputChange('medicalAlerts', e.target.value)}
                    />
                </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
                <Button type="submit" size="default" isLoading={isLoading} className="w-full sm:w-auto px-10 h-11 rounded-xl">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
