import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useChangePasswordMutation } from '../../redux/api/authApi';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [changePassword] = useChangePasswordMutation();
    const [isLoading, setIsLoading] = useState(false);
    const [current, setCurrent] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!current || !newPass || !confirm) {
            alert('Please fill in all password fields.');
            return;
        }

        if (newPass !== confirm) {
            alert('New password and confirm password do not match.');
            return;
        }

        if (newPass.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }

        if (!/\d/.test(newPass)) {
            alert('Password must contain at least one number');
            return;
        }

        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPass)) {
            alert('Password must contain at least one special character');
            return;
        }

        setIsLoading(true);
        changePassword({
            oldPassword: current,
            newPassword: newPass,
        })
            .unwrap()
            .then(() => {
                alert('Password updated successfully.');
                setCurrent('');
                setNewPass('');
                setConfirm('');
                onClose();
            })
            .catch((error: any) => {
                const message = error?.data?.message || 'Failed to update password.';
                alert(message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Change Password">
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Current Password</label>
                    <Input
                        type="password"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long and include at least one number and one special character.
                    </p>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm New Password</label>
                    <Input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Update Password</Button>
                </div>
            </form>
        </Modal>
    );
}
