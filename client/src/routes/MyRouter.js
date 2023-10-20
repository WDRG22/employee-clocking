import React from "react";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import { useEmployee } from "../auth/EmployeeContext";
import Dashboard from '../components/dashboard/Dashboard';
import Signup from '../components/signup/Signup';
import Login from '../components/login/Login';
import AdminDashboard from '../components/adminDashboard/AdminDashboard';
import Settings from "../components/settings/Settings";
import Layout from "../components/layout/Layout";
import EmployeeAttendance from '../components/employeeAttendance/EmployeeAttendance';

const PrivateRoute = ({ children, requiresAdmin = false }) => {
    const { employee } = useEmployee();
    if (!employee) return <Navigate to="/login" replace />;
    if (requiresAdmin && !employee.isAdmin) return <Navigate to="/" replace />;
    return children;
}

function MyRouter() {
    const { employee } = useEmployee();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={employee ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/signup" element={employee ? <Navigate to="/" replace /> : <Signup />}/>
                
                <Route path="/" element={
                    <PrivateRoute>
                        <Layout>
                            {employee?.is_admin ? <AdminDashboard /> : <Dashboard />}
                        </Layout>
                    </PrivateRoute>
                }/>                

                <Route path="/attendance/:employee_id" element={
                    <PrivateRoute>
                        <Layout>
                            <EmployeeAttendance />
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