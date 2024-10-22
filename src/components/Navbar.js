import { Link } from "react-router-dom";
import { auth } from "../firebase"; // Adjust the path based on your project structure

const Navbar = ({ user }) => {
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the user
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="bg-blue-500 p-4">
      <ul className="flex justify-between">
        <li>
          <Link to="/" className="text-white font-semibold">Home</Link>
        </li>
        <li>
          <Link to="/about" className="text-white font-semibold">About</Link>
        </li>
        <li>
          <Link to="/history" className="text-white font-semibold">History</Link>
        </li>
        {user && (
          <li>
            <button onClick={handleLogout} className="text-white font-semibold">Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
