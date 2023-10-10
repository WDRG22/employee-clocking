import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useUser } from "../auth/UserContext";
import Dashboard from '../pages/dashboard/Dashboard';
import Login from '../pages/login/Login';
import Signup from '../pages/signup/Signup';

const PrivateRoute = ({ children }) => {
    const { user } = useUser();
    if (user) return children;
    return <Navigate to="/login" replace />;
}

function MyRouter() {
    const { user, isLoading } = useUser();

    if (isLoading) {
        return <div>Loading...</div>; // or your preferred loading indicator
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />}/>
                <Route path="/signup" element={user? <Navigate to="/" /> : <Signup />}/>
                <Route path="*" element={<Navigate to="/" />} /> 
                {/* Create page not found */}

                {/* Private Routes*/}
                <Route path="/" element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default MyRouter;