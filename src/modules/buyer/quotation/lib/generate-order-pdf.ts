import { jsPDF } from "jspdf";

import { NO_SUPPLIER_ID } from "@/modules/buyer/quotation/lib/budget-order-constants";
import {
  formatOrderMoney,
  formatOrderProductLabel,
  formatOrderQuantity,
} from "@/modules/buyer/quotation/lib/format-order";
import type { BudgetOrder, BudgetOrderItem } from "@/modules/buyer/quotation/types/view-budget";
import { ORCA_LOGO_DARK } from "@/shared/theme/brand-assets";

type RGB = [number, number, number];

const NAVY: RGB = [24, 50, 72];
const NAVY_SOFT: RGB = [38, 64, 88];
const ORANGE: RGB = [234, 122, 38];
const GREEN_OK: RGB = [22, 140, 84];
const TEXT_PRIMARY: RGB = [33, 43, 54];
const TEXT_MUTED: RGB = [108, 122, 137];
const BORDER: RGB = [223, 230, 236];
const SURFACE: RGB = [246, 248, 250];
const ICON_BG: RGB = [237, 242, 247];
const WARNING_BG: RGB = [255, 247, 235];
const WARNING_BORDER: RGB = [245, 205, 155];
const WARNING_TEXT: RGB = [193, 104, 28];
const WHITE: RGB = [255, 255, 255];

const MARGIN = 14;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_RESERVE = 24;
const CONTENT_BOTTOM = PAGE_HEIGHT - FOOTER_RESERVE;
const LOGO_MAX_HEIGHT_MM = 15;
const LOGO_MAX_WIDTH_MM = 48;

export type OrderPdfLogo = {
  dataUrl: string;
  widthMm: number;
  heightMm: number;
};

export interface BudgetOrderPdfLabels {
  documentTitle: string;
  documentSubtitle: string;
  orderNumber: string;
  generationDate: string;
  status: string;
  statusPending: string;
  statusConfirmed: string;
  buyerTitle: string;
  deliveryTitle: string;
  supplierTitle: string;
  responsible: string;
  phone: string;
  email: string;
  document: string;
  deliveryTimeLabel: string;
  deadlineLabel: string;
  notInformed: string;
  supplierNotSelected: string;
  supplierNotSelectedHint: string;
  warningTitle: string;
  warningSubtitle: string;
  columns: {
    qty: string;
    unit: string;
    product: string;
    brands: string;
    observation: string;
    unitPrice: string;
    total: string;
  };
  totalLabel: string;
  observationsTitle: string;
  noSupplierObservation: string;
  paymentLabel: string;
  footerBrand: string;
  footerTagline: string;
  footerUrl: string;
  page: string;
  pageOf: string;
  generatedPrefix: string;
  emptyValue: string;
}

export interface BudgetOrderPdfMeta {
  orderNumber: string;
  /** Data já formatada (ex.: "03/06/2026 às 15:26"). */
  generatedAt: string;
  buyerName: string;
  buyerDocument?: string;
  deliveryTime?: string;
  /** Prazo já formatado. */
  deadline?: string;
  budgetObservation?: string;
}

type ColumnDef = {
  key: string;
  label: string;
  width: number;
  align: "left" | "right";
  bold?: boolean;
};

async function loadOrderPdfLogo(): Promise<OrderPdfLogo | null> {
  try {
    const response = await fetch(ORCA_LOGO_DARK);
    if (!response.ok) return null;

    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(blob);
    });

    const pixelSize = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error("image load failed"));
      img.src = dataUrl;
    });

    const aspect = pixelSize.width / pixelSize.height;
    let heightMm = LOGO_MAX_HEIGHT_MM;
    let widthMm = heightMm * aspect;
    if (widthMm > LOGO_MAX_WIDTH_MM) {
      widthMm = LOGO_MAX_WIDTH_MM;
      heightMm = widthMm / aspect;
    }

    return { dataUrl, widthMm, heightMm };
  } catch {
    return null;
  }
}

function ensureSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed <= CONTENT_BOTTOM) return y;
  doc.addPage();
  return MARGIN;
}

function drawWrapped(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = ensureSpace(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

/* ---------------------------------- Ícones --------------------------------- */

function drawIconBadge(doc: jsPDF, cx: number, cy: number, r = 3.4): void {
  doc.setFillColor(...ICON_BG);
  doc.circle(cx, cy, r, "F");
}

function strokeSetup(doc: jsPDF, color: RGB, width = 0.4): void {
  doc.setDrawColor(...color);
  doc.setLineWidth(width);
}

function iconStore(doc: jsPDF, cx: number, cy: number, color: RGB): void {
  strokeSetup(doc, color);
  doc.triangle(cx - 1.9, cy - 0.4, cx + 1.9, cy - 0.4, cx, cy - 1.7, "S");
  doc.rect(cx - 1.5, cy - 0.4, 3.0, 2.0, "S");
  doc.rect(cx - 0.45, cy + 0.4, 0.9, 1.2, "S");
}

function iconTruck(doc: jsPDF, cx: number, cy: number, color: RGB): void {
  strokeSetup(doc, color);
  doc.rect(cx - 1.9, cy - 1.0, 2.2, 1.9, "S");
  doc.rect(cx + 0.3, cy - 0.1, 1.4, 1.0, "S");
  doc.circle(cx - 1.0, cy + 1.2, 0.45, "S");
  doc.circle(cx + 1.0, cy + 1.2, 0.45, "S");
}

function iconUser(doc: jsPDF, cx: number, cy: number, color: RGB): void {
  strokeSetup(doc, color);
  doc.circle(cx, cy - 0.7, 0.9, "S");
  doc.roundedRect(cx - 1.3, cy + 0.4, 2.6, 1.5, 0.7, 0.7, "S");
}

function iconDocument(doc: jsPDF, cx: number, cy: number, color: RGB): void {
  strokeSetup(doc, color);
  doc.rect(cx - 1.2, cy - 1.5, 2.4, 3.0, "S");
  doc.line(cx - 0.6, cy - 0.5, cx + 0.6, cy - 0.5);
  doc.line(cx - 0.6, cy + 0.2, cx + 0.6, cy + 0.2);
  doc.line(cx - 0.6, cy + 0.9, cx + 0.2, cy + 0.9);
}

function iconCalendar(doc: jsPDF, cx: number, cy: number, color: RGB): void {
  strokeSetup(doc, color);
  doc.rect(cx - 1.5, cy - 1.1, 3.0, 2.6, "S");
  doc.line(cx - 1.5, cy - 0.4, cx + 1.5, cy - 0.4);
  doc.line(cx - 0.8, cy - 1.5, cx - 0.8, cy - 0.9);
  doc.line(cx + 0.8, cy - 1.5, cx + 0.8, cy - 0.9);
}

function iconAlertCircle(doc: jsPDF, cx: number, cy: number, color: RGB): void {
  strokeSetup(doc, color, 0.45);
  doc.circle(cx, cy, 1.6, "S");
  doc.line(cx, cy - 0.8, cx, cy + 0.2);
  doc.setFillColor(...color);
  doc.circle(cx, cy + 0.9, 0.22, "F");
}

function iconWarningTriangle(doc: jsPDF, cx: number, cy: number, color: RGB): void {
  strokeSetup(doc, color, 0.5);
  doc.triangle(cx - 1.7, cy + 1.4, cx + 1.7, cy + 1.4, cx, cy - 1.6, "S");
  doc.line(cx, cy - 0.4, cx, cy + 0.5);
  doc.setFillColor(...color);
  doc.circle(cx, cy + 1.0, 0.22, "F");
}

function iconClipboard(doc: jsPDF, cx: number, cy: number, color: RGB): void {
  strokeSetup(doc, color);
  doc.rect(cx - 1.3, cy - 1.4, 2.6, 3.0, "S");
  doc.rect(cx - 0.6, cy - 1.8, 1.2, 0.7, "S");
  doc.line(cx - 0.7, cy - 0.3, cx + 0.7, cy - 0.3);
  doc.line(cx - 0.7, cy + 0.5, cx + 0.7, cy + 0.5);
}

/* ----------------------------- Cabeçalho da página ------------------------- */

function drawDocumentHeader(
  doc: jsPDF,
  labels: BudgetOrderPdfLabels,
  meta: BudgetOrderPdfMeta,
  logo: OrderPdfLogo | null,
  statusKind: "pending" | "confirmed",
): number {
  const top = 12;

  if (logo) {
    doc.addImage(logo.dataUrl, "PNG", MARGIN, top, logo.widthMm, logo.heightMm);
  }

  const sepX = MARGIN + (logo ? logo.widthMm : 0) + 6;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.line(sepX, top + 1, sepX, top + 13);

  const titleX = sepX + 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...NAVY);
  doc.text(labels.documentTitle, titleX, top + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(labels.documentSubtitle, titleX, top + 11, { maxWidth: 70 });

  const metaX = 132;
  const metaRows: Array<{
    icon: (d: jsPDF, cx: number, cy: number, c: RGB) => void;
    label: string;
    value: string;
    valueColor: RGB;
  }> = [
    {
      icon: iconDocument,
      label: labels.orderNumber,
      value: meta.orderNumber,
      valueColor: TEXT_PRIMARY,
    },
    {
      icon: iconCalendar,
      label: labels.generationDate,
      value: meta.generatedAt,
      valueColor: TEXT_PRIMARY,
    },
    {
      icon: iconAlertCircle,
      label: labels.status,
      value: statusKind === "pending" ? labels.statusPending : labels.statusConfirmed,
      valueColor: statusKind === "pending" ? ORANGE : GREEN_OK,
    },
  ];

  metaRows.forEach((row, i) => {
    const rowY = top + i * 9.5;
    const cy = rowY + 2.6;
    drawIconBadge(doc, metaX + 3, cy, 3.1);
    row.icon(doc, metaX + 3, cy, statusKind === "pending" && i === 2 ? ORANGE : NAVY_SOFT);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(row.label, metaX + 9, rowY + 1.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...row.valueColor);
    doc.text(row.value, metaX + 9, rowY + 5.6);
  });

  const ruleY = top + 32;
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(1);
  doc.line(MARGIN, ruleY, PAGE_WIDTH - MARGIN, ruleY);

  return ruleY + 9;
}

/* --------------------------- Colunas de informação ------------------------- */

function drawInfoColumn(
  doc: jsPDF,
  colX: number,
  colW: number,
  y: number,
  icon: (d: jsPDF, cx: number, cy: number, c: RGB) => void,
  title: string,
  lines: Array<{ text: string; bold?: boolean; muted?: boolean }>,
): number {
  const innerX = colX + 4;
  drawIconBadge(doc, innerX + 3, y + 3, 3.4);
  icon(doc, innerX + 3, y + 3, NAVY_SOFT);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(title, innerX + 9, y + 4.2);

  let cursor = y + 11;
  const maxWidth = colW - 10;
  for (const line of lines) {
    doc.setFont("helvetica", line.bold ? "bold" : "normal");
    doc.setFontSize(line.bold ? 9.5 : 8.5);
    doc.setTextColor(...(line.muted ? TEXT_MUTED : TEXT_PRIMARY));
    cursor = drawWrapped(doc, line.text, innerX, cursor, maxWidth, line.bold ? 5 : 4.6);
    cursor += 0.6;
  }

  return cursor;
}

function drawInfoSection(
  doc: jsPDF,
  y: number,
  order: BudgetOrderItem,
  labels: BudgetOrderPdfLabels,
  meta: BudgetOrderPdfMeta,
  isNoSupplier: boolean,
): number {
  const colW = CONTENT_WIDTH / 3;
  const top = y;

  const buyerName = order.establishmentName?.trim() || meta.buyerName || labels.emptyValue;
  const buyerLines: Array<{ text: string; bold?: boolean; muted?: boolean }> = [
    { text: buyerName, bold: true },
  ];
  if (meta.buyerDocument?.trim()) {
    buyerLines.push({ text: `${labels.document}: ${meta.buyerDocument.trim()}`, muted: true });
  }
  if (order.responsibleName?.trim()) {
    buyerLines.push({ text: `${labels.responsible}: ${order.responsibleName.trim()}`, muted: true });
  }
  if (order.phone?.trim()) {
    buyerLines.push({ text: `${labels.phone}: ${order.phone.trim()}`, muted: true });
  }

  const deliveryLines: Array<{ text: string; bold?: boolean; muted?: boolean }> = [
    {
      text: `${labels.deliveryTimeLabel}: ${meta.deliveryTime?.trim() || labels.notInformed}`,
      muted: true,
    },
    {
      text: `${labels.deadlineLabel}: ${meta.deadline?.trim() || labels.notInformed}`,
      muted: true,
    },
  ];

  const supplierLines: Array<{ text: string; bold?: boolean; muted?: boolean }> = isNoSupplier
    ? [
        { text: labels.supplierNotSelected, bold: true },
        { text: labels.supplierNotSelectedHint, muted: true },
      ]
    : [
        { text: order.supplier.name, bold: true },
        ...(order.supplier.phone?.trim()
          ? [{ text: `${labels.phone}: ${order.supplier.phone.trim()}`, muted: true }]
          : []),
        ...(order.supplier.responsible.email?.trim()
          ? [{ text: `${labels.email}: ${order.supplier.responsible.email.trim()}`, muted: true }]
          : []),
      ];

  const bottoms = [
    drawInfoColumn(doc, MARGIN, colW, top, iconStore, labels.buyerTitle, buyerLines),
    drawInfoColumn(doc, MARGIN + colW, colW, top, iconTruck, labels.deliveryTitle, deliveryLines),
    drawInfoColumn(
      doc,
      MARGIN + colW * 2,
      colW,
      top,
      iconUser,
      labels.supplierTitle,
      supplierLines,
    ),
  ];

  const sectionBottom = Math.max(...bottoms);

  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.line(MARGIN + colW, top, MARGIN + colW, sectionBottom - 1);
  doc.line(MARGIN + colW * 2, top, MARGIN + colW * 2, sectionBottom - 1);

  let next = sectionBottom + 4;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, next, PAGE_WIDTH - MARGIN, next);
  next += 7;
  return next;
}

/* --------------------------------- Banner ---------------------------------- */

function drawWarningBanner(doc: jsPDF, y: number, labels: BudgetOrderPdfLabels): number {
  y = ensureSpace(doc, y, 20);
  const h = 16;
  doc.setFillColor(...WARNING_BG);
  doc.setDrawColor(...WARNING_BORDER);
  doc.setLineWidth(0.5);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, h, 2, 2, "FD");

  drawIconBadge(doc, MARGIN + 8, y + h / 2, 4);
  doc.setFillColor(255, 255, 255);
  iconWarningTriangle(doc, MARGIN + 8, y + h / 2, WARNING_TEXT);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...WARNING_TEXT);
  doc.text(labels.warningTitle, MARGIN + 16, y + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(labels.warningSubtitle, MARGIN + 16, y + 11.5, { maxWidth: CONTENT_WIDTH - 22 });

  return y + h + 7;
}

/* --------------------------------- Tabela ---------------------------------- */

function columnPositions(columns: ColumnDef[]): number[] {
  const xs: number[] = [];
  let x = MARGIN;
  for (const col of columns) {
    xs.push(x);
    x += col.width;
  }
  return xs;
}

function drawTableHeader(doc: jsPDF, y: number, columns: ColumnDef[], xs: number[]): number {
  const h = 9;
  doc.setFillColor(...NAVY);
  doc.rect(MARGIN, y, CONTENT_WIDTH, h, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  columns.forEach((col, i) => {
    const baseline = y + 6;
    if (col.align === "right") {
      doc.text(col.label, xs[i] + col.width - 2.5, baseline, { align: "right" });
    } else {
      doc.text(col.label, xs[i] + 2.5, baseline);
    }
  });
  return y + h;
}

function drawProductsTable(
  doc: jsPDF,
  y: number,
  columns: ColumnDef[],
  rows: Array<Record<string, string>>,
): number {
  const xs = columnPositions(columns);
  const lineH = 4.4;
  const padY = 3;

  y = ensureSpace(doc, y, 9 + 12);
  y = drawTableHeader(doc, y, columns, xs);

  const wrapCols = columns.filter((c) => c.align === "left");

  rows.forEach((row, rowIndex) => {
    const wrapMap = new Map<string, string[]>();
    let maxLines = 1;
    for (const col of wrapCols) {
      const lines = doc.splitTextToSize(row[col.key] ?? "", col.width - 5);
      wrapMap.set(col.key, lines);
      maxLines = Math.max(maxLines, lines.length);
    }
    const rowH = maxLines * lineH + padY * 2;

    if (y + rowH > CONTENT_BOTTOM) {
      doc.addPage();
      y = MARGIN;
      y = drawTableHeader(doc, y, columns, xs);
    }

    if (rowIndex % 2 === 1) {
      doc.setFillColor(...SURFACE);
      doc.rect(MARGIN, y, CONTENT_WIDTH, rowH, "F");
    }

    const firstBaseline = y + padY + lineH - 1;
    columns.forEach((col, i) => {
      doc.setFont("helvetica", col.bold ? "bold" : "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...(col.bold ? TEXT_PRIMARY : TEXT_MUTED));

      if (col.align === "right") {
        doc.text(row[col.key] ?? "", xs[i] + col.width - 2.5, firstBaseline, { align: "right" });
      } else {
        const lines = wrapMap.get(col.key) ?? [row[col.key] ?? ""];
        lines.forEach((line, li) => {
          doc.text(line, xs[i] + 2.5, firstBaseline + li * lineH);
        });
      }
    });

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y + rowH, PAGE_WIDTH - MARGIN, y + rowH);

    y += rowH;
  });

  return y;
}

function drawTotalRow(doc: jsPDF, y: number, label: string, value: string): number {
  y = ensureSpace(doc, y, 12);
  const h = 9;
  doc.setFillColor(...SURFACE);
  doc.rect(MARGIN, y, CONTENT_WIDTH, h, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NAVY);
  doc.text(label, MARGIN + 3, y + 6);
  doc.text(value, PAGE_WIDTH - MARGIN - 3, y + 6, { align: "right" });
  return y + h + 6;
}

/* ------------------------------ Observações -------------------------------- */

function drawObservations(
  doc: jsPDF,
  y: number,
  labels: BudgetOrderPdfLabels,
  body: string,
): number {
  y = ensureSpace(doc, y, 26);

  drawIconBadge(doc, MARGIN + 3, y + 3, 3.4);
  iconClipboard(doc, MARGIN + 3, y + 3, NAVY_SOFT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text(labels.observationsTitle, MARGIN + 9, y + 4.2);

  y += 9;

  const lines = doc.splitTextToSize(body, CONTENT_WIDTH - 10);
  const boxH = Math.max(12, lines.length * 4.6 + 7);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxH, 1.5, 1.5, "S");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_MUTED);
  let cursor = y + 6;
  for (const line of lines) {
    doc.text(line, MARGIN + 5, cursor);
    cursor += 4.6;
  }

  return y + boxH + 6;
}

/* --------------------------------- Rodapé ---------------------------------- */

function drawPageFooters(doc: jsPDF, labels: BudgetOrderPdfLabels, meta: BudgetOrderPdfMeta): void {
  const totalPages = doc.getNumberOfPages();
  const footerTop = PAGE_HEIGHT - 18;

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, footerTop, PAGE_WIDTH - MARGIN, footerTop);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...NAVY);
    doc.text(labels.footerBrand, MARGIN, footerTop + 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(labels.footerTagline, MARGIN, footerTop + 9);
    if (labels.footerUrl) {
      doc.text(labels.footerUrl, MARGIN, footerTop + 12.5);
    }

    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(
      `${labels.page} ${i} ${labels.pageOf} ${totalPages}`,
      PAGE_WIDTH - MARGIN,
      footerTop + 5,
      { align: "right" },
    );
    doc.text(
      `${labels.generatedPrefix} ${meta.generatedAt}`,
      PAGE_WIDTH - MARGIN,
      footerTop + 9,
      { align: "right" },
    );
  }
}

/* ------------------------------- Orquestração ------------------------------ */

function buildSupplierColumns(labels: BudgetOrderPdfLabels): ColumnDef[] {
  return [
    { key: "qty", label: labels.columns.qty, width: 18, align: "left" },
    { key: "unit", label: labels.columns.unit, width: 14, align: "left" },
    { key: "product", label: labels.columns.product, width: 64, align: "left", bold: true },
    { key: "brand", label: labels.columns.brands, width: 38, align: "left" },
    { key: "unitPrice", label: labels.columns.unitPrice, width: 24, align: "right" },
    { key: "total", label: labels.columns.total, width: 24, align: "right" },
  ];
}

function buildNoSupplierColumns(labels: BudgetOrderPdfLabels): ColumnDef[] {
  return [
    { key: "qty", label: labels.columns.qty, width: 18, align: "left" },
    { key: "unit", label: labels.columns.unit, width: 14, align: "left" },
    { key: "product", label: labels.columns.product, width: 60, align: "left", bold: true },
    { key: "brand", label: labels.columns.brands, width: 54, align: "left" },
    { key: "observation", label: labels.columns.observation, width: 36, align: "left" },
  ];
}

function drawOrderPage(
  doc: jsPDF,
  order: BudgetOrderItem,
  labels: BudgetOrderPdfLabels,
  meta: BudgetOrderPdfMeta,
  logo: OrderPdfLogo | null,
): void {
  const isNoSupplier = order.supplier.id === NO_SUPPLIER_ID;

  let y = drawDocumentHeader(
    doc,
    labels,
    meta,
    logo,
    isNoSupplier ? "pending" : "confirmed",
  );

  y = drawInfoSection(doc, y, order, labels, meta, isNoSupplier);

  if (isNoSupplier) {
    y = drawWarningBanner(doc, y, labels);
  }

  if (isNoSupplier) {
    const columns = buildNoSupplierColumns(labels);
    const rows = order.products.map((p) => ({
      qty: formatOrderQuantity(p.quantity),
      unit: p.unit,
      product: formatOrderProductLabel(p),
      brand: p.brand?.trim() || labels.emptyValue,
      observation: labels.emptyValue,
    }));
    y = drawProductsTable(doc, y, columns, rows) + 8;
  } else {
    const columns = buildSupplierColumns(labels);
    const rows = order.products.map((p) => ({
      qty: formatOrderQuantity(p.quantity),
      unit: p.unit,
      product: formatOrderProductLabel(p),
      brand: p.brand?.trim() || labels.emptyValue,
      unitPrice: `R$ ${formatOrderMoney(p.pricePerUnit)}`,
      total: `R$ ${formatOrderMoney(p.productTotalPrice)}`,
    }));
    y = drawProductsTable(doc, y, columns, rows);
    y = drawTotalRow(doc, y, labels.totalLabel, `R$ ${formatOrderMoney(order.totalPrice)}`) + 2;
  }

  const observationBody = isNoSupplier
    ? labels.noSupplierObservation
    : [
        `${labels.paymentLabel}: ${order.paymentMethod?.trim() || labels.notInformed}`,
        order.observation?.trim() || meta.budgetObservation?.trim() || labels.notInformed,
      ].join("\n");

  drawObservations(doc, y, labels, observationBody);
}

/** Gera PDF formatado a partir dos dados do pedido. Um pedido por página. */
export async function generateOrderPdf(
  orders: BudgetOrder,
  labels: BudgetOrderPdfLabels,
  meta: BudgetOrderPdfMeta,
): Promise<void> {
  if (!orders.length) return;

  const logo = await loadOrderPdfLogo();
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  orders.forEach((order, index) => {
    if (index > 0) doc.addPage();
    drawOrderPage(doc, order, labels, meta, logo);
  });

  drawPageFooters(doc, labels, meta);

  const pdfUrl = URL.createObjectURL(doc.output("blob"));
  window.open(pdfUrl, "_blank");
}
