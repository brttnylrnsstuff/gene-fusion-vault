-- Add missing fields to genes table for MyGene.info data
ALTER TABLE public.genes 
ADD COLUMN map_location TEXT,
ADD COLUMN uniprot_id TEXT,
ADD COLUMN ensembl_id TEXT,
ADD COLUMN type_of_gene TEXT,
ADD COLUMN tissue_specificity TEXT,
ADD COLUMN chromosome_location TEXT,
ADD COLUMN alias TEXT[],
ADD COLUMN summary TEXT;

-- Add missing fields to internal_fields table
ALTER TABLE public.internal_fields 
ADD COLUMN sds_url TEXT,
ADD COLUMN species_reactivity TEXT,
ADD COLUMN product_cellular_localization TEXT,
ADD COLUMN unigene TEXT,
ADD COLUMN recommended_name TEXT,
ADD COLUMN alternative_name TEXT,
ADD COLUMN synonyms TEXT,
ADD COLUMN target_background_information TEXT,
ADD COLUMN molecular_wt TEXT;

-- Drop the existing unique constraint to allow multiple clones per gene per user
ALTER TABLE public.internal_fields 
DROP CONSTRAINT IF EXISTS internal_fields_gene_id_user_id_key;

-- Add new unique constraint on gene_id, user_id, and clone to ensure unique clone identifiers
ALTER TABLE public.internal_fields 
ADD CONSTRAINT internal_fields_gene_id_user_id_clone_key 
UNIQUE (gene_id, user_id, clone);

-- Create indexes for better performance on the new structure
CREATE INDEX idx_internal_fields_gene_user_clone ON public.internal_fields(gene_id, user_id, clone);
CREATE INDEX idx_genes_symbol_lookup ON public.genes(symbol, entrez_id);
CREATE INDEX idx_genes_uniprot ON public.genes(uniprot_id);
CREATE INDEX idx_genes_ensembl ON public.genes(ensembl_id);