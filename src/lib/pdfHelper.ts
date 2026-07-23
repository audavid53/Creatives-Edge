import { jsPDF } from 'jspdf';

export function generateLessonPDF(
  dayNumber: number,
  title: string,
  keyInsight: string,
  questions: string[],
  answers: string[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Draw warm cream background (#FAF6F0)
  doc.setFillColor(250, 246, 240);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // 2. Decorative outer border
  doc.setDrawColor(235, 227, 213);
  doc.setLineWidth(1.5);
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40, 'D');

  let y = 60;

  // 3. Header branding
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(200, 90, 50); // Terracotta #C85A32
  doc.text('THE CREATIVE ACADEMY', 45, y, { charSpace: 1.5 });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 110, 100);
  doc.text('30-DAY DECUPLED INCOME BLUEPRINT', pageWidth - 45, y, { align: 'right' });

  // Divider line
  y += 15;
  doc.setDrawColor(212, 163, 115); // Accent gold
  doc.setLineWidth(1);
  doc.line(45, y, pageWidth - 45, y);

  // 4. Lesson Title Section
  y += 40;
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(28, 25, 23); // Charcoal #1C1917
  doc.text(`Day ${dayNumber}: ${title}`, 45, y);

  y += 18;
  doc.setFont('times', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(115, 100, 90);
  doc.text('A professional keepsake of your daily creative strategy', 45, y);

  // 5. Key Insight Box (Terracotta backdrop & times italic quote)
  y += 40;
  doc.setFillColor(244, 239, 234); // Slightly darker warm block
  doc.setDrawColor(200, 90, 50); // Left accent line
  doc.setLineWidth(3);
  
  // Calculate text height for Key Insight
  doc.setFont('times', 'italic');
  doc.setFontSize(13);
  const insightLines = doc.splitTextToSize(`"${keyInsight}"`, pageWidth - 120);
  const insightBoxHeight = insightLines.length * 18 + 24;

  // Draw box background and left accent line
  doc.rect(45, y, pageWidth - 90, insightBoxHeight, 'F');
  doc.line(45, y, 45, y + insightBoxHeight);

  // Write Insight Text
  doc.setTextColor(28, 25, 23);
  let textY = y + 18;
  insightLines.forEach((line: string) => {
    doc.text(line, 60, textY);
    textY += 18;
  });

  // Small Insight Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(200, 90, 50);
  doc.text('DECLARED INSIGHT', 60, y - 8);

  y += insightBoxHeight + 40;

  // 6. Reflection Q&A Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(100, 95, 90);
  doc.text('SCRIBED REFLECTIONS & BLUEPRINT ANSWERS', 45, y);
  
  y += 10;
  doc.setDrawColor(230, 222, 210);
  doc.setLineWidth(1);
  doc.line(45, y, pageWidth - 45, y);

  y += 25;

  questions.forEach((q, idx) => {
    // Check page boundaries
    if (y > pageHeight - 120) {
      doc.addPage();
      // Draw warm cream background on new page
      doc.setFillColor(250, 246, 240);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      // Decorative border on new page
      doc.setDrawColor(235, 227, 213);
      doc.setLineWidth(1.5);
      doc.rect(20, 20, pageWidth - 40, pageHeight - 40, 'D');
      y = 60;
    }

    // Question
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(28, 25, 23);
    const qLines = doc.splitTextToSize(`Inquiry ${idx + 1}: ${q}`, pageWidth - 95);
    qLines.forEach((line: string) => {
      doc.text(line, 45, y);
      y += 16;
    });

    y += 6;

    // Answer
    const ansText = answers[idx]?.trim() || "No reflection scribed for this inquiry.";
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    
    const aLines = doc.splitTextToSize(ansText, pageWidth - 105);
    
    // Draw left gray line for answers
    const ansHeight = aLines.length * 15;
    doc.setDrawColor(212, 206, 196);
    doc.setLineWidth(1);
    doc.line(55, y - 4, 55, y - 4 + ansHeight + 4);

    aLines.forEach((line: string) => {
      doc.text(line, 65, y);
      y += 15;
    });

    y += 30; // Spacing to next question
  });

  // Footer seal
  if (y > pageHeight - 60) {
    doc.addPage();
    doc.setFillColor(250, 246, 240);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(235, 227, 213);
    doc.setLineWidth(1.5);
    doc.rect(20, 20, pageWidth - 40, pageHeight - 40, 'D');
    y = 60;
  } else {
    y = pageHeight - 80;
  }

  doc.setDrawColor(212, 163, 115);
  doc.setLineWidth(0.5);
  doc.line(45, y, pageWidth - 45, y);

  y += 20;
  doc.setFont('times', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(140, 130, 120);
  doc.text('This document remains a permanent asset in your journey. Safeguard your clarity.', pageWidth / 2, y, { align: 'center' });

  // Save/Download the PDF
  const filename = `CreativeEdge_Day_${dayNumber}_Blueprint.pdf`;
  doc.save(filename);
}
