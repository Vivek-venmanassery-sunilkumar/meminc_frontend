
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Wallet() {
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = () => {
    alert(`Withdrawing $${withdrawAmount}`);
    setWithdrawAmount("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Total Earnings: $10,000</p>
        <div className="mt-4">
          <Input
            type="number"
            placeholder="Enter amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <Button className="mt-2" onClick={handleWithdraw}>
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}