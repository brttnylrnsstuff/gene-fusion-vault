import React, { useState } from 'react';
import { ExternalLink, Edit, Save, X, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface GeneData {
  id: string;
  symbol: string;
  entrezData: {
    name: string;
    description: string;
    chromosome: string;
    location: string;
    aliases: string[];
    organism: string;
  };
  swissprotData: {
    accession: string;
    proteinName: string;
    function: string;
    keywords: string[];
    length: number;
    mass: string;
  };
  internalFields: {
    notes: string;
    tags: string[];
    priority: 'High' | 'Medium' | 'Low';
    lastModified: string;
    assignedTo: string;
  };
}

interface GeneDataDisplayProps {
  geneData: GeneData;
  onUpdate: (updatedData: GeneData) => void;
}

export const GeneDataDisplay: React.FC<GeneDataDisplayProps> = ({ geneData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(geneData.internalFields);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSave = () => {
    const updatedData = {
      ...geneData,
      internalFields: {
        ...editData,
        lastModified: new Date().toISOString().split('T')[0],
      },
    };
    onUpdate(updatedData);
    setIsEditing(false);
    toast({
      title: "Data Updated",
      description: "Internal fields have been successfully updated.",
    });
  };

  const handleCancel = () => {
    setEditData(geneData.internalFields);
    setIsEditing(false);
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: `${fieldName} copied successfully.`,
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, fieldName)}
      className="h-6 w-6 p-0"
    >
      {copiedField === fieldName ? (
        <Check className="h-3 w-3 text-data-green" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {geneData.symbol}
                <Badge variant="outline">{geneData.id}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {geneData.entrezData.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.ncbi.nlm.nih.gov/gene?term=${geneData.id}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Entrez
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.uniprot.org/uniprotkb/${geneData.swissprotData.accession}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                UniProt
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entrez Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Entrez Gene Data
              <Badge variant="secondary">NCBI</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Description:</span>
                <CopyButton text={geneData.entrezData.description} fieldName="description" />
              </div>
              <p className="text-sm text-muted-foreground">{geneData.entrezData.description}</p>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Chromosome:</span>
                <p className="text-muted-foreground">{geneData.entrezData.chromosome}</p>
              </div>
              <div>
                <span className="font-medium">Location:</span>
                <p className="text-muted-foreground">{geneData.entrezData.location}</p>
              </div>
              <div>
                <span className="font-medium">Organism:</span>
                <p className="text-muted-foreground">{geneData.entrezData.organism}</p>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-sm">Aliases:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {geneData.entrezData.aliases.map((alias, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {alias}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SwissProt Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              SwissProt Data
              <Badge variant="secondary">UniProt</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Protein Name:</span>
                <CopyButton text={geneData.swissprotData.proteinName} fieldName="proteinName" />
              </div>
              <p className="text-sm font-medium">{geneData.swissprotData.proteinName}</p>
              <p className="text-xs text-muted-foreground">Accession: {geneData.swissprotData.accession}</p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <span className="font-medium text-sm">Function:</span>
              <p className="text-sm text-muted-foreground">{geneData.swissprotData.function}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Length:</span>
                <p className="text-muted-foreground">{geneData.swissprotData.length} aa</p>
              </div>
              <div>
                <span className="font-medium">Mass:</span>
                <p className="text-muted-foreground">{geneData.swissprotData.mass}</p>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-sm">Keywords:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {geneData.swissprotData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Internal Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              Internal Fields
              <Badge variant="secondary">Editable</Badge>
            </CardTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave} className="gap-1">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="gap-1">
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <CardDescription>
            Last modified: {geneData.internalFields.lastModified}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Add research notes, observations, or comments..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <Input
                    value={editData.assignedTo}
                    onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
                    placeholder="Researcher name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={editData.tags.join(', ')}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()) })}
                    placeholder="cancer, oncogene, biomarker"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium">Notes:</span>
                <p className="text-sm text-muted-foreground mt-1">
                  {geneData.internalFields.notes || 'No notes added yet.'}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Priority:</span>
                  <Badge 
                    variant={geneData.internalFields.priority === 'High' ? 'destructive' : 
                           geneData.internalFields.priority === 'Medium' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {geneData.internalFields.priority}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Assigned To:</span>
                  <p className="text-muted-foreground">{geneData.internalFields.assignedTo || 'Unassigned'}</p>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-sm">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {geneData.internalFields.tags.length > 0 ? (
                    geneData.internalFields.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No tags added</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};