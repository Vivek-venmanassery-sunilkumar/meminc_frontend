import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Concerns() {
  const [concerns, setConcerns] = useState([
    { id: 1, message: "Issue with product quality", reply: "" },
    { id: 2, message: "Delivery delay", reply: "" },
  ]);

  const handleReplyChange = (id, reply) => {
    setConcerns(concerns.map(concern => concern.id === id ? { ...concern, reply } : concern));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concerns</CardTitle>
      </CardHeader>
      <CardContent>
        {concerns.map(concern => (
          <div key={concern.id} className="mb-4 p-4 border rounded-md">
            <p>{concern.message}</p>
            <Input placeholder="Reply..." value={concern.reply} onChange={(e) => handleReplyChange(concern.id, e.target.value)} />
            <Button className="mt-2">Send Reply</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}