import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useUpdateSelfProfileMutation } from '../../redux/api/authApi';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  firstName?: string;
  lastName?: string;
  onUpdated?: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  firstName = '',
  lastName = '',
  onUpdated,
}: EditProfileModalProps) {
  const [updateSelfProfile] = useUpdateSelfProfileMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [nextFirstName, setNextFirstName] = useState(firstName);
  const [nextLastName, setNextLastName] = useState(lastName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNextFirstName(firstName);
    setNextLastName(lastName);
    setAvatarFile(null);
  }, [isOpen, firstName, lastName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextFirstName.trim() || !nextLastName.trim()) {
      alert('First name and last name are required.');
      return;
    }

    setIsLoading(true);
    updateSelfProfile({
      firstName: nextFirstName.trim(),
      lastName: nextLastName.trim(),
      avatar: avatarFile,
    })
      .unwrap()
      .then(() => {
        onUpdated?.();
        onClose();
      })
      .catch((error: any) => {
        const message = error?.data?.message || 'Failed to update profile.';
        alert(message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" description="Update your name and avatar">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={nextFirstName}
            onChange={(e) => setNextFirstName(e.target.value)}
            required
          />
          <Input
            label="Last Name"
            value={nextLastName}
            onChange={(e) => setNextLastName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
