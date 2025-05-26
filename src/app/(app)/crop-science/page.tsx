// src/app/(app)/crop-science/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical } from "lucide-react";

// Sample data structure for what might come from a Google Sheet
const mockCropData = [
  { id: '1', name: 'Tomato Blight', type: 'Fungal Disease', impact: 'High', controlMeasure: 'Fungicides, Crop Rotation' },
  { id: '2', name: 'Aphids', type: 'Insect Pest', impact: 'Medium', controlMeasure: 'Neem Oil, Ladybugs' },
  { id: '3', name: 'Nitrogen Deficiency', type: 'Nutrient Imbalance', impact: 'Medium', controlMeasure: 'Nitrogen-rich fertilizer' },
  { id: '4', name: 'Powdery Mildew', type: 'Fungal Disease', impact: 'Medium', controlMeasure: 'Sulfur dust, Improve air circulation' },
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
          <p className="mb-4 text-sm text-muted-foreground">
            <strong>Note:</strong> The data below is sample data. Integrating live data from a Google Sheet would typically involve setting up API access or publishing the sheet as a CSV and fetching it.
          </p>
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
