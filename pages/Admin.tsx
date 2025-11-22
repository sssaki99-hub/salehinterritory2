
import React, { useState, useContext, ChangeEvent, FormEvent } from 'react';
import PageWrapper from '../components/PageWrapper';
import { AdminContext } from '../contexts/AdminContext';
import { Project, Writing, WorkExperience, Education, Certificate, WritingGenre, WritingCategory, Episode, AdminSettings, Skill } from '../types';
import { FiLogOut, FiTrash2 } from 'react-icons/fi';
import {
    signInAdmin, signOutAdmin, updateUserPassword, signUpAdmin,
    addProject, updateProject, deleteProject,
    addWriting, updateWriting, deleteWriting,
    addWorkExperience, updateWorkExperience, deleteWorkExperience,
    addEducation, updateEducation, deleteEducation,
    addCertificate, updateCertificate, deleteCertificate,
    addSkill, updateSkill, deleteSkill,
    deleteMessage, markMessageAsRead,
    updateSettings, uploadFile
} from '../supabaseClient';

type AdminTab = 'Projects' | 'Literature' | 'Professional' | 'Inbox' | 'Settings';

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

const CrudSection: React.FC<{ title: string; items: any[]; onDelete: (id: string) => Promise<void>; setEditingItem: (item: any | null) => void; renderItem: (item: any) => React.ReactNode; isSubmitting: boolean; children?: React.ReactNode }> =
({ title, items, onDelete, setEditingItem, renderItem, isSubmitting, children }) => (
    <section className="bg-slate-800 p-6 rounded-lg mb-8">
        {children}
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
    const adminContext = useContext(AdminContext);
    if (!adminContext) return null;
    const { settings, setSettings, refetchAllData, messages, projects, writings, workExperience, education, certificates, skills } = adminContext;
    
    const [activeTab, setActiveTab] = useState<AdminTab>('Projects');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [editingWriting, setEditingWriting] = useState<Partial<Writing> | null>(null);
    const [editingWorkExperience, setEditingWorkExperience] = useState<Partial<WorkExperience> | null>(null);
    const [editingEducation, setEditingEducation] = useState<Partial<Education> | null>(null);
    const [editingCertificate, setEditingCertificate] = useState<Partial<Certificate> | null>(null);
    const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
    const [currentSettings, setCurrentSettings] = useState<AdminSettings>(settings);
    const [passwordFields, setPasswordFields] = useState({ newPassword: '', confirmPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

    const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, setter: React.Dispatch<React.SetStateAction<any>>) => {
        setter((prev: any) => ({ ...(prev || {}), [e.target.name]: e.target.value }));
    };

    const handleSave = async (action: (data: any) => Promise<void>, item: any, setEditingItem: (item: any | null) => void, type: string) => {
        setIsSubmitting(true);
        try {
            await action(item);
            setEditingItem(null);
            await refetchAllData();
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`);
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
                const urls = await Promise.all((Array.from(files) as File[]).map(file => uploadFile(bucket, file)));
                setter((prev: any) => ({ ...prev, [fieldName]: [...(prev[fieldName] || []), ...urls] }));
            } else {
                const url = await uploadFile(bucket, files[0]);
                const keys = fieldName.split('.');

                if (keys.length > 1) {
                    setter((prev: any) => {
                        const newState = { ...prev };
                        let current = newState;
                        for (let i = 0; i < keys.length - 1; i++) {
                            current[keys[i]] = { ...current[keys[i]] };
                            current = current[keys[i]];
                        }
                        current[keys[keys.length - 1]] = url;
                        return newState;
                    });
                } else {
                    setter((prev: any) => ({ ...prev, [fieldName]: url }));
                }
            }
        } catch (error) { console.error("File upload failed:", error); alert("File upload failed."); }
        finally { setIsSubmitting(false); }
    };

    const handleSettingsChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const keys = name.split('.');
        const isCheckbox = type === 'checkbox';
        const checkedValue = (e.target as HTMLInputElement).checked;

        setCurrentSettings(prev => {
            const newState = { ...prev };
            let currentLevel: any = newState;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                currentLevel[key] = { ...currentLevel[key] };
                currentLevel = currentLevel[key];
            }
            
            const finalKey = keys[keys.length - 1];
            currentLevel[finalKey] = isCheckbox ? checkedValue : value;

            return newState;
        });
    };
    
    const saveSettings = async () => {
        setIsSubmitting(true);
        try {
            await updateSettings(currentSettings);
            setSettings(currentSettings);
            alert('Settings saved!');
        } catch (error: any) {
            let errorMessage = "An unknown error occurred.";
            if (typeof error === 'object' && error !== null) {
                errorMessage = error.message || JSON.stringify(error, null, 2);
            } else {
                errorMessage = String(error);
            }
            console.error("Failed to save settings:", error);
            alert(`Failed to save settings:\n\n${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePasswordSave = async (e: FormEvent) => {
        e.preventDefault();
        if (!passwordFields.newPassword || passwordFields.newPassword !== passwordFields.confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Passwords do not match or are empty.' });
            return;
        }
        setIsSubmitting(true);
        try {
            await updateUserPassword(passwordFields.newPassword);
            setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
            setPasswordFields({ newPassword: '', confirmPassword: '' });
        } catch(error: any) {
             setPasswordMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleWorkExperienceSave = (e: FormEvent) => {
        e.preventDefault();
        if (!editingWorkExperience) return;
        
        const finalExp = {
            ...editingWorkExperience,
            description: typeof (editingWorkExperience.description as unknown) === 'string'
                ? (editingWorkExperience.description as unknown as string).split('\n').filter(d => d.trim() !== '')
                : editingWorkExperience.description || []
        };
        const action = finalExp.id ? (d: any) => updateWorkExperience(finalExp.id!, d) : addWorkExperience;
        handleSave(action, finalExp, setEditingWorkExperience, 'work experience');
    };
    
    const handleEpisodeChange = (index: number, field: 'title' | 'content', value: string) => {
        if (!editingWriting || !Array.isArray(editingWriting.content)) return;
        const updatedEpisodes = [...editingWriting.content];
        updatedEpisodes[index] = { ...updatedEpisodes[index], [field]: value, id: updatedEpisodes[index]?.id || `temp-${Date.now()}` };
        setEditingWriting({ ...editingWriting, content: updatedEpisodes });
    };

    const addEpisode = () => {
        if (!editingWriting) return;
        const currentEpisodes = Array.isArray(editingWriting.content) ? editingWriting.content : [];
        const newEpisode: Episode = { id: `temp-${Date.now()}`, episodeNumber: currentEpisodes.length + 1, title: '', content: '' };
        setEditingWriting({ ...editingWriting, content: [...currentEpisodes, newEpisode] });
    };

    const TabButton: React.FC<{tab: AdminTab, children: React.ReactNode}> = ({tab, children}) => (
        <button onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold rounded-t-lg transition-colors whitespace-nowrap relative ${activeTab === tab ? 'bg-slate-800 text-indigo-400' : 'bg-slate-900 text-gray-400 hover:bg-slate-700'}`}>{children}</button>
    );
    
    const unreadMessagesCount = messages.filter(m => !m.read).length;

    const CheckboxSetting: React.FC<{label: string, name: string, isChecked: boolean}> = ({ label, name, isChecked }) => (
        <div className="flex items-center justify-between">
            <label htmlFor={name} className="text-gray-300">{label}</label>
            <input 
                type="checkbox" 
                id={name} 
                name={name} 
                checked={isChecked} 
                onChange={handleSettingsChange} 
                className="h-6 w-6 rounded text-primary-accent bg-slate-700 border-slate-600 focus:ring-primary-accent" 
            />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center"><h1 className="font-serif text-4xl font-bold text-indigo-400">Admin Dashboard</h1><button onClick={signOutAdmin} className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700"><FiLogOut /> Logout</button></div>
            <div className="flex border-b-2 border-slate-700 overflow-x-auto">
                <TabButton tab="Projects">Projects</TabButton>
                <TabButton tab="Literature">Literature</TabButton>
                <TabButton tab="Professional">Professional</TabButton>
                <TabButton tab="Inbox">Inbox {unreadMessagesCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">{unreadMessagesCount}</span>}</TabButton>
                <TabButton tab="Settings">Settings</TabButton>
            </div>
            <div>
                 {activeTab === 'Projects' && (
                    <CrudSection title="Engineering Projects" items={projects} onDelete={(id) => handleDelete(deleteProject, id, 'project')} setEditingItem={setEditingProject} renderItem={(item) => <p>{item.title}</p>} isSubmitting={isSubmitting}>
                         {editingProject && (
                            <form onSubmit={(e) => { e.preventDefault(); const action = editingProject.id ? (d: any) => updateProject(editingProject.id!, d) : addProject; handleSave(action, editingProject, setEditingProject, 'project'); }} className="bg-slate-900 p-6 rounded-lg space-y-4 mb-8 border border-primary-accent/30">
                                <h2 className="text-2xl font-bold mb-4">{editingProject.id ? 'Edit' : 'Add'} Project</h2>
                                <FormField label="Title" name="title" value={editingProject.title || ''} onChange={(e) => handleFormChange(e, setEditingProject)} />
                                <FormField label="Description" name="description" value={editingProject.description || ''} onChange={(e) => handleFormChange(e, setEditingProject)} type="textarea" />
                                <div><label className="block text-sm font-medium text-gray-300">Images</label><input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'project-images', setEditingProject, 'images', true)} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-accent file:text-white hover:file:bg-opacity-80" /><div className="mt-2 flex gap-2 flex-wrap">{editingProject.images?.map((img, i) => <img key={i} src={img} alt="project" className="w-24 h-24 object-cover rounded" />)}</div></div>
                                <FormField label="Demo Video URL" name="demoVideoUrl" value={editingProject.demoVideoUrl || ''} onChange={(e) => handleFormChange(e, setEditingProject)} required={false} />
                                <FormField label="Detailed PDF URL" name="pdfUrl" value={editingProject.pdfUrl || ''} onChange={(e) => handleFormChange(e, setEditingProject)} required={false} />
                                <div className="flex space-x-4"><button type="submit" disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingProject(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                            </form>
                        )}
                    </CrudSection>
                 )}

                {activeTab === 'Literature' && (
                    <CrudSection title="Literary Works" items={writings} onDelete={(id) => handleDelete(deleteWriting, id, 'literary work')} setEditingItem={setEditingWriting} renderItem={(item) => <p>{item.title} <span className="text-sm text-gray-400">({item.category})</span></p>} isSubmitting={isSubmitting}>
                        {editingWriting && (
                            <form onSubmit={(e) => { e.preventDefault(); const action = editingWriting.id ? (d: any) => updateWriting(editingWriting.id!, d) : addWriting; handleSave(action, editingWriting, setEditingWriting, 'literary work'); }} className="bg-slate-900 p-6 rounded-lg space-y-4 mb-8 border border-primary-accent/30">
                                <h2 className="text-2xl font-bold mb-4">{editingWriting.id ? 'Edit' : 'Add'} Literary Work</h2>
                                <FormField label="Title" name="title" value={editingWriting.title || ''} onChange={e => handleFormChange(e, setEditingWriting)} />
                                <FormField label="Category" name="category" value={editingWriting.category || ''} onChange={e => handleFormChange(e, setEditingWriting)} type="select" options={Object.values(WritingCategory)} />
                                <FormField label="Genre" name="genre" value={editingWriting.genre || ''} onChange={e => handleFormChange(e, setEditingWriting)} type="select" options={Object.values(WritingGenre)} />
                                <div><label className="block text-sm font-medium text-gray-300">Cover Image</label><input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'writing-covers', setEditingWriting, 'coverImageUrl')} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-accent file:text-white hover:file:bg-opacity-80" />{editingWriting.coverImageUrl && <img src={editingWriting.coverImageUrl} alt="cover" className="w-24 h-36 object-cover rounded mt-2" />}</div>
                                <FormField label="Summary" name="summary" value={editingWriting.summary || ''} onChange={e => handleFormChange(e, setEditingWriting)} type="textarea" />
                                {editingWriting.category === WritingCategory.Novel ? (
                                    <div>
                                        <h3 className="text-xl font-bold mt-6 mb-4">Episodes</h3>
                                        <div className="space-y-4">
                                            {(Array.isArray(editingWriting.content) ? editingWriting.content : []).map((ep, index) => (
                                                <div key={ep.id} className="bg-slate-700 p-4 rounded">
                                                    <FormField label={`Episode ${index + 1} Title`} name={`ep-title-${index}`} value={ep.title} onChange={e => handleEpisodeChange(index, 'title', e.target.value)} />
                                                    <FormField label="Content" name={`ep-content-${index}`} value={ep.content} onChange={e => handleEpisodeChange(index, 'content', e.target.value)} type="textarea" rows={10} />
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" onClick={addEpisode} className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded">Add Episode</button>
                                    </div>
                                ) : (
                                    <FormField label="Content" name="content" value={typeof editingWriting.content === 'string' ? editingWriting.content : ''} onChange={e => handleFormChange(e, setEditingWriting)} type="textarea" rows={15} />
                                )}
                                <FormField label="YouTube Audiobook URL" name="youtubeAudiobookUrl" value={editingWriting.youtubeAudiobookUrl || ''} onChange={e => handleFormChange(e, setEditingWriting)} required={false} />
                                <div className="flex space-x-4"><button type="submit" className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingWriting(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                            </form>
                        )}
                    </CrudSection>
                )}

                {activeTab === 'Professional' && (
                    <div>
                        <CrudSection title="Work Experience" items={workExperience} onDelete={(id) => handleDelete(deleteWorkExperience, id, 'work experience')} setEditingItem={setEditingWorkExperience} renderItem={(item) => <p>{item.role} at {item.company}</p>} isSubmitting={isSubmitting}>
                            {editingWorkExperience && (
                                <form onSubmit={handleWorkExperienceSave} className="bg-slate-900 p-6 rounded-lg space-y-4 mb-8 border border-primary-accent/30">
                                    <h2 className="text-2xl font-bold mb-4">{editingWorkExperience.id ? 'Edit' : 'Add'} Work Experience</h2>
                                    <FormField label="Role" name="role" value={editingWorkExperience.role || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                    <FormField label="Company" name="company" value={editingWorkExperience.company || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                    <FormField label="Period" name="period" value={editingWorkExperience.period || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} />
                                    <FormField label="Description (one point per line)" name="description" value={Array.isArray(editingWorkExperience.description) ? editingWorkExperience.description.join('\n') : editingWorkExperience.description || ''} onChange={e => handleFormChange(e, setEditingWorkExperience)} type="textarea" />
                                    <div className="flex space-x-4"><button type="submit" disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingWorkExperience(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                                </form>
                            )}
                        </CrudSection>
                        
                        <CrudSection title="Skills" items={skills} onDelete={(id) => handleDelete(deleteSkill, id, 'skill')} setEditingItem={setEditingSkill} renderItem={(item) => <p>{item.name} <span className="text-sm text-gray-400">({item.category})</span></p>} isSubmitting={isSubmitting}>
                            {editingSkill && (
                                <form onSubmit={(e) => { e.preventDefault(); const action = editingSkill.id ? (d: any) => updateSkill(editingSkill.id!, d) : addSkill; handleSave(action, editingSkill, setEditingSkill, 'skill'); }} className="bg-slate-900 p-6 rounded-lg space-y-4 my-8 border border-primary-accent/30">
                                    <h2 className="text-2xl font-bold mb-4">{editingSkill.id ? 'Edit' : 'Add'} Skill</h2>
                                    <FormField label="Skill Name" name="name" value={editingSkill.name || ''} onChange={e => handleFormChange(e, setEditingSkill)} />
                                    <FormField label="Category" name="category" value={editingSkill.category || ''} onChange={e => handleFormChange(e, setEditingSkill)} />
                                    <div className="flex space-x-4"><button type="submit" disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingSkill(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                                </form>
                            )}
                        </CrudSection>
                        
                        <CrudSection title="Education" items={education} onDelete={(id) => handleDelete(deleteEducation, id, 'education')} setEditingItem={setEditingEducation} renderItem={(item) => <p>{item.degree} from {item.institution}</p>} isSubmitting={isSubmitting}>
                            {editingEducation && (
                                <form onSubmit={(e) => { e.preventDefault(); const action = editingEducation.id ? (d: any) => updateEducation(editingEducation.id!, d) : addEducation; handleSave(action, editingEducation, setEditingEducation, 'education'); }} className="bg-slate-900 p-6 rounded-lg space-y-4 my-8 border border-primary-accent/30">
                                    <h2 className="text-2xl font-bold mb-4">{editingEducation.id ? 'Edit' : 'Add'} Education</h2>
                                    <FormField label="Degree" name="degree" value={editingEducation.degree || ''} onChange={e => handleFormChange(e, setEditingEducation)} />
                                    <FormField label="Institution" name="institution" value={editingEducation.institution || ''} onChange={e => handleFormChange(e, setEditingEducation)} />
                                    <FormField label="Period" name="period" value={editingEducation.period || ''} onChange={e => handleFormChange(e, setEditingEducation)} />
                                    <FormField label="Details" name="details" value={editingEducation.details || ''} onChange={e => handleFormChange(e, setEditingEducation)} type="textarea" />
                                    <div className="flex space-x-4"><button type="submit" disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingEducation(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                                </form>
                            )}
                        </CrudSection>

                        <CrudSection title="Certificates" items={certificates} onDelete={(id) => handleDelete(deleteCertificate, id, 'certificate')} setEditingItem={setEditingCertificate} renderItem={(item) => <p>{item.name} from {item.issuer}</p>} isSubmitting={isSubmitting}>
                            {editingCertificate && (
                                <form onSubmit={(e) => { e.preventDefault(); const action = editingCertificate.id ? (d: any) => updateCertificate(editingCertificate.id!, d) : addCertificate; handleSave(action, editingCertificate, setEditingCertificate, 'certificate'); }} className="bg-slate-900 p-6 rounded-lg space-y-4 my-8 border border-primary-accent/30">
                                    <h2 className="text-2xl font-bold mb-4">{editingCertificate.id ? 'Edit' : 'Add'} Certificate</h2>
                                    <FormField label="Name" name="name" value={editingCertificate.name || ''} onChange={e => handleFormChange(e, setEditingCertificate)} />
                                    <FormField label="Issuer" name="issuer" value={editingCertificate.issuer || ''} onChange={e => handleFormChange(e, setEditingCertificate)} />
                                    <FormField label="Date" name="date" value={editingCertificate.date || ''} onChange={e => handleFormChange(e, setEditingCertificate)} />
                                    <FormField label="Credential URL" name="credentialUrl" value={editingCertificate.credentialUrl || ''} onChange={e => handleFormChange(e, setEditingCertificate)} required={false} />
                                    <div className="flex space-x-4"><button type="submit" disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded">Save</button><button type="button" onClick={() => setEditingCertificate(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button></div>
                                </form>
                            )}
                        </CrudSection>
                    </div>
                )}
                
                {activeTab === 'Inbox' && (
                    <section className="bg-slate-800 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold mb-6">Inbox</h2>
                        <div className="space-y-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`p-4 rounded border-l-4 ${msg.read ? 'bg-slate-700 border-slate-600' : 'bg-indigo-900/50 border-indigo-500'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white">{msg.name} <span className="font-normal text-gray-400">&lt;{msg.email}&gt;</span></p>
                                            <p className="text-gray-300 mt-2">{msg.message}</p>
                                            <p className="text-xs text-gray-500 mt-2">{new Date(msg.timestamp).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                                            {!msg.read && <button onClick={async () => { await markMessageAsRead(msg.id); await refetchAllData(); }} className="text-sm text-green-400 hover:underline">Mark as Read</button>}
                                            <button onClick={() => handleDelete(deleteMessage, msg.id, 'message')}><FiTrash2 className="text-red-500 hover:text-red-400" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {messages.length === 0 && <p className="text-gray-400">Your inbox is empty.</p>}
                        </div>
                    </section>
                )}

                {activeTab === 'Settings' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className="bg-slate-800 p-6 rounded-lg space-y-4">
                            <h2 className="text-2xl font-bold mb-4">General Settings</h2>
                             <CheckboxSetting label="Enable Comments" name="commentsEnabled" isChecked={currentSettings.commentsEnabled} />
                             <CheckboxSetting label="Enable Ratings" name="ratingsEnabled" isChecked={currentSettings.ratingsEnabled} />
                             <FormField label="Hero Title" name="heroSection.title" value={currentSettings.heroSection.title} onChange={handleSettingsChange} />
                             <FormField label="Hero Subtitle" name="heroSection.subtitle" value={currentSettings.heroSection.subtitle} onChange={handleSettingsChange} />
                             <FormField label="Footer Copyright" name="footerContent.copyright" value={currentSettings.footerContent.copyright} onChange={handleSettingsChange} />
                             <button onClick={saveSettings} disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded w-full mt-4">Save General Settings</button>
                        </section>
                        <section className="bg-slate-800 p-6 rounded-lg space-y-4">
                            <h2 className="text-2xl font-bold mb-4">About Me & Contact</h2>
                             <FormField label="Full Name" name="aboutMe.name" value={currentSettings.aboutMe.name} onChange={handleSettingsChange} />
                             <div><label className="block text-sm font-medium text-gray-300">Profile Photo</label><input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'profile-photos', setCurrentSettings, 'aboutMe.photoUrl')} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-accent file:text-white hover:file:bg-opacity-80" />{currentSettings.aboutMe.photoUrl && <img src={currentSettings.aboutMe.photoUrl} alt="profile" className="w-24 h-24 rounded-full object-cover mt-2" />}</div>
                             <FormField label="Bio" name="aboutMe.bio" value={currentSettings.aboutMe.bio} onChange={handleSettingsChange} type="textarea" />
                             <FormField label="CV Professional Summary" name="aboutMe.professionalSummary" value={currentSettings.aboutMe.professionalSummary} onChange={handleSettingsChange} type="textarea" />
                             <FormField label="Email" name="contactDetails.email" value={currentSettings.contactDetails.email} onChange={handleSettingsChange} type="email" />
                             <FormField label="Phone" name="contactDetails.phone" value={currentSettings.contactDetails.phone} onChange={handleSettingsChange} />
                             <FormField label="Facebook URL" name="contactDetails.facebook" value={currentSettings.contactDetails.facebook} onChange={handleSettingsChange} />
                             <FormField label="LinkedIn URL" name="contactDetails.linkedin" value={currentSettings.contactDetails.linkedin} onChange={handleSettingsChange} />
                             <FormField label="Location" name="contactDetails.location" value={currentSettings.contactDetails.location} onChange={handleSettingsChange} />
                             <button onClick={saveSettings} disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded w-full mt-4">Save Personal Info</button>
                        </section>
                         <section className="bg-slate-800 p-6 rounded-lg space-y-4">
                             <h2 className="text-2xl font-bold mb-4">CV Content Configuration</h2>
                             <CheckboxSetting label="Show Work Experience" name="cvSettings.showWorkExperience" isChecked={currentSettings.cvSettings?.showWorkExperience ?? true} />
                             <CheckboxSetting label="Show Skills" name="cvSettings.showSkills" isChecked={currentSettings.cvSettings?.showSkills ?? true} />
                             <CheckboxSetting label="Show Key Projects" name="cvSettings.showProjects" isChecked={currentSettings.cvSettings?.showProjects ?? true} />
                             <CheckboxSetting label="Show Education" name="cvSettings.showEducation" isChecked={currentSettings.cvSettings?.showEducation ?? true} />
                             <CheckboxSetting label="Show Certificates" name="cvSettings.showCertificates" isChecked={currentSettings.cvSettings?.showCertificates ?? true} />
                             <button onClick={saveSettings} disabled={isSubmitting} className="bg-primary-accent text-white font-bold py-2 px-4 rounded w-full mt-4">Save CV Settings</button>
                         </section>
                         <section className="bg-slate-800 p-6 rounded-lg">
                             <h2 className="text-2xl font-bold mb-4">Security</h2>
                             <form onSubmit={handlePasswordSave} className="space-y-4">
                                <FormField label="New Password" name="newPassword" type="password" value={passwordFields.newPassword} onChange={e => setPasswordFields({...passwordFields, newPassword: e.target.value})} />
                                <FormField label="Confirm New Password" name="confirmPassword" type="password" value={passwordFields.confirmPassword} onChange={e => setPasswordFields({...passwordFields, confirmPassword: e.target.value})} />
                                {passwordMessage.text && <p className={passwordMessage.type === 'error' ? 'text-red-500' : 'text-green-400'}>{passwordMessage.text}</p>}
                                <button type="submit" disabled={isSubmitting} className="bg-yellow-600 text-white font-bold py-2 px-4 rounded">Update Password</button>
                             </form>
                         </section>
                    </div>
                )}
            </div>
        </div>
    );
};

const Admin: React.FC = () => {
  const [password, setPassword] = useState('admin');
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
      setError(err.message || 'Failed to login. Ensure you have created the admin user in Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    setError('');
    setIsSubmitting(true);
    try {
        await signUpAdmin(password);
        alert("Admin account created! You can now login. \n\nNote: If your Supabase project requires email verification, you must verify your email before logging in.");
    } catch (err: any) {
        setError(err.message);
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
          <div className="flex flex-col gap-4">
            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-primary-accent hover:bg-opacity-80 disabled:bg-gray-500 transition-colors">
                {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" onClick={handleSignUp} disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm font-medium text-gray-300 bg-slate-800 hover:bg-slate-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
                Create Account
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">Default password is 'admin'. If this is your first time, click Create Account.</p>
        </form>
      </div>
    </PageWrapper>
  );
};

export default Admin;
