import React, { useState } from 'react';
import Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useGenes } from '@/hooks/useGenes';

interface CSVImportDialogProps {
  trigger: React.ReactNode;
}

interface ParsedGeneData {
  symbol: string;
  name?: string;
  entrezgene?: string;
  chromosome?: string;
  map_location?: string;
  type_of_gene?: string;
  summary?: string;
}

interface ParsedCloneData {
  gene_symbol: string;
  clone_id: string;
  vector?: string;
  bacterial_strain?: string;
  antibiotic_resistance?: string;
  concentration?: number;
  location?: string;
  notes?: string;
  priority?: string;
  status?: string;
}

export const CSVImportDialog: React.FC<CSVImportDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('genes');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const { bulkImportGenes, bulkImportClones } = useGenes();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      complete: (results) => {
        const data = results.data as any[];
        const validData = data.filter(row => 
          Object.values(row).some(value => value !== null && value !== undefined && value !== '')
        );
        setParsedData(validData);
        
        if (results.errors.length > 0) {
          setErrors(results.errors.map(error => error.message));
        } else {
          setErrors([]);
        }
      },
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().replace(/\s+/g, '_'),
    });
  };

  const validateGeneData = (data: any[]): { valid: ParsedGeneData[]; errors: string[] } => {
    const validData: ParsedGeneData[] = [];
    const validationErrors: string[] = [];

    data.forEach((row, index) => {
      if (!row.symbol) {
        validationErrors.push(`Row ${index + 1}: Gene symbol is required`);
        return;
      }

      validData.push({
        symbol: row.symbol,
        name: row.name,
        entrezgene: row.entrezgene,
        chromosome: row.chromosome,
        map_location: row.map_location,
        type_of_gene: row.type_of_gene,
        summary: row.summary,
      });
    });

    return { valid: validData, errors: validationErrors };
  };

  const validateCloneData = (data: any[]): { valid: ParsedCloneData[]; errors: string[] } => {
    const validData: ParsedCloneData[] = [];
    const validationErrors: string[] = [];

    data.forEach((row, index) => {
      if (!row.gene_symbol || !row.clone_id) {
        validationErrors.push(`Row ${index + 1}: Gene symbol and clone ID are required`);
        return;
      }

      const concentration = row.concentration ? parseFloat(row.concentration) : undefined;
      if (row.concentration && isNaN(concentration!)) {
        validationErrors.push(`Row ${index + 1}: Invalid concentration value`);
        return;
      }

      validData.push({
        gene_symbol: row.gene_symbol,
        clone_id: row.clone_id,
        vector: row.vector,
        bacterial_strain: row.bacterial_strain,
        antibiotic_resistance: row.antibiotic_resistance,
        concentration,
        location: row.location,
        notes: row.notes,
        priority: row.priority,
        status: row.status,
      });
    });

    return { valid: validData, errors: validationErrors };
  };

  const handleImport = async () => {
    if (!parsedData.length) return;

    setImporting(true);
    setProgress(0);

    try {
      if (activeTab === 'genes') {
        const { valid, errors } = validateGeneData(parsedData);
        if (errors.length > 0) {
          setErrors(errors);
          setImporting(false);
          return;
        }

        const results = await bulkImportGenes(valid, (progress) => setProgress(progress));
        toast({
          title: "Import Complete",
          description: `Successfully imported ${results.successful} genes. ${results.failed} failed.`,
        });
      } else {
        const { valid, errors } = validateCloneData(parsedData);
        if (errors.length > 0) {
          setErrors(errors);
          setImporting(false);
          return;
        }

        const results = await bulkImportClones(valid, (progress) => setProgress(progress));
        toast({
          title: "Import Complete",
          description: `Successfully imported ${results.successful} clones. ${results.failed} failed.`,
        });
      }

      setOpen(false);
      resetState();
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "An error occurred during import. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    setProgress(0);
  };

  const downloadTemplate = (type: 'genes' | 'clones') => {
    let csvContent = '';
    
    if (type === 'genes') {
      csvContent = 'symbol,name,entrezgene,chromosome,map_location,type_of_gene,summary\n';
      csvContent += 'BRCA1,BRCA1 DNA repair associated,672,17q21.31,17q21.31,protein-coding,BRCA1 encodes a 190 kD nuclear phosphoprotein...\n';
    } else {
      csvContent = 'gene_symbol,clone_id,vector,bacterial_strain,antibiotic_resistance,concentration,location,notes,priority,status\n';
      csvContent += 'BRCA1,BRCA1-001,pET28a,DH5α,Kanamycin,100,Freezer A1,Test clone,high,active\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CSV Import</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="genes">Import Genes</TabsTrigger>
            <TabsTrigger value="clones">Import Clones</TabsTrigger>
          </TabsList>

          <TabsContent value="genes" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Gene CSV File</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('genes')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={importing}
              />
              
              <div className="text-sm text-muted-foreground">
                Required columns: symbol<br />
                Optional columns: name, entrezgene, chromosome, map_location, type_of_gene, summary
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clones" className="space-y-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Clone CSV File</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('clones')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={importing}
              />
              
              <div className="text-sm text-muted-foreground">
                Required columns: gene_symbol, clone_id<br />
                Optional columns: vector, bacterial_strain, antibiotic_resistance, concentration, location, notes, priority, status
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {parsedData.length > 0 && errors.length === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Ready to import {parsedData.length} {activeTab === 'genes' ? 'genes' : 'clones'}
            </AlertDescription>
          </Alert>
        )}

        {importing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Importing...</span>
              <span className="text-sm">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!parsedData.length || errors.length > 0 || importing}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import {activeTab === 'genes' ? 'Genes' : 'Clones'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};