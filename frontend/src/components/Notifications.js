import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [show, setShow] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const load = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.data);
            setUnreadCount(res.data.data.filter(n => !n.read).length);
        } catch (error) {
            console.error('Notification load error:', error);
        }
    };

    useEffect(() => {
        load();
        const interval = setInterval(load, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const respond = async (id, accept) => {
        try {
            await api.post('/notifications/respond', { notificationId: id, accept });
            load(); // Reload to remove
        } catch (e) {
            alert('Error responding');
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <button
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', position: 'relative' }}
                onClick={() => setShow(!show)}
            >
                🔔
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: -2, right: -2, background: 'red', color: 'white',
                        borderRadius: '50%', fontSize: 10, width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </button>

            {show && (
                <div className="card" style={{
                    position: 'absolute', right: 0, top: 30, width: 300, zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <div className="cardhd">
                        <h4>Bildirimler</h4>
                        <button className="btn" style={{ fontSize: 10, padding: 2 }} onClick={() => setShow(false)}>✕</button>
                    </div>
                    <div className="cardbd" style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {notifications.length === 0 && <div className="small">No notifications.</div>}
                        {notifications.map(n => (
                            <div key={n._id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                                <div className="small" style={{ marginBottom: 4 }}>
                                    <b>{n.data.senderName}</b> invited you to <b>{n.data.squadName}</b>
                                </div>
                                {n.type === 'squad_invite' && (
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn primary" style={{ fontSize: 11, padding: '2px 8px' }} onClick={() => respond(n._id, true)}>Accept</button>
                                        <button className="btn" style={{ fontSize: 11, padding: '2px 8px', color: 'crimson' }} onClick={() => respond(n._id, false)}>Decline</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
