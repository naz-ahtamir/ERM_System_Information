import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface Finding {
  id: string;
  title: string;
  findingStatus: 'OPEN' | 'INPG' | 'CLSD';
  data?: {
    tanggalInspeksi?: string;
    lokasiUtama?: string;
    kategoriHazard?: string;
    levelHazard?: string;
    deskripsiKetidaksesuaian?: string;
    rekomendasiPerbaikan?: string;
    safetyOfficer?: string;
  };
  files?: Array<{ fileUrl: string; fieldName: string }>;
  createdAt: string;
  createdBy: string;
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export async function exportFindingToPDF(finding: Finding): Promise<void> {
  try {
    // Create PDF document with portrait orientation
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Company Header with Orange Background
    pdf.setFillColor(241, 90, 34); // Orange (#f15a22)
    pdf.rect(0, 0, pageWidth, 35, 'F');

    // Company Name and Title
    pdf.setTextColor(255, 255, 255); // White text
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SMK3 SYSTEM', pageWidth / 2, 12, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('SMK3 Finding Report', pageWidth / 2, 22, { align: 'center' });

    // Reset text color for content
    pdf.setTextColor(0, 0, 0);
    yPosition = 40;

    // Finding Status and Info
    const statusColor: Record<string, [number, number, number]> = {
      OPEN: [220, 53, 69],
      INPG: [255, 193, 7],
      CLSD: [40, 167, 69],
    };

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');

    const statusRGB = statusColor[finding.findingStatus] || statusColor.INPG;
    pdf.setFillColor(statusRGB[0], statusRGB[1], statusRGB[2]);
    pdf.setTextColor(255, 255, 255);
    pdf.rect(margin, yPosition - 5, 40, 8, 'F');
    pdf.text(`Status: ${finding.findingStatus}`, margin + 2, yPosition - 1);

    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(`ID: ${finding.id}`, pageWidth - margin - 40, yPosition - 1);

    yPosition += 12;

    // Finding Details Table
    const detailsData = [
      ['Field', 'Value'],
      ['Title', finding.title],
      ['Status', finding.findingStatus],
      [
        'Date',
        finding.data?.tanggalInspeksi
          ? new Date(finding.data.tanggalInspeksi).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })
          : new Date(finding.createdAt).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }),
      ],
      ['Location', finding.data?.lokasiUtama || '-'],
      ['Category', finding.data?.kategoriHazard || '-'],
      ['Hazard Level', finding.data?.levelHazard || '-'],
      ['Created By', finding.createdBy],
      ['Safety Officer', finding.data?.safetyOfficer || '-'],
      [
        'Approved By',
        finding.approvedBy ? `${finding.approvedBy} (${finding.approvedAt || 'N/A'})` : '-',
      ],
    ];

    autoTable(pdf, {
      head: [detailsData[0]],
      body: detailsData.slice(1),
      startY: yPosition,
      margin: margin,
      theme: 'striped',
      headStyles: {
        fillColor: [241, 90, 34], // Orange header
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 4,
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: pageWidth - 80 },
      },
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Description Section
    if (finding.data?.deskripsiKetidaksesuaian) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description', margin, yPosition);

      yPosition += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      const descriptionText = pdf.splitTextToSize(finding.data.deskripsiKetidaksesuaian, pageWidth - 2 * margin);
      pdf.text(descriptionText, margin, yPosition);
      yPosition += descriptionText.length * 5 + 5;
    }

    // Recommendation Section
    if (finding.data?.rekomendasiPerbaikan) {
      // Check if new page is needed
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations', margin, yPosition);

      yPosition += 7;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);

      const recommendationText = pdf.splitTextToSize(finding.data.rekomendasiPerbaikan, pageWidth - 2 * margin);
      pdf.text(recommendationText, margin, yPosition);
      yPosition += recommendationText.length * 5 + 5;
    }

    // Photos Section
    const photoFiles = finding.files?.filter(
      (f) => f.fieldName === 'dokumentasiHazard' || f.fieldName === 'dokumentasiPerbaikan'
    ) || [];

    if (photoFiles.length > 0) {
      // Check if new page is needed
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Documentation Photos', margin, yPosition);

      yPosition += 10;

      for (const file of photoFiles) {
        try {
          // Check if new page is needed for this image
          if (yPosition > pageHeight - 80) {
            pdf.addPage();
            yPosition = margin;
          }

          // Fetch and convert image to data URL
          const response = await fetch(file.fileUrl);
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          // Add label
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          const label = file.fieldName === 'dokumentasiHazard' ? 'Hazard Documentation' : 'Perbaikan Documentation';
          pdf.text(label, margin, yPosition);
          yPosition += 5;

          // Add image with constrained size
          const maxWidth = pageWidth - 2 * margin;
          const maxHeight = 60;
          pdf.addImage(dataUrl, 'PNG', margin, yPosition, maxWidth, maxHeight);
          yPosition += maxHeight + 10;
        } catch (error) {
          console.error('Error loading photo:', error);
          pdf.setFontSize(9);
          pdf.setTextColor(200, 0, 0);
          pdf.text(`[Failed to load: ${file.fieldName}]`, margin, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += 5;
        }
      }
    }

    // Footer with page numbers
    const totalPages = (pdf as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);

      // Page number
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Footer with company name
      pdf.text(
        'SMK3 System - Occupational Health & Safety Management',
        pageWidth / 2,
        pageHeight - 5,
        { align: 'center' }
      );
    }

    // Generate filename with finding ID and title
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const sanitizedTitle = finding.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const filename = `finding-${finding.id}-${sanitizedTitle}-${dateString}.pdf`;

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}
