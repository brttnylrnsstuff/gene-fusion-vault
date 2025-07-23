
import React, { useState } from 'react';
import { Database, Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GeneSearch } from '@/components/GeneSearch';
import { GeneDataDisplay } from '@/components/GeneDataDisplay';
import { GeneDataTable } from '@/components/GeneDataTable';
import { AuthButton } from '@/components/AuthButton';
import { useGenes } from '@/hooks/useGenes';
import { useToast } from '@/hooks/use-toast';

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
        description: `Searching for ${geneSymbol}...`,
      });

      const externalData = await fetchExternalGeneData(geneSymbol);
      
      if (externalData && externalData.hits && externalData.hits.length > 0) {
        const geneInfo = externalData.hits[0];
        
        // Save the gene to database
        const savedGene = await saveGene({
          symbol: geneInfo.symbol || geneSymbol,
          entrez_id: geneInfo.entrezgene?.toString(),
          name: geneInfo.name,
          description: geneInfo.summary
        });

        if (savedGene) {
          setSelectedGene(savedGene.id);
          setActiveTab('details');
        }
      } else {
        toast({
          title: "Gene not found",
          description: `No data found for gene symbol: ${geneSymbol}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error handling gene selection:', error);
      toast({
        title: "Error",
        description: "Failed to fetch gene data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneUpdate = (updatedData: any) => {
    console.log('Gene data updated:', updatedData);
  };

  const selectedGeneData = selectedGene ? genes.find(g => g.id === selectedGene) : null;

  // Transform genes data for the table
  const tableData = genes.map(gene => {
    // Extract chromosomal location from external data if available
    let chromosome = 'N/A';
    if (gene.external_data?.genomic_pos) {
      chromosome = gene.external_data.genomic_pos.chr || 'N/A';
    }
    
    return {
      id: gene.id,
      symbol: gene.symbol,
      name: gene.name || 'Unknown',
      chromosome,
      organism: 'Homo sapiens',
      proteinName: gene.description || 'N/A',
      priority: (gene.internal_fields?.tags?.includes('high-priority') ? 'High' : 
                gene.internal_fields?.tags?.includes('medium-priority') ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
      assignedTo: gene.internal_fields?.assigned_to || '',
      lastModified: new Date(gene.internal_fields?.updated_at || gene.updated_at).toLocaleDateString(),
      status: (gene.internal_fields?.tags?.includes('complete') ? 'Complete' : 
              gene.internal_fields?.tags?.includes('partial') ? 'Partial' : 'Pending') as 'Complete' | 'Partial' | 'Pending',
      tags: gene.internal_fields?.tags || [],
      // Include all internal fields for export
      notes: gene.internal_fields?.notes,
      nbt_num: gene.internal_fields?.nbt_num,
      catalog_num: gene.internal_fields?.catalog_num,
      host: gene.internal_fields?.host,
      clone: gene.internal_fields?.clone,
      clonality: gene.internal_fields?.clonality,
      isotype: gene.internal_fields?.isotype,
      price_usd: gene.internal_fields?.price_usd,
      parent_product_id: gene.internal_fields?.parent_product_id,
      light_chain: gene.internal_fields?.light_chain,
      storage_temperature: gene.internal_fields?.storage_temperature,
      lead_time: gene.internal_fields?.lead_time,
      country_of_origin: gene.internal_fields?.country_of_origin,
      datasheet_url: gene.internal_fields?.datasheet_url,
      website_url_to_product: gene.internal_fields?.website_url_to_product,
      product_application: gene.internal_fields?.product_application,
      research_area: gene.internal_fields?.research_area,
      image_url: gene.internal_fields?.image_url,
      image_filename: gene.internal_fields?.image_filename,
      image_caption: gene.internal_fields?.image_caption,
      positive_control: gene.internal_fields?.positive_control,
      expression_system: gene.internal_fields?.expression_system,
      purification: gene.internal_fields?.purification,
      supplied_as: gene.internal_fields?.supplied_as,
      immunogen: gene.internal_fields?.immunogen,
    };
  });

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
                <p className="text-sm text-muted-foreground">MyGene.info Integration</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <AuthButton />
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
              Browse All ({genes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <div className="text-center space-y-4 mb-8">
              <h2 className="text-3xl font-bold">Gene Database Search</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Enter a gene symbol to fetch comprehensive data from MyGene.info and save it to your database
                with internal research annotations and notes.
              </p>
            </div>
            <GeneSearch onGeneSelect={handleGeneSelect} />
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {selectedGeneData ? (
              <GeneDataDisplay 
                geneData={selectedGeneData} 
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
                Browse and manage all {genes.length} gene records in your database
              </p>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading genes...</p>
              </div>
            ) : (
              <GeneDataTable 
                data={tableData} 
                onRowSelect={setSelectedGene} 
              />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
