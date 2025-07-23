import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Gene {
  id: string;
  symbol: string;
  entrez_id?: string;
  name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InternalFields {
  id: string;
  gene_id: string;
  user_id: string;
  notes?: string;
  assigned_to?: string;
  tags?: string[];
  parent_product_id?: string;
  nbt_num?: string;
  catalog_num?: string;
  host?: string;
  clone?: string;
  clonality?: string;
  isotype?: string;
  light_chain?: string;
  storage_temperature?: string;
  lead_time?: string;
  country_of_origin?: string;
  datasheet_url?: string;
  website_url_to_product?: string;
  price_usd?: number;
  product_application?: string;
  research_area?: string;
  image_url?: string;
  image_filename?: string;
  image_caption?: string;
  positive_control?: string;
  expression_system?: string;
  purification?: string;
  supplied_as?: string;
  immunogen?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneData extends Gene {
  internal_fields?: InternalFields;
  entrezData?: any;
  swissprotData?: any;
}

export const useGenes = () => {
  const [genes, setGenes] = useState<GeneData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchGenes = async () => {
    setLoading(true);
    try {
      const { data: genesData, error: genesError } = await supabase
        .from('genes')
        .select('*')
        .order('created_at', { ascending: false });

      if (genesError) throw genesError;

      // Fetch internal fields for authenticated users
      const { data: { user } } = await supabase.auth.getUser();
      let internalFieldsData = [];
      
      if (user && genesData) {
        const { data, error } = await supabase
          .from('internal_fields')
          .select('*')
          .eq('user_id', user.id)
          .in('gene_id', genesData.map(g => g.id));
        
        if (!error) {
          internalFieldsData = data || [];
        }
      }

      // Combine genes with their internal fields
      const combinedData = genesData?.map(gene => ({
        ...gene,
        internal_fields: internalFieldsData.find(field => field.gene_id === gene.id)
      })) || [];

      setGenes(combinedData);
    } catch (error: any) {
      toast({
        title: "Error fetching genes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveGene = async (geneData: Partial<Gene>) => {
    try {
      const { data, error } = await supabase
        .from('genes')
        .insert([{
          symbol: geneData.symbol!,
          entrez_id: geneData.entrez_id,
          name: geneData.name,
          description: geneData.description
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Gene saved",
        description: `${geneData.symbol} has been added to the database.`,
      });

      await fetchGenes();
      return data;
    } catch (error: any) {
      toast({
        title: "Error saving gene",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateInternalFields = async (geneId: string, fields: Partial<InternalFields>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to update internal fields");
      }

      const { data, error } = await supabase
        .from('internal_fields')
        .upsert({
          gene_id: geneId,
          user_id: user.id,
          ...fields
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Internal fields updated",
        description: "Your notes and assignments have been saved.",
      });

      await fetchGenes();
      return data;
    } catch (error: any) {
      toast({
        title: "Error updating internal fields",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const searchGenes = async (symbol: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('genes')
        .select('*')
        .ilike('symbol', `%${symbol}%`)
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (error: any) {
      toast({
        title: "Error searching genes",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchExternalGeneData = async (geneSymbol: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-gene-data', {
        body: { geneSymbol }
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      toast({
        title: "Error fetching external gene data",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchGenes();
  }, []);

  return {
    genes,
    loading,
    fetchGenes,
    saveGene,
    updateInternalFields,
    searchGenes,
    fetchExternalGeneData
  };
};