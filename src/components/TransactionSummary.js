// TransactionSummary.js
const TransactionSummary = ({ transactions }) => {
    return (
      <div className="w-full max-w-lg mt-8">
        <h2 className="text-2xl font-semibold mb-4">Transaction Summary</h2>
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Category</th>
              <th className="py-3 px-6 text-left">Type</th>
              <th className="py-3 px-6 text-left">Amount</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm font-light">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-6 text-left">
                  {new Date(transaction.createdAt.seconds * 1000).toLocaleDateString()}
                </td>
                <td className="py-3 px-6 text-left">{transaction.category}</td>
                <td className="py-3 px-6 text-left">{transaction.type}</td>
                <td className="py-3 px-6 text-left">${transaction.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default TransactionSummary;
  