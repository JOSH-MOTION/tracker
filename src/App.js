import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Signup from "./components/Signup";
import About from "./components/About"; // Import About component
import History from "./components/History"; // Import History component
import Navbar from "./components/Navbar"; // Import Navbar
import { auth } from "./firebase";

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
        <Navbar user={user} /> {/* Include Navbar here */}
        <Routes>
          <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} /> {/* About route */}
          <Route path="/history" element={user ? <History user={user} /> : <Navigate to="/login" />} /> {/* History route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
