import React from 'react';
import './Header.css';

const Header = () => {
    const logout = () => {
        document.cookie = 'token=; Max-Age=0'; // Clear the 'token' cookie
        window.location.href = '/login';  // Redirect to login
    }

    return (
        <div className="headerContainer">
            <div className="logo">MyAppLogo</div>
            <div className="navigationButtons">
                <button className="navButton" onClick={() => window.location.href = '/'}>Homepage</button>
                <button className="navButton" onClick={() => window.location.href = '/account'}>Account</button>
            </div>
            <button className="logoutButton" onClick={logout}>Logout</button>
        </div>
    );
}

export default Header;
