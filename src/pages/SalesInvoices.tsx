import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  IconButton,
} from '@mui/material';
import { Plus, Search, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface InvoiceItem {
  product_id: string;
  product?: Product;
  quantity: number;
  price: number;
  tax: number;
  discount: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  description: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items?: InvoiceItem[];
}

export default function SalesInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    fetchInvoices();
    fetchProducts();
  }, []);

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        items:invoice_items (
          *,
          product:products (*)
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      return;
    }

    setInvoices(data || []);
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data || []);
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        product_id: '',
        quantity: 1,
        price: 0,
        tax: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      if (product) {
        item.product_id = value;
        item.price = product.price;
        item.tax = product.price * 0.1; // 10% tax
        item.discount = 0;
        item.total = (item.price * item.quantity + item.tax) - item.discount;
      }
    } else {
      (item as any)[field] = value;
      if (field === 'quantity') {
        item.total = (item.price * value + item.tax) - item.discount;
      }
    }

    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    const discount = items.reduce((sum, item) => sum + item.discount, 0);
    const total = subtotal + tax - discount;
    return { subtotal, tax, discount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, tax, discount, total } = calculateTotals();

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert([
        {
          ...formData,
          subtotal,
          tax,
          discount,
          total,
        },
      ])
      .select()
      .single();

    if (invoiceError || !invoice) {
      console.error('Error creating invoice:', invoiceError);
      return;
    }

    const invoiceItems = items.map((item) => ({
      invoice_id: invoice.id,
      ...item,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) {
      console.error('Error creating invoice items:', itemsError);
      return;
    }

    setDialogOpen(false);
    fetchInvoices();
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Sales Invoices</Typography>
        <Button
          variant="contained"
          startIcon={<Plus />}
          onClick={() => {
            setFormData({
              invoice_number: '',
              date: new Date().toISOString().split('T')[0],
              description: '',
            });
            setItems([]);
            setDialogOpen(true);
          }}
        >
          New Invoice
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search invoices..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
        }}
        sx={{ mb: 4 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Subtotal</TableCell>
              <TableCell align="right">Tax</TableCell>
              <TableCell align="right">Discount</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                <TableCell>{invoice.description}</TableCell>
                <TableCell align="right">${invoice.subtotal.toFixed(2)}</TableCell>
                <TableCell align="right">${invoice.tax.toFixed(2)}</TableCell>
                <TableCell align="right">${invoice.discount.toFixed(2)}</TableCell>
                <TableCell align="right">${invoice.total.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>New Invoice</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Invoice Number"
                  value={formData.invoice_number}
                  onChange={(e) =>
                    setFormData({ ...formData, invoice_number: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Items</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Plus />}
                  onClick={handleAddItem}
                >
                  Add Item
                </Button>
              </Box>

              {items.map((item, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      select
                      label="Product"
                      value={item.product_id}
                      onChange={(e) =>
                        handleItemChange(index, 'product_id', e.target.value)
                      }
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      required
                      fullWidth
                      type="number"
                      label="Quantity"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', parseInt(e.target.value))
                      }
                      inputProps={{ min: '1' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tax"
                      value={item.tax}
                      onChange={(e) =>
                        handleItemChange(index, 'tax', parseFloat(e.target.value))
                      }
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      fullWidth <boltAction type="file" filePath="src/pages/SalesInvoices.tsx">                      fullWidth
                      type="number"
                      label="Discount"
                     value={item.discount}
                      onChange={(e) =>
                        handleItemChange(index, 'discount', parseFloat(e.target.value))
                      }
                      inputProps={{ step: '0.01', min: '0' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Total"
                      value={item.total}
                      InputProps={{ readOnly: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1">
                  Subtotal: ${calculateTotals().subtotal.toFixed(2)}
                </Typography>
                <Typography variant="subtitle1">
                  Tax: ${calculateTotals().tax.toFixed(2)}
                </Typography>
                <Typography variant="subtitle1">
                  Discount: ${calculateTotals().discount.toFixed(2)}
                </Typography>
                <Typography variant="h6">
                  Total: ${calculateTotals().total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Invoice
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}