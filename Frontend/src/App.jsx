import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Components/login';
import Signup from './Components/signup';
import Dashboard from './Components/Dashboard';
import TaskMangement from './Components/TaskManagement'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/taskMangement" element={<TaskMangement />} />
      </Routes>
    </Router>
  );
}

export default App;
