import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NotificationsContainer = styled.div`
  max-width: 800px;
  margin: 1rem auto 3rem;
  background: ${props => props.theme.backgroundCard};
  border: 1px solid ${props => props.theme.border};
  border-radius: 20px;
  box-shadow: ${props => props.theme.shadow};
  padding: 2.5rem;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${props => props.theme.border};
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: ${props => props.theme.text};
  margin: 0;
`;

const MarkAllReadButton = styled.button`
  background: ${props => props.theme.primary}20;
  color: ${props => props.theme.primary};
  border: 1px solid ${props => props.theme.primary}40;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${props => props.theme.primary};
    color: white;
    box-shadow: 0 4px 12px ${props => props.theme.primary}35;
    transform: translateY(-1px);
  }
`;

const NotificationItem = styled.div`
  background: ${props => props.isRead ? 'transparent' : `${props.theme.primary}08` };
  border: 1px solid ${props => props.isRead ? props.theme.border : `${props.theme.primary}25` };
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  position: relative;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: ${props => props.theme.shadow};
    transform: translateY(-1px);
    border-color: ${props => props.theme.primary}40;
  }
`;

const UnreadIndicator = styled.div`
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  width: 8px;
  height: 8px;
  background: ${props => props.theme.accent};
  border-radius: 50%;
  display: ${props => props.isRead ? 'none' : 'block'};
  box-shadow: 0 0 10px ${props => props.theme.accent};
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const NotificationTitle = styled.h4`
  margin: 0;
  color: ${props => props.theme.text};
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.015em;
`;

const NotificationTime = styled.span`
  color: ${props => props.theme.textSecondary};
  font-size: 0.775rem;
  font-weight: 500;
`;

const NotificationMessage = styled.p`
  margin: 0;
  color: ${props => props.theme.textSecondary};
  font-size: 0.9rem;
  line-height: 1.5;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  background: ${props => props.primary ? props.theme.primary : 'transparent'};
  color: ${props => props.primary ? 'white' : props.theme.textSecondary};
  border: 1px solid ${props => props.primary ? 'transparent' : props.theme.border};
  padding: 0.4rem 0.875rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${props => props.primary ? props.theme.primaryHover : props.theme.secondaryHover};
    color: ${props => props.primary ? 'white' : props.theme.text};
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  color: ${props => props.theme.textSecondary};
  font-size: 0.95rem;

  h3 {
    color: ${props => props.theme.text};
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 0.95rem;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
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
    <NotificationsContainer
      as={motion.div}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
            <NotificationItem 
              as={motion.div}
              layout
              key={notification._id} 
              isRead={notification.isRead}
            >
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
                  <ActionButton primary onClick={() => markAsRead(notification._id)}>
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
