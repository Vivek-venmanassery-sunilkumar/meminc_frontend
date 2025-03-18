import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Loader2, Plus, CreditCard, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/axios/axiosInstance"
import toast from "react-hot-toast"

export default function Wallet() {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [walletBalance, setWalletBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [transactionsLoading, setTransactionsLoading] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  // Fetch wallet balance and transactions when the component mounts
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Fetch wallet balance
        const balanceResponse = await api.get("wallet/customer/wallet-balance/")
        setWalletBalance(balanceResponse.data.wallet_balance)

        // Fetch wallet transactions
        const transactionsResponse = await api.get("wallet/customer-transactions/")
        setTransactions(transactionsResponse.data)
      } catch (error) {
        console.error("Failed to fetch wallet data:", error)
        setError("Failed to fetch wallet data. Please try again later.")
      } finally {
        setTransactionsLoading(false)
      }
    }

    fetchWalletData()
  }, [])

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => {
      console.log("Razorpay SDK loaded successfully")
    }
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK")
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleAddFunds = async () => {
    // Reset error message
    setError("")

    // Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.")
      return
    }

    // Check if the amount is greater than 500
    if (amount <= 500) {
      setError("Amount must be greater than 500.")
      return
    }

    setLoading(true)

    try {
      // Fetch Razorpay Key and Order ID from backend
      const response = await api.post("/wallet/customer/", {
        amount: amount,
        currency: "INR",
      })

      const { key, order_id } = response.data

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        order_id: order_id,
        name: "Your Company Name",
        description: "Add funds to wallet",
        handler: async (response) => {
          try {
            // Send payment details to backend for verification and wallet update
            const paymentResponse = await api.post("/wallet/customer/update-balance/", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount,
            })

            if (paymentResponse.data.success) {
              toast.success("Payment successful! Wallet balance updated.")
              // Update wallet balance in the state
              setWalletBalance(paymentResponse.data.wallet_balance)
            } else {
              toast.error("Payment verification failed. Please contact support.")
            }
          } catch (error) {
            console.error("Failed to update wallet balance:", error)
            toast.error("Failed to update wallet balance. Please contact support.")
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4A5859",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Failed to initialize payment:", error)
      toast.error("Failed to initialize payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Get current transactions for pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1))

  return (
    <div className="space-y-6">
      {/* Wallet Balance Card */}
      <Card className="border-[#4A5859]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#4A5859] flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {walletBalance !== null ? (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#4A5859]">₹{walletBalance}</span>
              <span className="ml-2 text-sm text-gray-500">Available Balance</span>
            </div>
          ) : (
            <Skeleton className="h-10 w-32" />
          )}
        </CardContent>
      </Card>

      {/* Add Funds Card */}
      <Card className="border-[#4A5859]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#4A5859]">Add Funds</CardTitle>
          <CardDescription>Enter the amount you want to add to your wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Enter amount (min ₹501)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="501"
                className="border-[#4A5859]/20 focus-visible:ring-[#4A5859]"
              />
              {error && (
                <Alert variant="destructive" className="mt-2 py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <Button
              onClick={handleAddFunds}
              disabled={loading || !amount}
              className="bg-[#4A5859] hover:bg-[#4A5859]/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Funds
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Card */}
      <Card className="border-[#4A5859]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#4A5859]">Transaction History</CardTitle>
          <CardDescription>View your recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-[#4A5859]/5">
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{transaction.transaction_id}</TableCell>
                        <TableCell>{new Date(transaction.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              transaction.transaction_type === "credit"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.transaction_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={transaction.transaction_type === "credit" ? "text-green-600" : "text-red-600"}
                          >
                            {transaction.transaction_type === "credit" ? "+" : "-"}₹{transaction.amount}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={prevPage}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => paginate(i + 1)}
                          isActive={currentPage === i + 1}
                          className={currentPage === i + 1 ? "bg-[#4A5859] text-white" : ""}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={nextPage}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

