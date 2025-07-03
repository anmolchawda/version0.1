// src/app/(app)/frac-code/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function FracCodePage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold text-primary">
            <Code2 className="mr-3 h-7 w-7" />
            FRAC Codes Explained
          </CardTitle>
          <CardDescription>
            Understanding Fungicide Resistance Action Committee (FRAC) Mode of Action (MoA) codes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm sm:text-base">
          <div className="p-4 border bg-card rounded-lg shadow">
            <h3 className="font-semibold text-lg text-primary mb-2">What is FRAC?</h3>
            <p className="text-muted-foreground">
              The <Link href="https://www.frac.info/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Fungicide Resistance Action Committee (FRAC)</Link> is an international group of technical experts from the crop protection industry. Their primary goal is to provide fungicide resistance management guidelines to prolong the effectiveness of fungicides and limit crop losses.
            </p>
          </div>

          <div className="p-4 border bg-card rounded-lg shadow">
            <h3 className="font-semibold text-lg text-primary mb-2">Purpose of FRAC MoA Classification</h3>
            <p className="text-muted-foreground">
              FRAC assigns a unique code (a number and/or letter) to groups of fungicides based on their **Mode of Action (MoA)** – the specific biochemical process they inhibit in the fungus.
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground pl-4">
              <li>Fungicides with the same FRAC MoA code share a common target site. Continuous use of fungicides from the same group increases the risk of selecting for resistant fungal strains.</li>
              <li>This classification is a key tool for developing effective fungicide resistance management (FRM) strategies.</li>
            </ul>
          </div>

          <div className="p-4 border bg-card rounded-lg shadow">
            <h3 className="font-semibold text-lg text-primary mb-2">Why are FRAC Codes Important?</h3>
            <p className="text-muted-foreground">
              Correctly using FRAC codes is essential for sustainable disease control in agriculture:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground pl-4">
              <li><strong>Resistance Management:</strong> By alternating or mixing fungicides with different FRAC MoA codes, farmers can significantly reduce the selection pressure for resistance to any single mode of action.</li>
              <li><strong>Informed Fungicide Choice:</strong> FRAC codes provide growers, advisors, and researchers with a clear and simple way to select fungicides for effective resistance management programs.</li>
              <li><strong>Preserving Fungicide Efficacy:</strong> Helps to maintain the long-term effectiveness of existing and new fungicides, ensuring these valuable tools remain viable for disease control.</li>
              <li><strong>Sustainable Agriculture:</strong> Contributes to more sustainable farming practices by minimizing the impact of fungicide resistance.</li>
            </ul>
          </div>
          
          <div className="p-4 border bg-card rounded-lg shadow">
            <h3 className="font-semibold text-lg text-primary mb-2">Key Principles for FRM using FRAC Codes</h3>
             <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground pl-4">
                <li><strong>Rotate MoA Groups:</strong> Avoid consecutive applications of fungicides from the same FRAC MoA group. Alternate with fungicides from different groups.</li>
                <li><strong>Use Mixtures:</strong> Tank-mixing or using pre-packaged mixtures of fungicides from different MoA groups can be an effective strategy, provided it&apos;s supported by product labels and local recommendations.</li>
 <li><strong>Limit Applications:</strong> Adhere to the recommended maximum number of applications for fungicides within a specific FRAC group per season or crop cycle.</li>
                <li><strong>Follow Label Instructions:</strong> Always read and follow product label recommendations regarding application rates, timing, and specific resistance management advice.</li>
                <li><strong>Integrated Disease Management (IDM):</strong> Incorporate FRAC code-based strategies as part of a broader IDM program that includes cultural practices, resistant varieties, and biological controls where appropriate.</li>
            </ul>
          </div>

          <div className="mt-6 p-4 border-t border-dashed">
            <p className="text-center text-sm text-muted-foreground">
              For the most up-to-date and detailed FRAC MoA classification, publications, and resistance management guidelines, please visit the official FRAC website:
              <br />
              <Link
                href="https://www.frac.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-accent hover:underline font-medium mt-1"
              >
                www.frac.info <ExternalLink className="ml-1 h-4 w-4" />
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
