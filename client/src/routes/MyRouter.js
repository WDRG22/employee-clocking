import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Dashboard from '../components/dashboard/Dashboard';
import Signup from '../components/signup/Signup';
import Login from '../components/login/Login';
import Account from '../components/account/Account';
import AdminDashboard from '../components/adminDashboard/AdminDashboard';
import { useUser } from "../auth/UserContext";

const PrivateRoute = ({ children, requiresAdmin = false }) => {
    const { user } = useUser();
    if (!user) return <Navigate to="/login" replace />;
    if (requiresAdmin && !user.isAdmin) return <Navigate to="/" replace />;
    return children;
}

function MyRouter() {
    const { user } = useUser();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />

                {/* This is where we manage which dashboard to display */}
                <Route path="/" element={
                    <PrivateRoute>
                        {user?.is_admin ? <AdminDashboard /> : <Dashboard />}
                    </PrivateRoute>
                }/>
                <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />            
                <Route path="*" element={<Navigate to="/" />} /> 
            </Routes>
        </BrowserRouter>
    )
}


export default MyRouter;