import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Target, Calendar, ArrowUpRight, ArrowDownLeft, Flame, AlertTriangle, Sparkles, Zap, Award } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useCRM } from '../context/CRMContext';

export function Dashboard() {
  const crm = useCRM();
  const { dashboardStats = [], dashboardChartData = [], dealStageData = [], recentActivity = [], smartInsights = [], hotLeads = [], followupReminders = [], deals = [], leadIntelligence = [], teamMembers = [] } = crm || {};
  
  // Calculate enhanced metrics
  const metrics = useMemo(() => {
    const wonDeals = (deals || []).filter((d) => d.stage === 'Closed Won');
    const lostDeals = (deals || []).filter((d) => d.stage === 'Closed Lost');
    const totalClosed = wonDeals.length + lostDeals.length;
    const winRate = totalClosed > 0 ? Math.round((wonDeals.length / totalClosed) * 100) : 0;
    
    // Lead conversion rate (Converted leads / Total leads)
    const convertedLeads = (leadIntelligence || []).filter((l) => l.status === 'Converted').length;
    const conversionRate = (leadIntelligence || []).length > 0 ? Math.round((convertedLeads / (leadIntelligence || []).length) * 100) : 0;
    
    // Average deal cycle time (simplified - using probability as proxy for time in cycle)
    const avgCycleTime = (deals || []).length > 0 ? Math.round((deals || []).reduce((sum, d) => sum + (100 - (d.probability || 0)), 0) / (deals || []).length) : 0;
    
    // Sales velocity (deals closed per month - simplified)
    const salesVelocity = wonDeals.length;
    
    // Top performers (by won deals)
    const topPerformers = (teamMembers || [])
      ?.map((member) => ({
        name: member.name,
        wonDeals: wonDeals.filter((d) => d.owner === member.name).length,
        totalValue: wonDeals
          .filter((d) => d.owner === member.name)
          .reduce((sum, d) => sum + (d.value || 0), 0),
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 3) || [];

    return { winRate, conversionRate, avgCycleTime, salesVelocity, topPerformers };
  }, [deals, leadIntelligence, teamMembers]);
  
  const stats = (dashboardStats || []).map((stat) => ({
    ...stat,
    icon:
      stat.label === 'Total Leads'
        ? Users
        : stat.label === 'Active Deals'
          ? Target
          : stat.label === 'Pipeline Value'
            ? TrendingUp
            : Calendar,
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to DealPilot! Here's your AI-powered sales performance overview.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            const isPositive = stat.change.startsWith('+');
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border-l-4 border-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className={`text-sm font-semibold mt-2 flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                      {stat.change}
                    </p>
                  </div>
                  <Icon className="w-10 h-10 text-blue-500 opacity-20" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Enhanced KPI Metrics */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm p-4 border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Win Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.winRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-30" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm p-4 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.conversionRate}%</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500 opacity-30" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm p-4 border-l-4 border-purple-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Avg Cycle Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.avgCycleTime}%</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500 opacity-30" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm p-4 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Sales Velocity</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.salesVelocity}</p>
              </div>
              <Flame className="w-8 h-8 text-orange-500 opacity-30" />
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg shadow-sm p-4 border-l-4 border-pink-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 font-medium">Top Performer</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{metrics.topPerformers[0]?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500">{metrics.topPerformers[0]?.wonDeals || 0} won deals</p>
              </div>
              <Award className="w-8 h-8 text-pink-500 opacity-30" />
            </div>
          </motion.div>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue & Leads Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#1e40af" strokeWidth={2} dot={{ fill: '#1e40af' }} />
                <Line type="monotone" dataKey="leads" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Deal Stages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Deal Stages</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dealStageData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {dealStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-6 space-y-2">
              {dealStageData.map((stage, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{stage.name}</span>
                  <span className="font-semibold text-gray-900">{stage.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-blue-600" />
              Smart Insights & Alerts
            </h2>
            <div className="space-y-3">
              {smartInsights.length === 0 && <p className="text-sm text-gray-500">No critical insight right now. Pipeline health looks stable.</p>}
              {smartInsights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${insight.severity === 'critical' ? 'bg-red-50 border-red-500' : insight.severity === 'warning' ? 'bg-amber-50 border-amber-500' : 'bg-blue-50 border-blue-500'}`}>
                  <p className="font-semibold text-gray-900">{insight.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{insight.action}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Flame size={18} className="text-orange-600" />
              Hot Leads
            </h2>
            <div className="space-y-3">
              {hotLeads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="p-3 rounded-lg bg-orange-50 border border-orange-100">
                  <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                  <p className="text-xs text-gray-600">{lead.company}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-800">Score {lead.leadScore}</span>
                    <span className="text-xs text-gray-600">{lead.nextBestAction}</span>
                  </div>
                </div>
              ))}
              {hotLeads.length === 0 && <p className="text-sm text-gray-500">No hot leads currently.</p>}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-600" />
              Inactive Lead Follow-ups
            </h2>
            <div className="space-y-3">
              {followupReminders.slice(0, 4).map((item) => (
                <div key={item.leadId} className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <p className="font-semibold text-sm text-gray-900">{item.leadName}</p>
                  <p className="text-xs text-gray-600">{item.company} • {item.inactivityDays} days inactive</p>
                  <p className="text-xs text-gray-700 mt-2 line-clamp-2">{item.suggestedMessage}</p>
                </div>
              ))}
              {followupReminders.length === 0 && <p className="text-sm text-gray-500">No inactive leads pending follow-up.</p>}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  whileHover={{ x: 4 }}
                  className="p-4 border-l-4 border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all flex items-start justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{activity.time} • by {activity.actor}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                    activity.status === 'new' ? 'bg-blue-200 text-blue-900' :
                    activity.status === 'success' ? 'bg-green-200 text-green-900' :
                    activity.status === 'warning' ? 'bg-yellow-200 text-yellow-900' :
                    'bg-gray-200 text-gray-900'
                  }`}>
                    {activity.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Top Performers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Award size={18} className="text-pink-600" />
            Top Performers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.topPerformers.length === 0 ? (
              <p className="text-sm text-gray-500 col-span-3">No performance data available yet.</p>
            ) : (
              metrics.topPerformers.map((performer, index) => (
                <motion.div
                  key={performer.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{performer.name}</h3>
                    {index === 0 && <span className="text-2xl">🏆</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Won Deals</span>
                      <span className="font-semibold text-gray-900">{performer.wonDeals}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Value</span>
                      <span className="font-semibold text-gray-900">${performer.totalValue.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
