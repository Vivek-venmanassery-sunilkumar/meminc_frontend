import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/axios/axiosInstance"; // Import the Axios instance
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming you have a Table component

export default function AdminWallet() {
  const [walletBalance, setWalletBalance] = useState(null); // State to store wallet balance
  const [transactions, setTransactions] = useState([]); // State to store wallet transactions
  const [loading, setLoading] = useState(true); // State to manage loading state
  const [error, setError] = useState(""); // State to store error messages

  // Fetch wallet balance and transactions when the component mounts
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Fetch wallet balance
        const balanceResponse = await api.get("wallet/admin/");
        setWalletBalance(balanceResponse.data.wallet_balance);

        // Fetch wallet transactions
        const transactionsResponse = await api.get("wallet/admin-transactions/");
        setTransactions(transactionsResponse.data); // Update to match the API response structure
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
        setError("Failed to fetch wallet data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display wallet balance */}
        {walletBalance !== null && (
          <p className="mb-4">
            <strong>Wallet Balance:</strong> ₹{walletBalance}
          </p>
        )}

        {/* Display error message if any */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Display wallet transactions */}
        <h3 className="text-lg font-semibold mb-4">Wallet Transactions</h3>
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.transacted_user}</TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
                  <TableCell>{transaction.transaction_through}</TableCell>
                  <TableCell>₹{transaction.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No transactions found.</p>
        )}
      </CardContent>
    </Card>
  );
}