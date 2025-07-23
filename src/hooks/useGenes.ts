import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Gene {
  id: string;
  symbol: string;
  entrez_id?: string;
  name?: string;
  description?: string;
  map_location?: string;
  uniprot_id?: string;
  ensembl_id?: string;
  type_of_gene?: string;
  tissue_specificity?: string;
  chromosome_location?: string;
  alias?: string[];
  summary?: string;
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
  sds_url?: string;
  species_reactivity?: string;
  product_cellular_localization?: string;
  unigene?: string;
  recommended_name?: string;
  alternative_name?: string;
  synonyms?: string;
  target_background_information?: string;
  molecular_wt?: string;
  created_at: string;
  updated_at: string;
}

export interface GeneData extends Gene {
  internal_fields?: InternalFields[];
  external_data?: {
    genomic_pos?: {
      chr?: string;
      start?: number;
      end?: number;
      strand?: number;
    };
    uniprot?: {
      'Swiss-Prot'?: string;
    };
    ensembl?: {
      gene?: string;
    };
    type_of_gene?: string;
    summary?: string;
    alias?: string[];
  };
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
          .in('gene_id', genesData.map(g => g.id))
          .order('clone', { ascending: true });
        
        if (!error) {
          internalFieldsData = data || [];
        }
      }

      // Combine genes with their internal fields (now multiple per gene)
      const combinedData = genesData?.map(gene => ({
        ...gene,
        internal_fields: internalFieldsData.filter(field => field.gene_id === gene.id)
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

  const saveGene = async (geneData: Partial<Gene> & { external_data?: any }) => {
    try {
      // Extract external data and prepare gene record
      const { external_data, ...geneRecord } = geneData;
      
      // If external data exists, merge it into the gene record
      if (external_data && external_data.hits && external_data.hits.length > 0) {
        const hit = external_data.hits[0];
        geneRecord.map_location = hit.genomic_pos?.chr;
        geneRecord.uniprot_id = hit.uniprot?.['Swiss-Prot'];
        geneRecord.ensembl_id = hit.ensembl?.gene;
        geneRecord.type_of_gene = hit.type_of_gene;
        geneRecord.summary = hit.summary;
        geneRecord.alias = hit.alias;
        geneRecord.chromosome_location = hit.genomic_pos_hg19?.chr;
      }

      // Check if gene already exists
      const { data: existingGene } = await supabase
        .from('genes')
        .select('*')
        .eq('symbol', geneRecord.symbol)
        .single();

      let savedGene;
      if (existingGene) {
        // Update existing gene with new external data
        const { data, error } = await supabase
          .from('genes')
          .update(geneRecord)
          .eq('id', existingGene.id)
          .select()
          .single();

        if (error) throw error;
        savedGene = data;
      } else {
        // Create new gene
        const { data, error } = await supabase
          .from('genes')
          .insert([{
            symbol: geneRecord.symbol!,
            entrez_id: geneRecord.entrez_id,
            name: geneRecord.name,
            description: geneRecord.description,
            map_location: geneRecord.map_location,
            uniprot_id: geneRecord.uniprot_id,
            ensembl_id: geneRecord.ensembl_id,
            type_of_gene: geneRecord.type_of_gene,
            summary: geneRecord.summary,
            alias: geneRecord.alias,
            chromosome_location: geneRecord.chromosome_location
          }])
          .select()
          .single();

        if (error) throw error;
        savedGene = data;
      }

      toast({
        title: "Gene saved",
        description: `${geneRecord.symbol} has been ${existingGene ? 'updated' : 'added'} in the database.`,
      });

      await fetchGenes();
      return savedGene;
    } catch (error: any) {
      toast({
        title: "Error saving gene",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateInternalFields = async (geneId: string, fields: Partial<InternalFields>, cloneId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to update internal fields");
      }

      if (cloneId) {
        // Update existing clone
        const { data, error } = await supabase
          .from('internal_fields')
          .update({ ...fields, updated_at: new Date().toISOString() })
          .eq('id', cloneId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Clone updated",
          description: "Clone information has been saved.",
        });

        await fetchGenes();
        return data;
      } else {
        // Create new clone - clone field is required
        if (!fields.clone) {
          throw new Error('Clone identifier is required for new clones');
        }

        const { data, error } = await supabase
          .from('internal_fields')
          .insert([{
            gene_id: geneId,
            user_id: user.id,
            ...fields
          }])
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Clone added",
          description: "New clone has been added successfully.",
        });

        await fetchGenes();
        return data;
      }
    } catch (error: any) {
      toast({
        title: "Error updating clone",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteClone = async (cloneId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('internal_fields')
        .delete()
        .eq('id', cloneId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchGenes();
      
      toast({
        title: "Clone deleted",
        description: "Clone deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting clone",
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
    deleteClone,
    searchGenes,
    fetchExternalGeneData
  };
};