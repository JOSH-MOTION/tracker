import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Sidebar from "./components/Sidebar"; // Import the Sidebar component
import { auth } from "./firebase";
import History from "./components/History";
import About from "./components/About";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user && <Sidebar user={user} />} {/* Only render Sidebar if user is authenticated */}
        <Routes>
          <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
