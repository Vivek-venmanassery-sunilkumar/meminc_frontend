import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$10,000</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$5,000</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$1,000</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

