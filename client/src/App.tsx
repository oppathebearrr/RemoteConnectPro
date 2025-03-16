import { Route, Switch } from "wouter";
import HomePage from "@/pages/HomePage";
import ClientPage from "@/pages/ClientPage";
import AdminPage from "@/pages/AdminPage";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import RemoteSessionPage from "@/pages/RemoteSessionPage";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/client" component={ClientPage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/session" component={RemoteSessionPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
