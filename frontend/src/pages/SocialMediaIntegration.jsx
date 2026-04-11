import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Send, Calendar, Target, TrendingUp, Trash2, Edit2, CheckCircle, Clock, AlertCircle, Share2, MessageSquare } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useNotification } from '../context/NotificationContext';
import { useCRM } from '../context/CRMContext';

const emptyPost = {
  platform: 'facebook', // facebook, instagram, twitter, linkedin
  content: '',
  scheduledTime: '',
  targetAudience: 'all', // all, leads, customers
  selectedLeads: [],
  mediaUrls: [],
  status: 'draft', // draft, scheduled, posted, failed
  engagementTarget: 'awareness', // awareness, engagement, conversion
};

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: Share2, color: 'bg-blue-600' },
  { value: 'instagram', label: 'Instagram', icon: MessageSquare, color: 'bg-pink-600' },
  { value: 'twitter', label: 'Twitter', icon: Send, color: 'bg-sky-500' },
  { value: 'linkedin', label: 'LinkedIn', icon: Send, color: 'bg-blue-700' },
];

export function SocialMediaIntegration() {
  const { addNotification } = useNotification();
  const { leads } = useCRM();
  const [posts, setPosts] = useState([
    {
      id: 'post_1',
      platform: 'instagram',
      content: '🚀 Excited to announce our new AI-powered CRM solution! Save 10+ hours weekly on lead management. Try it free! #CRM #Sales #AI',
      scheduledTime: '2026-04-15T10:00',
      targetAudience: 'leads',
      selectedLeads: ['lead_1', 'lead_2'],
      mediaUrls: ['https://example.com/image1.jpg'],
      status: 'scheduled',
      engagementTarget: 'awareness',
      likes: 0,
      comments: 0,
      shares: 0,
    },
    {
      id: 'post_2',
      platform: 'facebook',
      content: 'Join 5000+ sales teams using our CRM to close deals faster. Schedule a demo today!',
      scheduledTime: '2026-04-16T14:00',
      targetAudience: 'all',
      selectedLeads: [],
      mediaUrls: [],
      status: 'draft',
      engagementTarget: 'conversion',
      likes: 0,
      comments: 0,
      shares: 0,
    },
  ]);

  const [companyAccounts, setCompanyAccounts] = useState([
    {
      id: 'account_1',
      platform: 'facebook',
      accountName: 'DealPilot Inc',
      connected: true,
      followers: 12500,
      lastPostDate: '2026-04-14',
    },
    {
      id: 'account_2',
      platform: 'instagram',
      accountName: 'dealpilot.io',
      connected: true,
      followers: 8300,
      lastPostDate: '2026-04-13',
    },
  ]);

  const [showPostModal, setShowPostModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [postForm, setPostForm] = useState(emptyPost);
  const [accountForm, setAccountForm] = useState({
    platform: 'facebook',
    accountName: '',
    accessToken: '',
  });
  const [selectedLeadsList, setSelectedLeadsList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter((p) => filterStatus === 'all' || p.status === filterStatus)
      .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime));
  }, [posts, filterStatus]);

  // Upcoming posts (scheduled)
  const upcomingPosts = useMemo(() => {
    return filteredPosts.filter((p) => p.status === 'scheduled');
  }, [filteredPosts]);

  const openPostModal = (post = null) => {
    setEditingPost(post);
    if (post) {
      setPostForm({ ...post });
      setSelectedLeadsList(post.selectedLeads);
    } else {
      setPostForm(emptyPost);
      setSelectedLeadsList([]);
    }
    setShowPostModal(true);
  };

  const closePostModal = () => {
    setEditingPost(null);
    setPostForm(emptyPost);
    setSelectedLeadsList([]);
    setShowPostModal(false);
  };

  const openAccountModal = () => {
    setShowAccountModal(true);
  };

  const closeAccountModal = () => {
    setAccountForm({ platform: 'facebook', accountName: '', accessToken: '' });
    setEditingAccount(null);
    setShowAccountModal(false);
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    
    if (!postForm.content || !postForm.platform) {
      addNotification('Please fill in all required fields', 'warning');
      return;
    }

    if (editingPost) {
      setPosts(posts.map((p) =>
        p.id === editingPost.id
          ? { ...postForm, id: editingPost.id, selectedLeads: selectedLeadsList }
          : p
      ));
      addNotification('Post updated successfully', 'success');
    } else {
      const newPost = {
        ...postForm,
        id: `post_${Date.now()}`,
        selectedLeads: selectedLeadsList,
        likes: 0,
        comments: 0,
        shares: 0,
      };
      setPosts([...posts, newPost]);
      addNotification('Post created successfully', 'success');
    }
    closePostModal();
  };

  const handleSubmitAccount = (e) => {
    e.preventDefault();
    
    if (!accountForm.accountName || !accountForm.accessToken) {
      addNotification('Please fill in all required fields', 'warning');
      return;
    }

    const newAccount = {
      id: `account_${Date.now()}`,
      platform: accountForm.platform,
      accountName: accountForm.accountName,
      connected: true,
      followers: 0,
      lastPostDate: new Date().toISOString().split('T')[0],
    };
    setCompanyAccounts([...companyAccounts, newAccount]);
    addNotification('Account connected successfully', 'success');
    closeAccountModal();
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter((p) => p.id !== id));
    addNotification('Post deleted', 'success');
  };

  const handleDeleteAccount = (id) => {
    setCompanyAccounts(companyAccounts.filter((a) => a.id !== id));
    addNotification('Account disconnected', 'success');
  };

  const toggleLead = (leadId) => {
    if (selectedLeadsList.includes(leadId)) {
      setSelectedLeadsList(selectedLeadsList.filter((l) => l !== leadId));
    } else {
      setSelectedLeadsList([...selectedLeadsList, leadId]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'posted':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform) => {
    const p = PLATFORMS.find((pr) => pr.value === platform);
    return p?.icon || Facebook;
  };

  const getPlatformColor = (platform) => {
    const p = PLATFORMS.find((pr) => pr.value === platform);
    return p?.color || 'bg-blue-600';
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Social Media Integration</h1>
          <p className="text-gray-600 mt-2">Manage company social media accounts and schedule lead follow-ups</p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex gap-4 border-b border-gray-200">
          <button className="px-6 py-3 text-gray-900 font-semibold border-b-2 border-blue-600">
            Social Posts ({filteredPosts.length})
          </button>
          <button className="px-6 py-3 text-gray-600 hover:text-gray-900">
            Connected Accounts ({companyAccounts.length})
          </button>
        </motion.div>

        {/* Upcoming Posts Alert */}
        {upcomingPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start gap-3"
          >
            <Calendar size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-900">
                📅 {upcomingPosts.length} post{upcomingPosts.length > 1 ? 's' : ''} scheduled
              </p>
              <p className="text-sm text-purple-700 mt-1">
                Next post: {new Date(upcomingPosts[0].scheduledTime).toLocaleDateString()} at {new Date(upcomingPosts[0].scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        )}

        {/* Action Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex gap-4 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openPostModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus size={18} />
            Create Post
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAccountModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            <Plus size={18} />
            Connect Account
          </motion.button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none ml-auto"
          >
            <option value="all">All Posts</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
            <option value="posted">Posted</option>
            <option value="failed">Failed</option>
          </select>
        </motion.div>

        {/* Connected Accounts Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {companyAccounts.map((account, index) => {
            const Icon = getPlatformIcon(account.platform);
            return (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={20} className={getPlatformColor(account.platform).replace('bg-', 'text-')} />
                  <span className="font-semibold text-gray-900">{account.accountName}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>👥 {account.followers.toLocaleString()} followers</p>
                  <p>📅 Last post: {account.lastPostDate}</p>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
                  <CheckCircle size={14} />
                  Connected
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Posts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.08 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredPosts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Send size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-gray-500 text-lg">No posts yet</p>
            </div>
          ) : (
            filteredPosts.map((post, index) => {
              const Icon = getPlatformIcon(post.platform);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon size={24} className={getPlatformColor(post.platform).replace('bg-', 'text-')} />
                      <div>
                        <p className="text-xs text-gray-500">
                          {PLATFORMS.find((p) => p.value === post.platform)?.label}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(post.status)}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {post.status === 'draft' && (
                        <button onClick={() => openPostModal(post)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDeletePost(post.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-800 mb-4 line-clamp-4">{post.content}</p>

                  {post.mediaUrls.length > 0 && (
                    <div className="mb-4 flex gap-2 overflow-x-auto">
                      {post.mediaUrls.map((url, i) => (
                        <img key={i} src={url} alt="post" className="h-20 w-20 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>
                        {new Date(post.scheduledTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={14} />
                      <span>{post.engagementTarget.charAt(0).toUpperCase() + post.engagementTarget.slice(1)}</span>
                    </div>
                  </div>

                  {post.status === 'posted' && (
                    <div className="pt-4 border-t border-gray-200 flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-red-500" /> {post.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        💬 {post.comments} comments
                      </span>
                      <span className="flex items-center gap-1">
                        ↗️ {post.shares} shares
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Create Post Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{editingPost ? 'Edit Post' : 'Create Social Post'}</h2>
                <button onClick={closePostModal} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <select
                  value={postForm.platform}
                  onChange={(e) => setPostForm({ ...postForm, platform: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <textarea
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Write your post content here..."
                  maxLength={280}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                  required
                />
                <p className="text-xs text-gray-500">{postForm.content.length}/280 characters</p>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={postForm.scheduledTime}
                    onChange={(e) => setPostForm({ ...postForm, scheduledTime: e.target.value })}
                    placeholder="Schedule time"
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <select
                    value={postForm.engagementTarget}
                    onChange={(e) => setPostForm({ ...postForm, engagementTarget: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="awareness">Awareness</option>
                    <option value="engagement">Engagement</option>
                    <option value="conversion">Conversion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Target Leads</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                    {leads.map((lead) => (
                      <label key={lead.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={selectedLeadsList.includes(lead.id)}
                          onChange={() => toggleLead(lead.id)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{lead.firstName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closePostModal}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingPost ? 'Update' : 'Schedule'} Post
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Connect Account Modal */}
        {showAccountModal && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Connect Social Account</h2>
                <button onClick={closeAccountModal} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitAccount} className="p-6 space-y-4">
                <select
                  value={accountForm.platform}
                  onChange={(e) => setAccountForm({ ...accountForm, platform: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  value={accountForm.accountName}
                  onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                  placeholder="Account name or handle"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <input
                  type="password"
                  value={accountForm.accessToken}
                  onChange={(e) => setAccountForm({ ...accountForm, accessToken: e.target.value })}
                  placeholder="API Token or Access Key"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="font-semibold">💡 Get your API credentials from:</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>Facebook: Business Suite Settings</li>
                    <li>Instagram: Graph API Token</li>
                    <li>Twitter: Developer Portal</li>
                    <li>LinkedIn: Developer App</li>
                  </ul>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={closeAccountModal}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Connect Account
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
