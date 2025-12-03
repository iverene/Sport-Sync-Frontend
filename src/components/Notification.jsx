import React, { useState, useEffect, useRef } from 'react';
import { Bell, Trash2, X, CheckCircle, Loader2 } from 'lucide-react';
import API from '../services/api';

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await API.get('/notifications?limit=20');
      setNotifications(response.data.data || []);
      if (response.data.meta) {
          setUnreadCount(response.data.meta.unreadCount);
      } else {
          const unread = (response.data.data || []).filter(n => n.status === 'Unread').length;
          setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Fetch notifications error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id, status) => {
    if (status === 'Read') return; 
    try {
        await API.put(`/notifications/${id}/read`);
        setNotifications(prev => prev.map(n => 
            n.notification_id === id ? { ...n, status: 'Read' } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
        await API.put(`/notifications/read-all`);
        setNotifications(prev => prev.map(n => ({ ...n, status: 'Read' })));
        setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    
    if (!window.confirm("Are you sure you want to delete all notifications? This action cannot be undone.")) {
      return;
    }

    try {
      await API.delete('/notifications'); 
      setNotifications([]);
      setUnreadCount(0);
    } catch (e) { 
      console.error("Clear all notifications error", e);
    }
  };

  // --- SIMPLIFIED: Default Icon for ALL Types ---
  const getIcon = () => {
    return <Bell className="w-5 h-5 text-blue-500" />;
  };

  // --- SIMPLIFIED: Default Border Color for ALL Types ---
  const getBorderColor = () => {
    return 'border-l-blue-500';
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        className="p-2 rounded-full hover:bg-slate-100 relative transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={22} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-softWhite rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-navyBlue text-white">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex gap-2">
                <button 
                    onClick={clearAllNotifications} 
                    title="Clear all notifications" 
                    disabled={loading || notifications.length === 0}
                    className={`p-1 rounded-full transition-colors ${loading || notifications.length === 0 ? 'text-white/50 cursor-not-allowed' : 'hover:bg-white/20'}`}
                >
                    <Trash2 size={18}/>
                </button>
                <button 
                    onClick={markAllAsRead} 
                    title="Mark all read" 
                    disabled={loading || unreadCount === 0}
                    className={`p-1 rounded-full transition-colors ${loading || unreadCount === 0 ? 'text-white/50 cursor-not-allowed' : 'hover:bg-white/20'}`}
                >
                    <CheckCircle size={18}/>
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                    <X size={18}/>
                </button>
            </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {loading ? (
                <div className="p-6 text-center"><Loader2 className="animate-spin mx-auto text-navyBlue"/></div>
            ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p>No notifications</p>
                </div>
            ) : (
                notifications.map(n => (
                <div
                    key={n.notification_id}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 border-l-4 transition-colors ${getBorderColor()} ${n.status === 'Unread' ? 'bg-blue-50/40' : 'bg-white'}`}
                    onClick={() => markAsRead(n.notification_id, n.status)}
                >
                    <div className="flex gap-3">
                    <div className="mt-1 shrink-0">{getIcon()}</div>
                    <div>
                        <p className={`text-sm ${n.status === 'Unread' ? 'font-bold text-slate-800' : 'text-slate-600'}`}>
                            {n.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    </div>
                </div>
                ))
            )}
            </div>
            
        </div>
      )}
    </div>
  );
}