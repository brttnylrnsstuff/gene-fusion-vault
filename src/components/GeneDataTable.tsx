import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GeneRecord {
  id: string;
  symbol: string;
  name: string;
  chromosome: string;
  organism: string;
  proteinName: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: string;
  lastModified: string;
  status: 'Complete' | 'Partial' | 'Pending';
  tags: string[];
  // Internal fields for export
  notes?: string;
  nbt_num?: string;
  catalog_num?: string;
  host?: string;
  clone?: string;
  clonality?: string;
  isotype?: string;
  price_usd?: number;
  parent_product_id?: string;
  light_chain?: string;
  storage_temperature?: string;
  lead_time?: string;
  country_of_origin?: string;
  datasheet_url?: string;
  website_url_to_product?: string;
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
}

interface GeneDataTableProps {
  data: GeneRecord[];
  onRowSelect: (geneId: string) => void;
}

export const GeneDataTable: React.FC<GeneDataTableProps> = ({ data, onRowSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return data.filter(gene => {
      const matchesSearch = 
        gene.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gene.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gene.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gene.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || gene.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || gene.status === statusFilter;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [data, searchTerm, priorityFilter, statusFilter]);

  const exportData = () => {
    const headers = [
      'Gene ID', 'Symbol', 'Name', 'Chromosome', 'Organism', 'Protein Name', 'Priority', 'Assigned To', 'Last Modified', 'Status', 'Tags',
      'Notes', 'NBT Number', 'Catalog Number', 'Host', 'Clone', 'Clonality', 'Isotype', 'Price (USD)', 'Parent Product ID',
      'Light Chain', 'Storage Temperature', 'Lead Time', 'Country of Origin', 'Datasheet URL', 'Website URL', 
      'Product Application', 'Research Area', 'Image URL', 'Image Filename', 'Image Caption', 'Positive Control',
      'Expression System', 'Purification', 'Supplied As', 'Immunogen'
    ];
    
    const csvData = [
      headers,
      ...filteredData.map(gene => [
        gene.id,
        gene.symbol,
        gene.name,
        gene.chromosome,
        gene.organism,
        gene.proteinName,
        gene.priority,
        gene.assignedTo,
        gene.lastModified,
        gene.status,
        Array.isArray(gene.tags) ? gene.tags.join('; ') : '',
        gene.notes || '',
        gene.nbt_num || '',
        gene.catalog_num || '',
        gene.host || '',
        gene.clone || '',
        gene.clonality || '',
        gene.isotype || '',
        gene.price_usd ? gene.price_usd.toString() : '',
        gene.parent_product_id || '',
        gene.light_chain || '',
        gene.storage_temperature || '',
        gene.lead_time || '',
        gene.country_of_origin || '',
        gene.datasheet_url || '',
        gene.website_url_to_product || '',
        gene.product_application || '',
        gene.research_area || '',
        gene.image_url || '',
        gene.image_filename || '',
        gene.image_caption || '',
        gene.positive_control || '',
        gene.expression_system || '',
        gene.purification || '',
        gene.supplied_as || '',
        gene.immunogen || ''
      ])
    ];
    
    // Properly escape CSV fields that contain commas or quotes
    const csv = csvData.map(row => 
      row.map(field => {
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
          return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gene_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'High': 'destructive',
      'Medium': 'default',
      'Low': 'secondary'
    } as const;
    return <Badge variant={variants[priority as keyof typeof variants]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Complete': 'default',
      'Partial': 'secondary',
      'Pending': 'outline'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Gene Database Records</CardTitle>
          <Button onClick={exportData} variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search genes, symbols, or researchers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Complete">Complete</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gene</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Protein</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No genes found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((gene) => (
                  <TableRow 
                    key={gene.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onRowSelect(gene.id)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium">{gene.symbol}</div>
                        <div className="text-sm text-muted-foreground">{gene.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={gene.name}>
                        {gene.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Chr {gene.chromosome}</div>
                        <div className="text-muted-foreground">{gene.organism}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[150px] truncate text-sm" title={gene.proteinName}>
                        {gene.proteinName}
                      </div>
                    </TableCell>
                    <TableCell>{getPriorityBadge(gene.priority)}</TableCell>
                    <TableCell>{getStatusBadge(gene.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{gene.assignedTo || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{gene.lastModified}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onRowSelect(gene.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => window.open(`https://www.ncbi.nlm.nih.gov/gene?term=${gene.id}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View in Entrez
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => window.open(`https://www.uniprot.org/uniprotkb/?query=${gene.symbol}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View in UniProt
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <div>
            Showing {filteredData.length} of {data.length} records
          </div>
          <div className="flex gap-4">
            {priorityFilter !== 'all' && (
              <Badge variant="outline">Priority: {priorityFilter}</Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="outline">Status: {statusFilter}</Badge>
            )}
            {searchTerm && (
              <Badge variant="outline">Search: "{searchTerm}"</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};