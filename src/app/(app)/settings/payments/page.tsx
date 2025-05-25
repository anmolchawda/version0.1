
// src/app/(app)/settings/payments/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Wallet, ListChecks, DollarSign } from "lucide-react"; // Using Wallet as a generic for GPay

// A simple SVG for Google Pay as Lucide doesn't have a direct one.
const GooglePayLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18.7 3.8C15.4.5 10-.4 5.1 2.2c-2.2 1.2-3.9 3.1-4.8 5.4A9.06 9.06 0 001.9 14c.7 3.1 3.9 5.8 7.2 6.3s6.9-.2 9.4-2.6c.2-.2.3-.5.2-.8l-.6-1.9a.8.8 0 00-1-.6c-1 .2-2.2.2-3.4-.3-1.3-.6-2.3-1.7-2.7-3s.2-2.8 1.2-3.8c1.1-1 2.5-1.5 4-1.3 1.3.1 2.5.7 3.3 1.7.5.6.4 1.5-.2 1.9l-1.3 1c-.3.2-.2.7.1.8.8.3 1.7.3 2.5.1 1.3-.4 2.5-1.4 3.1-2.7.8-1.8.8-3.9.2-5.8z"></path>
    <path d="M8.2 13.5c-.6 1.1-1.8 1.8-3.1 1.8H3V9.1h2.2c1.2 0 2.2.6 2.8 1.6l.2.5z"></path>
  </svg>
);


export default function PaymentsSettingsPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            <DollarSign className="mr-3 h-7 w-7" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage your payment methods for FARMDOCC services or marketplace transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Card className="shadow-md rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center">
                <GooglePayLogo />
                <CardTitle className="text-lg font-semibold ml-3">Google Pay</CardTitle>
              </div>
              <Button variant="outline">Link Account</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Link your Google Pay account for quick and easy payments.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center">
                <CreditCard className="mr-3 h-6 w-6 text-primary" />
                <CardTitle className="text-lg font-semibold">Credit/Debit Cards</CardTitle>
              </div>
              <Button variant="outline">Add New Card</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add and manage your credit or debit cards for payments.
              </p>
            </CardContent>
          </Card>
          
          <Separator className="my-6" />

          <div>
            <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
              <ListChecks className="mr-2 h-6 w-6"/>
              Saved Payment Methods
            </h3>
            <div className="p-6 border-2 border-dashed border-muted-foreground/30 rounded-lg text-center">
              <p className="text-muted-foreground">
                You have no saved payment methods yet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">Linked accounts and cards will appear here.</p>
            </div>
          </div>
        </CardContent>
         <CardFooter>
          <p className="text-xs text-muted-foreground">
            FARMDOCC does not store your full card details. All payment processing is handled by secure third-party providers.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

