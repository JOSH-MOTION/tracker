import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

ChartJS.register(ArcElement, Tooltip, Legend);

// Predefined category colors
const categoryColors = {
  Income: '#28a745', // Green for Income
  Expense: '#dc3545', // Red for Expense
  Transport: '#17a2b8', // Blue for Transport
  Food: '#ffc107', // Yellow for Food
  // Add more categories as needed or leave undefined for dynamic coloring
};

// Function to generate random color for undefined categories
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const Chart = () => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Income and Expenses',
        data: [],
        backgroundColor: [], // Dynamic background colors
      },
    ],
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const transactions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const talliedData = {};

      transactions.forEach((transaction) => {
        const createdAt = transaction.createdAt;
        const date = createdAt instanceof Date ? createdAt : new Date(createdAt.seconds * 1000);
      
        if (isNaN(date)) {
          console.error(`Invalid date for transaction: ${transaction.id}`);
          return;
        }
      
        const month = date.toLocaleString('default', { month: 'long' });
        const category = transaction.category || 'Uncategorized';
        const key = `${month}-${category}`;
      
        if (!talliedData[key]) {
          talliedData[key] = { income: 0, expenses: 0 };
        }
      
        const amount = parseFloat(transaction.amount);
        if (isNaN(amount)) {
          console.warn(`Invalid amount for transaction: ${transaction.id}`);
          return;
        }
      
        if (transaction.type === "Income") {
          talliedData[key].income += amount;
          console.log(`Income added: ${amount} to ${key}`);
        } else if (transaction.type === "Expense") {
          talliedData[key].expenses += amount;
          console.log(`Expense added: ${amount} to ${key}`);
        } else {
          console.warn(`Invalid transaction type: ${transaction.type}`);
        }
      });

      // Extracting labels and data
      const labels = Object.keys(talliedData);
      const incomeData = labels.map((label) => talliedData[label]?.income || 0); // Default to 0 if undefined
      const expenseData = labels.map((label) => talliedData[label]?.expenses || 0); // Default to 0 if undefined

      // Combine income and expense data for the chart
      const chartData = [...incomeData, ...expenseData];

      // Assign colors to each category (using predefined or random color)
      const colors = labels.map(label => {
        const category = label.split('-')[1]; // Extract category from the key
        return categoryColors[category] || getRandomColor(); // Use random color if category not found
      });

      // Update chart data
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
  }, []);

  // Chart options for controlling size and responsiveness
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
