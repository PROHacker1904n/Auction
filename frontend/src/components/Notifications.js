import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const NotificationsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const MarkAllReadButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #0056b3;
  }
`;

const NotificationItem = styled.div`
  background: ${props => props.isRead ? '#f8f9fa' : '#fff'};
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
`;

const UnreadIndicator = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 8px;
  height: 8px;
  background: #007bff;
  border-radius: 50%;
  display: ${props => props.isRead ? 'none' : 'block'};
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const NotificationTime = styled.span`
  color: #666;
  font-size: 12px;
`;

const NotificationMessage = styled.p`
  margin: 0;
  color: #666;
  line-height: 1.4;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? '#007bff' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#007bff'};
  border: 1px solid #007bff;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: ${props => props.primary ? '#0056b3' : '#f8f9fa'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 18px;
  color: #666;
`;

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications(page, 20);
      setNotifications(prev => page === 1 ? response.notifications : [...prev, ...response.notifications]);
      setUnreadCount(response.unreadCount);
      setHasMore(response.currentPage < response.totalPages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.deleteNotification(notificationId);
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bid_placed':
        return '💰';
      case 'bid_outbid':
        return '📈';
      case 'auction_won':
        return '🎉';
      case 'auction_ended':
        return '⏰';
      case 'payment_required':
        return '💳';
      case 'item_shipped':
        return '📦';
      case 'item_delivered':
        return '✅';
      case 'new_review':
        return '⭐';
      case 'rating_received':
        return '⭐';
      default:
        return '🔔';
    }
  };

  if (loading && page === 1) {
    return (
      <NotificationsContainer>
        <LoadingSpinner>Loading notifications...</LoadingSpinner>
      </NotificationsContainer>
    );
  }

  return (
    <NotificationsContainer>
      <Header>
        <Title>
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </Title>
        {unreadCount > 0 && (
          <MarkAllReadButton onClick={markAllAsRead}>
            Mark All Read
          </MarkAllReadButton>
        )}
      </Header>

      {notifications.length === 0 ? (
        <EmptyState>
          <h3>No notifications yet</h3>
          <p>You'll see notifications about bids, auction updates, and more here.</p>
        </EmptyState>
      ) : (
        <>
          {notifications.map((notification) => (
            <NotificationItem key={notification._id} isRead={notification.isRead}>
              <UnreadIndicator isRead={notification.isRead} />
              <NotificationHeader>
                <NotificationTitle>
                  {getNotificationIcon(notification.type)} {notification.title}
                </NotificationTitle>
                <NotificationTime>
                  {formatTime(notification.createdAt)}
                </NotificationTime>
              </NotificationHeader>
              <NotificationMessage>
                {notification.message}
              </NotificationMessage>
              <NotificationActions>
                {!notification.isRead && (
                  <ActionButton onClick={() => markAsRead(notification._id)}>
                    Mark Read
                  </ActionButton>
                )}
                <ActionButton onClick={() => deleteNotification(notification._id)}>
                  Delete
                </ActionButton>
              </NotificationActions>
            </NotificationItem>
          ))}

          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <ActionButton onClick={() => setPage(prev => prev + 1)}>
                Load More
              </ActionButton>
            </div>
          )}
        </>
      )}
    </NotificationsContainer>
  );
};

export default Notifications;
