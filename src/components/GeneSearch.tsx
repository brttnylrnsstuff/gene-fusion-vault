
import React, { useState } from 'react';
import { Search, Database, ExternalLink, Loader2 } from 'lucide-react';
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
        title: "Gene Symbol Required",
        description: "Please enter a valid gene symbol to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      await onGeneSelect(geneId.trim());
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search for gene. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
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
          Enter a gene symbol to fetch data from MyGene.info and save it to your database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter Gene Symbol (e.g., BRCA1, TP53, EGFR)"
            value={geneId}
            onChange={(e) => setGeneId(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            disabled={isSearching}
          />
          <Button 
            onClick={handleSearch} 
            disabled={isSearching || !geneId.trim()}
            className="px-6"
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
        
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            MyGene.info
          </Badge>
          <Badge variant="secondary">Internal Database</Badge>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>
            <strong>How it works:</strong> First searches your local database. If not found, 
            fetches data from MyGene.info API and saves it to your database for future reference.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
