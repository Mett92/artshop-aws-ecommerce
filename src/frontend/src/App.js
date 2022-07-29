import './App.css';
import { Navbar } from './components';
import { Outlet } from "react-router-dom";

var isLogged = true;
  
function App() {
  return (
    <div className="App">
      <Navbar isLogged={isLogged} />
      <Outlet />
    </div>
  );
}

export default App;
