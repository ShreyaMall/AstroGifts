import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order) => {
  const doc = new jsPDF();
  
  // Minimalist Colors
  const darkColor = [33, 33, 33];
  const grayColor = [100, 100, 100];
  const lightGray = [240, 240, 240];
  
  // Set default font
  doc.setFont('helvetica');

  // --- 1. Header Section ---
  
  // Company Info (Top Left)
  doc.setFontSize(22);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('AstroGifts.', 15, 25);
  
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  doc.text('AstroGifts Center, Commercial Market', 15, 33);
  doc.text('Gorakhpur 273001, India', 15, 38);
  doc.text('contact@astrogifts.com | +91 9876543210', 15, 43);

  // Invoice Title & Info (Top Right)
  doc.setFontSize(28);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 195, 30, { align: 'right' });
  
  const orderNumber = order.order_number || order.id || 'N/A';
  const invoiceDate = order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No:', 150, 40);
  doc.text('Date:', 150, 46);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`INV-${String(orderNumber).substring(0, 8).toUpperCase()}`, 195, 40, { align: 'right' });
  doc.text(invoiceDate, 195, 46, { align: 'right' });

  // Divider Line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(15, 52, 195, 52);

  // --- 2. Billing & Shipping Info ---
  const customerName = order.customer_name || 'Customer';
  const address = order.shipping_address || 'Not Provided';
  const city = order.city || '';
  const state = order.state || '';
  const zip = order.zip || '';

  doc.setFontSize(11);
  doc.setTextColor(...grayColor);
  doc.text('Billed To:', 15, 65);
  doc.text('Shipped To:', 105, 65);

  doc.setFontSize(12);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(customerName, 15, 72);
  doc.text(customerName, 105, 72); // Assuming same for now

  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.setFont('helvetica', 'normal');
  
  // Bill To Address
  const splitAddress = doc.splitTextToSize(address, 80);
  doc.text(splitAddress, 15, 78);
  
  const addressHeight = splitAddress.length * 4.5;
  const cityY = 78 + addressHeight;
  
  if (city || state) doc.text(`${city} ${state}`.trim(), 15, cityY);
  if (zip) doc.text(`${zip}`, 15, cityY + 5);

  // Ship To Address
  doc.text(splitAddress, 105, 78);
  if (city || state) doc.text(`${city} ${state}`.trim(), 105, cityY);
  if (zip) doc.text(`${zip}`, 105, cityY + 5);

  const tableStartY = Math.max(105, cityY + 15);

  // --- 3. Items Table ---
  const items = order.items || [];
  const tableData = items.map((item, index) => {
    const qty = parseInt(item.qty || item.quantity || 1, 10);
    const rate = parseFloat(item.price || 0);
    const amount = qty * rate;
    const name = item.name || item.product_name || 'Product';
    const colorStr = item.color ? ` (Color: ${item.color})` : '';
    return [
      index + 1,
      `${name}${colorStr}`,
      qty.toString(),
      `Rs. ${rate.toFixed(2)}`,
      `Rs. ${amount.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [['#', 'Item Description', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: lightGray,
      textColor: darkColor,
      fontStyle: 'bold',
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    bodyStyles: {
      textColor: darkColor,
      lineColor: [220, 220, 220],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: 15, right: 15 },
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  // --- 4. Totals & Footer ---
  const totalAmount = order.total_price || order.total || order.amount || 0;
  const subTotal = totalAmount; // For simplicity

  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text('Subtotal:', 140, finalY);
  doc.setTextColor(...darkColor);
  doc.text(`Rs. ${Number(subTotal).toFixed(2)}`, 195, finalY, { align: 'right' });

  doc.setTextColor(...grayColor);
  doc.text('Shipping:', 140, finalY + 7);
  doc.setTextColor(...darkColor);
  doc.text('Rs. 0.00', 195, finalY + 7, { align: 'right' });
  
  // Total Line
  doc.setDrawColor(220, 220, 220);
  doc.line(140, finalY + 12, 195, finalY + 12);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 140, finalY + 20);
  doc.text(`Rs. ${Number(totalAmount).toFixed(2)}`, 195, finalY + 20, { align: 'right' });

  // Notes & Terms
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Notes & Terms', 15, finalY);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text('Thanks for shopping with AstroGifts.', 15, finalY + 6);
  doc.text('Please keep this invoice for any return or exchange requests.', 15, finalY + 11);

  // Footer Line
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, pageHeight - 20, 195, pageHeight - 20);
  doc.setFontSize(8);
  doc.text('This is a computer generated invoice and does not require a physical signature.', 105, pageHeight - 12, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_${orderNumber}.pdf`);
};

