// src/app/(app)/irac-code/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function IracCodePage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <Code2 className="mr-3 h-7 w-7" />
            IRAC Codes Explained
          </CardTitle>
          <CardDescription>
            Understanding Insecticide Resistance Action Committee (IRAC) Mode of Action (MoA) codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm sm:text-base">
          <div className="p-4 border bg-card rounded-lg shadow">
            <h3 className="font-semibold text-lg text-primary mb-2">What is IRAC?</h3>
            <p className="text-muted-foreground">
              The <Link href="https://irac-online.org/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Insecticide Resistance Action Committee (IRAC)</Link> is an international group of technical experts from agrochemical companies. Their mission is to provide a coordinated industry response to prevent or delay the development of insecticide resistance in agricultural pests.
            </p>
          </div>

          <div className="p-4 border bg-card rounded-lg shadow">
            <h3 className="font-semibold text-lg text-primary mb-2">Purpose of IRAC MoA Classification</h3>
            <p className="text-muted-foreground">
              IRAC assigns a unique code (a number and sometimes a letter) to groups of insecticides based on their **Mode of Action (MoA)** – the specific biochemical process or site within the pest that the insecticide disrupts.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground pl-4">
              <li>Insecticides with the same IRAC MoA code share a common target site and thus, pests resistant to one insecticide in a group are likely to be resistant to others in the same group.</li>
              <li>This classification helps in designing effective insecticide resistance management (IRM) strategies.</li>
            </ul>
          </div>

          <div className="p-4 border bg-card rounded-lg shadow">
            <h3 className="font-semibold text-lg text-primary mb-2">Why are IRAC Codes Important?</h3>
            <p className="text-muted-foreground">
              Using IRAC codes correctly is crucial for sustainable pest control:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground pl-4">
              <li><strong>Resistance Management:</strong> By rotating or alternating insecticides with different IRAC MoA codes, farmers can reduce the selection pressure for resistance to any single mode of action.</li>
              <li><strong>Informed Decisions:</strong> Provides growers, advisors, and crop protection professionals with a clear and simple way to choose appropriate insecticides for their IRM programs.</li>
              <li><strong>Preserving Efficacy:</strong> Helps maintain the long-term effectiveness of available insecticides, ensuring tools remain viable for pest control.</li>
            </ul>
          </div>
          
          <div className="p-4 border bg-card rounded-lg shadow">
            <h3 className="font-semibold text-lg text-primary mb-2">Key Principles for IRM using IRAC Codes</h3>
             <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground pl-4">
                <li><strong>Rotate MoA Groups:</strong> Avoid repeated use of insecticides from the same IRAC MoA group against successive generations of a pest.</li>
                <li><strong>Use Spray Windows:</strong> Apply products from the same MoA group within a defined spray window or treatment block and then switch to a different MoA group for the next window.</li>
                <li><strong>Follow Label Instructions:</strong> Always adhere to product label recommendations regarding application rates, timing, and resistance management advice.</li>
                <li><strong>Integrate Pest Management (IPM):</strong> Use IRAC codes as part of a broader IPM strategy that includes cultural, biological, and other non-chemical control methods.</li>
            </ul>
          </div>

          <div className="mt-6 p-4 border-t border-dashed">
            <p className="text-center text-sm text-muted-foreground">
              For the most current and detailed IRAC MoA classification and resistance management guidelines, please visit the official IRAC website:
              <br />
              <Link
                href="https://irac-online.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-accent hover:underline font-medium mt-1"
              >
                irac-online.org <ExternalLink className="ml-1 h-4 w-4" />
              </Link>
            </p>
            <p className="text-center text-xs text-muted-foreground/80 mt-2">
              The information provided here is for general understanding. Always consult official resources and local agricultural advisors for specific recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
