import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiUser, FiFileText, FiAward, FiActivity, FiMusic, FiBriefcase } from 'react-icons/fi';

const NavContainer = styled(motion.nav)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(248, 246, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(155, 107, 158, 0.1);
  z-index: 1000;
  padding: 1rem 0;
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  font-family: 'Lato', sans-serif;
  color: #9B6B9E;
  text-decoration: none;
  transition: color 0.3s ease;
  
  &:hover {
    color: #6B4E71;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #6B4E71;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    color: #9B6B9E;
    background: rgba(155, 107, 158, 0.1);
  }
  
  &.active {
    color: #9B6B9E;
    background: rgba(155, 107, 158, 0.15);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6B4E71;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: fixed;
  top: 80px;
  left: 0;
  right: 0;
  background: rgba(248, 246, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(155, 107, 158, 0.1);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  text-decoration: none;
  color: #6B4E71;
  font-weight: 500;
  padding: 1rem;
  border-radius: 10px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1.1rem;
  
  &:hover {
    color: #9B6B9E;
    background: rgba(155, 107, 158, 0.1);
  }
  
  &.active {
    color: #9B6B9E;
    background: rgba(155, 107, 158, 0.15);
  }
`;

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: <FiHome /> },
    { path: '/about', label: 'About', icon: <FiUser /> },
    { path: '/articles', label: 'Articles', icon: <FiFileText /> },
    { path: '/races', label: 'Races', icon: <FiAward /> },
    { path: '/fitness', label: 'Fitness', icon: <FiActivity /> },
    { path: '/music', label: 'Music', icon: <FiMusic /> },
    { path: '/professional', label: 'Professional', icon: <FiBriefcase /> },
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  return (
    <>
      <NavContainer
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <NavContent>
          <Logo to="/">Maya A. Ramirez</Logo>
          
          <NavLinks>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </NavLinks>
          
          <MobileMenuButton onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </MobileMenuButton>
        </NavContent>
      </NavContainer>
      
      {isMobileMenuOpen && (
        <MobileMenu
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {navItems.map((item) => (
            <MobileNavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={location.pathname === item.path ? 'active' : ''}
            >
              {item.icon}
              {item.label}
            </MobileNavLink>
          ))}
        </MobileMenu>
      )}
    </>
  );
};

export default Navigation; 