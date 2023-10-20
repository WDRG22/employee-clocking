import React from 'react';
import './NotFound.css';

function NotFound() {
    return (
        <div className="notFound">
            <h1>404</h1>
            <p>Sorry, the page you are looking for cannot be found.</p>
            <p><a href="/">Go back to homepage</a></p>
        </div>
    );
}

export default NotFound;
