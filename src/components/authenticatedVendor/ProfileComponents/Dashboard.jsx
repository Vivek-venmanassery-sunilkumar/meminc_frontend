

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
              <CardTitle>Total Items Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <p>1,234</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$50,000</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Yearly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p>+15%</p>
            </CardContent>
          </Card>
        </div>
        {/* Placeholder for a graph */}
        <div className="mt-8 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Yearly Growth Graph</p>
        </div>
      </CardContent>
    </Card>
  );
}

