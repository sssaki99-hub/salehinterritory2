import React, { useContext, useState } from 'react';
import { AdminContext } from '../contexts/AdminContext';
import { Skill } from '../types';

// Make sure jsPDF is available in the global scope
declare const jspdf: any;

const CVDownloadButton: React.FC = () => {
    const adminContext = useContext(AdminContext);
    const [isLoading, setIsLoading] = useState(false);
    
    const generatePdf = async () => {
        setIsLoading(true);

        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        if (!adminContext) {
            console.error("AdminContext is not available");
            setIsLoading(false);
            return;
        }

        const { settings, workExperience, education, certificates, projects, skills } = adminContext;
        const { name, professionalSummary, photoUrl } = settings.aboutMe;
        const { email, phone, linkedin, location } = settings.contactDetails;
        
        let yPos = 20;
        const leftMargin = 20;
        const rightMargin = 20;
        const page_width = doc.internal.pageSize.getWidth();
        const contentWidth = page_width - leftMargin - rightMargin;

        // --- Header ---
        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = photoUrl;
            await new Promise(resolve => {
                img.onload = resolve;
                img.onerror = () => { console.error("Image failed to load for PDF"); resolve(null); };
            });
            if (img.complete && img.naturalHeight !== 0) {
                 doc.addImage(img, 'JPEG', page_width - rightMargin - 40, 15, 40, 40);
            }
        } catch (error) {
            console.error("Error adding image to PDF:", error);
        }

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(name, leftMargin, yPos + 5);
        yPos += 15;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const contactInfo = [email, phone, linkedin, location].filter(Boolean).join(' | ');
        const contactLines = doc.splitTextToSize(contactInfo, contentWidth - 50);
        doc.text(contactLines, leftMargin, yPos);
        yPos += (contactLines.length * 5) + 15;
        
        doc.setDrawColor(99, 102, 241);
        doc.line(leftMargin, yPos, leftMargin + contentWidth, yPos);
        yPos += 10;
        
        // --- About Me ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('About Me', leftMargin, yPos);
        yPos += 7;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(professionalSummary, contentWidth);
        doc.text(summaryLines, leftMargin, yPos);
        yPos += (summaryLines.length * 5) + 5; 

        // --- Work Experience ---
        if(workExperience.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Work Experience', leftMargin, yPos);
            yPos += 7;
            
            doc.setFontSize(11);
            workExperience.forEach(exp => {
                doc.setFont('helvetica', 'bold');
                doc.text(`${exp.role} at ${exp.company}`, leftMargin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(exp.period, doc.internal.pageSize.getWidth() - rightMargin, yPos, { align: 'right' });
                yPos += 6;
                
                exp.description.forEach(desc => {
                    const descLines = doc.splitTextToSize(`- ${desc}`, contentWidth - 4);
                    doc.text(descLines, leftMargin + 4, yPos);
                    yPos += (descLines.length * 5);
                });
                yPos += 4;
            });
        }
        
        // --- Skills ---
        if(skills.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Skills', leftMargin, yPos);
            yPos += 7;

            const groupedSkills = skills.reduce((acc, skill) => {
                const { category } = skill;
                if (!acc[category]) acc[category] = [];
                acc[category].push(skill.name);
                return acc;
            }, {} as Record<string, string[]>);

            doc.setFontSize(11);
            Object.entries(groupedSkills).forEach(([category, skillList]) => {
                doc.setFont('helvetica', 'bold');
                doc.text(category, leftMargin, yPos);
                yPos += 6;

                doc.setFont('helvetica', 'normal');
                const skillsLine = skillList.join(', ');
                const skillLines = doc.splitTextToSize(skillsLine, contentWidth);
                doc.text(skillLines, leftMargin, yPos);
                yPos += (skillLines.length * 5) + 2;
            });
             yPos += 5;
        }

        // --- Key Projects ---
        if (projects.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Key Projects', leftMargin, yPos);
            yPos += 7;

            doc.setFontSize(11);
            projects.slice(0, 3).forEach(project => {
                doc.setFont('helvetica', 'bold');
                doc.text(project.title, leftMargin, yPos);
                yPos += 6;

                doc.setFont('helvetica', 'normal');
                const descLines = doc.splitTextToSize(project.description, contentWidth);
                doc.text(descLines, leftMargin, yPos);
                yPos += (descLines.length * 5) + 4;
            });
        }

        // --- Education ---
        if(education.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Education', leftMargin, yPos);
            yPos += 7;
            
            doc.setFontSize(11);
            education.forEach(edu => {
                doc.setFont('helvetica', 'bold');
                doc.text(`${edu.degree}, ${edu.institution}`, leftMargin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(edu.period, doc.internal.pageSize.getWidth() - rightMargin, yPos, { align: 'right' });
                yPos += 6;
                const detailLines = doc.splitTextToSize(edu.details, contentWidth);
                doc.text(detailLines, leftMargin, yPos);
                yPos += (detailLines.length * 5) + 5;
            });
        }

        // --- Certificates ---
        if(certificates.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Certificates', leftMargin, yPos);
            yPos += 7;
            
            doc.setFontSize(11);
            certificates.forEach(cert => {
                doc.setFont('helvetica', 'bold');
                doc.text(cert.name, leftMargin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(cert.date, doc.internal.pageSize.getWidth() - rightMargin, yPos, { align: 'right' });
                yPos += 6;
                doc.text(`${cert.issuer}`, leftMargin, yPos);
                yPos += 8;
            });
        }

        doc.save(`${name.replace(/\s/g, '_')}_CV.pdf`);
        setIsLoading(false);
    };

    return (
        <button 
            onClick={generatePdf}
            disabled={isLoading}
            className="mt-6 inline-block bg-primary-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Generating...' : 'Download CV'}
        </button>
    );
};

export default CVDownloadButton;