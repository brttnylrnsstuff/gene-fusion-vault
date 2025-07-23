import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let geneSymbol;
    
    if (req.method === 'POST') {
      const body = await req.json();
      geneSymbol = body.geneSymbol;
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      geneSymbol = url.searchParams.get('geneSymbol');
    }

    if (!geneSymbol) {
      return new Response(
        JSON.stringify({ error: 'Gene symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch gene data from MyGene.info API
    const response = await fetch(
      `https://mygene.info/v3/query?q=${encodeURIComponent(geneSymbol)}&species=human&fields=symbol,name,summary,entrezgene,uniprot,ensembl,genomic_pos,type_of_gene,genomic_pos_hg19&size=5`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`MyGene.info API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-gene-data function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});