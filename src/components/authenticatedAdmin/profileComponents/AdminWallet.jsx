import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Wallet } from "lucide-react"
import api from "@/axios/axiosInstance"

export default function AdminWallet() {
  const [walletBalance, setWalletBalance] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Fetch wallet balance and transactions when the component mounts
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        // Fetch wallet balance
        const balanceResponse = await api.get("wallet/admin/")
        setWalletBalance(balanceResponse.data.wallet_balance)

        // Fetch wallet transactions
        const transactionsResponse = await api.get("wallet/admin-transactions/")
        setTransactions(transactionsResponse.data)
      } catch (error) {
        console.error("Failed to fetch wallet data:", error)
        setError("Failed to fetch wallet data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [])

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
            <Wallet className="h-5 w-5" />
            Admin Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-10 w-32" />
          ) : error ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#4A5859]">₹{walletBalance}</span>
              <span className="ml-2 text-sm text-gray-500">Total Balance</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Card */}
      <Card className="border-[#4A5859]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#4A5859]">Transaction History</CardTitle>
          <CardDescription>View all wallet transactions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : transactions.length > 0 ? (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-[#4A5859]/5">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTransactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(transaction.timestamp).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{transaction.transacted_user}</TableCell>
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
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {transaction.transaction_through}
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

                    {totalPages <= 7 ? (
                      // Show all pages if there are 7 or fewer
                      [...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => paginate(i + 1)}
                            isActive={currentPage === i + 1}
                            className={currentPage === i + 1 ? "bg-[#4A5859] text-white" : ""}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))
                    ) : (
                      // Show limited pages with ellipsis for many pages
                      <>
                        {/* First page */}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => paginate(1)}
                            isActive={currentPage === 1}
                            className={currentPage === 1 ? "bg-[#4A5859] text-white" : ""}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>

                        {/* Ellipsis if needed */}
                        {currentPage > 3 && (
                          <PaginationItem>
                            <PaginationLink className="cursor-default">...</PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Pages around current page */}
                        {[...Array(5)]
                          .map((_, i) => {
                            const pageNum = Math.max(2, currentPage - 2) + i
                            if (pageNum > 1 && pageNum < totalPages) {
                              return (
                                <PaginationItem key={i}>
                                  <PaginationLink
                                    onClick={() => paginate(pageNum)}
                                    isActive={currentPage === pageNum}
                                    className={currentPage === pageNum ? "bg-[#4A5859] text-white" : ""}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            }
                            return null
                          })
                          .filter(Boolean)}

                        {/* Ellipsis if needed */}
                        {currentPage < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationLink className="cursor-default">...</PaginationLink>
                          </PaginationItem>
                        )}

                        {/* Last page */}
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => paginate(totalPages)}
                            isActive={currentPage === totalPages}
                            className={currentPage === totalPages ? "bg-[#4A5859] text-white" : ""}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

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

