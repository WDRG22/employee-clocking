import { UserProvider } from "./auth/UserContext";
import RoutesComponent from './components/RoutesComponent';
import './App.css';

function App() {
    return (
        <>
        <UserProvider>
            <RoutesComponent/>            
        </UserProvider>
        </>      
    );
  }

  export default App;