import React from 'react';
import './LogoutButton.css';

export const LogoutButton = () => {
    const logout = () => {
        // If you're using a library like js-cookie
        // cookies.remove('token');
        document.cookie = 'token=; Max-Age=0'; // This will clear the 'token' cookie

        // Now redirect the user to post-logout
        window.location.href = '/login';
    }

    return (
        <Container>
            <button className="signoutButton" onClick={logout}>Logout</button>
            <TimeDisplay>Local Time : {date.toLocaleTimeString()}</TimeDisplay>
            <TimeDisplay>Local Date : {date.toLocaleDateString()}</TimeDisplay>
            <ButtonGroup>
                <Button onClick={clockIn}>Clock In</Button>
                <Button onClick={clockOut}>Clock Out</Button>
            </ButtonGroup>
        </Container>
    );
};

export default LogoutButton;
