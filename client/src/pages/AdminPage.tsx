import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuthentication } from "@/hooks/useAuthentication";
import { 
  Users, 
  Settings, 
  Monitor, 
  Clock, 
  Shield, 
  LayoutDashboard, 
  PaintBucket, 
  LogOut 
} from "lucide-react";

const AdminPage = () => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, logout } = useAuthentication();
  const { toast } = useToast();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  // Active connections query (would be replaced with actual data in a real app)
  const { data: activeConnections = [] } = useQuery({
    queryKey: ['/api/connections/active'],
    enabled: isAuthenticated,
  });

  // White labeling state
  const [brandingSettings, setBrandingSettings] = useState({
    companyName: "RemoteConnect",
    primaryColor: "#3366FF",
    logo: "",
  });

  const handleLogout = () => {
    logout();
    setLocation("/login");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-800 text-white p-4 flex flex-col">
        <div className="flex items-center mb-8">
          <LayoutDashboard className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Button variant="ghost" className="w-full justify-start text-white">
            <Monitor className="h-5 w-5 mr-2" />
            Connections
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white">
            <Users className="h-5 w-5 mr-2" />
            Users
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white">
            <Clock className="h-5 w-5 mr-2" />
            Session History
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white">
            <Shield className="h-5 w-5 mr-2" />
            Security
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white">
            <PaintBucket className="h-5 w-5 mr-2" />
            White Labeling
          </Button>
          <Button variant="ghost" className="w-full justify-start text-white">
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </Button>
        </nav>
        
        <Button variant="ghost" className="justify-start text-white mt-auto" onClick={handleLogout}>
          <LogOut className="h-5 w-5 mr-2" />
          Logout
        </Button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-800">Welcome, Admin</h1>
            <p className="text-neutral-500">Manage your remote connections and settings</p>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Active Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeConnections.length}</div>
                <p className="text-sm text-neutral-500">Current remote sessions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24</div>
                <p className="text-sm text-neutral-500">Registered users</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Server Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="font-medium">Online</span>
                </div>
                <p className="text-sm text-neutral-500">99.9% uptime</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="connections">
            <TabsList className="mb-4">
              <TabsTrigger value="connections">Active Connections</TabsTrigger>
              <TabsTrigger value="branding">White Labeling</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connections">
              <Card>
                <CardHeader>
                  <CardTitle>Active Connections</CardTitle>
                  <CardDescription>Manage current remote desktop sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {activeConnections.length === 0 ? (
                    <div className="text-center py-12">
                      <Monitor className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                      <h3 className="text-lg font-medium text-neutral-700">No active connections</h3>
                      <p className="text-neutral-500">When users connect to remote desktops, they'll appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Connection entries would go here */}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>White Labeling</CardTitle>
                  <CardDescription>Customize the appearance of your client application</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
                      <Input 
                        value={brandingSettings.companyName} 
                        onChange={(e) => setBrandingSettings({...brandingSettings, companyName: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Primary Color</label>
                      <div className="flex space-x-2">
                        <Input 
                          type="color" 
                          value={brandingSettings.primaryColor} 
                          onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                          className="w-12 h-10 p-1"
                        />
                        <Input 
                          value={brandingSettings.primaryColor} 
                          onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Logo Upload</label>
                      <Input type="file" accept="image/*" />
                    </div>
                    
                    <Separator />
                    
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Preview</h3>
                      <div 
                        className="border rounded-lg p-4" 
                        style={{borderColor: brandingSettings.primaryColor}}
                      >
                        <div className="flex items-center" style={{color: brandingSettings.primaryColor}}>
                          <div className="w-10 h-10 rounded bg-current flex items-center justify-center text-white">
                            {brandingSettings.companyName.charAt(0)}
                          </div>
                          <span className="ml-2 font-bold">{brandingSettings.companyName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button>Save Branding Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Server Settings</CardTitle>
                  <CardDescription>Configure your remote desktop server</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Session Timeout (minutes)</label>
                      <Input type="number" defaultValue={30} />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Maximum Concurrent Sessions</label>
                      <Input type="number" defaultValue={10} />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="audit-logs" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="audit-logs" className="text-sm font-medium text-neutral-700">Enable Audit Logs</label>
                    </div>
                    
                    <Button>Save Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
