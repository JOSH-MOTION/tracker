// Home.js
import { useEffect, useState } from "react";
import { collection, addDoc, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase"; // Ensure the path to firebase.js is correct
import Chart from "./Chart";
import { signOut } from "firebase/auth"; // Import signOut from Firebase auth
import { auth } from "../firebase"; // Import auth from firebase.js

const categoryColors = {
  Food: 'rgba(255, 99, 132, 0.5)',
  Transport: 'rgba(54, 162, 235, 0.5)',
  Entertainment: 'rgba(255, 206, 86, 0.5)',
  Other: 'rgba(75, 192, 192, 0.5)',
  Income: 'rgba(153, 102, 255, 0.5)',
};

const Home = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("Expense");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [salary, setSalary] = useState("");

  useEffect(() => {
    if (!user) {
      return; // Exit early if user is not logged in
    }

    // Fetch transactions for the logged-in user
    const unsub = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const newTransactions = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((transaction) => transaction.userId === user.uid); // Filter by user ID

      setTransactions(newTransactions);

      const totalExp = newTransactions
        .filter(transaction => transaction.type === "Expense")
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      setTotalExpenses(totalExp);

      const totalInc = newTransactions
        .filter(transaction => transaction.type === "Income")
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      setTotalIncome(totalInc);
    });

    return () => unsub();
  }, [user]);

  const addTransaction = async (e) => {
    e.preventDefault();

    // Ensure required fields are filled
    if (!amount && !salary || !description || !date || !user) return;

    const currentTime = new Date();
    const selectedDate = new Date(date);
  
    selectedDate.setHours(currentTime.getHours());
    selectedDate.setMinutes(currentTime.getMinutes());
    selectedDate.setSeconds(currentTime.getSeconds());

    const parsedAmount = type === "Income" ? parseFloat(salary) : parseFloat(amount);
    if (isNaN(parsedAmount)) {
      console.error("Invalid amount provided:", type === "Income" ? salary : amount);
      return; // Exit early if the amount is not a valid number
    }

    try {
      await addDoc(collection(db, "transactions"), {
        amount: parsedAmount,
        category: type === "Income" ? "Income" : category,
        description,
        createdAt: selectedDate,
        type,
        userId: user.uid, // Store user ID for tracking transactions
      });

      // Reset form fields
      setAmount("");
      setDescription("");
      setDate("");
      setType("Expense");
      setSalary("");
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Prepare data for the chart
  const talliedData = transactions.reduce((acc, transaction) => {
    const category = transaction.type === "Income" ? "Income" : transaction.category;

    if (!acc[category]) {
      acc[category] = { income: 0, expenses: 0 };
    }

    if (transaction.type === "Income") {
      acc[category].income += transaction.amount;
    } else {
      acc[category].expenses += transaction.amount;
    }

    return acc;
  }, {});

  const labels = Object.keys(talliedData);
  const incomeData = labels.map((label) => talliedData[label].income);
  const expenseData = labels.map((label) => talliedData[label].expenses);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user ? user.email : "Guest"}</h1>

      <Chart 
        labels={labels}
        incomeData={incomeData}
        expenseData={expenseData}
        categoryColors={categoryColors}
      />

      <div className="max-w-xl mx-auto py-8">
        {user && (
          <button
            onClick={logout}
            className="mb-4 bg-red-500 text-white py-2 px-4 rounded-md"
          >
            Logout
          </button>
        )}

        <h2 className="text-3xl font-bold mb-6 text-center">Expense Tracker</h2>
        {user ? (
          <>
            <form onSubmit={addTransaction} className="mb-6">
              {type === "Income" ? (
                <>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="Salary (e.g., 5000)"
                    className="w-full p-2 mb-3 border rounded-md"
                  />
                </>
              ) : (
                <>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount (e.g., 50)"
                    className="w-full p-2 mb-3 border rounded-md"
                  />
                </>
              )}
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (e.g., Lunch)"
                className="w-full p-2 mb-3 border rounded-md"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 mb-3 border rounded-md"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 mb-3 border rounded-md"
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 mb-3 border rounded-md"
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md"
              >
                Add Transaction
              </button>
            </form>

            <div className="mb-6">
              <h2 className="text-xl font-bold">Total Income: ${totalIncome}</h2>
              <h2 className="text-xl font-bold">Total Expenses: ${totalExpenses}</h2>
              <h2 className="text-xl font-bold">Net Balance: ${totalIncome - totalExpenses}</h2>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Transactions</h2>
            <ul>
              {transactions.map((transaction) => (
                <li key={transaction.id} className="mb-3 p-4 bg-white rounded-md shadow">
                  <p>{transaction.description} - {transaction.type}</p>
                  <p>${transaction.amount} - {transaction.category} on {new Date(transaction.createdAt.seconds * 1000).toLocaleString()}</p>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-center">Please log in to view and add transactions.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
