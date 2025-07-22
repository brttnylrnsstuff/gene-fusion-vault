import React, { useState } from 'react';
import { Database, Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneSearch } from '@/components/GeneSearch';
import { GeneDataDisplay } from '@/components/GeneDataDisplay';
import { GeneDataTable } from '@/components/GeneDataTable';

// Mock data for demonstration
const mockGeneData = {
  id: 'uuid-brca1-123',
  symbol: 'BRCA1',
  entrez_id: '672',
  name: 'BRCA1 DNA repair associated',
  description: 'This gene encodes a 190 kD nuclear phosphoprotein that plays a role in maintaining genomic stability and acts as a tumor suppressor.',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  internal_fields: {
    id: 'uuid-internal-123',
    gene_id: 'uuid-brca1-123',
    user_id: 'user-123',
    notes: 'High priority target for breast cancer research. Associated with hereditary breast and ovarian cancer syndrome.',
    assigned_to: 'Dr. Smith',
    tags: ['cancer', 'tumor-suppressor', 'DNA-repair', 'hereditary'],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  entrezData: {
    name: 'BRCA1 DNA repair associated',
    description: 'This gene encodes a 190 kD nuclear phosphoprotein that plays a role in maintaining genomic stability and acts as a tumor suppressor.',
    chromosome: '17',
    location: '17q21.31',
    aliases: ['BRCAI', 'BRCC1', 'BROVCA1', 'FANCS', 'IRIS', 'PNCA4', 'PPP1R53', 'PSCP', 'RNF53'],
    organism: 'Homo sapiens',
  },
  swissprotData: {
    accession: 'P38398',
    proteinName: 'Breast cancer type 1 susceptibility protein',
    function: 'E3 ubiquitin-protein ligase that specifically mediates the formation of Lys-6-linked polyubiquitin chains and plays a central role in DNA repair by facilitating cellular responses to DNA damage.',
    keywords: ['3D-structure', 'Cancer', 'DNA damage', 'DNA repair', 'Ligase', 'Nuclear', 'Phosphoprotein', 'Tumor suppressor', 'Ubl conjugation'],
    length: 1863,
    mass: '207.7 kDa',
  },
};

const mockTableData = [
  {
    id: 'BRCA1',
    symbol: 'BRCA1',
    name: 'BRCA1 DNA repair associated',
    chromosome: '17',
    organism: 'Homo sapiens',
    proteinName: 'Breast cancer type 1 susceptibility protein',
    priority: 'High' as const,
    assignedTo: 'Dr. Smith',
    lastModified: '2024-01-15',
    status: 'Complete' as const,
    tags: ['cancer', 'tumor-suppressor'],
  },
  {
    id: 'TP53',
    symbol: 'TP53',
    name: 'tumor protein p53',
    chromosome: '17',
    organism: 'Homo sapiens',
    proteinName: 'Cellular tumor antigen p53',
    priority: 'High' as const,
    assignedTo: 'Dr. Johnson',
    lastModified: '2024-01-12',
    status: 'Partial' as const,
    tags: ['tumor-suppressor', 'transcription'],
  },
  {
    id: 'EGFR',
    symbol: 'EGFR',
    name: 'epidermal growth factor receptor',
    chromosome: '7',
    organism: 'Homo sapiens',
    proteinName: 'Epidermal growth factor receptor',
    priority: 'Medium' as const,
    assignedTo: 'Dr. Williams',
    lastModified: '2024-01-10',
    status: 'Pending' as const,
    tags: ['receptor', 'oncogene'],
  },
];

const Index = () => {
  const [selectedGene, setSelectedGene] = useState<string | null>(null);
  const [currentGeneData, setCurrentGeneData] = useState(mockGeneData);
  const [activeTab, setActiveTab] = useState('search');

  const handleGeneSelect = (geneId: string) => {
    setSelectedGene(geneId);
    setActiveTab('details');
    // In a real app, this would fetch data from APIs
    console.log(`Fetching data for gene: ${geneId}`);
  };

  const handleGeneUpdate = (updatedData: any) => {
    setCurrentGeneData(updatedData);
    console.log('Gene data updated:', updatedData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Gene Database Tool</h1>
                <p className="text-sm text-muted-foreground">Entrez & SwissProt Integration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('search')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Search
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('browse')}
                className="gap-2"
              >
                <List className="h-4 w-4" />
                Browse All
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search" className="gap-2">
              <Database className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedGene} className="gap-2">
              Gene Details
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <List className="h-4 w-4" />
              Browse All
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Gene Database Search</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enter a gene ID to fetch comprehensive data from Entrez and SwissProt databases, 
                combined with internal research annotations and notes.
              </p>
            </div>
            <GeneSearch onGeneSelect={handleGeneSelect} />
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {selectedGene ? (
              <GeneDataDisplay 
                geneData={currentGeneData} 
                onUpdate={handleGeneUpdate} 
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No gene selected. Please search for a gene first.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-2xl font-bold">Gene Database Records</h2>
              <p className="text-muted-foreground">
                Browse and manage all gene records in the database
              </p>
            </div>
            <GeneDataTable 
              data={mockTableData} 
              onRowSelect={handleGeneSelect} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
