import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Trash2, Save, X, Copy } from 'lucide-react';
import { GeneData, InternalFields, useGenes } from '@/hooks/useGenes';
import { useToast } from '@/components/ui/use-toast';

interface CloneManagementProps {
  geneData: GeneData;
  onUpdate?: (updatedData: GeneData) => void;
}

export const CloneManagement: React.FC<CloneManagementProps> = ({ geneData, onUpdate }) => {
  const { updateInternalFields, deleteClone } = useGenes();
  const { toast } = useToast();
  const [editingClone, setEditingClone] = useState<string | null>(null);
  const [isAddingClone, setIsAddingClone] = useState(false);
  const [formData, setFormData] = useState<Partial<InternalFields>>({});

  const clones = geneData.internal_fields || [];

  const handleEdit = (clone: InternalFields) => {
    setEditingClone(clone.id);
    setFormData(clone);
  };

  const handleAddNew = () => {
    setIsAddingClone(true);
    setFormData({ clone: '' });
  };

  const handleSave = async () => {
    try {
      if (isAddingClone) {
        await updateInternalFields(geneData.id, formData);
        setIsAddingClone(false);
      } else if (editingClone) {
        await updateInternalFields(geneData.id, formData, editingClone);
        setEditingClone(null);
      }
      setFormData({});
      onUpdate?.(geneData);
    } catch (error) {
      console.error('Error saving clone:', error);
    }
  };

  const handleCancel = () => {
    setEditingClone(null);
    setIsAddingClone(false);
    setFormData({});
  };

  const handleDelete = async (cloneId: string) => {
    try {
      await deleteClone(cloneId);
      onUpdate?.(geneData);
    } catch (error) {
      console.error('Error deleting clone:', error);
    }
  };

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

  const renderField = (label: string, value: string | number | undefined, key: keyof InternalFields) => {
    if (!value) return null;
    
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
        <div className="flex items-center">
          <span className="text-sm">{value}</span>
          <CopyButton text={String(value)} />
        </div>
      </div>
    );
  };

  const renderEditField = (label: string, key: keyof InternalFields, type: 'text' | 'number' | 'textarea' = 'text') => {
    const value = formData[key];
    
    return (
      <div className="space-y-2">
        <Label htmlFor={key}>{label}</Label>
        {type === 'textarea' ? (
          <Textarea
            id={key}
            value={String(value || '')}
            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
            rows={2}
          />
        ) : (
          <Input
            id={key}
            type={type}
            value={String(value || '')}
            onChange={(e) => setFormData({ 
              ...formData, 
              [key]: type === 'number' ? Number(e.target.value) : e.target.value 
            })}
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Clone Management ({clones.length} clones)</h3>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Clone
        </Button>
      </div>

      {/* Add New Clone Form */}
      {isAddingClone && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Clone</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="product">Product Details</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {renderEditField("Clone *", "clone")}
                  {renderEditField("Host", "host")}
                  {renderEditField("Clonality", "clonality")}
                  {renderEditField("Isotype", "isotype")}
                  {renderEditField("Light Chain", "light_chain")}
                  {renderEditField("Immunogen", "immunogen", "textarea")}
                </div>
              </TabsContent>
              
              <TabsContent value="product" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {renderEditField("NBT Number", "nbt_num")}
                  {renderEditField("Catalog Number", "catalog_num")}
                  {renderEditField("Parent Product ID", "parent_product_id")}
                  {renderEditField("Price (USD)", "price_usd", "number")}
                  {renderEditField("Product Application", "product_application")}
                  {renderEditField("Research Area", "research_area")}
                </div>
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {renderEditField("Storage Temperature", "storage_temperature")}
                  {renderEditField("Lead Time", "lead_time")}
                  {renderEditField("Country of Origin", "country_of_origin")}
                  {renderEditField("Expression System", "expression_system")}
                  {renderEditField("Purification", "purification")}
                  {renderEditField("Supplied As", "supplied_as")}
                  {renderEditField("Species Reactivity", "species_reactivity")}
                  {renderEditField("Cellular Localization", "product_cellular_localization")}
                  {renderEditField("Molecular Weight", "molecular_wt")}
                </div>
              </TabsContent>
              
              <TabsContent value="documentation" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {renderEditField("Datasheet URL", "datasheet_url")}
                  {renderEditField("SDS URL", "sds_url")}
                  {renderEditField("Website URL", "website_url_to_product")}
                  {renderEditField("Image URL", "image_url")}
                  {renderEditField("Notes", "notes", "textarea")}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Clone
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Clones */}
      <div className="space-y-4">
        {clones.map((clone) => (
          <Card key={clone.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{clone.clone || 'Unnamed Clone'}</CardTitle>
                  {clone.host && <Badge variant="secondary">{clone.host}</Badge>}
                  {clone.clonality && <Badge variant="outline">{clone.clonality}</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(clone)}
                    disabled={editingClone === clone.id}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(clone.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editingClone === clone.id ? (
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="product">Product Details</TabsTrigger>
                    <TabsTrigger value="technical">Technical</TabsTrigger>
                    <TabsTrigger value="documentation">Documentation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {renderEditField("Clone *", "clone")}
                      {renderEditField("Host", "host")}
                      {renderEditField("Clonality", "clonality")}
                      {renderEditField("Isotype", "isotype")}
                      {renderEditField("Light Chain", "light_chain")}
                      {renderEditField("Immunogen", "immunogen", "textarea")}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="product" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {renderEditField("NBT Number", "nbt_num")}
                      {renderEditField("Catalog Number", "catalog_num")}
                      {renderEditField("Parent Product ID", "parent_product_id")}
                      {renderEditField("Price (USD)", "price_usd", "number")}
                      {renderEditField("Product Application", "product_application")}
                      {renderEditField("Research Area", "research_area")}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="technical" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {renderEditField("Storage Temperature", "storage_temperature")}
                      {renderEditField("Lead Time", "lead_time")}
                      {renderEditField("Country of Origin", "country_of_origin")}
                      {renderEditField("Expression System", "expression_system")}
                      {renderEditField("Purification", "purification")}
                      {renderEditField("Supplied As", "supplied_as")}
                      {renderEditField("Species Reactivity", "species_reactivity")}
                      {renderEditField("Cellular Localization", "product_cellular_localization")}
                      {renderEditField("Molecular Weight", "molecular_wt")}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="documentation" className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {renderEditField("Datasheet URL", "datasheet_url")}
                      {renderEditField("SDS URL", "sds_url")}
                      {renderEditField("Website URL", "website_url_to_product")}
                      {renderEditField("Image URL", "image_url")}
                      {renderEditField("Notes", "notes", "textarea")}
                    </div>
                  </TabsContent>
                  
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      SaveChanges
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </Tabs>
              ) : (
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Basic Information</h4>
                    {renderField("Catalog #", clone.catalog_num, "catalog_num")}
                    {renderField("NBT #", clone.nbt_num, "nbt_num")}
                    {renderField("Isotype", clone.isotype, "isotype")}
                    {renderField("Light Chain", clone.light_chain, "light_chain")}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Product Details</h4>
                    {renderField("Price (USD)", clone.price_usd, "price_usd")}
                    {renderField("Application", clone.product_application, "product_application")}
                    {renderField("Research Area", clone.research_area, "research_area")}
                    {renderField("Storage Temp", clone.storage_temperature, "storage_temperature")}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Technical</h4>
                    {renderField("Expression System", clone.expression_system, "expression_system")}
                    {renderField("Purification", clone.purification, "purification")}
                    {renderField("Species Reactivity", clone.species_reactivity, "species_reactivity")}
                    {renderField("Molecular Weight", clone.molecular_wt, "molecular_wt")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {clones.length === 0 && !isAddingClone && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No clones added yet. Click "Add Clone" to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
