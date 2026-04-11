import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, DollarSign, Calendar, User, X, ArrowRightCircle, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useNotification } from '../context/NotificationContext';
import { useCRM } from '../context/CRMContext';

const emptyDeal = {
  name: '',
  value: 0,
  stage: 'Qualification',
  owner: '',
  dueDate: '',
  probability: 40,
  lostReason: '',
};

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

export function Deals() {
  const { addNotification } = useNotification();
  const { deals, addDeal, updateDeal, deleteDeal } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [form, setForm] = useState(emptyDeal);
  const [filterStage, setFilterStage] = useState('All');

  const stageFlow = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won'];
  const lostReasons = ['Budget Not Approved', 'Competitive Loss', 'Decision Delayed', 'No Further Interest', 'Wrong Fit', 'Other'];

  const filteredDeals = useMemo(
    () =>
      deals.filter((deal) => {
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          deal.name.toLowerCase().includes(query) ||
          deal.owner.toLowerCase().includes(query) ||
          deal.stage.toLowerCase().includes(query);
        const matchesStage = filterStage === 'All' || deal.stage === filterStage;
        return matchesSearch && matchesStage;
      }),
    [deals, searchTerm, filterStage]
  );

  // Calculate win/loss statistics
  const stats = useMemo(() => {
    const wonDeals = deals.filter((d) => d.stage === 'Closed Won');
    const lostDeals = deals.filter((d) => d.stage === 'Closed Lost');
    const activeDeals = deals.filter((d) => !['Closed Won', 'Closed Lost'].includes(d.stage));
    const totalWonValue = wonDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const totalLostValue = lostDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const totalValue = deals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    const totalClosed = wonDeals.length + lostDeals.length;
    const winRate = totalClosed > 0 ? Math.round((wonDeals.length / totalClosed) * 100) : 0;
    const avgDealSize = deals.length > 0 ? Math.round(totalValue / deals.length) : 0;

    return {
      wonCount: wonDeals.length,
      lostCount: lostDeals.length,
      activeCount: activeDeals.length,
      totalWonValue,
      totalLostValue,
      totalValue,
      winRate,
      avgDealSize,
      avgWonValue: wonDeals.length > 0 ? Math.round(totalWonValue / wonDeals.length) : 0,
    };
  }, [deals]);

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Qualification':
        return 'bg-blue-100 text-blue-800';
      case 'Proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'Negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'Closed Won':
        return 'bg-green-100 text-green-800';
      case 'Closed Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const moveDealToNextStage = (deal) => {
    const currentIndex = stageFlow.indexOf(deal.stage);
    if (currentIndex === -1 || currentIndex === stageFlow.length - 1) return;
    const nextStage = stageFlow[currentIndex + 1];
    updateDeal(deal.id, { stage: nextStage, probability: Math.min(100, Number(deal.probability || 0) + 15) });
    addNotification(`Moved to ${nextStage}`, 'success');
  };

  const markDealWon = (deal) => {
    updateDeal(deal.id, { stage: 'Closed Won', probability: 100 });
    addNotification('Deal marked as Won! 🎉', 'success');
  };

  const markDealLost = (deal) => {
    setEditingDeal(deal);
    setForm({ ...deal, stage: 'Closed Lost' });
    setShowModal(true);
  };

  const openModal = (deal = null) => {
    setEditingDeal(deal);
    setForm(deal ? { ...deal } : emptyDeal);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingDeal(null);
    setForm(emptyDeal);
    setShowModal(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = { ...form, value: Number(form.value), probability: Number(form.probability) };
    if (editingDeal) {
      updateDeal(editingDeal.id, payload);
      addNotification('Deal updated successfully', 'success');
    } else {
      addDeal(payload);
      addNotification('Deal added successfully', 'success');
    }
    closeModal();
  };

  const handleDelete = (id) => {
    deleteDeal(id);
    addNotification('Deal deleted', 'success');
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Deals Management</h1>
          <p className="text-gray-600 mt-2">Move opportunities through the pipeline with confidence and track win/loss metrics.</p>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <p className="text-xs text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(stats.totalValue)}</p>
            <p className="text-xs text-gray-500 mt-2">{stats.activeCount} active deals</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-green-600" />
              <p className="text-xs text-gray-600">Won Deals</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.wonCount}</p>
            <p className="text-xs text-gray-500 mt-2">{formatMoney(stats.totalWonValue)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={16} className="text-red-600" />
              <p className="text-xs text-gray-600">Lost Deals</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.lostCount}</p>
            <p className="text-xs text-gray-500 mt-2">{formatMoney(stats.totalLostValue)}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-purple-600" />
              <p className="text-xs text-gray-600">Win Rate</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.winRate}%</p>
            <p className="text-xs text-gray-500 mt-2">Average: {formatMoney(stats.avgDealSize)}</p>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search deals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent outline-none text-gray-900" />
          </div>

          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 outline-none"
          >
            <option value="All">All Stages</option>
            {stageFlow.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
            <option value="Closed Won">Closed Won</option>
            <option value="Closed Lost">Closed Lost</option>
          </select>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} />
            Add Deal
          </motion.button>
        </motion.div>

        {/* Deal Cards */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.08 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredDeals.map((deal, index) => (
            <motion.div key={deal.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm p-6 border-l-4" style={{ borderLeftColor: deal.stage === 'Closed Won' ? '#10b981' : deal.stage === 'Closed Lost' ? '#ef4444' : '#3b82f6' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{deal.name}</h3>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getStageColor(deal.stage)}`}>{deal.stage}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(deal)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(deal.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600 text-sm">
                    <DollarSign size={16} />
                    Value
                  </span>
                  <span className="font-bold text-gray-900">{formatMoney(deal.value)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600 text-sm">
                    <Calendar size={16} />
                    Due Date
                  </span>
                  <span className="text-gray-900 text-sm">{deal.dueDate || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-600 text-sm">
                    <User size={16} />
                    Owner
                  </span>
                  <span className="text-gray-900 text-sm">{deal.owner}</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Win Probability</span>
                    <span className="font-semibold text-gray-900">{deal.probability}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${deal.probability}%` }} />
                  </div>
                </div>
                {deal.stage !== 'Closed Won' && deal.stage !== 'Closed Lost' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => moveDealToNextStage(deal)}
                      className="flex-1 inline-flex items-center justify-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold py-2 bg-blue-50 hover:bg-blue-100 rounded"
                    >
                      <ArrowRightCircle size={14} />
                      Next Stage
                    </button>
                    <button
                      onClick={() => markDealWon(deal)}
                      className="flex-1 inline-flex items-center justify-center gap-1 text-xs text-green-700 hover:text-green-900 font-semibold py-2 bg-green-50 hover:bg-green-100 rounded"
                    >
                      <CheckCircle size={14} />
                      Won
                    </button>
                    <button
                      onClick={() => markDealLost(deal)}
                      className="flex-1 inline-flex items-center justify-center gap-1 text-xs text-red-700 hover:text-red-900 font-semibold py-2 bg-red-50 hover:bg-red-100 rounded"
                    >
                      <XCircle size={14} />
                      Lost
                    </button>
                  </div>
                )}
                {deal.lostReason && deal.stage === 'Closed Lost' && (
                  <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-xs text-red-700">
                      <span className="font-semibold">Lost Reason:</span> {deal.lostReason}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Kanban Pipeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Kanban Pipeline</h2>
            <p className="text-sm text-gray-500">Drag-and-drop ready structure with stage progression actions</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {stageFlow.map((stage) => (
              <div key={stage} className="rounded-xl bg-slate-100 p-3">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-sm text-gray-800">{stage}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-white text-gray-700">
                    {filteredDeals.filter((deal) => deal.stage === stage).length}
                  </span>
                </div>

                <div className="space-y-3">
                  {filteredDeals
                    .filter((deal) => deal.stage === stage)
                    .map((deal) => (
                      <div key={`kanban_${deal.id}`} className="bg-white rounded-lg p-3 shadow-sm border border-slate-200">
                        <p className="font-semibold text-sm text-gray-900">{deal.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{formatMoney(deal.value)} • {deal.owner}</p>
                        {stage !== 'Closed Won' && (
                          <button onClick={() => moveDealToNextStage(deal)} className="mt-3 inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-semibold">
                            Move to next stage
                            <ArrowRightCircle size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Deal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{editingDeal ? 'Edit Deal' : 'Add Deal'}</h2>
                <button onClick={closeModal} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Deal name" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2" required />
                <input type="number" min="0" value={form.value} onChange={(e) => setForm((current) => ({ ...current, value: e.target.value }))} placeholder="Value" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input value={form.owner} onChange={(e) => setForm((current) => ({ ...current, owner: e.target.value }))} placeholder="Owner" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <select value={form.stage} onChange={(e) => setForm((current) => ({ ...current, stage: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                  {['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'].map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
                <input type="date" value={form.dueDate} onChange={(e) => setForm((current) => ({ ...current, dueDate: e.target.value }))} className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <div className="md:col-span-2">
                  <label className="block text-sm text-gray-600 mb-2">Probability ({form.probability}%)</label>
                  <input type="range" min="0" max="100" value={form.probability} onChange={(e) => setForm((current) => ({ ...current, probability: e.target.value }))} className="w-full" />
                </div>
                {form.stage === 'Closed Lost' && (
                  <select
                    value={form.lostReason}
                    onChange={(e) => setForm((current) => ({ ...current, lostReason: e.target.value }))}
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2"
                  >
                    <option value="">Select reason for loss...</option>
                    {lostReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                )}
                <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                  <button type="button" onClick={closeModal} className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingDeal ? 'Save Deal' : 'Create Deal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
