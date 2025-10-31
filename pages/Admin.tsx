

import React, { useState, useContext, ChangeEvent, FormEvent } from 'react';
import PageWrapper from '../components/PageWrapper';
import { AdminContext } from '../contexts/AdminContext';
import { Project, Writing, WorkExperience, Education, Certificate, WritingGenre, WritingCategory, Episode } from '../types';
import { FiTrash2, FiLogOut } from 'react-icons/fi';
import { 
    signInAdmin, signOutAdmin, updateUserPassword,
    addProject, updateProject, deleteProject,
    addWriting, updateWriting, deleteWriting,
    addWorkExperience, updateWorkExperience, deleteWorkExperience,
    addEducation, updateEducation, deleteEducation,
    addCertificate, updateCertificate, deleteCertificate,
    deleteMessage, markMessageAsRead,
    updateSettings, uploadFile
} from '../supabaseClient';

type AdminTab = 'Dashboard' | 'Inbox' | 'Settings' | 'Projects' | 'Literature' | 'Professional';

const FormField: React.FC<{label: string, name: string, value: any, onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void, type?: string, required?: boolean, rows?: number, options?: string[], autoComplete?: string}> = 
({label, name, value, onChange, type = 'text', required = true, rows, options, autoComplete = 'off'}) => (
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
            <input id={name} type={type} name={name} value={value} onChange={onChange} required={required} autoComplete={autoComplete} className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-primary-accent focus:border-primary-accent" />
        )}
    </div>
);

const CrudSection: React.FC<{ title: string; items: any[]; onDelete: (id: string) => Promise<void>; setEditingItem: (item: any | null) => void; renderItem: (item: any) => React.ReactNode; isSubmitting: boolean; }> =
({ title, items, onDelete, setEditingItem, renderItem, isSubmitting }) => (
    <section className="bg-slate-800 p-6 rounded-lg mb-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={() => setEditingItem({})} disabled={isSubmitting} className="bg-green-600 text-white font-bold py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-500">Add New</button>
        </div>
        <div className="space-y-4">
            {items.map(item => (
                <div key={item.id} className="bg-slate-700 p-4 rounded flex justify-between items-center">
                    <div>{renderItem(item)}</div>
                    <div>
                        <button onClick={() => setEditingItem(item)} disabled={isSubmitting} className="text-yellow-400 hover:text-yellow-300 mr-4 font-semibold disabled:text-gray-500">Edit</button>
                        <button onClick={() => onDelete(item.id)} disabled={isSubmitting} className="text-red-500 hover:text-red-400 font-semibold disabled:text-gray-500">Delete</button>
                    </div>
                </div>
            ))}
             {items.length === 0 && <p className="text-gray-400">No items yet. Click "Add New" to get started.</p>}
        </div>
    </section>
);

const AdminDashboard = () => {
    const { settings, setSettings, refetchAllData, messages, projects, writings, workExperience, education, certificates } = useContext(AdminContext)!;
    const [activeTab, setActiveTab] = useState<AdminTab>('Dashboard');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [editingWriting, setEditingWriting] = useState<Partial<Writing> | null>(null);
    const [editingWorkExperience, setEditingWorkExperience] = useState<Partial<WorkExperience> | null>(null);
    const [editingEducation, setEditingEducation] = useState<Partial<Education> | null>(null);
    const [editingCertificate, setEditingCertificate] = useState<Partial<Certificate> | null>(null);

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, setter: React.Dispatch<React.SetStateAction<any>>) => {
        setter((prev: any) => ({ ...(prev || {}), [e.target.name]: e.target.value }));
    };

    const handleSave = async (action: (data: any) => Promise<void>, item: any, setEditingItem: (item: any | null) => void, type: string) => {
        setIsSubmitting(true);
        try {
            await action(item);
            setEditingItem(null);
            await refetchAllData();
        } catch (error) { console.error(`Failed to save ${type}:`, error); alert(`Error: Could not save ${type}.`); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (deleteFn: (id: string) => Promise<void>, id: string, type: string) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        setIsSubmitting(true);
        try {
            await deleteFn(id);
            await refetchAllData();
        } catch (error) { console.error(`Failed to delete ${type}:`, error); alert(`Error: Could not delete ${type}.`); }
        finally { setIsSubmitting(false); }
    };

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>, bucket: string, setter: React.Dispatch<React.SetStateAction<any>>, fieldName: string, isMultiple = false) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setIsSubmitting(true);
        try {
            if (isMultiple) {
                const urls = await Promise.all(Array.from(files).map(file => uploadFile(bucket, file)));
                setter((prev: any) => ({ ...prev, [fieldName]: [...(prev[fieldName] || []), ...urls] }));
            } else {
                const url = await uploadFile(bucket, files[0]);
                setter((prev: any) => ({ ...prev, [fieldName]: url }));
            }
        } catch (error) { console.error("File upload failed:", error); alert("File upload failed."); }
        finally { setIsSubmitting(false); }
    };

    const handleWorkExperienceSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingWorkExperience) return;
        
        // FIX: The type of `editingWorkExperience.description` can be a string from the form, which conflicts with its `string[]` type.
        // Use `as any` to bypass the strict type check and allow conversion from a string (from the textarea) to a string array.
        const finalExp = {
            ...editingWorkExperience,
            description: typeof (editingWorkExperience.description as any) === 'string'
// FIX: Corrected an unsafe type assertion from `string[]` to `string`. The type of `editingWorkExperience.description` is `string[]`, but it holds a string from the form at runtime. The direct cast `as string` is invalid. Changed to `as unknown as string` to make the conversion explicit and fix the TypeScript error.
                ? (editingWorkExperience.description as unknown as string).split('\n')
                : editingWorkExperience.description || []
        };

        const action = editingWorkExperience.id 
            ? (data: any) => updateWorkExperience(editingWorkExperience.id!, data) 
            : addWorkExperience;
        await handleSave(action, finalExp, setEditingWorkExperience, 'work experience');
    };

    const TabButton: React.FC<{tab: AdminTab, children: React.ReactNode}> = ({tab, children}) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors whitespace-nowrap relative ${activeTab === tab ? 'bg-slate-800 text-indigo-400' : 'bg-slate-900 text-gray-400 hover:bg-slate-700'}`}>{children}</button>
    );
    
    const unreadMessagesCount = messages.filter(m => !m.read).length;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center"><h1 className="font-serif text-4xl font-bold text-indigo-400">Admin Dashboard</h1><button onClick={signOutAdmin} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700"><FiLogOut /> Logout</button></div>
            <div className="flex border-b-2 border-slate-700 overflow-x-auto">
                <TabButton tab="Projects">Projects</TabButton>
                <TabButton tab="Literature">Literature</TabButton>
                <TabButton tab="Professional">Professional</TabButton>
                <TabButton tab="Inbox">Inbox {unreadMessagesCount > 0 && `(${unreadMessagesCount})`}</TabButton>
                <TabButton tab="Settings">Settings</TabButton>
            </div>
            <div>
                 {activeTab === 'Projects' && (editingProject ? (
                    <form onSubmit={(e) => { e.preventDefault(); const action = editingProject.id ? (d: any) => updateProject(editingProject.id!, d) : addProject; handleSave(action, editingProject, setEditingProject, 'project'); }} className="bg-slate-800 p-6 rounded-lg space-y-4">
                        <h2 className="text-2xl font-bold mb-4">{editingProject.id ? 'Edit' : 'Add'} Project</h2>
                        <FormField label="Title" name="title" value={editingProject.title || ''} onChange={(e) => handleFormChange(e, setEditingProject)} />
                        <FormField label="Description" name="description" value={editingProject.description || ''} onChange={(e) => handleFormChange(e, setEditingProject)} type="textarea" />
                        <div><label className="block text-sm font-medium text-gray-300">Images</label><input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'project-images', setEditingProject, 'images', true)} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-accent file:text-white hover:file:bg-opacity-80" /><div className="mt-2 flex gap-2 flex-wrap">{editingProject.images?.map((img, i) => <img key={i} src={img} alt="project" className="w-24 h-24 object-cover rounded" />)}</div></div>
                        <div className="flex space-x-4"><button type="submit" disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingProject(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                    </form>
                ) : <CrudSection title="Engineering Projects" items={projects} onDelete={(id) => handleDelete(deleteProject, id, 'project')} setEditingItem={setEditingProject} renderItem={(item) => <p>{item.title}</p>} isSubmitting={isSubmitting}/>)}
                {activeTab === 'Professional' && (
                    <div>
                        {editingWorkExperience ? (
                             <form onSubmit={handleWorkExperienceSave} className="bg-slate-800 p-6 rounded-lg space-y-4 mb-8">
                                <h2 className="text-2xl font-bold mb-4">{editingWorkExperience.id ? 'Edit' : 'Add'} Work Experience</h2>
                                <FormField label="Role" name="role" value={editingWorkExperience.role || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                <FormField label="Company" name="company" value={editingWorkExperience.company || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                <FormField label="Period" name="period" value={editingWorkExperience.period || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                <FormField label="Description (one point per line)" name="description" value={Array.isArray(editingWorkExperience.description) ? editingWorkExperience.description.join('\n') : editingWorkExperience.description || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} type="textarea" />
                                <div className="flex space-x-4"><button type="submit" disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">{isSubmitting ? 'Saving...' : 'Save'}</button><button type="button" onClick={() => setEditingWorkExperience(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                            </form>
                        ) : ( <CrudSection title="Work Experience" items={workExperience} onDelete={(id) => handleDelete(deleteWorkExperience, id, 'work experience')} setEditingItem={setEditingWorkExperience} renderItem={(item) => <p>{item.role} at {item.company}</p>} isSubmitting={isSubmitting} /> )}
                    </div>
                )}
            </div>
        </div>
    );
};

const Admin: React.FC = () => {
  const [password, setPassword] = useState('smss1857');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const adminContext = useContext(AdminContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await signInAdmin(password);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your password and Supabase user setup.');
    } finally {
      setIsSubmitting(false);
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
          <div><button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-primary-accent hover:bg-opacity-80 disabled:bg-gray-500">{isSubmitting ? 'Logging in...' : 'Login'}</button></div>
        </form>
      </div>
    </PageWrapper>
  );
};

export default Admin;