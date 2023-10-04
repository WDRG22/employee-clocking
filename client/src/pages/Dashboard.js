import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #333;
`;

const TimeDisplay = styled.p`
    color: white;
    font-size: 48px;  // Increased font size
    margin: 15px 0;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`;

const Button = styled.button`
    margin: 10px;
    padding: 10px 20px;
    background-color: #007BFF;
    border: none;
    border-radius: 5px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    &:hover {
        background-color: #0056b3;
    }
`;

const clockIn = async () => {
    try {
        const response = await fetch('http://localhost:8080');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error clocking in:", error);
    }
}

const clockOut = async () => {
    try {
        const response = await fetch('http://localhost:8080');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error("Error clocking out:", error);
    }
}

export const Dashboard = () => {
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Container>
          <Header />
          <TimeDisplay>Local Time : {date.toLocaleTimeString()}</TimeDisplay>
          <TimeDisplay>Local Date : {date.toLocaleDateString()}</TimeDisplay>
          <ButtonGroup>
              <Button onClick={clockIn}>Clock In</Button>
              <Button onClick={clockOut}>Clock Out</Button>
          </ButtonGroup>
        </Container>
    );
}

export default Dashboard;
