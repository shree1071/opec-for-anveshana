import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from './ui/Button';
import { FileText, Download } from 'lucide-react';
import { Card } from './ui/Card';

export function ResumeBuilder({ roadmap, analysis }) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateResume = () => {
        setIsGenerating(true);

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Header
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Career Development Resume', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('AI-Generated Career Roadmap', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Professional Summary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Professional Summary', 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const summary = analysis.counselor_view || 'Motivated professional with clear career goals.';
        const splitSummary = doc.splitTextToSize(summary, pageWidth - 40);
        doc.text(splitSummary, 20, yPos);
        yPos += splitSummary.length * 5 + 10;

        // Career Progression
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Career Progression Plan', 20, yPos);
        yPos += 10;

        roadmap.forEach((year, index) => {
            if (yPos > 250) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Year ${year.year}: ${year.role}`, 20, yPos);
            yPos += 6;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text(year.focus, 20, yPos);
            yPos += 6;

            doc.setFont('helvetica', 'normal');
            doc.text('Key Skills:', 20, yPos);
            yPos += 5;

            year.skills_to_acquire.forEach(skill => {
                doc.text(`• ${skill}`, 25, yPos);
                yPos += 5;
            });

            yPos += 5;
        });

        // Skills Summary
        if (yPos > 220) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Technical Skills', 20, yPos);
        yPos += 8;

        const allSkills = roadmap.flatMap(y => y.skills_to_acquire);
        const uniqueSkills = [...new Set(allSkills)];

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        uniqueSkills.forEach(skill => {
            doc.text(`• ${skill}`, 20, yPos);
            yPos += 5;
        });

        // Save
        doc.save('CareerPath_Resume.pdf');
        setIsGenerating(false);
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">AI Resume Builder</h3>
                        <p className="text-sm text-slate-600">Generate a professional resume from your roadmap</p>
                    </div>
                </div>
                <Button onClick={generateResume} disabled={isGenerating}>
                    {isGenerating ? (
                        'Generating...'
                    ) : (
                        <>
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </>
                    )}
                </Button>
            </div>
            <p className="text-sm text-slate-500">
                Your resume will include your career progression, skills, and professional summary.
            </p>
        </Card>
    );
}
