import { useMemo, useState } from 'react';
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
import { useGetClinicTransactionsQuery, useGetCurrentSubscriptionQuery } from '../redux/api/clientsApi';

export function SubscriptionPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<any>(null);
  const [isBillingOpen, setIsBillingOpen] = useState(false);

  const { data: subscriptionResponse, isLoading: subscriptionLoading, isError: subscriptionError } = useGetCurrentSubscriptionQuery();
  const subscriptionData = subscriptionResponse?.response?.data?.subscription;

  const subscriptions = useMemo(() => {
    if (!subscriptionData) {
      return [];
    }

    const planName = subscriptionData.plan?.name || 'Current Plan';
    const price = subscriptionData.plan?.price ?? 0;
    const nextBilling = subscriptionData.currentPeriodEnd
      ? new Date(subscriptionData.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'N/A';
    const status = subscriptionData.status ? subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1) : 'Active';

    return [
      {
        id: subscriptionData.id,
        name: planName,
        cycle: 'Monthly',
        price: `$${price.toFixed(2)}`,
        nextBilling,
        status,
      },
    ];
  }, [subscriptionData]);

  // Pagination for Billing History
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data: transactionsResponse, isLoading: transactionsLoading, isError: transactionsError } = useGetClinicTransactionsQuery({
    page: currentPage,
    limit: itemsPerPage,
  });
  const transactions = transactionsResponse?.response?.data?.docs || [];
  const totalPages = transactionsResponse?.response?.data?.totalPages || 1;
  const totalDocs = transactionsResponse?.response?.data?.totalDocs || transactions.length;

  const handleEdit = (sub: any) => {
    setSelectedSubscription(sub);
    setIsEditOpen(true);
  };

  const handleAddSubscription = () => {
    setIsAddOpen(false);
  };

  const handleDeleteSubscription = () => {
    alert('Please contact support to cancel or change your subscription.');
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
            {subscriptionLoading && (
              <div className="text-sm text-muted-foreground">Loading subscription...</div>
            )}
            {subscriptionError && (
              <div className="text-sm text-destructive">Failed to load subscription.</div>
            )}
            {/* Desktop Table */}
            {!subscriptionLoading && !subscriptionError && (
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
                  {subscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-sm text-muted-foreground">
                        No active subscription found.
                      </td>
                    </tr>
                  )}
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
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={handleDeleteSubscription}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}

            {/* Mobile Card View */}
            {!subscriptionLoading && !subscriptionError && (
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
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={handleDeleteSubscription}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {subscriptions.length === 0 && (
                <div className="text-sm text-muted-foreground">No active subscription found.</div>
              )}
              </div>
            )}
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
          {transactionsLoading && (
            <div className="text-sm text-muted-foreground">Loading billing history...</div>
          )}
          {transactionsError && (
            <div className="text-sm text-destructive">Failed to load billing history.</div>
          )}
          {/* Desktop Table */}
          {!transactionsLoading && !transactionsError && (
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
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-sm text-muted-foreground">
                      No billing history found.
                    </td>
                  </tr>
                )}
                {transactions.map((item) => {
                  const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const statusLabel = item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown';
                  return (
                    <tr key={item.id} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleBillingClick(item)}>
                      <td className="px-4 py-3">{date}</td>
                      <td className="px-4 py-3">{item.description}</td>
                      <td className="px-4 py-3">${item.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          variant="secondary"
                          className={item.status === 'completed' ? "bg-green-100 text-green-700 hover:bg-green-200 border-none" : ""}
                        >
                          {statusLabel}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}

          {/* Mobile Card View */}
          {!transactionsLoading && !transactionsError && (
            <div className="md:hidden space-y-3">
              {transactions.length === 0 && (
                <div className="text-sm text-muted-foreground">No billing history found.</div>
              )}
              {transactions.map((item) => {
                const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const statusLabel = item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Unknown';
                return (
                  <div key={item.id} className="p-3 border border-border/50 rounded-lg flex justify-between items-center active:bg-muted/5" onClick={() => handleBillingClick(item)}>
                    <div>
                      <div className="font-semibold text-sm">{item.description}</div>
                      <div className="text-xs text-muted-foreground">{date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">${item.amount.toFixed(2)}</div>
                      <Badge variant="secondary" className={item.status === 'completed' ? "text-[10px] h-5 bg-green-50 text-green-700 px-1.5 border-green-100" : "text-[10px] h-5"}>
                        {statusLabel}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            <div className="text-xs text-muted-foreground mt-2">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, totalDocs)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalDocs)}</span> of{' '}
              <span className="font-medium">{totalDocs}</span> results
            </div>
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
