import { useState } from 'react';
import { Plus, Download, Mail, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MOCK_CLIENTS } from '../lib/mockData';
import { InvoicePreviewModal } from '../components/modals/InvoicePreviewModal';
import { Pagination } from '../components/ui/Pagination';
import { DatePicker } from '../components/ui/DatePicker';

const INITIAL_INVOICES = [{
  id: 'INV-001',
  client: 'James Wilson',
  date: 'Mar 20, 2024',
  amount: '$150.00',
  status: 'Paid'
}, {
  id: 'INV-002',
  client: 'Emma Thompson',
  date: 'Mar 19, 2024',
  amount: '$200.00',
  status: 'Pending'
}, {
  id: 'INV-003',
  client: 'Michael Brown',
  date: 'Mar 18, 2024',
  amount: '$150.00',
  status: 'Overdue'
}];

export function InvoicesPage() {
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const itemsPerPage = 5;

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;

    // Simple date string comparison (Mar 20, 2024 format)
    // For a real app, we'd parse these, but for mock data we'll do a simple check
    const matchesDate = (!startDate || new Date(invoice.date) >= new Date(startDate)) &&
      (!endDate || new Date(invoice.date) <= new Date(endDate));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const displayedInvoices = filteredInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
    if (selectedInvoice) {
      // Edit existing
      setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? newInvoice : inv));
    } else {
      // Add new
      setInvoices([newInvoice, ...invoices]);
    }
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
          <h3 className="text-2xl font-bold mt-2">$12,450.00</h3>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Pending Payments
          </p>
          <h3 className="text-2xl font-bold mt-2">$3,200.00</h3>
          <p className="text-xs text-muted-foreground mt-1">
            8 invoices pending
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-sm font-medium text-muted-foreground">Overdue</p>
          <h3 className="text-2xl font-bold mt-2 text-red-600">$450.00</h3>
          <p className="text-xs text-muted-foreground mt-1">
            2 invoices overdue
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
                const client = MOCK_CLIENTS.find(c => c.name === invoice.client);
                return (
                  <tr key={invoice.id} className="hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{invoice.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{invoice.client}</div>
                      <div className="text-[10px] text-muted-foreground">{client?.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{invoice.date}</td>
                    <td className="px-6 py-4 font-semibold">{invoice.amount}</td>
                    <td className="px-6 py-4 text-muted-foreground">{client?.email}</td>
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
                            alert(`Invoice ${invoice.id} has been sent to ${client?.email}`);
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
          const client = MOCK_CLIENTS.find(c => c.name === invoice.client);
          return (
            <Card key={invoice.id} className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-foreground">{invoice.id}</div>
                  <div className="text-xs text-muted-foreground">{invoice.date}</div>
                </div>
                <Badge variant={invoice.status === 'Paid' ? 'success' : invoice.status === 'Pending' ? 'warning' : 'destructive'}>
                  {invoice.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 py-2 border-t border-b border-border/50">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground mb-0.5">Client</div>
                  <div className="font-medium text-sm">{invoice.client}</div>
                  <div className="text-[10px] text-muted-foreground">{client?.email}</div>
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
                <Button variant="outline" size="sm" className="h-8 text-xs text-primary border-primary/20 bg-primary/5" onClick={() => alert(`Sent to ${client?.email}`)}>
                  <Mail className="h-3 w-3 mr-2" /> Email
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="bg-white px-4 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-border/50 rounded-xl md:rounded-b-xl md:rounded-t-none">
        <div className="text-sm text-muted-foreground text-center sm:text-left">
          Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredInvoices.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredInvoices.length)}</span> of <span className="font-medium">{filteredInvoices.length}</span> results
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