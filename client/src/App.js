import { UserProvider } from "./auth/UserContext";
import MyRouter from "./routes/MyRouter";
import './globalStyles.css';

function App() {
    return (
        <>
        <UserProvider>
            <MyRouter/>            
        </UserProvider>
        </>      
    );
  }

  export default App;