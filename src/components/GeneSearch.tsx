import React, { useState } from 'react';
import { Search, Database, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface GeneSearchProps {
  onGeneSelect: (geneId: string) => void;
}

export const GeneSearch: React.FC<GeneSearchProps> = ({ onGeneSelect }) => {
  const [geneId, setGeneId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!geneId.trim()) {
      toast({
        title: "Gene ID Required",
        description: "Please enter a valid gene ID to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      onGeneSelect(geneId.trim());
      setIsSearching(false);
      toast({
        title: "Search Initiated",
        description: `Fetching data for gene ID: ${geneId}`,
      });
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Gene Database Search
        </CardTitle>
        <CardDescription>
          Enter a gene ID to fetch data from Entrez and SwissProt databases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter Gene ID (e.g., BRCA1, TP53, EGFR)"
            value={geneId}
            onChange={(e) => setGeneId(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="px-6"
          >
            {isSearching ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {!isSearching && "Search"}
          </Button>
        </div>
        
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            Entrez
          </Badge>
          <Badge variant="outline" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            SwissProt
          </Badge>
          <Badge variant="secondary">Internal DB</Badge>
        </div>
      </CardContent>
    </Card>
  );
};