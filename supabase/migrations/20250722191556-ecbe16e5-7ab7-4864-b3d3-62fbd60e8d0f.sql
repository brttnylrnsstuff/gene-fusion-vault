-- Create genes table to store basic gene information
CREATE TABLE public.genes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  entrez_id TEXT,
  name TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create internal_fields table for user-specific gene data
CREATE TABLE public.internal_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gene_id UUID NOT NULL REFERENCES public.genes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  assigned_to TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(gene_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.genes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internal_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for genes table (public read, authenticated users can manage)
CREATE POLICY "Anyone can view genes" 
ON public.genes 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert genes" 
ON public.genes 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update genes" 
ON public.genes 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policies for internal_fields (user-specific access)
CREATE POLICY "Users can view their own internal fields" 
ON public.internal_fields 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own internal fields" 
ON public.internal_fields 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own internal fields" 
ON public.internal_fields 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own internal fields" 
ON public.internal_fields 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_genes_updated_at
BEFORE UPDATE ON public.genes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_internal_fields_updated_at
BEFORE UPDATE ON public.internal_fields
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_genes_symbol ON public.genes(symbol);
CREATE INDEX idx_internal_fields_gene_user ON public.internal_fields(gene_id, user_id);
CREATE INDEX idx_internal_fields_tags ON public.internal_fields USING GIN(tags);