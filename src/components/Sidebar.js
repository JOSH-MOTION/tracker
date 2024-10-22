import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase"; // Adjust the path based on your project structure

const Sidebar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null); // Create a ref for the sidebar

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Close sidebar when clicking outside
  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Run effect when isOpen changes

  return (
    <div>
      {/* Show the button only when the sidebar is closed */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="p-2 text-white bg-blue-500 rounded-lg fixed top-4 left-4 z-50"
        >
          ☰ {/* Hamburger Icon */}
        </button>
      )}

      <div
        ref={sidebarRef} // Attach ref to the sidebar div
        className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-transform transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "250px", transition: "transform 0.3s ease" }}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          {/* Display username or email */}
          {user && <p className="mb-4">Welcome, {user.email || user.displayName}!</p>}
          <ul className="space-y-4">
            <li>
              <Link to="/" className="hover:underline" onClick={toggleSidebar}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline" onClick={toggleSidebar}>
                About
              </Link>
            </li>
            <li>
              <Link to="/history" className="hover:underline" onClick={toggleSidebar}>
                History
              </Link>
            </li>
            {user && (
              <li>
                <button onClick={handleLogout} className="hover:underline">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
