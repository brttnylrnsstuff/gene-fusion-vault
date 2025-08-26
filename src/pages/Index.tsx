import React, { useState } from 'react';
import { Database, Plus, List, ChevronRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneSearch } from '@/components/GeneSearch';
import { GeneDataDisplay } from '@/components/GeneDataDisplay';
import { GeneDataTable } from '@/components/GeneDataTable';
import { AuthButton } from '@/components/AuthButton';
import { CSVImportDialog } from '@/components/CSVImportDialog';
import { useGenes } from '@/hooks/useGenes';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [selectedGene, setSelectedGene] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('search');
  const { genes, loading, saveGene, fetchExternalGeneData } = useGenes();
  const { toast } = useToast();

  const handleGeneSelect = async (geneSymbol: string) => {
    try {
      // First try to find the gene in our database
      const existingGene = genes.find(g => g.symbol.toLowerCase() === geneSymbol.toLowerCase());
      
      if (existingGene) {
        setSelectedGene(existingGene.id);
        setActiveTab('details');
        return;
      }

      // If not found, fetch from external API and save to database
      toast({
        title: "Fetching gene data",
        description: `Looking up ${geneSymbol} from external databases...`,
      });

      const externalData = await fetchExternalGeneData(geneSymbol);
      
      if (externalData && externalData.hits && externalData.hits.length > 0) {
        const hit = externalData.hits[0];
        const geneData = {
          symbol: geneSymbol.toUpperCase(),
          name: hit.name,
          entrez_id: hit.entrezgene?.toString(),
          external_data: externalData
        };

        const savedGene = await saveGene(geneData);
        setSelectedGene(savedGene.id);
        setActiveTab('details');
      } else {
        toast({
          title: "Gene not found",
          description: `No data found for ${geneSymbol} in external databases.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error selecting gene:', error);
      toast({
        title: "Error",
        description: "Failed to fetch gene data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneUpdate = (updatedData: any) => {
    // Handle gene data updates here if needed
    console.log('Gene updated:', updatedData);
  };

  // Find the selected gene data
  const selectedGeneData = selectedGene ? genes.find(g => g.id === selectedGene) : null;

  // Transform genes data for table display
  const tableData = genes.flatMap(gene => {
    const clones = gene.internal_fields || [];
    
    if (clones.length === 0) {
      // Gene with no clones
      return [{
        id: gene.id, // Keep original gene ID
        geneId: gene.id, // Add separate geneId field for lookup
        symbol: gene.symbol,
        name: gene.name || 'Unknown',
        chromosome: gene.map_location || 'N/A',
        organism: 'Human', // Default organism
        proteinName: gene.name || gene.symbol || 'Unknown',
        priority: 'Medium' as const,
        assignedTo: 'Unassigned',
        lastModified: gene.updated_at || gene.created_at,
        status: 'Complete' as const,
        tags: gene.alias || [],
        
        // Optional fields for export
        notes: 'N/A',
        nbt_num: 'N/A',
        catalog_num: 'N/A',
        host: 'N/A',
        clone: 'N/A',
        clonality: 'N/A'
      }];
    }
    
    // Gene with clones - create a row for each clone
    return clones.map(clone => ({
      id: `${gene.id}-${clone.id}`, // Keep composite ID for table row uniqueness
      geneId: gene.id, // Add separate geneId field for lookup
      symbol: gene.symbol,
      name: gene.name || 'Unknown',
      chromosome: gene.map_location || 'N/A',
      organism: 'Human', // Default organism
      proteinName: gene.name || gene.symbol || 'Unknown',
      priority: 'Medium' as const,
      assignedTo: clone.assigned_to || 'Unassigned',
      lastModified: clone.updated_at || clone.created_at,
      status: 'Complete' as const,
      tags: clone.tags || [],
      
      // Optional fields for export
      notes: clone.notes || 'N/A',
      nbt_num: clone.nbt_num || 'N/A',
      catalog_num: clone.catalog_num || 'N/A',
      host: clone.host || 'N/A',
      clone: clone.clone || 'N/A',
      clonality: clone.clonality || 'N/A'
    }));
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <div className="mr-4 hidden md:flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <Database className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">Gene Database Tool</span>
            </a>
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
              <a className="transition-colors hover:text-foreground/80 text-foreground" href="#search">
                Search
              </a>
              <a className="transition-colors hover:text-foreground/80 text-muted-foreground" href="#browse">
                Browse
              </a>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button variant="outline" className="relative h-8 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64">
                <span className="hidden lg:inline-flex">Search genes...</span>
                <span className="inline-flex lg:hidden">Search...</span>
              </Button>
            </div>
            <nav className="flex items-center">
              <AuthButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Gene Search
            </TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedGeneData} className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Gene Details
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Browse All ({genes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl font-bold tracking-tighter">Gene Database Search</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Search for genes by symbol to view comprehensive information from multiple databases including NCBI, UniProt, and Ensembl.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <GeneSearch onGeneSelect={handleGeneSelect} />
            </div>
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>External API Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Real-time Data Fetching</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                  <span>Comprehensive Gene Information</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {selectedGeneData ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('search')}
                  >
                    Back to Search
                  </Button>
                  <ChevronRight className="h-4 w-4" />
                  <h2 className="text-2xl font-bold">{selectedGeneData.symbol}</h2>
                </div>
                <GeneDataDisplay 
                  geneData={selectedGeneData} 
                  onUpdate={handleGeneUpdate} 
                />
              </>
            ) : (
              <div className="text-center">
                <p>No gene selected. Please search for a gene first.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <div className="flex items-center justify-between mb-8">
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">Gene Database Records</h2>
                <p className="text-muted-foreground">
                  Browse and manage all {genes.length} gene records in your database
                </p>
              </div>
              <CSVImportDialog 
                trigger={
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Import CSV
                  </Button>
                }
              />
            </div>
            {loading ? (
              <div className="text-center">Loading genes...</div>
            ) : (
              <GeneDataTable 
                data={tableData} 
                onRowSelect={(geneId) => {
                  setSelectedGene(geneId);
                  setActiveTab('details');
                }} 
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;