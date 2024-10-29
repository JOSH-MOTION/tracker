// TransactionForm.js
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const TransactionForm = ({ user, onTransactionAdded }) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("Expense");

  const addTransaction = async (e) => {
    e.preventDefault();

    if (!amount || !description || !date || !user) return;

    try {
      await addDoc(collection(db, "transactions"), {
        amount: parseFloat(amount),
        category,
        description,
        createdAt: new Date(date),
        type,
        userId: user.uid,
      });

      // Reset form fields
      setAmount("");
      setDescription("");
      setDate("");
      setType("Expense");

      // Notify parent component
      onTransactionAdded();
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <form onSubmit={addTransaction} className="mb-6 w-full max-w-lg">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-full p-2 mb-3 border rounded-md"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
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
        className="w-full bg-green-500 text-white py-2 rounded-md"
      >
        Add Transaction
      </button>
    </form>
  );
};

export default TransactionForm;
