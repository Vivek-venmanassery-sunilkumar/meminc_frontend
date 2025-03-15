import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Assuming you have a Table component
import api from "@/axios/axiosInstance"; // Import the Axios instance
import toast from "react-hot-toast";

export default function Wallet() {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(""); // State to store the amount entered by the user
  const [error, setError] = useState(""); // State to store validation error messages
  const [walletBalance, setWalletBalance] = useState(null); // State to store wallet balance
  const [transactions, setTransactions] = useState([]); // State to store wallet transactions
  const [transactionsLoading, setTransactionsLoading] = useState(true); // State to manage loading state for transactions

  // Fetch wallet balance and transactions when the component mounts
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Fetch wallet balance
        const balanceResponse = await api.get("wallet/customer/wallet-balance/");
        setWalletBalance(balanceResponse.data.wallet_balance);

        // Fetch wallet transactions
        const transactionsResponse = await api.get("wallet/customer-transactions/");
        setTransactions(transactionsResponse.data); // Update to match the API response structure
      } catch (error) {
        console.error("Failed to fetch wallet data:", error);
        setError("Failed to fetch wallet data. Please try again later.");
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchWalletData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay SDK loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAddFunds = async () => {
    // Reset error message
    setError("");

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    // Check if the amount is greater than 500
    if (amount <= 500) {
      setError("Amount must be greater than 500.");
      return;
    }

    setLoading(true);

    try {
      // Fetch Razorpay Key and Order ID from backend
      const response = await api.post("/wallet/customer/", {
        amount: amount, // Send the amount as entered by the user
        currency: "INR", // Currency code
      });

      const { key, order_id } = response.data;

      const options = {
        key,
        amount: amount * 100, // Convert to subunits for Razorpay (frontend only)
        currency: "INR",
        order_id: order_id,
        name: "Your Company Name",
        description: "Add funds to wallet",
        handler: async function (response) {
          try {
            // Send payment details to backend for verification and wallet update
            const paymentResponse = await api.post("/wallet/customer/update-balance/", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount, // Send the amount as entered by the user
            });

            if (paymentResponse.data.success) {
              toast.success("Payment successful! Wallet balance updated.");
              // Update wallet balance in the state
              setWalletBalance(paymentResponse.data.wallet_balance);
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Failed to update wallet balance:", error);
            toast.error("Failed to update wallet balance. Please contact support.");
          }
        },
        prefill: {
          name: "Customer Name", // Replace with dynamic user data if available
          email: "customer@example.com", // Replace with dynamic user data if available
          contact: "9999999999", // Replace with dynamic user data if available
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Failed to initialize payment:", error);
      alert("Failed to initialize payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Display wallet balance */}
        {walletBalance !== null && (
          <p className="mb-4">
            <strong>Wallet Balance:</strong> ₹{walletBalance}
          </p>
        )}

        <p>Enter the amount you want to add to your wallet:</p>
        <div className="flex space-x-4 mt-4">
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="501" // Set minimum value to 501
          />
          <Button onClick={handleAddFunds} disabled={loading || !amount}>
            {loading ? "Processing..." : "Add Funds"}
          </Button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}

        {/* Display wallet transactions */}
        <h3 className="text-lg font-semibold mt-8 mb-4">Wallet Transactions</h3>
        {transactionsLoading ? (
          <p>Loading transactions...</p>
        ) : transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.transaction_id}</TableCell>
                  <TableCell>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.transaction_type}</TableCell>
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