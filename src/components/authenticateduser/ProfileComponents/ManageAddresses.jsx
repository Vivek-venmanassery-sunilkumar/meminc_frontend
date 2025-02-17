import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";


export default function ManageAddresses() {
  const [addresses, setAddresses] = useState([
    { id: 1, street: "123 Main St", city: "Anytown", state: "State", country: "Country", pincode: "12345" },
    { id: 2, street: "456 Elm St", city: "Othertown", state: "State", country: "Country", pincode: "67890" },
  ]);

  const handleDelete = (id) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.map((address) => (
          <div key={address.id} className="mb-4 p-4 border rounded-md relative group">
            <p>{address.street}</p>
            <p>{`${address.city}, ${address.state}, ${address.country} ${address.pincode}`}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <Accordion type="single" collapsible>
          <AccordionItem value="add-address">
            <AccordionTrigger>Add New Address</AccordionTrigger>
            <AccordionContent>
              <form className="space-y-4">
                <Input placeholder="Street Address" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="City" />
                  <Input placeholder="State" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Country" />
                  <Input placeholder="Pincode" />
                </div>
                <Button type="submit">Add Address</Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}