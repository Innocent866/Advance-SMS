export const generateReceipt = async (tx, schoolSettings) => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // Settings or Defaults
    const title = schoolSettings?.receiptSettings?.title || 'Payment Receipt';
    const message = schoolSettings?.receiptSettings?.message || 'Thank you for your payment.';
    const signature = schoolSettings?.receiptSettings?.signature || 'Management';
    const showLogo = schoolSettings?.receiptSettings?.showLogo ?? true;
    const logoUrl = schoolSettings?.receiptSettings?.logoUrl || schoolSettings?.logoUrl;
    
    const schoolName = schoolSettings?.name || 'Advance SMS';
    const address = schoolSettings?.address || '';
    const contact = schoolSettings?.receiptSettings?.contactDetails || schoolSettings?.contactEmail || '';

    // --- Header ---
    if (showLogo && logoUrl) {
         // Note: For now we just put a placeholder if real image fetch is complex cross-origin
         // Ideally, you'd fetch the image, convert to Base64, then add.
         // For this MVP, we might skip the actual image implementation unless we have a reliable Base64 source.
         // We'll trust the user has a way to view it or just put text marker.
         // doc.addImage(...) 
    }

    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(schoolName, 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(address, 105, 28, { align: "center" });
    if (contact) {
        doc.text(contact, 105, 33, { align: "center" });
    }

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), 105, 48, { align: "center" });

    // Divider
    doc.setLineWidth(0.5);
    doc.line(20, 53, 190, 53);

    // --- Content ---
    let y = 65;
    const addLine = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(label, 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(value ? value.toString() : '-', 80, y);
        y += 10;
    };

    const receiptNo = tx.receiptNumber || tx.reference;
    const studentName = tx.student ? `${tx.student.firstName} ${tx.student.lastName}` : 'N/A';
    const studentId = tx.student?.studentId || '';
    const className = tx.student?.classId?.name || '';
    const paidBy = tx.parent?.user?.name || 'Parent';

    addLine("Receipt No:", receiptNo);
    addLine("Date:", new Date(tx.paidAt || tx.createdAt).toLocaleString());
    addLine("Student:", `${studentName} (${studentId})`);
    if(className) addLine("Class:", className);
    addLine("Paid By:", paidBy);
    addLine("Payment Type:", tx.type ? tx.type.replace('_', ' ').toUpperCase() : 'FEE');
    
    if (tx.session) addLine("Session:", tx.session);
    if (tx.term) addLine("Term:", tx.term);

    // Amount Big
    y += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`AMOUNT: NGN ${tx.amount.toLocaleString()}`, 20, y);
    
    // Status
    doc.setFontSize(10);
    doc.setTextColor(tx.status === 'success' ? 0 : 200, tx.status === 'success' ? 128 : 0, 0);
    doc.text(`STATUS: ${tx.status.toUpperCase()}`, 150, y);
    doc.setTextColor(40, 40, 40);

    // Divider
    y += 15;
    doc.line(20, y, 190, y);
    y += 10;

    // Footer Message
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text(message, 105, y, { align: "center" });

    // Signature
    y += 25;
    doc.setFont("helvetica", "bold");
    doc.text(signature, 160, y, { align: "center" });
    doc.setLineWidth(0.2);
    doc.line(140, y-5, 180, y-5); // Signature line

    doc.save(`Receipt_${receiptNo}.pdf`);
};
