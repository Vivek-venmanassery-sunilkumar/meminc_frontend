import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";





export default function Coupons() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: "SUMMER10", type: "percentage", minOrderValue: 100, maxDiscountValue: 20 },
    { id: 2, code: "FLAT50", type: "flat", minOrderValue: 200, maxDiscountValue: 50 },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coupons</CardTitle>
      </CardHeader>
      <CardContent>
        {coupons.map(coupon => (
          <div key={coupon.id} className="mb-4 p-4 border rounded-md">
            <p>Code: {coupon.code}</p>
            <p>Type: {coupon.type}</p>
            <p>Min Order Value: ${coupon.minOrderValue}</p>
            <p>Max Discount Value: ${coupon.maxDiscountValue}</p>
          </div>
        ))}
        <Accordion type="single" collapsible>
          <AccordionItem value="add-coupon">
            <AccordionTrigger>Add New Coupon</AccordionTrigger>
            <AccordionContent>
              <form className="space-y-4">
                <Input placeholder="Coupon Code" />
                <select className="w-full p-2 border rounded-md">
                  <option value="flat">Flat</option>
                  <option value="percentage">Percentage</option>
                </select>
                <Input type="number" placeholder="Min Order Value" />
                <Input type="number" placeholder="Max Discount Value" />
                <Button type="submit">Add Coupon</Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}