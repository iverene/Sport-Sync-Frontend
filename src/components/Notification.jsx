import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, X, AlertTriangle, Info, CheckCircle, Loader2 } from 'lucide-react';
import API from '../services/api';

export default function NotificationPanel({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await API.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error("Fetch notifications error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
        await API.put(`/notifications/${id}/read`);
        setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, status: 'Read' } : n));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
        await API.put(`/notifications/read-all`);
        setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' })));
    } catch (e) { console.error(e); }
  };

  const getIcon = (type) => {
    // Map backend types to icons
    if(type === 'LOW_STOCK') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    if(type === 'SALES') return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="w-80 bg-softWhite rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-navyBlue text-white">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-2">
             <button onClick={markAllAsRead} title="Mark all read" className="hover:text-blue-200"><CheckCircle size={16}/></button>
             <button onClick={onClose} className="hover:text-red-200"><X size={18}/></button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
             <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto"/></div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.notification_id}
                className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${n.status === 'Unread' ? 'bg-blue-50/50' : 'bg-white'}`}
                onClick={() => markAsRead(n.notification_id, n.status === 'Read')}
              >
                <div className="flex gap-3">
                  <div className="mt-1">{getIcon(n.type)}</div>
                  <div>
                    <p className={`text-sm ${n.status === 'Unread' ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
}