import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import TransactionForm from "./TransactionForm"; // Import the form
import TransactionSummary from "./TransactionSummary"; // Import the summary
import Chart from "./Chart"; // Import the chart component

const Home = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    if (!user) return; // Exit early if user is not logged in

    const unsub = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const newTransactions = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((transaction) => transaction.userId === user.uid); // Filter by user ID

      setTransactions(newTransactions);

      // Calculate totals
      const income = newTransactions
        .filter((transaction) => transaction.type === "Income")
        .reduce((acc, transaction) => acc + transaction.amount, 0);
      const expenses = newTransactions
        .filter((transaction) => transaction.type === "Expense")
        .reduce((acc, transaction) => acc + transaction.amount, 0);

      setTotalIncome(income);
      setTotalExpenses(expenses);
    });

    return () => unsub(); // Cleanup subscription on unmount
  }, [user]);

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user ? user.email : "Guest"}</h1>

      {/* Chart displaying total income and expenses */}
      <Chart 
        transactions={transactions}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />

      {/* Transaction Form for adding new transactions */}
      <TransactionForm user={user} />

      {/* Summary of transactions */}
      <TransactionSummary transactions={transactions} />
    </div>
  );
};

export default Home;
