import React from 'react'
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { LegalDocumentSnapshot } from '@phiguard/baa'

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 48,
    paddingHorizontal: 44,
    fontSize: 10,
    lineHeight: 1.45,
    color: '#111827',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 8,
  },
  meta: {
    fontSize: 10,
    marginBottom: 4,
  },
  section: {
    marginTop: 14,
  },
  heading: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  paragraph: {
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  bullet: {
    width: 10,
  },
  bulletText: {
    flex: 1,
  },
  signatureBlock: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 12,
  },
})

export interface LegalAgreementDocumentProps {
  snapshot: LegalDocumentSnapshot
  customerEntityName: string
  signerName: string
  signerTitle: string
  signerEmail: string
  acceptedAt: string
}

export default function LegalAgreementDocument(props: LegalAgreementDocumentProps) {
  const {
    snapshot,
    customerEntityName,
    signerName,
    signerTitle,
    signerEmail,
    acceptedAt,
  } = props

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.title}>{snapshot.title}</Text>
        <Text style={styles.meta}>Version: {snapshot.version}</Text>
        <Text style={styles.meta}>Effective date: {snapshot.effectiveDate}</Text>
        <Text style={styles.meta}>PHIGuard party: {snapshot.partyName}</Text>
        <Text style={styles.meta}>Customer party: {customerEntityName}</Text>

        {snapshot.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>
            ))}
            {(section.bullets ?? []).map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <Text style={styles.bullet}>-</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.signatureBlock}>
          <Text style={styles.meta}>Customer signer: {signerName}</Text>
          <Text style={styles.meta}>Customer signer title: {signerTitle}</Text>
          <Text style={styles.meta}>Customer signer email: {signerEmail}</Text>
          <Text style={styles.meta}>Accepted at: {acceptedAt}</Text>
          <Text style={styles.meta}>PHIGuard signatory: {snapshot.signatoryName}, {snapshot.signatoryTitle}</Text>
          <Text style={styles.meta}>Notice address: {snapshot.noticeAddress}</Text>
        </View>
      </Page>
    </Document>
  )
}
