import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRemoteDesktop } from "@/hooks/useRemoteDesktop";
import { Shield, Info, Download, ArrowLeft } from "lucide-react";
import Logo from "@/components/icons/Logo";

const ClientPage = () => {
  const [connectionId, setConnectionId] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const { connect, isConnecting } = useRemoteDesktop();

  const handleConnect = async () => {
    if (!connectionId) {
      toast({
        title: "Connection ID required",
        description: "Please enter a valid connection ID",
        variant: "destructive"
      });
      return;
    }

    try {
      // First attempt to connect
      await connect(connectionId, password || undefined);
      
      // For demo purposes, redirect even if connection fails
      window.location.href = `/session?id=${connectionId}${password ? `&password=${password}` : ''}`;
    } catch (error) {
      // Even if there's an error, redirect to demo mode
      toast({
        title: "Using demo mode",
        description: "Using demo mode since connection to remote server failed",
      });
      
      setTimeout(() => {
        window.location.href = `/session?id=${connectionId}${password ? `&password=${password}` : ''}`;
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <Logo className="h-16 w-16" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">RemoteConnect Client</h1>
            <p className="text-neutral-600">Connect to remote desktops securely</p>
          </div>
          
          <Tabs defaultValue="connect">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="connect">Connect</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connect">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">Connection ID</label>
                      <div className="relative">
                        <Input 
                          value={connectionId}
                          onChange={(e) => setConnectionId(e.target.value)}
                          placeholder="Enter your 9-digit ID"
                          className="pr-10"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Info className="h-5 w-5 text-neutral-400" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-neutral-700 mb-1 block">Password (optional)</label>
                      <Input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter session password"
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        className="w-full" 
                        onClick={handleConnect}
                        disabled={isConnecting}
                      >
                        {isConnecting ? "Connecting..." : "Connect Now"}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-center text-neutral-500 text-sm pt-2">
                      <Shield className="h-5 w-5 mr-2" />
                      End-to-end encrypted connection
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="download">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">RemoteConnect Desktop Client</h3>
                      <p className="text-sm text-neutral-600 mb-4">
                        Download our desktop application for the best remote experience
                      </p>
                      
                      <div className="space-y-3">
                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download for Windows
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download for macOS
                        </Button>
                        <Button className="w-full" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download for Linux
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">System Requirements</h4>
                      <ul className="text-sm text-neutral-600 space-y-1">
                        <li>• Windows 7 or later</li>
                        <li>• macOS 10.13 or later</li>
                        <li>• Ubuntu 18.04, Debian 10, CentOS 7, or later</li>
                        <li>• 2GB RAM minimum</li>
                        <li>• 100MB free disk space</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
          RemoteConnect Client v3.2.1 | © {new Date().getFullYear()} RemoteConnect
        </div>
      </footer>
    </div>
  );
};

export default ClientPage;
