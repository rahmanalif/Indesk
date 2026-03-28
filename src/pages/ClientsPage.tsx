import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { CreateClientModal } from '../components/modals/CreateClientModal';
import { ClientsReportModal } from '../components/modals/ClientsReportModal';
import { Pagination } from '../components/ui/Pagination';
import { useGetClientsQuery, useCreateClientMutation, type CreateClientRequest } from '../redux/api/clientsApi';

type ClientRow = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Waiting List' | 'Inactive';
  nextApt: string;
  clinician: string;
  rawClient: any;
};

export function ClientsPage() {
  const navigate = useNavigate();
  
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Waiting List' | 'Inactive'>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'status' | 'nextApt'; direction: 'asc' | 'desc' } | null>(null);
  
  const statusParam =
    statusFilter === 'All'
      ? undefined
      : statusFilter === 'Waiting List'
        ? 'waiting'
        : statusFilter.toLowerCase();

  const { data: clientsData, isLoading, isError, error, refetch } = useGetClientsQuery({
    page,
    limit: 10,
    status: statusParam,
    search: searchQuery || undefined,
  });
  const [createClient, { isLoading: isCreatingClient, error: createClientError }] = useCreateClientMutation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const itemsPerPage = 10;

  const formatNextAppointment = (appointments: any[] | undefined) => {
    if (!appointments || appointments.length === 0) return 'Not scheduled';

    const upcoming = appointments
      .filter((apt) => apt?.startTime)
      .map((apt) => ({ ...apt, start: new Date(apt.startTime) }))
      .filter((apt) => !isNaN(apt.start.getTime()))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (upcoming.length === 0) return 'Not scheduled';

    const next = upcoming[0].start;
    const dateStr = next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const timeStr = next.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dateStr}, ${timeStr}`;
  };

  const clients = useMemo<ClientRow[]>(() => {
    if (!clientsData?.response?.data?.docs) return [];

    return clientsData.response.data.docs.map((client: any) => {
      const clinicianUser = client.assignedClinician?.user;
      const clinicianName = clinicianUser
        ? `Dr. ${clinicianUser.firstName} ${clinicianUser.lastName}`.trim()
        : 'Not assigned';

      const statusMap: Record<string, 'Active' | 'Waiting List' | 'Inactive'> = {
        active: 'Active',
        waiting: 'Waiting List',
        inactive: 'Inactive'
      };

      return {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`.trim(),
        email: client.email,
        status: statusMap[client.status] || 'Active',
        nextApt: formatNextAppointment(client.appointments),
        clinician: clinicianName,
        rawClient: client
      };
    });
  }, [clientsData]);

  // -- Logic --
  const filteredAndSortedClients = useMemo(() => {
    let result = [...clients];

    // 1. Additional client-side search (if needed beyond API search)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(client =>
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      );
    }

    // 2. Additional client-side filter (if needed)
    if (statusFilter !== 'All') {
      result = result.filter(client => client.status === statusFilter);
    }

    // 3. Client-side sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [clients, searchQuery, statusFilter, sortConfig]);

  // -- Pagination --
  const totalPages = Math.ceil(filteredAndSortedClients.length / itemsPerPage);
  const displayedClients = filteredAndSortedClients.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSort = (key: 'name' | 'status' | 'nextApt') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle API pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle create client
  const handleCreateClient = async (clientData: CreateClientRequest) => {
    try {
      await createClient(clientData).unwrap();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create client:', error);
      // Handle error (show toast, etc.)
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>Error loading clients: {(error as any)?.data?.message || 'Unknown error'}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Clients
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your client base and waiting list.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" className="gap-2" onClick={() => setIsExportModalOpen(true)}>
          <Download className="h-4 w-4" />
          Export Information
        </Button>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>
    </div>

    {/* Filters & Search */}
    <div className="flex flex-col lg:flex-row gap-4 items-end bg-white p-6 rounded-3xl border border-primary/10 shadow-sm animate-in slide-in-from-top-4 duration-500">
      <div className="w-full lg:flex-1">
        <Input
          label="Search Clients"
          placeholder="Filter by name, email, or status..."
          icon={<Search className="h-4 w-4" />}
          className="border-none shadow-inner"
          value={searchQuery}
          onChange={e => { 
            setSearchQuery(e.target.value); 
            setPage(1); 
          }}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <div className="w-full sm:w-48">
          <Select
            label="Filter Status"
            value={statusFilter}
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Active', label: 'Active' },
              { value: 'Waiting List', label: 'Waiting List' },
              { value: 'Inactive', label: 'Inactive' }
            ]}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            label="Sort By"
            value={sortConfig?.key || 'name'}
            options={[
              { value: 'name', label: 'Client Name' },
              { value: 'status', label: 'Status' },
              { value: 'nextApt', label: 'Next Appointment' }
            ]}
            onChange={(e) => {
              handleSort(e.target.value as any);
            }}
          />
        </div>
      </div>
    </div>

    {/* Client List */}
    <div className="space-y-4">
      {/* Desktop Table View */}
      <Card className="hidden md:block border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('name')}>Name</th>
                <th className="px-6 py-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('status')}>Status</th>
                <th className="px-6 py-4 cursor-pointer hover:text-foreground" onClick={() => handleSort('nextApt')}>Next Appointment</th>
                <th className="px-6 py-4">Clinician</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white">
              {displayedClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No clients found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayedClients.map(client => <tr key={client.id} className="hover:bg-muted/5 transition-colors cursor-pointer group" onClick={() => navigate(`/clients/${client.id}`)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar fallback={client.name.split(' ').map(n => n[0]).join('')} className="bg-primary/10 text-primary" />
                      <div>
                        <div className="font-medium text-foreground">
                          {client.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {client.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={client.status === 'Active' ? 'success' : client.status === 'Waiting List' ? 'warning' : 'secondary'}>
                      {client.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {client.nextApt}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar fallback="DR" size="sm" className="h-6 w-6" />
                      <span className="text-muted-foreground">
                        {client.clinician}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => navigate(`/clients/${client.id}/details`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>)
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {displayedClients.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 bg-white rounded-xl border border-border/50">
            No clients found.
          </div>
        ) : (
          displayedClients.map(client => (
            <Card key={client.id} className="p-4 flex flex-col gap-4 active:scale-[0.98] transition-all" onClick={() => navigate(`/clients/${client.id}`)}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar fallback={client.name.split(' ').map(n => n[0]).join('')} className="bg-primary/10 text-primary h-10 w-10" />
                  <div>
                    <div className="font-medium text-foreground">
                      {client.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {client.email}
                    </div>
                  </div>
                </div>
                <Badge variant={client.status === 'Active' ? 'success' : client.status === 'Waiting List' ? 'warning' : 'secondary'}>
                  {client.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Next Apt</div>
                  <div className="font-medium">{client.nextApt}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Clinician</div>
                  <div className="flex items-center gap-2">
                    <Avatar fallback="DR" size="sm" className="h-5 w-5" />
                    <span className="truncate">{client.clinician}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="bg-white px-4 py-2 rounded-xl border border-border/50 md:border-none md:shadow-none md:bg-transparent md:p-0 md:rounded-none">
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      </div>
    </div>

    <CreateClientModal 
      isOpen={isCreateModalOpen} 
      onClose={() => setIsCreateModalOpen(false)}
      onSubmit={handleCreateClient}
      isLoading={isCreatingClient}
      errorMessage={(createClientError as any)?.data?.message}
    />
    <ClientsReportModal
      isOpen={isExportModalOpen}
      onClose={() => setIsExportModalOpen(false)}
      clients={filteredAndSortedClients}
    />
  </div>;
}
