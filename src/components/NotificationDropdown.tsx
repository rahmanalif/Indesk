import { Check, Clock } from 'lucide-react';
import { Button } from './ui/Button';

interface Notification {
    id: number;
    title: string;
    desc: string;
    time: string;
    read: boolean;
}

interface NotificationDropdownProps {
    notifications: Notification[];
    onMarkAllRead: () => void;
    onRead: (id: number) => void;
}

export function NotificationDropdown({ notifications, onMarkAllRead, onRead }: NotificationDropdownProps) {
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[90vw] max-w-sm md:absolute md:top-12 md:right-0 md:left-auto md:translate-x-0 md:w-80 bg-white/95 backdrop-blur-xl border border-primary/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[5px] h-6 bg-primary rounded-r-lg" />
                <h4 className="font-bold text-[13px] text-primary ml-2">Notifications</h4>
                {unreadCount > 0 && <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => onRead(n.id)}
                            className={`p-4 border-b last:border-0 hover:bg-muted/20 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <p className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>{n.title}</p>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {n.time}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{n.desc}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="p-2 border-t bg-muted/20">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-8 text-primary hover:text-primary/80"
                    onClick={onMarkAllRead}
                    disabled={unreadCount === 0}
                >
                    <Check className="mr-2 h-3 w-3" /> Mark all as read
                </Button>
            </div>
        </div>
    );
}
