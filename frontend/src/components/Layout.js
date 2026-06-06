import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Header,
  HeaderTitle,
  Nav,
  NavLink,
  Main,
  Footer
} from '../styles/GlobalStyles';
import styled from 'styled-components';

const NotificationBadge = styled.span`
  background: ${props => props.theme.accent};
  color: white;
  border-radius: 9999px;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 800;
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled(motion.div)`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background-color: ${props => props.theme.backgroundCard};
  min-width: 210px;
  box-shadow: ${props => props.theme.shadow};
  z-index: 101;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.border};
  overflow: hidden;
  transform-origin: top right;
`;

const DropdownItem = styled(Link)`
  color: ${props => props.theme.text};
  padding: 0.875rem 1.25rem;
  text-decoration: none;
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  border-bottom: 1px solid ${props => props.theme.border};
  transition: all 0.2s ease;
  background: none;
  border-left: none;
  border-right: none;
  border-top: none;
  width: 100%;
  text-align: left;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme.secondary};
    color: ${props => props.theme.primary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
`;

const ProfileImageContainer = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.primary} 0%, ${props => props.theme.accent} 100%);
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileImage = styled.img`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  cursor: pointer;
  object-fit: cover;
  border: 2px solid ${props => props.theme.primary};
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const UserButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.theme.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
`;

const ThemeToggleButton = styled.button`
  background: ${props => props.theme.secondary};
  border: 1px solid ${props => props.theme.border};
  color: ${props => props.theme.text};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 1.05rem;

  &:hover {
    background: ${props => props.theme.secondaryHover};
    transform: rotate(15deg);
  }
`;

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.getNotifications(1, 1, true);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <>
      <Header>
        <HeaderTitle>🧠 Intelligent Auction Platform</HeaderTitle>
        <Nav>
          <NavLink as={Link} to="/">Home</NavLink>
          <NavLink as={Link} to="/listings">Listings</NavLink>
          {isAuthenticated && user && user.name && (
            <NavLink as={Link} to="/add-listing">Add Listing</NavLink>
          )}

          {/* Theme toggle switch */}
          <ThemeToggleButton onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </ThemeToggleButton>

          {isAuthenticated && user && user.name && (
            <UserMenu>
              <NavLink as={Link} to="/notifications" style={{ display: 'flex', alignItems: 'center' }}>
                Notifications
                {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
              </NavLink>
              <Dropdown>
                <UserButton onClick={() => setShowDropdown(!showDropdown)}>
                  {user.profileImage ? (
                      <ProfileImage src={user.profileImage} alt={user.name} />
                  ) : (
                      <ProfileImageContainer>{user.name.charAt(0).toUpperCase()}</ProfileImageContainer>
                  )}
                </UserButton>
                <AnimatePresence>
                  {showDropdown && (
                    <DropdownContent
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                      <DropdownItem to={`/profile/${user?._id}`} onClick={() => setShowDropdown(false)}>
                        👤 View Profile
                      </DropdownItem>

                      {user.role === 'admin' && (
                        <DropdownItem to="/admin" onClick={() => setShowDropdown(false)}>
                          🛠️ Admin Dashboard
                        </DropdownItem>
                      )}

                      <DropdownItem to="/notifications" onClick={() => setShowDropdown(false)}>
                        🔔 Notifications
                      </DropdownItem>
                      <DropdownItem as="button" onClick={handleLogout}>
                        🚪 Logout
                      </DropdownItem>
                    </DropdownContent>
                  )}
                </AnimatePresence>
              </Dropdown>
            </UserMenu>
          )}
          {!isAuthenticated && (
            <NavLink as={Link} to="/login">Login</NavLink>
          )}
        </Nav>
      </Header>
      
      {/* Framer motion page transition wrapper */}
      <Main
        as={motion.main}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {children}
      </Main>

      <Footer>
        <p>© 2025 Intelligent Auction Platform | Developed by Prasad Kumbhar</p>
      </Footer>
    </>
  );
};

export default Layout;
