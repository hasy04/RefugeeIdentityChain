import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MockBlockchain } from "@/lib/mock-blockchain";
import { CheckCircle, XCircle } from "lucide-react";

export default function Verify() {
  const { hash } = useParams();
  const blockchain = MockBlockchain.getInstance();

  const { data: document } = useQuery({
    queryKey: [`/api/documents/${hash}`],
  });

  const isValid = hash ? blockchain.verifyDocument(hash) : false;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Document Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            {isValid ? (
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <h2 className="text-xl font-semibold">Document Verified</h2>
                <p className="text-muted-foreground">
                  This document has been verified on the blockchain.
                </p>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                <h2 className="text-xl font-semibold">Invalid Document</h2>
                <p className="text-muted-foreground">
                  This document could not be verified on the blockchain.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
