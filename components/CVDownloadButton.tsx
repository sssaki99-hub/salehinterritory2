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
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });

        if (!adminContext) {
            console.error("AdminContext is not available");
            setIsLoading(false);
            return;
        }

        const { settings, workExperience, education, certificates, projects, skills } = adminContext;
        const { name, professionalSummary, photoUrl } = settings.aboutMe;
        const { email, phone, linkedin, location } = settings.contactDetails;
        const { cvSettings } = settings;
        
        const page_width = doc.internal.pageSize.getWidth();
        const leftMargin = 40;
        const rightMargin = 40;
        const contentWidth = page_width - leftMargin - rightMargin;
        let yPos = 60;
        const lineHeight = 12;
        const sectionGap = 20;
        const entryGap = 12;
        const paraGap = 6;

        const checkPageBreak = (spaceNeeded: number) => {
            if (yPos + spaceNeeded > doc.internal.pageSize.getHeight() - 50) {
                doc.addPage();
                yPos = 50;
            }
        };
        
        const renderSectionHeader = (title: string) => {
            checkPageBreak(30);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(title, leftMargin, yPos);
            yPos += lineHeight * 1.5;
        };

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
                 doc.addImage(img, 'JPEG', page_width - rightMargin - 60, 50, 60, 60);
            }
        } catch (error) {
            console.error("Error adding image to PDF:", error);
        }

        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(name, leftMargin, yPos);
        yPos += 28;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const contactInfo = [email, phone, linkedin, location].filter(Boolean).join(' | ');
        const contactLines = doc.splitTextToSize(contactInfo, contentWidth - 70);
        doc.text(contactLines, leftMargin, yPos);
        yPos += (contactLines.length * lineHeight) + sectionGap;
        
        doc.setDrawColor(99, 102, 241); // primary-accent
        doc.setLineWidth(1);
        doc.line(leftMargin, yPos - (sectionGap / 2), contentWidth + leftMargin, yPos - (sectionGap / 2));
        
        // --- About Me ---
        renderSectionHeader('About Me');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(professionalSummary, contentWidth);
        checkPageBreak(summaryLines.length * lineHeight);
        doc.text(summaryLines, leftMargin, yPos);
        yPos += (summaryLines.length * lineHeight) + sectionGap; 

        // --- Work Experience ---
        if(cvSettings.showWorkExperience && workExperience.length > 0) {
            renderSectionHeader('Work Experience');
            doc.setFontSize(10);
            workExperience.forEach((exp, index) => {
                doc.setFont('helvetica', 'bold');
                const roleText = `${exp.role} at ${exp.company}`;
                const periodText = exp.period;
                const roleLines = doc.splitTextToSize(roleText, contentWidth - 80); // leave space for period
                
                checkPageBreak(roleLines.length * lineHeight + 10);
                doc.text(roleLines, leftMargin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(periodText, page_width - rightMargin, yPos, { align: 'right' });
                yPos += (roleLines.length * lineHeight) + paraGap;
                
                exp.description.forEach(desc => {
                    const descLines = doc.splitTextToSize(`- ${desc}`, contentWidth - 10);
                    checkPageBreak(descLines.length * lineHeight);
                    doc.text(descLines, leftMargin + 10, yPos);
                    yPos += (descLines.length * lineHeight);
                });
                if (index < workExperience.length - 1) yPos += entryGap;
            });
            yPos += sectionGap;
        }
        
        // --- Skills ---
        if(cvSettings.showSkills && skills.length > 0) {
            renderSectionHeader('Skills');
            const groupedSkills = skills.reduce((acc, skill) => {
                const { category } = skill;
                if (!acc[category]) acc[category] = [];
                acc[category].push(skill.name);
                return acc;
            }, {} as Record<string, string[]>);

            doc.setFontSize(10);
            Object.entries(groupedSkills).forEach(([category, skillList]) => {
                doc.setFont('helvetica', 'bold');
                checkPageBreak(lineHeight * 2);
                doc.text(category, leftMargin, yPos);
                yPos += lineHeight + 2;

                doc.setFont('helvetica', 'normal');
                const skillsLine = (skillList as string[]).join(', ');
                const skillLines = doc.splitTextToSize(skillsLine, contentWidth);
                checkPageBreak(skillLines.length * lineHeight);
                doc.text(skillLines, leftMargin, yPos);
                yPos += (skillLines.length * lineHeight) + paraGap;
            });
             yPos += sectionGap;
        }

        // --- Key Projects (Titles Only) ---
        if (cvSettings.showProjects && projects.length > 0) {
            renderSectionHeader('Key Projects');
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            projects.slice(0, 5).forEach(project => {
                const projectTitleLines = doc.splitTextToSize(`- ${project.title}`, contentWidth - 10);
                checkPageBreak(projectTitleLines.length * lineHeight);
                doc.text(projectTitleLines, leftMargin + 10, yPos);
                yPos += (projectTitleLines.length * lineHeight);
            });
            yPos += sectionGap;
        }

        // --- Education ---
        if(cvSettings.showEducation && education.length > 0) {
            renderSectionHeader('Education');
            doc.setFontSize(10);
            education.forEach(edu => {
                doc.setFont('helvetica', 'bold');
                const leftText = `${edu.degree}, ${edu.institution}`;
                const rightText = edu.period;
                const leftLines = doc.splitTextToSize(leftText, contentWidth - 80);
                
                checkPageBreak(leftLines.length * lineHeight + 10);
                doc.text(leftLines, leftMargin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(rightText, page_width - rightMargin, yPos, { align: 'right' });
                yPos += (leftLines.length * lineHeight) + paraGap;

                const detailLines = doc.splitTextToSize(edu.details, contentWidth);
                checkPageBreak(detailLines.length * lineHeight);
                doc.text(detailLines, leftMargin, yPos);
                yPos += (detailLines.length * lineHeight) + entryGap;
            });
            yPos += sectionGap;
        }

        // --- Certificates ---
        if(cvSettings.showCertificates && certificates.length > 0) {
            renderSectionHeader('Certificates');
            doc.setFontSize(10);
            certificates.forEach(cert => {
                doc.setFont('helvetica', 'bold');
                const certNameLines = doc.splitTextToSize(cert.name, contentWidth - 60);
                checkPageBreak(certNameLines.length * lineHeight + 10);
                doc.text(certNameLines, leftMargin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(cert.date, page_width - rightMargin, yPos, { align: 'right' });
                yPos += (certNameLines.length * lineHeight) + paraGap;

                const issuerLines = doc.splitTextToSize(cert.issuer, contentWidth);
                checkPageBreak(issuerLines.length * lineHeight);
                doc.text(issuerLines, leftMargin, yPos);
                yPos += (issuerLines.length * lineHeight) + entryGap;
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