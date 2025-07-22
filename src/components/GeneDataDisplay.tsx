
import React, { useState, useEffect } from 'react';
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
    tags: geneData.internal_fields?.tags || [],
    parent_product_id: geneData.internal_fields?.parent_product_id || '',
    nbt_num: geneData.internal_fields?.nbt_num || '',
    catalog_num: geneData.internal_fields?.catalog_num || '',
    host: geneData.internal_fields?.host || '',
    clone: geneData.internal_fields?.clone || '',
    clonality: geneData.internal_fields?.clonality || '',
    isotype: geneData.internal_fields?.isotype || '',
    light_chain: geneData.internal_fields?.light_chain || '',
    storage_temperature: geneData.internal_fields?.storage_temperature || '',
    lead_time: geneData.internal_fields?.lead_time || '',
    country_of_origin: geneData.internal_fields?.country_of_origin || '',
    datasheet_url: geneData.internal_fields?.datasheet_url || '',
    website_url_to_product: geneData.internal_fields?.website_url_to_product || '',
    price_usd: geneData.internal_fields?.price_usd?.toString() || '',
    product_application: geneData.internal_fields?.product_application || '',
    research_area: geneData.internal_fields?.research_area || '',
    image_url: geneData.internal_fields?.image_url || '',
    image_filename: geneData.internal_fields?.image_filename || '',
    image_caption: geneData.internal_fields?.image_caption || '',
    positive_control: geneData.internal_fields?.positive_control || '',
    expression_system: geneData.internal_fields?.expression_system || '',
    purification: geneData.internal_fields?.purification || '',
    supplied_as: geneData.internal_fields?.supplied_as || '',
    immunogen: geneData.internal_fields?.immunogen || '',
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [externalData, setExternalData] = useState<any>(null);
  const { toast } = useToast();
  const { updateInternalFields, fetchExternalGeneData } = useGenes();

  useEffect(() => {
    // Fetch external data when component mounts
    const fetchData = async () => {
      try {
        const data = await fetchExternalGeneData(geneData.symbol);
        if (data && data.hits && data.hits.length > 0) {
          setExternalData(data.hits[0]);
        }
      } catch (error) {
        console.error('Failed to fetch external data:', error);
      }
    };

    fetchData();
  }, [geneData.symbol, fetchExternalGeneData]);

  const handleSave = async () => {
    try {
      const fieldsToUpdate = {
        ...editData,
        tags: Array.isArray(editData.tags) ? editData.tags : editData.tags.split(',').map(t => t.trim()).filter(t => t),
        price_usd: editData.price_usd ? parseFloat(editData.price_usd) : undefined,
      };

      await updateInternalFields(geneData.id, fieldsToUpdate);
      setIsEditing(false);
      if (onUpdate) {
        const updatedGeneData = {
          ...geneData,
          internal_fields: {
            ...geneData.internal_fields,
            ...fieldsToUpdate,
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
    // Reset to original values
    setEditData({
      notes: geneData.internal_fields?.notes || '',
      assigned_to: geneData.internal_fields?.assigned_to || '',
      tags: geneData.internal_fields?.tags || [],
      parent_product_id: geneData.internal_fields?.parent_product_id || '',
      nbt_num: geneData.internal_fields?.nbt_num || '',
      catalog_num: geneData.internal_fields?.catalog_num || '',
      host: geneData.internal_fields?.host || '',
      clone: geneData.internal_fields?.clone || '',
      clonality: geneData.internal_fields?.clonality || '',
      isotype: geneData.internal_fields?.isotype || '',
      light_chain: geneData.internal_fields?.light_chain || '',
      storage_temperature: geneData.internal_fields?.storage_temperature || '',
      lead_time: geneData.internal_fields?.lead_time || '',
      country_of_origin: geneData.internal_fields?.country_of_origin || '',
      datasheet_url: geneData.internal_fields?.datasheet_url || '',
      website_url_to_product: geneData.internal_fields?.website_url_to_product || '',
      price_usd: geneData.internal_fields?.price_usd?.toString() || '',
      product_application: geneData.internal_fields?.product_application || '',
      research_area: geneData.internal_fields?.research_area || '',
      image_url: geneData.internal_fields?.image_url || '',
      image_filename: geneData.internal_fields?.image_filename || '',
      image_caption: geneData.internal_fields?.image_caption || '',
      positive_control: geneData.internal_fields?.positive_control || '',
      expression_system: geneData.internal_fields?.expression_system || '',
      purification: geneData.internal_fields?.purification || '',
      supplied_as: geneData.internal_fields?.supplied_as || '',
      immunogen: geneData.internal_fields?.immunogen || '',
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
        <Check className="h-3 w-3 text-green-500" />
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
                <Badge variant="outline">{geneData.entrez_id || geneData.id}</Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {geneData.name || externalData?.name || 'No name available'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://mygene.info/v3/gene/${geneData.entrez_id || geneData.symbol}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                MyGene.info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://www.ncbi.nlm.nih.gov/gene?term=${geneData.symbol}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                NCBI
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
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Name:</span>
                <CopyButton text={geneData.name || externalData?.name || ''} fieldName="name" />
              </div>
              <p className="text-sm text-muted-foreground">{geneData.name || externalData?.name || 'No name available'}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Description:</span>
                <CopyButton text={geneData.description || externalData?.summary || ''} fieldName="description" />
              </div>
              <p className="text-sm text-muted-foreground">{geneData.description || externalData?.summary || 'No description available'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Entrez ID:</span>
                <p className="text-muted-foreground">{geneData.entrez_id || externalData?.entrezgene || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Type:</span>
                <p className="text-muted-foreground">{externalData?.type_of_gene || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Data */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              External Data
              <Badge variant="secondary">MyGene.info</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {externalData ? (
              <div className="space-y-3">
                {externalData.genomic_pos && (
                  <div>
                    <span className="font-medium text-sm">Genomic Position:</span>
                    <p className="text-sm text-muted-foreground">
                      Chr {externalData.genomic_pos.chr}: {externalData.genomic_pos.start?.toLocaleString()}-{externalData.genomic_pos.end?.toLocaleString()}
                    </p>
                  </div>
                )}
                
                {externalData.uniprot && (
                  <div>
                    <span className="font-medium text-sm">UniProt ID:</span>
                    <p className="text-sm text-muted-foreground">{externalData.uniprot["Swiss-Prot"]}</p>
                  </div>
                )}
                
                {externalData.ensembl && (
                  <div>
                    <span className="font-medium text-sm">Ensembl ID:</span>
                    <p className="text-sm text-muted-foreground">{externalData.ensembl.gene}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-muted-foreground text-sm mt-2">Loading external data...</p>
              </div>
            )}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Research notes..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Assigned To</label>
                  <Input
                    value={editData.assigned_to}
                    onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                    placeholder="Researcher name"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Product ID</label>
                  <Input
                    value={editData.parent_product_id}
                    onChange={(e) => setEditData({ ...editData, parent_product_id: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">NBT Number</label>
                  <Input
                    value={editData.nbt_num}
                    onChange={(e) => setEditData({ ...editData, nbt_num: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Catalog Number</label>
                  <Input
                    value={editData.catalog_num}
                    onChange={(e) => setEditData({ ...editData, catalog_num: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Host</label>
                  <Input
                    value={editData.host}
                    onChange={(e) => setEditData({ ...editData, host: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Clone</label>
                  <Input
                    value={editData.clone}
                    onChange={(e) => setEditData({ ...editData, clone: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Clonality</label>
                  <Input
                    value={editData.clonality}
                    onChange={(e) => setEditData({ ...editData, clonality: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Isotype</label>
                  <Input
                    value={editData.isotype}
                    onChange={(e) => setEditData({ ...editData, isotype: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price (USD)</label>
                  <Input
                    type="number"
                    value={editData.price_usd}
                    onChange={(e) => setEditData({ ...editData, price_usd: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Tags (comma-separated)</label>
                  <Input
                    value={Array.isArray(editData.tags) ? editData.tags.join(', ') : editData.tags}
                    onChange={(e) => setEditData({ ...editData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                    placeholder="cancer, oncogene, biomarker"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.notes || 'No notes'}</p>
                </div>
                <div>
                  <span className="font-medium">Assigned To:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.assigned_to || 'Unassigned'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Product ID:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.parent_product_id || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">NBT Number:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.nbt_num || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Catalog Number:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.catalog_num || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Host:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.host || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Clone:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.clone || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Clonality:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.clonality || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium">Isotype:</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.isotype || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Price (USD):</span>
                  <p className="text-muted-foreground">{geneData.internal_fields?.price_usd ? `$${geneData.internal_fields.price_usd}` : 'N/A'}</p>
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
                      <span className="text-xs text-muted-foreground">No tags</span>
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
