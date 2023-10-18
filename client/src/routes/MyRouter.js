import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useUser } from "../auth/UserContext";
import Dashboard from '../components/dashboard/Dashboard';
import Signup from '../components/signup/Signup';
import Login from '../components/login/Login';
import Attendance from "../components/attendance/Attendance";
import AdminDashboard from '../components/adminDashboard/AdminDashboard';
import Settings from "../components/settings/Settings";
import Layout from "../components/layout/Layout";

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
                <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />}/>
                
                <Route path="/" element={
                    <PrivateRoute>
                        <Layout>
                            {user?.is_admin ? <AdminDashboard /> : <Dashboard />}
                        </Layout>
                    </PrivateRoute>
                }/>
                
                <Route path="/attendance" element={
                    <PrivateRoute>
                        <Layout>
                            <Attendance />
                        </Layout>
                    </PrivateRoute>
                }/>

                <Route path="/settings" element={
                    <PrivateRoute>
                        <Layout>
                            <Settings />
                        </Layout>
                    </PrivateRoute>
                }/>
                
                <Route path="*" element={<Layout><Navigate to="/" /></Layout>} /> 
            </Routes>
        </BrowserRouter>
    );
}


export default MyRouter;