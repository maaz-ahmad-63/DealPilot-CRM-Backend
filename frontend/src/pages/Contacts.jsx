import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Mail, Phone, MapPin, X } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useNotification } from '../context/NotificationContext';
import { useCRM } from '../context/CRMContext';

const emptyContact = {
  name: '',
  email: '',
  phone: '',
  company: '',
  city: '',
};

export function Contacts() {
  const { addNotification } = useNotification();
  const { contacts, addContact, updateContact, deleteContact } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [form, setForm] = useState(emptyContact);

  const filteredContacts = useMemo(
    () =>
      contacts.filter((contact) => {
        const query = searchTerm.toLowerCase();
        return (
          contact.name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.company.toLowerCase().includes(query)
        );
      }),
    [contacts, searchTerm]
  );

  const openModal = (contact = null) => {
    setEditingContact(contact);
    setForm(contact ? { ...contact } : emptyContact);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingContact(null);
    setForm(emptyContact);
    setShowModal(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingContact) {
      updateContact(editingContact.id, form);
      addNotification('Contact updated', 'success');
    } else {
      addContact(form);
      addNotification('Contact added', 'success');
    }
    closeModal();
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contacts Management</h1>
          <p className="text-gray-600 mt-2">Keep the people behind every deal organized and reachable.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2">
            <Search size={18} className="text-gray-400" />
            <input type="text" placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent outline-none text-gray-900" />
          </div>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openModal()} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={18} />
            Add Contact
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ staggerChildren: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact, index) => (
            <motion.div key={contact.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} whileHover={{ y: -4 }} className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-600">{contact.company}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openModal(contact)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => { deleteContact(contact.id); addNotification('Contact deleted', 'success'); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <a href={`tel:${contact.phone}`} className="text-blue-600 hover:underline">
                    {contact.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600">{contact.city}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">{editingContact ? 'Edit Contact' : 'Add Contact'}</h2>
                <button onClick={closeModal} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Contact name" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input value={form.company} onChange={(e) => setForm((current) => ({ ...current, company: e.target.value }))} placeholder="Company" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} placeholder="Email" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} placeholder="Phone" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                <input value={form.city} onChange={(e) => setForm((current) => ({ ...current, city: e.target.value }))} placeholder="City" className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2" required />
                <div className="md:col-span-2 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    {editingContact ? 'Save Contact' : 'Create Contact'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
