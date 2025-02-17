import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";



export default function BannerManagement() {
  const [banners, setBanners] = useState([
    { id: 1, imageUrl: "/banner1.jpg", expiryDate: "2023-12-31" },
    { id: 2, imageUrl: "/banner2.jpg", expiryDate: "2024-01-31" },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Management</CardTitle>
      </CardHeader>
      <CardContent>
        {banners.map(banner => (
          <div key={banner.id} className="mb-4 p-4 border rounded-md">
            <img src={banner.imageUrl} alt={`Banner ${banner.id}`} className="w-full h-32 object-cover" />
            <p>Expiry Date: {banner.expiryDate}</p>
          </div>
        ))}
        <Accordion type="single" collapsible>
          <AccordionItem value="add-banner">
            <AccordionTrigger>Add New Banner</AccordionTrigger>
            <AccordionContent>
              <form className="space-y-4">
                <Input type="file" />
                <Input type="date" placeholder="Expiry Date" />
                <Button type="submit">Add Banner</Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}