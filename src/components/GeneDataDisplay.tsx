import React, { useState } from 'react';
import { ExternalLink, Edit, Save, X, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { GeneData, useGenes } from '@/hooks/useGenes';

interface GeneDataDisplayProps {
  geneData: GeneData;
  onUpdate?: (updatedData: GeneData) => void;
}

export const GeneDataDisplay: React.FC<GeneDataDisplayProps> = ({ geneData, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    notes: geneData.internal_fields?.notes || '',
    assigned_to: geneData.internal_fields?.assigned_to || '',
    tags: geneData.internal_fields?.tags || []
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();
  const { updateInternalFields } = useGenes();

  const handleSave = async () => {
    try {
      await updateInternalFields(geneData.id, editData);
      setIsEditing(false);
      if (onUpdate) {
        const updatedGeneData = {
          ...geneData,
          internal_fields: {
            ...geneData.internal_fields,
            ...editData,
            updated_at: new Date().toISOString()
          }
        };
        onUpdate(updatedGeneData);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      notes: geneData.internal_fields?.notes || '',
      assigned_to: geneData.internal_fields?.assigned_to || '',
      tags: geneData.internal_fields?.tags || []
    });
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

  // For now, we'll display basic gene info since we don't have external API data yet
  const mockEntrezData = geneData.entrezData || {
    name: geneData.name || 'No name available',
    description: geneData.description || 'No description available',
    chromosome: 'N/A',
    location: 'N/A',
    aliases: [],
    organism: 'Homo sapiens'
  };

  const mockSwissprotData = geneData.swissprotData || {
    accession: 'N/A',
    proteinName: 'N/A',
    function: 'No function data available',
    keywords: [],
    length: 0,
    mass: 'N/A'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {geneData.symbol}
                <Badge variant="outline">{geneData.entrez_id || geneData.id}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {mockEntrezData.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.ncbi.nlm.nih.gov/gene?term=${geneData.symbol}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Entrez
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.uniprot.org/uniprot/?query=${geneData.symbol}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                UniProt
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gene Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Gene Information
              <Badge variant="secondary">Database</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Symbol:</span>
                <CopyButton text={geneData.symbol} fieldName="symbol" />
              </div>
              <p className="text-sm font-medium">{geneData.symbol}</p>
            </div>
            
            <Separator />
            
            {geneData.name && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Name:</span>
                  <CopyButton text={geneData.name} fieldName="name" />
                </div>
                <p className="text-sm text-muted-foreground">{geneData.name}</p>
              </div>
            )}

            {geneData.description && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Description:</span>
                  <CopyButton text={geneData.description} fieldName="description" />
                </div>
                <p className="text-sm text-muted-foreground">{geneData.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Gene ID:</span>
                <p className="text-muted-foreground">{geneData.entrez_id || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <p className="text-muted-foreground">{new Date(geneData.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Data Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              External Data
              <Badge variant="secondary">Future Enhancement</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">
                External API integration will be added to fetch data from:
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <Badge variant="outline">NCBI Entrez</Badge>
                <Badge variant="outline">UniProt</Badge>
                <Badge variant="outline">ENSEMBL</Badge>
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
            Last modified: {geneData.internal_fields?.updated_at ? 
              new Date(geneData.internal_fields.updated_at).toLocaleDateString() : 
              'Never'
            }
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
                    value={editData.assigned_to}
                    onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                    placeholder="Researcher name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={editData.tags.join(', ')}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
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
                  {geneData.internal_fields?.notes || 'No notes added yet.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Assigned To:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.assigned_to || 'Unassigned'}</p>
                </div>
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {geneData.internal_fields?.tags && geneData.internal_fields.tags.length > 0 ? (
                      geneData.internal_fields.tags.map((tag, index) => (
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};