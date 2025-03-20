import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { useLocation } from "wouter";
import { LanguageSelector } from "@/components/language-selector";
import { useBiometric } from "@/lib/biometric";
import { useBlockchain } from "@/lib/blockchain";
import { Fingerprint, Wallet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { loginMutation, registerMutation, user } = useAuth();
  const [, setLocation] = useLocation();
  const { isSupported, register: registerBiometric } = useBiometric();
  const { connectWallet } = useBlockchain();
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function checkBiometric() {
      const supported = await isSupported();
      setBiometricSupported(supported);
    }
    checkBiometric();
  }, [isSupported]);

  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      dateOfBirth: "",
      nationality: "",
      languages: [],
      isAdmin: false,
    },
  });

  const handleRegisterSubmit = async (data: InsertUser) => {
    try {
      registerMutation.mutate(data);
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen relative bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 animate-gradient" />
        <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[url('/refugees.jpg')] bg-cover bg-center opacity-5" />
      </div>

      <div className="min-h-screen flex">
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md backdrop-blur-sm bg-background/95 transition-all duration-500 hover:shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl relative group">
                  <span className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-primary-foreground/50 blur opacity-0 group-hover:opacity-100 transition-all duration-500"></span>
                  <span className="relative bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                    Digital Identity Platform
                  </span>
                </CardTitle>
                <LanguageSelector
                  onSelect={(languages) => {
                    registerForm.setValue("languages", languages);
                  }}
                  value={registerForm.getValues("languages")}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="transition-all duration-300">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4 mt-4">
                  <form
                    onSubmit={loginForm.handleSubmit((data) =>
                      loginMutation.mutate(data)
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        {...loginForm.register("username")}
                        required
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        {...loginForm.register("password")}
                        required
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full transition-all duration-300 hover:scale-105"
                      disabled={loginMutation.isPending}
                    >
                      Login
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4 mt-4">
                  <form
                    onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Username</Label>
                      <Input
                        id="reg-username"
                        {...registerForm.register("username")}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        {...registerForm.register("password")}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        {...registerForm.register("fullName")}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        {...registerForm.register("dateOfBirth")}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        {...registerForm.register("nationality")}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="languages">Languages</Label>
                      <LanguageSelector
                        onSelect={(languages) => {
                          registerForm.setValue("languages", languages);
                        }}
                        value={registerForm.getValues("languages")}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full transition-all duration-300 hover:scale-105"
                      disabled={registerMutation.isPending}
                    >
                      Register
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
          <div className="max-w-lg text-primary-foreground animate-fade-in">
            <h1 className="text-4xl font-bold mb-6 animate-pulse">
              Secure Digital Identity for Refugees
            </h1>
            <p className="text-lg opacity-90 mb-4">
              A blockchain-based solution that helps refugees maintain and verify their
              identity documents securely, even without internet access.
            </p>
            <ul className="space-y-2 opacity-75">
              <li className="animate-slide-in" style={{ animationDelay: "200ms" }}>✓ Secure document storage</li>
              <li className="animate-slide-in" style={{ animationDelay: "400ms" }}>✓ Offline access</li>
              <li className="animate-slide-in" style={{ animationDelay: "600ms" }}>✓ Multi-language support</li>
              <li className="animate-slide-in" style={{ animationDelay: "800ms" }}>✓ Blockchain verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}