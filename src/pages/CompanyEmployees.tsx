import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, UserMinus, Mail, Phone, Calendar, ArrowLeft, Search, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Employee {
  id: string;
  email: string;
  name: string;
  phone: string;
  joined_at: string;
  total_bookings: number;
  is_active: boolean;
}

interface Company {
  id: string;
  name: string;
  current_employee_count: number;
  max_employees: number | null;
}

export default function CompanyEmployees() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<Company | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/company-signup');
        return;
      }

      // Load company data
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, current_employee_count, max_employees')
        .eq('owner_user_id', user.id)
        .single();

      if (companyData) {
        setCompany(companyData);
      }

      // Load employees (you'd need to create a company_employees table or similar)
      // For now, showing mock data
      const mockEmployees: Employee[] = [
        {
          id: '1',
          email: 'john.doe@company.com',
          name: 'John Doe',
          phone: '+1 (555) 123-4567',
          joined_at: '2025-01-15T10:00:00Z',
          total_bookings: 5,
          is_active: true
        },
        {
          id: '2',
          email: 'jane.smith@company.com',
          name: 'Jane Smith',
          phone: '+1 (555) 234-5678',
          joined_at: '2025-02-01T10:00:00Z',
          total_bookings: 3,
          is_active: true
        },
        {
          id: '3',
          email: 'bob.johnson@company.com',
          name: 'Bob Johnson',
          phone: '+1 (555) 345-6789',
          joined_at: '2025-02-15T10:00:00Z',
          total_bookings: 1,
          is_active: false
        }
      ];
      setEmployees(mockEmployees);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteEmployee = async () => {
    if (!newEmployeeEmail) {
      alert('Please enter an email address');
      return;
    }

    setInviting(true);
    try {
      // Here you would send an invitation email
      // For now, just showing success
      alert(`Invitation sent to ${newEmployeeEmail}!`);
      setNewEmployeeEmail('');
      setAddingEmployee(false);
    } catch (error) {
      console.error('Error inviting employee:', error);
      alert('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleToggleEmployee = async (employeeId: string, currentStatus: boolean) => {
    try {
      // Update employee status
      // await supabase.from('company_employees').update({ is_active: !currentStatus }).eq('id', employeeId);

      setEmployees(employees.map(emp =>
        emp.id === employeeId ? { ...emp, is_active: !currentStatus } : emp
      ));

      alert(currentStatus ? 'Employee deactivated' : 'Employee reactivated');
    } catch (error) {
      console.error('Error toggling employee:', error);
      alert('Failed to update employee status');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading employees...</p>
        </div>
      </div>
    );
  }

  const activeEmployees = employees.filter(e => e.is_active).length;

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/company-dashboard')}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Employee Management</h1>
              <p className="text-gray-400">Manage team access to company benefits</p>
            </div>
            <button
              onClick={() => setAddingEmployee(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Invite Employee
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{activeEmployees}</div>
            <div className="text-sm text-gray-400">Active Employees</div>
            {company?.max_employees && (
              <div className="text-xs text-gray-500 mt-2">
                {activeEmployees} / {company.max_employees} limit
              </div>
            )}
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {employees.reduce((sum, emp) => sum + emp.total_bookings, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Bookings</div>
            <div className="text-xs text-gray-500 mt-2">
              By all employees
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {(employees.reduce((sum, emp) => sum + emp.total_bookings, 0) / activeEmployees || 0).toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Avg per Employee</div>
            <div className="text-xs text-gray-500 mt-2">
              Monthly bookings
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-700 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Bookings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-750 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{employee.name}</div>
                        <div className="text-sm text-gray-400">{employee.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="h-4 w-4" />
                        {employee.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">
                        {new Date(employee.joined_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white">{employee.total_bookings}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                        employee.is_active
                          ? 'bg-green-900/50 text-green-400'
                          : 'bg-red-900/50 text-red-400'
                      }`}>
                        {employee.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleEmployee(employee.id, employee.is_active)}
                        className={`text-sm font-medium ${
                          employee.is_active
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {employee.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No employees found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-400 text-sm mt-2 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Add Employee Modal */}
        {addingEmployee && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-4">Invite Employee</h3>
              <p className="text-gray-400 mb-6">
                Send an invitation email to add a new employee to your benefits program.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Employee Email
                  </label>
                  <input
                    type="email"
                    value={newEmployeeEmail}
                    onChange={(e) => setNewEmployeeEmail(e.target.value)}
                    placeholder="employee@company.com"
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleInviteEmployee}
                    disabled={inviting || !newEmployeeEmail}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviting ? 'Sending...' : 'Send Invitation'}
                  </button>
                  <button
                    onClick={() => {
                      setAddingEmployee(false);
                      setNewEmployeeEmail('');
                    }}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
