import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { PERMISSION_KEYS } from '../../lib/mockData';

export interface ManagePermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    initialPermissions?: string[];
    onSave?: (selectedPermissions: string[]) => Promise<void> | void;
}

export function ManagePermissionsModal({
    isOpen,
    onClose,
    title = "Manage Permissions",
    description = "Select the permissions to assign.",
    initialPermissions = [],
    onSave
}: ManagePermissionsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setSelectedPermissions([...initialPermissions]);
        }
    }, [isOpen, initialPermissions]);

    const handleToggle = (permId: string) => {
        setSelectedPermissions(prev => {
            if (prev.includes(permId)) {
                return prev.filter(p => p !== permId);
            } else {
                return [...prev, permId];
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (onSave) {
                await onSave(selectedPermissions);
            }
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} description={description}>
            <form onSubmit={handleSave} className="space-y-6 mt-2">
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                        {PERMISSION_KEYS.map((perm) => (
                            <div key={perm.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={perm.id}
                                    label={perm.label}
                                    checked={selectedPermissions.includes(perm.id)}
                                    onCheckedChange={() => handleToggle(perm.id)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                </div>
            </form>
        </Modal>
    );
}
