import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { UserPlus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  emp_id: string;
  name: string;
  national_id: string;
  hiring_date: string;
  address: string;
  phone_number: string;
  photo_url: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching employees:', error);
      return;
    }

    setEmployees(data || []);
  }

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.emp_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Employees</Typography>
        <Button
          component={Link}
          to="/employees/add"
          variant="contained"
          startIcon={<UserPlus />}
        >
          Add Employee
        </Button>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
        }}
        sx={{ mb: 4 }}
      />

      <Grid container spacing={3}>
        {filteredEmployees.map((employee) => (
          <Grid item xs={12} sm={6} md={4} key={employee.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={employee.photo_url}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{employee.name}</Typography>
                    <Typography color="textSecondary">
                      ID: {employee.emp_id}
                    </Typography>
                  </Box>
                </Box>
                <Typography sx={{ mb: 1 }}>
                  <strong>National ID:</strong> {employee.national_id}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  <strong>Hiring Date:</strong>{' '}
                  {new Date(employee.hiring_date).toLocaleDateString()}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                  <strong>Phone:</strong> {employee.phone_number}
                </Typography>
                <Typography>
                  <strong>Address:</strong> {employee.address}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}