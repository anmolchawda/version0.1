
// src/app/(app)/crop-science/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, AlertTriangle } from "lucide-react";

// Mock data structure for demonstration
const mockCropData = [
  { id: '1', name: 'Wheat Disease A', type: 'Fungus', impact: 'High', controlMeasure: 'Fungicide X, Crop Rotation' },
  { id: '2', name: 'Corn Nutrient Deficiency (Nitrogen)', type: 'Nutrient', impact: 'Medium', controlMeasure: 'Apply Nitrogen Fertilizer' },
  { id: '3', name: 'Rice Pest Y', type: 'Insect', impact: 'High', controlMeasure: 'Integrated Pest Management, Insecticide Z' },
  { id: '4', name: 'Soybean Virus B', type: 'Virus', impact: 'Medium', controlMeasure: 'Resistant Varieties, Vector Control' },
];

export default function CropSciencePage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl font-bold">
            <FlaskConical className="mr-3 h-7 w-7 text-primary" />
            Crop Science Hub
          </CardTitle>
          <CardDescription>
            Explore data and insights related to crop science, agronomy, and best farming practices. The table below is a placeholder for data that could be sourced from a Google Sheet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 mb-6 border-l-4 border-primary bg-primary/10 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 mr-3 text-primary" />
              <div>
                <h3 className="font-semibold text-primary">Developer Note: Google Sheets Integration</h3>
                <p className="text-sm text-muted-foreground">
                  To display live data from a Google Sheet, you would need to:
                </p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 mt-1">
                  <li>Publish your Google Sheet to the web (e.g., as a CSV).</li>
                  <li>Create a Next.js API route or Server Action to fetch and parse this data.</li>
                  <li>Update this page to fetch from your backend and display the live data.</li>
                  <li>For private sheets, use the Google Sheets API with appropriate authentication (e.g., Service Account).</li>
                </ul>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-primary">Crop Issues & Management (Sample Data)</h3>
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Issue Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Impact Level</TableHead>
                  <TableHead>Control Measures</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCropData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.impact}</TableCell>
                    <TableCell>{item.controlMeasure}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {mockCropData.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              No crop science data to display currently.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
