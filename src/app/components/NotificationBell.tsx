'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data: Notification[]) =>
        setNotifications(Array.isArray(data) ? data : [])
      )
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!session) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center h-9 w-9 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#E94560] text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-white/10 bg-[#16181f] shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No notifications yet
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors ${
                    !n.read ? 'bg-white/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                        n.type === 'resolution'
                          ? 'bg-[#00D4AA]'
                          : 'bg-[#FFB547]'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-medium text-white">
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {new Date(n.time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
