import { EmployeeProvider } from "./auth/EmployeeContext";
import MyRouter from "./routes/MyRouter";
import './globalStyles.css';

function App() {
    return (
        <>
            <EmployeeProvider>
                <MyRouter/>            
            </EmployeeProvider>
        </>      
    );
  }

  export default App;