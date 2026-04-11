import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, User, Lock, Eye, EyeOff, Save, Users, Bot } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useNotification } from '../context/NotificationContext';
import { useCRM } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { addNotification } = useNotification();
  const { preferences, updatePreferences, teamMembers, currentMemberId, setCurrentMember } = useCRM();
  const { user, updateUserProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState(preferences);
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || 'CRM Pro',
  });

  useEffect(() => {
    setSettings(preferences);
  }, [preferences]);

  useEffect(() => {
    setUserInfo({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      company: user?.company || 'CRM Pro',
    });
  }, [user]);

  const handleSettingsChange = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleUserInfoChange = (key, value) => {
    setUserInfo((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    updatePreferences(settings);
    updateUserProfile(userInfo);
    addNotification('Settings saved successfully', 'success');
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account, security, and workspace preferences.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User size={20} />
            Profile Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input type="text" value={userInfo.name} onChange={(e) => handleUserInfoChange('name', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" value={userInfo.email} onChange={(e) => handleUserInfoChange('email', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" value={userInfo.phone} onChange={(e) => handleUserInfoChange('phone', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input type="text" value={userInfo.company} onChange={(e) => handleUserInfoChange('company', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Bell size={20} />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about pipeline and tasks.</p>
              </div>
              <input type="checkbox" checked={settings.notifications} onChange={(e) => handleSettingsChange('notifications', e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
            </div>
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Digest Frequency</label>
              <select value={settings.emailDigest} onChange={(e) => handleSettingsChange('emailDigest', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Inactive Lead Threshold (days)</label>
              <input type="number" min="1" max="30" value={settings.inactivityDays || 5} onChange={(e) => handleSettingsChange('inactivityDays', Number(e.target.value))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Bot size={16} />
                  Smart Auto Task Engine
                </p>
                <p className="text-sm text-gray-600">Auto-create tasks based on lead stage and inactivity.</p>
              </div>
              <input type="checkbox" checked={Boolean(settings.autoTaskCreation)} onChange={(e) => handleSettingsChange('autoTaskCreation', e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users size={20} />
            Team Collaboration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Workspace Persona</label>
              <select value={currentMemberId} onChange={(e) => setCurrentMember(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} • {member.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Member</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Role</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="border-t border-gray-100">
                      <td className="px-4 py-2 text-gray-900">{member.name}</td>
                      <td className="px-4 py-2 text-gray-700">{member.role === 'admin' ? 'Admin' : 'Sales Rep'}</td>
                      <td className="px-4 py-2 text-gray-600">{member.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Lock size={20} />
            Security
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type="password" placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account.</p>
              </div>
              <input type="checkbox" checked={settings.twoFactor} onChange={(e) => handleSettingsChange('twoFactor', e.target.checked)} className="w-5 h-5 text-blue-600 rounded" />
            </div>
          </div>
        </motion.div>

        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
          <Save size={18} />
          Save Settings
        </motion.button>
      </div>
    </PageTransition>
  );
}
