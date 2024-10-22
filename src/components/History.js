import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Ensure the path is correct

const History = ({ user }) => {
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(collection(db, "transactions"), (snapshot) => {
      const newTransactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(newTransactions);
    });

    return () => unsub();
  }, [user]);

  // Prepare monthly summary
  const monthlySummary = transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.createdAt.seconds * 1000).getMonth();
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0 };
    }

    if (transaction.type === "Income") {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expenses += transaction.amount;
    }

    return acc;
  }, {});

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Monthly Summary</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border">Month</th>
            <th className="py-2 px-4 border">Total Income</th>
            <th className="py-2 px-4 border">Total Expenses</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(monthlySummary).map(([month, { income, expenses }]) => (
            <tr key={month}>
              <td className="py-2 px-4 border">{month + 1}</td>
              <td className="py-2 px-4 border">${income}</td>
              <td className="py-2 px-4 border">${expenses}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default History;
