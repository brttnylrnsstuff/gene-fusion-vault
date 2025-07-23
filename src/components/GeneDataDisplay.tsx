import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy } from 'lucide-react';
import { GeneData, useGenes } from '@/hooks/useGenes';
import { useToast } from '@/components/ui/use-toast';
import { CloneManagement } from './CloneManagement';

interface GeneDataDisplayProps {
  geneData: GeneData;
  onUpdate?: (updatedData: GeneData) => void;
}

export const GeneDataDisplay: React.FC<GeneDataDisplayProps> = ({ geneData, onUpdate }) => {
  const { fetchExternalGeneData } = useGenes();
  const { toast } = useToast();
  const [externalData, setExternalData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchExternalGeneData(geneData.symbol);
      setExternalData(data);
    };
    fetchData();
  }, [geneData.symbol, fetchExternalGeneData]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `"${text}" has been copied to your clipboard.`,
    });
  };

  const CopyButton: React.FC<{ text: string }> = ({ text }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text)}
      className="ml-2 h-6 w-6 p-0"
    >
      <Copy className="h-3 w-3" />
    </Button>
  );

  const getExternalValue = (path: string) => {
    if (!externalData?.hits?.[0]) return null;
    return path.split('.').reduce((obj, key) => obj?.[key], externalData.hits[0]);
  };

  return (
    <div className="space-y-6">
      {/* Gene Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{geneData.symbol}</CardTitle>
              <p className="text-muted-foreground">{geneData.name || 'No name available'}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={`https://mygene.info/v3/gene/${geneData.entrez_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  MyGene.info
                </a>
              </Button>
              {geneData.entrez_id && (
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://www.ncbi.nlm.nih.gov/gene/${geneData.entrez_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    NCBI
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {geneData.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{geneData.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {geneData.entrez_id && (
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Entrez ID:</span>
                  <span className="text-sm">{geneData.entrez_id}</span>
                  <CopyButton text={geneData.entrez_id} />
                </div>
              )}
              
              {(geneData.map_location || getExternalValue('genomic_pos.chr')) && (
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Location:</span>
                  <span className="text-sm">{geneData.map_location || getExternalValue('genomic_pos.chr')}</span>
                  <CopyButton text={geneData.map_location || getExternalValue('genomic_pos.chr')} />
                </div>
              )}
              
              {(geneData.uniprot_id || getExternalValue('uniprot.Swiss-Prot')) && (
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">UniProt:</span>
                  <span className="text-sm">{geneData.uniprot_id || getExternalValue('uniprot.Swiss-Prot')}</span>
                  <CopyButton text={geneData.uniprot_id || getExternalValue('uniprot.Swiss-Prot')} />
                </div>
              )}
              
              {(geneData.ensembl_id || getExternalValue('ensembl.gene')) && (
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Ensembl:</span>
                  <span className="text-sm">{geneData.ensembl_id || getExternalValue('ensembl.gene')}</span>
                  <CopyButton text={geneData.ensembl_id || getExternalValue('ensembl.gene')} />
                </div>
              )}
              
              {(geneData.type_of_gene || getExternalValue('type_of_gene')) && (
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Gene Type:</span>
                  <Badge variant="secondary">{geneData.type_of_gene || getExternalValue('type_of_gene')}</Badge>
                </div>
              )}
            </div>

            {(geneData.summary || getExternalValue('summary')) && (
              <div>
                <h3 className="font-medium mb-2">Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {geneData.summary || getExternalValue('summary')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Clone Management */}
      <CloneManagement geneData={geneData} onUpdate={onUpdate} />
    </div>
  );
};