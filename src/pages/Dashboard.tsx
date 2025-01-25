import { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Users, DollarSign, Package, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    employeeCount: 0,
    totalSales: 0,
    productCount: 0,
    averageInvoice: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: employeeCount },
        { data: sales },
        { count: productCount },
      ] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('total'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ]);

      const totalSales = sales?.reduce((sum, invoice) => sum + invoice.total, 0) || 0;
      const averageInvoice = sales?.length ? totalSales / sales.length : 0;

      setStats({
        employeeCount: employeeCount || 0,
        totalSales,
        productCount: productCount || 0,
        averageInvoice,
      });
    }

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Employees',
      value: stats.employeeCount,
      icon: <Users size={24} />,
      color: '#2563eb',
    },
    {
      title: 'Total Sales',
      value: `$${stats.totalSales.toFixed(2)}`,
      icon: <DollarSign size={24} />,
      color: '#16a34a',
    },
    {
      title: 'Products',
      value: stats.productCount,
      icon: <Package size={24} />,
      color: '#9333ea',
    },
    {
      title: 'Average Invoice',
      value: `$${stats.averageInvoice.toFixed(2)}`,
      icon: <TrendingUp size={24} />,
      color: '#ea580c',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {statsCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="textSecondary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Box sx={{ color: card.color }}>{card.icon}</Box>
                </Box>
                <Typography variant="h5">{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sales Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { month: 'Jan', sales: 4000 },
                  { month: 'Feb', sales: 3000 },
                  { month: 'Mar', sales: 2000 },
                  { month: 'Apr', sales: 2780 },
                  { month: 'May', sales: 1890 },
                  { month: 'Jun', sales: 2390 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={[
                  { month: 'Jan', revenue: 4000 },
                  { month: 'Feb', revenue: 3000 },
                  { month: 'Mar', revenue: 2000 },
                  { month: 'Apr', revenue: 2780 },
                  { month: 'May', revenue: 1890 },
                  { month: 'Jun', revenue: 2390 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}