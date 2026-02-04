import { useState } from 'react';
import { Plus, Download, Mail, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { InvoicePreviewModal } from '../components/modals/InvoicePreviewModal';
import { Pagination } from '../components/ui/Pagination';
import { DatePicker } from '../components/ui/DatePicker';
import { useGetInvoiceStatsQuery, useGetInvoicesQuery } from '../redux/api/clientsApi';

export function InvoicesPage() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const itemsPerPage = 10;
  const { data: invoicesResponse, isLoading, isError, refetch } = useGetInvoicesQuery({
    page: currentPage,
    limit: itemsPerPage,
  });
  const { data: statsResponse } = useGetInvoiceStatsQuery();
  const apiInvoices = invoicesResponse?.response?.data?.docs || [];
  const stats = statsResponse?.response?.data;
  const monthlySalesAmount = Number(stats?.monthlySales?.amount ?? 0);
  const monthlySalesCount = Number(stats?.monthlySales?.count ?? 0);
  const dueAmount = Number(stats?.dueAmount?.amount ?? 0);
  const dueCount = Number(stats?.dueAmount?.count ?? 0);
  const overdueAmount = Number(stats?.overdueAmount?.amount ?? 0);
  const overdueCount = Number(stats?.overdueAmount?.count ?? 0);

  const normalizeStatus = (status?: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Pending';

  const invoices = apiInvoices.map(inv => {
    const clientName = inv.client ? `${inv.client.firstName} ${inv.client.lastName}` : 'Unknown';
    return {
      id: inv.id,
      client: clientName,
      clientEmail: inv.client?.email || '',
      date: inv.invoiceDate,
      amount: `$${(inv.totalAmount ?? 0).toFixed(2)}`,
      status: normalizeStatus(inv.status),
    };
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;

    const matchesDate = (!startDate || new Date(invoice.date) >= new Date(startDate)) &&
      (!endDate || new Date(invoice.date) <= new Date(endDate));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = invoicesResponse?.response?.data?.totalPages || 1;
  const totalDocs = invoicesResponse?.response?.data?.totalDocs || filteredInvoices.length;
  const displayedInvoices = filteredInvoices;

  const handleCreate = () => {
    setSelectedInvoice(null);
    setModalMode('edit');
    setIsPreviewOpen(true);
  };

  const handleView = (invoice: any) => {
    setSelectedInvoice(invoice);
    setModalMode('view');
    setIsPreviewOpen(true);
  };

  const handleSaveInvoice = (newInvoice: any) => {
    setIsPreviewOpen(false);
    setSelectedInvoice(null);
    refetch();
  };

  return <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Invoices
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage billing and payments.
        </p>
      </div>
      <Button onClick={handleCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Invoice
      </Button>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Revenue (Monthly)
          </p>
          <h3 className="text-2xl font-bold mt-2">
            ${monthlySalesAmount.toFixed(2)}
          </h3>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Pending Payments
          </p>
          <h3 className="text-2xl font-bold mt-2">
            ${dueAmount.toFixed(2)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {dueCount} invoices pending
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Overdue</p>
          <h3 className="text-2xl font-bold mt-2 text-red-600">
            ${overdueAmount.toFixed(2)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {overdueCount} invoices overdue
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Search and Filters */}
    <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-primary/10 animate-in slide-in-from-top-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Search Bar - Takes more space */}
        <div className="lg:col-span-4">
          <Input
            label="Search Invoices"
            placeholder="Search by ID or client name..."
            icon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-secondary/30 border-none h-11 rounded-xl"
          />
        </div>

        {/* Start Date */}
        <div className="lg:col-span-2">
          <DatePicker
            label="Start Date"
            date={startDate ? new Date(startDate) : undefined}
            setDate={(d) => setStartDate(d ? d.toISOString().split('T')[0] : '')}
            triggerClassName="h-11 rounded-xl bg-secondary/30 border-none"
          />
        </div>

        {/* End Date */}
        <div className="lg:col-span-2">
          <DatePicker
            label="End Date"
            date={endDate ? new Date(endDate) : undefined}
            setDate={(d) => setEndDate(d ? d.toISOString().split('T')[0] : '')}
            triggerClassName="h-11 rounded-xl bg-secondary/30 border-none"
          />
        </div>

        {/* Status */}
        <div className="lg:col-span-2">
          <Select
            label="Payment Status"
            value={statusFilter}
            triggerClassName="h-11 rounded-xl bg-secondary/30 border-none px-4"
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Paid', label: 'Paid' },
              { value: 'Pending', label: 'Pending' },
              { value: 'Overdue', label: 'Overdue' }
            ]}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        {/* Reset Button */}
        <div className="lg:col-span-2">
          <Button
            variant="ghost"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('All');
              setStartDate('');
              setEndDate('');
            }}
            className="w-full h-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-[10px] uppercase tracking-widest border border-dashed border-border transition-all"
          >
            Reset All
          </Button>
        </div>
      </div>
    </div>

    {/* Invoice List */}
    <div className="space-y-4">
      {isLoading && (
        <div className="text-sm text-muted-foreground">Loading invoices...</div>
      )}
      {isError && (
        <div className="text-sm text-destructive">Failed to load invoices.</div>
      )}
      {!isLoading && !isError && displayedInvoices.length === 0 && (
        <div className="text-sm text-muted-foreground">No invoices found.</div>
      )}
      {/* Desktop Table View */}
      <Card className="hidden md:block border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border/50">
              <tr>
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-white">
              {displayedInvoices.map(invoice => {
                const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <tr key={invoice.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{invoice.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{invoice.client}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formattedDate}</td>
                    <td className="px-6 py-4 font-semibold">{invoice.amount}</td>
                    <td className="px-6 py-4 text-muted-foreground">{invoice.clientEmail}</td>
                    <td className="px-6 py-4">
                      <Badge variant={invoice.status === 'Paid' ? 'success' : invoice.status === 'Pending' ? 'warning' : 'destructive'}>
                        {invoice.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Download" onClick={() => handleView(invoice)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          title="Send via Email"
                          onClick={() => {
                            alert(`Invoice ${invoice.id} has been sent to ${invoice.clientEmail}`);
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {displayedInvoices.map(invoice => {
          const formattedDate = new Date(invoice.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          return (
            <Card key={invoice.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-foreground">{invoice.id}</div>
                  <div className="text-xs text-muted-foreground">{formattedDate}</div>
                </div>
                <Badge variant={invoice.status === 'Paid' ? 'success' : invoice.status === 'Pending' ? 'warning' : 'destructive'}>
                  {invoice.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 py-2 border-t border-b border-border/50">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Client</div>
                  <div className="font-medium text-sm">{invoice.client}</div>
                  <div className="text-[10px] text-muted-foreground">{invoice.clientEmail}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-0.5">Amount</div>
                  <div className="font-bold text-lg">{invoice.amount}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleView(invoice)}>
                  <Download className="h-3 w-3 mr-2" /> View
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs text-primary border-primary/20 bg-primary/5" onClick={() => alert(`Sent to ${invoice.clientEmail}`)}>
                  <Mail className="h-3 w-3 mr-2" /> Email
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-white px-4 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-border/50 rounded-xl md:rounded-b-xl md:rounded-t-none">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalDocs)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalDocs)}</span> of <span className="font-medium">{totalDocs}</span> results
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>

    <InvoicePreviewModal
      isOpen={isPreviewOpen}
      onClose={() => setIsPreviewOpen(false)}
      onSave={handleSaveInvoice}
      invoice={selectedInvoice}
      mode={modalMode}
    />
  </div>;
}
