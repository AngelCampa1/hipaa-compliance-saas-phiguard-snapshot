import { Document, Image, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import {
  LEAD_MAGNETS_BY_SLUG,
  getLeadMagnetResourceMetadata,
  type LeadMagnetSlug,
} from '@phiguard/lead-magnets'
import { pdfColors } from '@phiguard/ui/pdf-tokens'
import { pdfLogoHorizontalDataUri, pdfLogoMarkDataUri } from '../assets/brand/logo-data'

export const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 72,
    paddingHorizontal: 56,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: pdfColors.text,
    lineHeight: 1.5,
  },
  header: {
    fontSize: 9,
    color: pdfColors.muted,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heading1: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.text,
    marginBottom: 16,
  },
  heading2: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.primary,
    marginTop: 20,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.text,
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 11,
    color: pdfColors.text,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  callout: {
    backgroundColor: pdfColors.calloutBg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: pdfColors.primary,
    borderLeftStyle: 'solid',
  },
  calloutBorder: {
    borderLeftWidth: 3,
    borderLeftColor: pdfColors.primary,
    borderLeftStyle: 'solid',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 56,
    right: 56,
    fontSize: 9,
    color: pdfColors.muted,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: pdfColors.line,
    borderTopStyle: 'solid',
    paddingTop: 8,
  },
  cover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 56,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.text,
    marginBottom: 12,
    lineHeight: 1.15,
  },
  coverSubtitle: {
    fontSize: 14,
    color: pdfColors.muted,
    marginBottom: 32,
    lineHeight: 1.4,
  },
  coverWordmark: {
    marginTop: 40,
    marginBottom: 4,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerBrandText: {
    fontSize: 9,
    color: pdfColors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 6,
  },
  coverDate: {
    fontSize: 10,
    color: pdfColors.muted,
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 4,
  },
  bullet: {
    width: 12,
    fontSize: 11,
    color: pdfColors.primary,
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: pdfColors.text,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: pdfColors.line,
    borderBottomStyle: 'solid',
    paddingVertical: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: pdfColors.primary,
    borderBottomStyle: 'solid',
    paddingVertical: 6,
    backgroundColor: pdfColors.calloutBg,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    paddingHorizontal: 6,
    color: pdfColors.text,
  },
  tableCellHeader: {
    flex: 1,
    fontSize: 10,
    paddingHorizontal: 6,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.text,
  },
  calloutLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: pdfColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
})

export interface PdfLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  magnetSlug?: LeadMagnetSlug
}

export function PdfLayout({ title, subtitle, children, magnetSlug }: PdfLayoutProps) {
  const today = new Date().toISOString().slice(0, 10)
  const magnet = magnetSlug
    ? LEAD_MAGNETS_BY_SLUG[magnetSlug]
    : Object.values(LEAD_MAGNETS_BY_SLUG).find((item) => item.title === title)
  const metadata = magnet ? getLeadMagnetResourceMetadata(magnet) : null

  return (
    <Document
      title={title}
      author={metadata?.author}
      subject={metadata?.subject}
      keywords={metadata?.keywords}
      language={metadata?.language}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverTitle}>{title}</Text>
          <Text style={styles.coverSubtitle}>{subtitle}</Text>
          <View style={styles.coverWordmark}>
            <PdfLogo />
          </View>
          <Text style={styles.coverDate}>Published {today}</Text>
        </View>
      </Page>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.headerBrand}>
          <PdfLogoMark size={18} />
          <Text style={styles.headerBrandText}>PHIGuard - {title}</Text>
        </View>
        {children}
        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `phiguard.app - Page ${pageNumber} of ${totalPages}`
          }
        />
      </Page>
    </Document>
  )
}

function PdfLogo() {
  return <Image src={pdfLogoHorizontalDataUri} style={{ width: 182, height: 40 }} />
}

function PdfLogoMark({ size }: { size: number }) {
  return <Image src={pdfLogoMarkDataUri} style={{ width: size, height: size }} />
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.heading2}>{title}</Text>
      {children}
    </View>
  )
}

export function Subsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text style={styles.heading3}>{title}</Text>
      {children}
    </View>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <Text style={styles.paragraph}>{children}</Text>
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bullet}>-</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

export function Callout({ children, label }: { children: ReactNode; label: string }) {
  return (
    <View style={styles.callout}>
      <Text style={styles.calloutLabel}>{label}</Text>
      <Text style={styles.paragraph}>{children}</Text>
    </View>
  )
}

export interface TableProps {
  headers: string[]
  rows: string[][]
}

export function Table({ headers, rows }: TableProps) {
  return (
    <View>
      <View style={styles.tableHeader}>
        {headers.map((h, i) => (
          <Text key={i} style={styles.tableCellHeader}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={styles.tableRow}>
          {row.map((cell, ci) => (
            <Text key={ci} style={styles.tableCell}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}
