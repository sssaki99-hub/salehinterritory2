

import React, { useState, useContext, ChangeEvent, FormEvent } from 'react';
import PageWrapper from '../components/PageWrapper';
import { AdminContext } from '../contexts/AdminContext';
import { Project, Writing, WorkExperience, Education, Certificate, WritingGenre, WritingCategory, Episode } from '../types';
import { FiLogOut } from 'react-icons/fi';

type AdminTab = 'Dashboard' | 'Inbox' | 'Settings' | 'Projects' | 'Literature' | 'Professional';

const FormField: React.FC<{label: string, name: string, value: any, onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void, type?: string, required?: boolean, rows?: number, options?: string[]}> = 
({label, name, value, onChange, type = 'text', required = true, rows, options}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300">{label}</label>
        {type === 'textarea' ? (
            <textarea id={name} name={name} value={value} onChange={onChange} required={required} rows={rows || 4} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-primary-accent focus:border-primary-accent" />
        ) : type === 'select' && options ? (
            <select id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-primary-accent focus:border-primary-accent">
                <option value="" disabled>Select a {label.toLowerCase()}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input id={name} type={type} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-primary-accent focus:border-primary-accent" />
        )}
    </div>
);

const CrudSection: React.FC<{ title: string; items: any[]; onDelete: (id: string) => void; setEditingItem: (item: any | null) => void; renderItem: (item: any) => React.ReactNode; }> =
({ title, items, onDelete, setEditingItem, renderItem }) => (
    <section className="bg-slate-800 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={() => setEditingItem({})} className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700">Add New</button>
        </div>
        <div className="space-y-4">
            {items.map(item => (
                <div key={item.id} className="bg-slate-700 p-4 rounded flex justify-between items-center">
                    <div>{renderItem(item)}</div>
                    <div>
                        <button onClick={() => setEditingItem(item)} className="text-yellow-400 hover:text-yellow-300 mr-4 font-semibold">Edit</button>
                        <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-400 font-semibold">Delete</button>
                    </div>
                </div>
            ))}
             {items.length === 0 && <p className="text-gray-400">No items yet. Click "Add New" to get started.</p>}
        </div>
    </section>
);

const AdminDashboard = () => {
    const adminContext = useContext(AdminContext);
    if (!adminContext) return null;
    const { 
      setIsAdmin, settings, setSettings, messages, setMessages, projects, setProjects, 
      writings, setWritings, workExperience, setWorkExperience, education, setEducation, 
      certificates, setCertificates 
    } = adminContext;

    const [activeTab, setActiveTab] = useState<AdminTab>('Projects');
    
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [editingWorkExperience, setEditingWorkExperience] = useState<Partial<WorkExperience> | null>(null);

    // FIX: Widened the type of `e` to include `HTMLSelectElement` to match the `onChange` prop of `FormField`.
    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, setter: React.Dispatch<React.SetStateAction<any>>) => {
        setter((prev: any) => ({ ...(prev || {}), [e.target.name]: e.target.value }));
    };

    const handleSave = (setter: React.Dispatch<React.SetStateAction<any[]>>, item: any) => {
        if (item.id) {
            setter(prev => prev.map(p => p.id === item.id ? item : p));
        } else {
            setter(prev => [...prev, { ...item, id: Date.now().toString() }]);
        }
    };
    
    const handleDelete = (setter: React.Dispatch<React.SetStateAction<any[]>>, id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setter(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleProjectSave = (e: FormEvent) => {
      e.preventDefault();
      if (!editingProject) return;

      const finalProject = {
        ...editingProject,
        images: Array.isArray(editingProject.images) ? editingProject.images : (editingProject.images as string || '').split(',').map(s => s.trim()).filter(Boolean),
      }

      handleSave(setProjects, finalProject);
      setEditingProject(null);
    }
    
    const handleWorkExperienceSave = (e: FormEvent) => {
        e.preventDefault();
        if (!editingWorkExperience) return;
        
        const finalExp = {
            ...editingWorkExperience,
            description: typeof editingWorkExperience.description === 'string'
                ? (editingWorkExperience.description as string).split('\n').filter(d => d)
                : editingWorkExperience.description || []
        };
        handleSave(setWorkExperience, finalExp);
        setEditingWorkExperience(null);
    };

    const TabButton: React.FC<{tab: AdminTab, children: React.ReactNode}> = ({tab, children}) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-slate-800 text-indigo-400' : 'bg-slate-900 text-gray-400 hover:bg-slate-700'}`}>{children}</button>
    );
    
    const unreadMessagesCount = messages.filter(m => !m.read).length;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center"><h1 className="font-serif text-4xl font-bold text-indigo-400">Admin Dashboard</h1><button onClick={() => setIsAdmin(false)} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700"><FiLogOut /> Logout</button></div>
            <div className="flex border-b-2 border-slate-700 overflow-x-auto">
                <TabButton tab="Projects">Projects</TabButton>
                <TabButton tab="Literature">Literature</TabButton>
                <TabButton tab="Professional">Professional</TabButton>
                <TabButton tab="Inbox">Inbox {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}</TabButton>
                <TabButton tab="Settings">Settings</TabButton>
            </div>
            <div>
                 {activeTab === 'Projects' && (editingProject ? (
                    <form onSubmit={handleProjectSave} className="bg-slate-800 p-6 rounded-lg space-y-4">
                        <h2 className="text-2xl font-bold mb-4">{editingProject.id ? 'Edit' : 'Add'} Project</h2>
                        <FormField label="Title" name="title" value={editingProject.title || ''} onChange={(e) => handleFormChange(e, setEditingProject)} />
                        <FormField label="Description" name="description" value={editingProject.description || ''} onChange={(e) => handleFormChange(e, setEditingProject)} type="textarea" />
                        <FormField label="Image URLs (comma-separated)" name="images" value={Array.isArray(editingProject.images) ? editingProject.images.join(', ') : editingProject.images || ''} onChange={(e) => handleFormChange(e, setEditingProject)} />
                        <div className="flex space-x-4"><button type="submit" className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingProject(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                    </form>
                ) : <CrudSection title="Engineering Projects" items={projects} onDelete={(id) => handleDelete(setProjects, id)} setEditingItem={setEditingProject} renderItem={(item) => <p>{item.title}</p>} />)}

                {activeTab === 'Professional' && (
                    <div>
                        {editingWorkExperience ? (
                             <form onSubmit={handleWorkExperienceSave} className="bg-slate-800 p-6 rounded-lg space-y-4 mb-8">
                                <h2 className="text-2xl font-bold mb-4">{editingWorkExperience.id ? 'Edit' : 'Add'} Work Experience</h2>
                                <FormField label="Role" name="role" value={editingWorkExperience.role || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                <FormField label="Company" name="company" value={editingWorkExperience.company || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                <FormField label="Period" name="period" value={editingWorkExperience.period || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                <FormField label="Description (one point per line)" name="description" value={Array.isArray(editingWorkExperience.description) ? editingWorkExperience.description.join('\n') : editingWorkExperience.description || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} type="textarea" />
                                <div className="flex space-x-4"><button type="submit" className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingWorkExperience(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                            </form>
                        ) : ( <CrudSection title="Work Experience" items={workExperience} onDelete={(id) => handleDelete(setWorkExperience, id)} setEditingItem={setEditingWorkExperience} renderItem={(item) => <p>{item.role} at {item.company}</p>} /> )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Admin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const adminContext = useContext(AdminContext);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check. In a real app, use a secure backend.
    if (password === 'admin') {
      adminContext?.setIsAdmin(true);
    } else {
      setError('Incorrect password.');
    }
  };

  if (adminContext?.isAdmin) {
    return <PageWrapper><AdminDashboard /></PageWrapper>;
  }

  return (
    <PageWrapper>
      <div className="max-w-md mx-auto">
        <h1 className="font-serif text-4xl font-bold text-indigo-400 text-center mb-8">Admin Login</h1>
        <form onSubmit={handleLogin} className="space-y-6 card-glass p-8 rounded-lg shadow-lg">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-primary-accent focus:border-primary-accent"/>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div><button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-primary-accent hover:bg-opacity-80">Login</button></div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default Admin;