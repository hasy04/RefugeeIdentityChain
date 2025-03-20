import { User } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";

interface IdentityCardProps {
  user: User;
  blockchainHash?: string;
}

export function IdentityCard({ user, blockchainHash }: IdentityCardProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold">Digital Identity Card</h3>
          {blockchainHash && (
            <div className="w-24 h-24">
              <QRCodeSVG
                value={blockchainHash}
                size={96}
                level="H"
                includeMargin={true}
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <p className="text-lg">{user.fullName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
            <p className="text-lg">{user.dateOfBirth}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nationality</label>
            <p className="text-lg">{user.nationality}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Languages</label>
            <p className="text-lg">{user.languages.join(", ")}</p>
          </div>
          {blockchainHash && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Verification Hash</label>
              <p className="text-xs font-mono break-all">{blockchainHash}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
