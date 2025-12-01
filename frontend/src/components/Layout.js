import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
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
  background: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: bold;
  margin-left: 4px;
`;

const Dropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownContent = styled.div`
  display: ${props => props.show ? 'block' : 'none'};
  position: absolute;
  right: 0;
  background-color: white;
  min-width: 200px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
`;

const DropdownItem = styled(Link)`
  color: #333;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
`;

const ProfileImageContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1a73e8;
  color: white;
  font-size: 1.5rem;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
`;

const UserButton = styled.button`
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;

  &:hover {
    background: #f8f9fa;
  }
`;

const Layout = ({ children }) => {
  const { user, logout, isAuthenticated } = useAuth();
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
            <>
              <NavLink as={Link} to="/add-listing">Add Listing</NavLink>

              <UserMenu>
                <NavLink as={Link} to="/notifications">
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
                  <DropdownContent show={showDropdown}>
                    <DropdownItem to={`/profile/${user?._id}`} onClick={() => setShowDropdown(false)}>
                      View Profile
                    </DropdownItem>

                    {user.role === 'admin' && (
                      <DropdownItem to="/admin" onClick={() => setShowDropdown(false)}>
                        Admin Dashboard
                      </DropdownItem>
                    )}

                    <DropdownItem to="/notifications" onClick={() => setShowDropdown(false)}>
                      Notifications
                    </DropdownItem>
                    <DropdownItem as="button" onClick={handleLogout}>
                      Logout
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </UserMenu>
            </>
          )}
          {!isAuthenticated && (
            <NavLink as={Link} to="/login">Login</NavLink>
          )}
        </Nav>
      </Header>
      <Main>{children}</Main>
      <Footer>
        <p>© 2025 Intelligent Auction Platform | Developed by Prasad Kumbhar</p>
      </Footer>
    </>
  );
};

export default Layout;
