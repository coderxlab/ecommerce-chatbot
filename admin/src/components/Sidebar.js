import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaBox, 
  FaUsers, 
  FaShoppingCart, 
  FaTruck, 
  FaUser 
} from 'react-icons/fa';

const Sidebar = () => {
  return (
    <div className="d-flex flex-column p-3 h-100">
      <h3 className="text-center mb-4">E-commerce</h3>
      <Nav className="flex-column">
        <NavLink to="/" className={({ isActive }) => 
          isActive ? 'sidebar-link active' : 'sidebar-link'
        }>
          <FaHome className="me-2" /> Dashboard
        </NavLink>
        
        <NavLink to="/products" className={({ isActive }) => 
          isActive ? 'sidebar-link active' : 'sidebar-link'
        }>
          <FaBox className="me-2" /> Products
        </NavLink>
        
        <NavLink to="/users" className={({ isActive }) => 
          isActive ? 'sidebar-link active' : 'sidebar-link'
        }>
          <FaUsers className="me-2" /> Users
        </NavLink>
        
        <NavLink to="/orders" className={({ isActive }) => 
          isActive ? 'sidebar-link active' : 'sidebar-link'
        }>
          <FaShoppingCart className="me-2" /> Orders
        </NavLink>
        
        <NavLink to="/delivery" className={({ isActive }) => 
          isActive ? 'sidebar-link active' : 'sidebar-link'
        }>
          <FaTruck className="me-2" /> Delivery Routes
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => 
          isActive ? 'sidebar-link active' : 'sidebar-link'
        }>
          <FaUser className="me-2" /> Profile
        </NavLink>
      </Nav>
    </div>
  );
};

export default Sidebar;
