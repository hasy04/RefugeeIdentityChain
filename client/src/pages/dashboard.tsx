import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { IdentityCard } from "@/components/identity-card";
import { LanguageSelector } from "@/components/language-selector";
import { WelcomeBanner } from "@/components/welcome-banner";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IdentityDocument } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LogOut, Upload, Shield, Fingerprint, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { offlineStorage } from "@/lib/offline-storage";
import { useBlockchain } from "@/lib/blockchain";
import { useBiometric } from "@/lib/biometric";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const { connectWallet } = useBlockchain();
  const { isSupported, register: registerBiometric } = useBiometric();
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  // Check biometric support
  useEffect(() => {
    async function checkBiometric() {
      const supported = await isSupported();
      setBiometricSupported(supported);
    }
    checkBiometric();
  }, [isSupported]);

  // Sync offline data when online
  useEffect(() => {
    async function syncData() {
      if (navigator.onLine) {
        const synced = await offlineStorage.sync();
        if (synced) {
          queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        }
      }
    }

    window.addEventListener('online', syncData);
    return () => window.removeEventListener('online', syncData);
  }, []);

  const { data: documents } = useQuery<IdentityDocument[]>({
    queryKey: ["/api/documents"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("document", file);
      const res = await apiRequest("POST", "/api/documents", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded and will be verified soon.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background remains unchanged */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 animate-gradient"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      </div>

      <header className="border-b backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Digital Identity Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <LanguageSelector
              onSelect={(languages) => {
                // Handle language selection
              }}
              value={user?.languages || []}
            />
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="transition-all duration-300 hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <WelcomeBanner />

          <div className="grid gap-8 md:grid-cols-2">
            {/* Identity Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Your Identity
              </h2>
              <div className="transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <IdentityCard
                  user={user!}
                  blockchainHash={documents?.[0]?.blockchainHash}
                />
              </div>

              {/* Security Enhancements Section */}
              <div className="space-y-4 p-6 rounded-lg border backdrop-blur-sm bg-background/95">
                <h3 className="font-semibold">Enhanced Security</h3>

                {/* Biometric Section */}
                <div className="space-y-2">
                  {biometricSupported && !biometricRegistered && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={async () => {
                        if (!user) return;
                        const registered = await registerBiometric(user.username);
                        if (registered) {
                          setBiometricRegistered(true);
                          toast({
                            title: "Biometric Registered",
                            description: "Successfully enabled biometric authentication",
                          });
                        }
                      }}
                    >
                      <Fingerprint className="w-4 h-4 mr-2" />
                      Enable Biometric Authentication
                    </Button>
                  )}
                  {biometricRegistered && (
                    <Alert>
                      <AlertDescription className="text-green-600">
                        ✓ Biometric authentication enabled
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Blockchain Wallet Section */}
                <div className="space-y-2">
                  {!walletConnected && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={async () => {
                        const connected = await connectWallet();
                        if (connected) {
                          setWalletConnected(true);
                          toast({
                            title: "Wallet Connected",
                            description: "Successfully connected blockchain wallet",
                          });
                        }
                      }}
                    >
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Blockchain Wallet
                    </Button>
                  )}
                  {walletConnected && (
                    <Alert>
                      <AlertDescription className="text-green-600">
                        ✓ Blockchain wallet connected
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Document Management
              </h2>

              {/* Upload Section */}
              <div className="space-y-4 p-6 rounded-lg border backdrop-blur-sm bg-background/95">
                <div className="space-y-2">
                  <Label htmlFor="document">Upload Document</Label>
                  <Input
                    id="document"
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadMutation.mutate(file);
                    }}
                    accept="image/*,.pdf"
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload identification documents for verification. Supported formats: Images, PDF.
                </p>
              </div>

              {/* Documents List */}
              {documents && documents.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Documents</h3>
                  <div className="space-y-4">
                    {documents.map((doc) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg backdrop-blur-sm bg-background/95 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className={`w-5 h-5 ${doc.verified ? 'text-green-500' : 'text-yellow-500'}`} />
                          <div>
                            <p className="font-medium">{doc.documentType}</p>
                            <p className="text-sm text-muted-foreground">
                              {doc.verified ? "Verified" : "Pending verification"}
                            </p>
                          </div>
                        </div>
                        {doc.verified && (
                          <Button variant="outline" size="sm">
                            <Upload className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}