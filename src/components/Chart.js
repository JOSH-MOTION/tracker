// src/components/Chart.js
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

ChartJS.register(ArcElement, Tooltip, Legend);

// Define category colors here
const categoryColors = {
  Income: '#28a745', // Green for Income
  Expense: '#dc3545', // Red for Expense
  Transport: '#17a2b8', // Example category color
  Food: '#ffc107', // Example category color
  // Add more categories and their colors as needed
};

const Chart = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Income and Expenses',
        data: [],
        backgroundColor: [], // This will hold the colors for the chart
      },
    ],
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const transactions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const talliedData = {};

      transactions.forEach((transaction) => {
        // Ensure createdAt is a valid date
        const createdAt = transaction.createdAt;
        const date = createdAt instanceof Date ? createdAt : new Date(createdAt.seconds * 1000);

        if (isNaN(date)) {
          console.error(`Invalid date for transaction: ${transaction.id}`);
          return; // Skip this transaction if the date is invalid
        }

        const month = date.toLocaleString('default', { month: 'long' });
        const category = transaction.category || 'Uncategorized'; // Use a default if no category is provided

        // Create a unique key for each month and category combination
        const key = `${month}-${category}`;

        if (!talliedData[key]) {
          talliedData[key] = { income: 0, expenses: 0 };
        }

        // Validate transaction.amount to ensure it's a number
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount)) {
          console.warn(`Invalid amount for transaction: ${transaction.id}, amount: ${transaction.amount}`);
          return; // Skip this transaction if the amount is invalid
        }

        // Tally income or expenses
        if (transaction.type === "Income") {
          talliedData[key].income += amount;
        } else if (transaction.type === "Expense") {
          talliedData[key].expenses += amount;
        } else {
          console.warn(`Invalid transaction type for transaction: ${transaction.id}, type: ${transaction.type}`);
        }
      });

      // Debugging: Log talliedData to verify values
      console.log('Tallied Data:', talliedData);

      // Safely create labels, incomeData, and expenseData arrays
      const labels = Object.keys(talliedData);
      const incomeData = labels.map((label) => talliedData[label]?.income || 0); // Default to 0 if undefined
      const expenseData = labels.map((label) => talliedData[label]?.expenses || 0); // Default to 0 if undefined

      // Debugging: Log incomeData and expenseData to verify values
      console.log('Income Data:', incomeData);
      console.log('Expense Data:', expenseData);

      // Combine income and expense data for the chart
      const chartData = [...incomeData, ...expenseData];

      // Generate colors for each category based on the predefined category colors
      const colors = labels.map(label => {
        const category = label.split('-')[1]; // Extract the category from the key
        return categoryColors[category] || '#6c757d'; // Default color if category not found
      });

      // Set the data for the chart
      setData({
        labels: labels, // Include both month and category in labels
        datasets: [
          {
            label: 'Income and Expenses',
            data: [...incomeData, ...expenseData], // Include both income and expenses
            backgroundColor: colors,
          },
        ],
      });
    });

    return () => unsubscribe();
  }, []); // Removed user dependency

  // Chart options for controlling size
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Set to false to allow custom sizing
  };

  return (
    <div className="mb-8" style={{ width: '300px', height: '300px' }}> {/* Adjust width and height here */}
      <h2 className="text-2xl font-semibold mb-4">Income and Expense Chart</h2>
      <Doughnut data={data} options={options} />
      <div className="mt-4 flex flex-wrap">
        {data.labels.map((label, index) => (
          <div 
            key={index} 
            className="flex items-center mr-4 mb-2 p-1 rounded border" 
            style={{ backgroundColor: data.datasets[0].backgroundColor[index] }}
          >
            <span className="mr-2">{label}</span>
            <span>${(data.datasets[0].data[index]).toFixed(2)}</span> {/* Display the corresponding income or expense with two decimal places */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chart;
