import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CreditCard, Lock } from 'lucide-react';

interface UpdatePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UpdatePaymentModal({ isOpen, onClose }: UpdatePaymentModalProps) {
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [zip, setZip] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle payment update logic
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Payment Method">
            <form onSubmit={handleSubmit} className="mt-4 space-y-6">

                {/* Stripe-like Card Element Container */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Card Details</label>
                    <div className="border rounded-md shadow-sm bg-white overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                        <div className="flex items-center px-3 py-2 border-b">
                            <CreditCard className="h-4 w-4 text-muted-foreground mr-3" />
                            <input
                                className="flex-1 border-none bg-transparent text-sm focus:ring-0 placeholder:text-muted-foreground/50 outline-none"
                                placeholder="Card number"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                            />
                        </div>
                        <div className="flex divide-x">
                            <input
                                className="flex-1 border-none bg-transparent px-3 py-2 text-sm focus:ring-0 placeholder:text-muted-foreground/50 outline-none"
                                placeholder="MM / YY"
                                value={expiry}
                                onChange={(e) => setExpiry(e.target.value)}
                            />
                            <input
                                className="flex-1 border-none bg-transparent px-3 py-2 text-sm focus:ring-0 placeholder:text-muted-foreground/50 outline-none"
                                placeholder="CVC"
                                value={cvc}
                                onChange={(e) => setCvc(e.target.value)}
                            />
                            <input
                                className="flex-1 border-none bg-transparent px-3 py-2 text-sm focus:ring-0 placeholder:text-muted-foreground/50 outline-none"
                                placeholder="ZIP"
                                value={zip}
                                onChange={(e) => setZip(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-3 rounded text-xs text-muted-foreground flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Payments are secure and encrypted. Powered by Stripe.
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="bg-[#635BFF] hover:bg-[#5851E6] text-white">
                        Save Card
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
