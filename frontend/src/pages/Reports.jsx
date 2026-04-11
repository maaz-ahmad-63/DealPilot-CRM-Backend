import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Filter, Calendar } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useCRM } from '../context/CRMContext';

export function Reports() {
  const { leads, deals, tasks, contacts } = useCRM();
  const [reportType, setReportType] = useState('leads');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filterSource, setFilterSource] = useState('all');

  // Export functions
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => `"${row[header] || ''}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Get filtered data based on report type
  const getFilteredData = () => {
    let data = [];
    
    switch (reportType) {
      case 'leads':
        data = leads.map(l => ({
          Name: l.name,
          Email: l.email,
          Company: l.company,
          Status: l.status,
          Source: l.source || 'Direct',
          Score: l.leadScore || 0,
          'Last Touch': new Date(l.lastInteractionAt).toLocaleDateString(),
          Value: `$${l.value || 0}`,
        }));
        break;
      case 'deals':
        data = deals.map(d => ({
          Title: d.title,
          Company: d.company,
          Amount: `$${d.value}`,
          Stage: d.stage,
          Owner: d.owner || 'Unassigned',
          'Due Date': new Date(d.dueDate).toLocaleDateString(),
          Probability: `${d.probability || 0}%`,
          Status: d.status,
        }));
        break;
      case 'tasks':
        data = tasks.map(t => ({
          Title: t.title,
          Assigned: t.assignedTo || 'Unassigned',
          'Due Date': new Date(t.dueDate).toLocaleDateString(),
          Priority: t.priority || 'Medium',
          Status: t.status,
          'Related To': t.relatedTo || '',
          'Created Date': new Date(t.createdAt).toLocaleDateString(),
        }));
        break;
      case 'contacts':
        data = contacts.map(c => ({
          Name: c.name,
          Email: c.email,
          Phone: c.phone || 'N/A',
          Company: c.company || 'N/A',
          Title: c.jobTitle || 'N/A',
          Address: c.address || 'N/A',
          'Last Updated': new Date(c.updatedAt).toLocaleDateString(),
        }));
        break;
      default:
        data = leads;
    }

    return data;
  };

  // Generate summary statistics
  const getSummaryStats = () => {
    switch (reportType) {
      case 'leads':
        return {
          total: leads.length,
          qualified: leads.filter(l => l.status === 'Qualified').length,
          hot: leads.filter(l => l.leadScore >= 75).length,
          cold: leads.filter(l => l.leadScore < 40).length,
          avgScore: (leads.reduce((sum, l) => sum + (l.leadScore || 0), 0) / leads.length).toFixed(1),
        };
      case 'deals':
        return {
          total: deals.length,
          totalValue: `$${deals.reduce((sum, d) => sum + d.value, 0)}`,
          avgDealSize: `$${(deals.reduce((sum, d) => sum + d.value, 0) / deals.length).toFixed(0)}`,
          won: deals.filter(d => d.status === 'Won').length,
          lost: deals.filter(d => d.status === 'Lost').length,
          pending: deals.filter(d => d.status !== 'Won' && d.status !== 'Lost').length,
        };
      case 'tasks':
        return {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'completed').length,
          pending: tasks.filter(t => t.status !== 'completed').length,
          overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
        };
      case 'contacts':
        return {
          total: contacts.length,
          withEmail: contacts.filter(c => c.email).length,
          withPhone: contacts.filter(c => c.phone).length,
          byCompany: contacts.length > 0 ? [...new Set(contacts.map(c => c.company))].length : 0,
        };
      default:
        return {};
    }
  };

  const stats = getSummaryStats();
  const filteredData = getFilteredData();

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" size={32} />
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-2">Export and analyze your CRM data</p>
        </motion.div>

        {/* Report Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Select Report Type</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'leads', label: 'Leads Report' },
              { value: 'deals', label: 'Deals Report' },
              { value: 'tasks', label: 'Tasks Report' },
              { value: 'contacts', label: 'Contacts Report' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setReportType(option.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  reportType === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-gray-900">{option.label}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Statistics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <p className="text-gray-600 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            </div>
          ))}
        </motion.div>

        {/* Export Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Download size={20} />
            Export Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => exportToCSV(filteredData, `${reportType}-report`)}
              className="p-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Export to CSV
            </button>
            <button
              onClick={() => exportToJSON(filteredData, `${reportType}-report`)}
              className="p-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Export to JSON
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            📊 {filteredData.length} records ready to export
          </p>
        </motion.div>

        {/* Data Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Data Preview</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {Object.keys(filteredData[0] || {}).map((header) => (
                    <th key={header} className="text-left py-3 px-4 font-semibold text-gray-900">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="py-3 px-4 text-gray-700">
                        {String(value).substring(0, 50)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length > 10 && (
              <p className="text-sm text-gray-600 mt-4 text-center">
                Showing 10 of {filteredData.length} records. Export to see all data.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
