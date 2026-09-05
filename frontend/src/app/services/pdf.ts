import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Evento, ItemEvento } from '../models/solicitud.model';
import { ESCUDO_RISARALDA } from '../data/escudo';

const ENCABEZADO_TEXTO =
  'PRESTACIÓN DE SERVICIOS PARA LA ORGANIZACIÓN, ADMINISTRACIÓN Y EJECUCIÓN DE LAS ACCIONES LOGÍSTICAS TALES COMO PUBLICIDAD, PROMOCIÓN, DIVULGACIÓN, ALOJAMIENTO, ACTIVIDADES INSTITUCIONALES, TALLERES DE REUNIONES DE TRABAJO Y DEMÁS ACTIVIDADES QUE REQUIERAN LAS SECRETARÍAS DEL DEPARTAMENTO DE RISARALDA';
const EMAIL = 'E-MAIL: LOGISTICAGOBERNACIONRDA2024@GMAIL.COM';

@Injectable({ providedIn: 'root' })
export class PdfService {

  private fecha(f: string): string {
    if (!f) return '';
    const d = new Date(f);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase();
  }

  private pesos(n: number): string {
    return '$' + (n || 0).toLocaleString('es-CO');
  }

  // Dibuja el encabezado común (escudo + texto + email + datos del evento)
  private encabezado(doc: jsPDF, ev: Evento, titulo: string): number {
    const margen = 14;
    const ancho = doc.internal.pageSize.getWidth() - margen * 2;

    // Escudo
    try {
      doc.addImage(ESCUDO_RISARALDA, 'JPEG', margen, 12, 24, 24);
    } catch (e) { /* si falla la imagen, sigue sin ella */ }

    // Texto del contrato al lado del escudo
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    const textoX = margen + 28;
    const textoW = ancho - 28;
    const lineas = doc.splitTextToSize(ENCABEZADO_TEXTO, textoW);
    doc.text(lineas, textoX, 15);

    let y = 40;

    // Título del documento
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(EMAIL, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 6;

    // Tabla de datos del evento
    autoTable(doc, {
      startY: y,
      margin: { left: margen, right: margen },
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      body: [
        ['SECRETARÍA ENCARGADA:', ev.proyecto ? '' : '', 'NOMBRE DEL EVENTO:', ev.nombre],
        ['FECHA:', this.fecha(ev.fecha), 'LUGAR:', ev.lugar],
        ['PROYECTO:', ev.proyecto || '', 'RUBRO:', ev.rubro || ''],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 40 },
        2: { fontStyle: 'bold', fillColor: [240, 240, 240], cellWidth: 40 },
      },
    });

    return (doc as any).lastAutoTable.finalY + 4;
  }

  // ============ CERTIFICACIÓN (sin precios, con firma) ============
  certificacion(ev: Evento) {
    const doc = new jsPDF();
    const margen = 14;
    let y = this.encabezado(doc, ev, 'CERTIFICACIÓN DE SERVICIOS PRESTADOS A ENTERA SATISFACCIÓN');

    const filas = (ev.items || []).map((it: ItemEvento) => [
      String(it.numero || ''),
      it.descripcion || it.categoria,
      String(it.cantidad),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margen, right: margen },
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.2, lineColor: [0, 0, 0] },
      styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.2, lineColor: [0, 0, 0] },
      head: [['ÍTEM', 'REQUERIMIENTOS', 'CANTIDAD']],
      body: filas,
      columnStyles: {
        0: { cellWidth: 16, halign: 'center' },
        2: { cellWidth: 28, halign: 'center' },
      },
    });

    // Firma
    let yFirma = (doc as any).lastAutoTable.finalY + 30;
    if (ev.firma) {
      try {
        doc.addImage(ev.firma, 'PNG', margen, yFirma - 22, 40, 20);
      } catch (e) { /* sin firma */ }
    }
    doc.setDrawColor(0);
    doc.line(margen, yFirma, margen + 70, yFirma);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(ev.firmanteNombre || 'Vo.Bo. Supervisor(a)', margen, yFirma + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('Vo.Bo. Supervisor(a)', margen, yFirma + 10);

    doc.save(`Certificacion-${ev.nombre}.pdf`);
  }

  // ============ SOLICITUD (con precios y total) ============
  solicitud(ev: Evento, total: number) {
    const doc = new jsPDF();
    const margen = 14;
    let y = this.encabezado(doc, ev, 'SOLICITUD DE SERVICIOS');

    const filas = (ev.items || []).map((it: ItemEvento) => [
      String(it.numero || ''),
      it.descripcion || it.categoria,
      this.pesos(it.valorUnidad || 0),
      String(it.cantidad),
      this.pesos((it.cantidad || 0) * (it.valorUnidad || 0)),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margen, right: margen },
      theme: 'grid',
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7, lineWidth: 0.2, lineColor: [0, 0, 0] },
      styles: { fontSize: 8, cellPadding: 2, lineWidth: 0.2, lineColor: [0, 0, 0] },
      head: [['ÍTEM', 'REQUERIMIENTOS', 'VALOR UNIDAD IVA INCL.', 'CANTIDAD', 'VALOR TOTAL IVA INCL.']],
      body: filas,
      foot: [['', '', '', 'TOTAL', this.pesos(total)]],
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 8, lineWidth: 0.2, lineColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 14, halign: 'center' },
        2: { cellWidth: 34, halign: 'right' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 34, halign: 'right' },
      },
    });

    // Firma
    let yFirma = (doc as any).lastAutoTable.finalY + 30;
    if (ev.firma) {
      try {
        doc.addImage(ev.firma, 'PNG', margen, yFirma - 22, 40, 20);
      } catch (e) { /* sin firma */ }
    }
    doc.setDrawColor(0);
    doc.line(margen, yFirma, margen + 70, yFirma);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(ev.firmanteNombre || 'Vo.Bo. Supervisor(a)', margen, yFirma + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('Vo.Bo. Supervisor(a)', margen, yFirma + 10);

    doc.save(`Solicitud-${ev.nombre}.pdf`);
  }
}