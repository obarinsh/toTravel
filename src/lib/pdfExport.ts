import { jsPDF } from 'jspdf';
import { Trip, Attraction } from '@/types';

interface ExportOptions {
  trip: Trip;
  startDate?: string | null;
  endDate?: string | null;
}

export function exportTripToPDF({ trip, startDate, endDate }: ExportOptions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(trip.destination, margin, yPos);
  yPos += 10;

  // Dates
  if (startDate && endDate) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const dateStr = `${formatDateForPDF(startDate)} - ${formatDateForPDF(endDate)}`;
    doc.text(dateStr, margin, yPos);
    yPos += 8;
  }

  // Trip name if different from destination
  if (trip.name && trip.name !== trip.destination) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(trip.name, margin, yPos);
    yPos += 8;
  }

  yPos += 5;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;

  // Hotel info
  if (trip.hotel_name || trip.hotel_location) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Accommodation', margin, yPos);
    yPos += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    if (trip.hotel_name) {
      doc.text(trip.hotel_name, margin, yPos);
      yPos += 5;
    }
    if (trip.hotel_address) {
      doc.setTextColor(100, 100, 100);
      const addressLines = doc.splitTextToSize(trip.hotel_address, pageWidth - margin * 2);
      doc.text(addressLines, margin, yPos);
      yPos += addressLines.length * 5;
    }
    yPos += 10;
  }

  // Group attractions by day
  const numDays = startDate && endDate ? calculateDaysBetween(startDate, endDate) : 0;
  const unassigned = trip.attractions.filter(a => !a.day);
  
  // Itinerary by day
  if (numDays > 0) {
    for (let day = 1; day <= numDays; day++) {
      const dayAttractions = trip.attractions
        .filter(a => a.day === day)
        .sort((a, b) => a.order - b.order);

      checkPageBreak(30);

      // Day header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      const dayDate = startDate ? getDayDate(startDate, day) : '';
      doc.text(`Day ${day}${dayDate ? ` - ${dayDate}` : ''}`, margin, yPos);
      yPos += 8;

      if (dayAttractions.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('No places planned', margin + 5, yPos);
        yPos += 10;
      } else {
        dayAttractions.forEach((attraction, index) => {
          checkPageBreak(25);
          
          // Attraction name
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text(`${index + 1}. ${attraction.name}`, margin + 5, yPos);
          yPos += 5;

          // Description
          if (attraction.description) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            const descLines = doc.splitTextToSize(attraction.description, pageWidth - margin * 2 - 10);
            // Limit to 2 lines
            const limitedLines = descLines.slice(0, 2);
            doc.text(limitedLines, margin + 5, yPos);
            yPos += limitedLines.length * 4 + 3;
          }
          yPos += 3;
        });
      }
      yPos += 5;
    }
  }

  // Unassigned places
  if (unassigned.length > 0) {
    checkPageBreak(30);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Other Places to Visit', margin, yPos);
    yPos += 8;

    unassigned.forEach((attraction, index) => {
      checkPageBreak(20);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`• ${attraction.name}`, margin + 5, yPos);
      yPos += 5;

      if (attraction.description) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const descLines = doc.splitTextToSize(attraction.description, pageWidth - margin * 2 - 10);
        const limitedLines = descLines.slice(0, 2);
        doc.text(limitedLines, margin + 5, yPos);
        yPos += limitedLines.length * 4 + 3;
      }
      yPos += 2;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Created with LaLúz • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `${trip.destination.replace(/[^a-zA-Z0-9]/g, '_')}_trip.pdf`;
  doc.save(fileName);
}

// Helper functions
function formatDateForPDF(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function getDayDate(startDate: string, dayNum: number): string {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayNum - 1);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}
