import { useState } from 'react';
import { cn } from '../lib/utils';
import { Check, CreditCard, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AddSubscriptionModal } from '../components/modals/AddSubscriptionModal';
import { UpdatePaymentModal } from '../components/modals/UpdatePaymentModal';
import { EditSubscriptionModal } from '../components/modals/EditSubscriptionModal';
import { BillingDetailsModal } from '../components/modals/BillingDetailsModal';
import { Pagination } from '../components/ui/Pagination';

export function SubscriptionPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<any>(null);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const [subscriptions, setSubscriptions] = useState([
    { id: '1', name: 'Professional Plan', cycle: 'Monthly', price: '$49.00', nextBilling: 'Apr 24, 2024', status: 'Active' },
    { id: '2', name: 'Add-on: SMS Pack', cycle: 'Monthly', price: '$15.00', nextBilling: 'Apr 24, 2024', status: 'Active' }
  ]);

  // Pagination for Billing History
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const allBillingItems = Array.from({ length: 20 }, (_, i) => ({
    id: `INV-2024-${String(20 - i).padStart(3, '0')}`,
    date: `Mar ${20 - (i % 30)}, 2024`,
    description: i % 2 === 0 ? 'Professional Plan - Monthly' : 'SMS Pack Add-on',
    amount: i % 2 === 0 ? '$49.00' : '$15.00'
  }));
  const totalPages = Math.ceil(allBillingItems.length / itemsPerPage);

  const handleEdit = (sub: any) => {
    setSelectedSubscription(sub);
    setIsEditOpen(true);
  };

  const handleAddSubscription = (newSub: any) => {
    setSubscriptions([...subscriptions, newSub]);
  };

  const handleDeleteSubscription = (id: string) => {
    if (confirm('Are you sure you want to delete this subscription?')) {
      setSubscriptions(subscriptions.filter(s => s.id !== id));
    }
  };

  const handleBillingClick = (item: any) => {
    setSelectedBilling(item);
    setIsBillingOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Subscription & Billing
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your Inkind Suite plan and payment methods.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Subscription
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Active Subscriptions List (Replaces simple card) */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardDescription>Manage your current plans and services</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground font-medium">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Plan Name</th>
                    <th className="px-4 py-3">Cycle</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Next Billing</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className={cn("p-1.5 rounded", sub.status === 'Active' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            {sub.name.includes('Add-on') ? <Plus className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                          </div>
                          {sub.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">{sub.cycle}</td>
                      <td className="px-4 py-3">{sub.price}</td>
                      <td className="px-4 py-3 text-muted-foreground">{sub.nextBilling}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={sub.status === 'Active' ? 'success' : 'secondary'}
                          className={sub.status === 'Active' ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" : ""}
                        >
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => handleEdit(sub)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDeleteSubscription(sub.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="p-4 border border-border/50 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 font-semibold text-sm">
                      <div className={cn("p-1.5 rounded", sub.status === 'Active' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                        {sub.name.includes('Add-on') ? <Plus className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                      </div>
                      {sub.name}
                    </div>
                    <Badge
                      variant={sub.status === 'Active' ? 'success' : 'secondary'}
                      className={sub.status === 'Active' ? "bg-green-100 text-green-700 h-5 text-[10px]" : "h-5 text-[10px]"}
                    >
                      {sub.status}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm py-2 border-t border-b border-border/50">
                    <div>
                      <div className="text-xs text-muted-foreground">Price</div>
                      <div className="font-medium">{sub.price} <span className="text-xs text-muted-foreground">/{sub.cycle}</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Next Billing</div>
                      <div className="font-medium">{sub.nextBilling}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs flex-1" onClick={() => handleEdit(sub)}>
                      Edit Plan
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSubscription(sub.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="shadow-md h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-white/50">
              <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center border">
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/25</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setIsPaymentOpen(true)}>
              Update Payment Method
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Securely processed by Stripe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Billing History */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[1, 2, 3, 4].map(i => {
                  const item = { id: `INV-2024-00${i}`, date: `Mar ${20 - i}, 2024`, description: 'Professional Plan - Monthly', amount: '$49.00' };
                  return (
                    <tr key={i} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleBillingClick(item)}>
                      <td className="px-4 py-3">{item.date}</td>
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3">{item.amount}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                          Paid
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {[1, 2, 3, 4].map(i => {
              const item = { id: `INV-2024-00${i}`, date: `Mar ${20 - (i % 30)}, 2024`, description: i % 2 === 0 ? 'Professional Plan - Monthly' : 'SMS Pack Add-on', amount: i % 2 === 0 ? '$49.00' : '$15.00' };
              return (
                <div key={i} className="p-3 border border-border/50 rounded-lg flex justify-between items-center active:bg-muted/5" onClick={() => handleBillingClick(item)}>
                  <div>
                    <div className="font-semibold text-sm">{item.description}</div>
                    <div className="text-xs text-muted-foreground">{item.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{item.amount}</div>
                    <Badge variant="secondary" className="text-[10px] h-5 bg-green-50 text-green-700 px-1.5 border-green-100">Paid</Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </CardContent>
      </Card>

      <AddSubscriptionModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onAdd={handleAddSubscription} />
      <EditSubscriptionModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} subscription={selectedSubscription} />
      <UpdatePaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} />
      <BillingDetailsModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} billingItem={selectedBilling} />
    </div>
  );
}