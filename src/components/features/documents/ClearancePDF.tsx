import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  republicText: {
    fontSize: 10,
    marginBottom: 2,
  },
  cityText: {
    fontSize: 10,
    marginBottom: 2,
  },
  brgyText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  officeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e3a8a', // Deep blue
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  body: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: 200,
    paddingTop: 5,
    textAlign: 'center',
  },
  signatureName: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  signatureTitle: {
    fontSize: 10,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  qrImage: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  qrText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
  docNo: {
    position: 'absolute',
    top: 50,
    right: 50,
    fontSize: 10,
    color: '#666',
  }
});

interface ClearancePDFProps {
  documentName: string;
  residentName: string;
  address: string;
  purpose: string;
  documentNumber: string;
  qrCodeDataUrl: string;
  issuedDate: Date;
}

export const ClearancePDF = ({
  documentName,
  residentName,
  address,
  purpose,
  documentNumber,
  qrCodeDataUrl,
  issuedDate
}: ClearancePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.docNo}>No. {documentNumber}</Text>
      
      <View style={styles.header}>
        <Text style={styles.republicText}>Republic of the Philippines</Text>
        <Text style={styles.cityText}>City/Municipality</Text>
        <Text style={styles.brgyText}>BARANGAY NEXUS</Text>
        <Text style={styles.officeText}>OFFICE OF THE BARANGAY CAPTAIN</Text>
      </View>

      <Text style={styles.documentTitle}>{documentName}</Text>

      <View style={styles.body}>
        <Text>TO WHOM IT MAY CONCERN:</Text>
        <Text style={{ marginTop: 10, marginBottom: 10 }}>
          This is to certify that Mr./Ms. <Text style={styles.bold}>{residentName}</Text>, of legal age, 
          is a bonafide resident of <Text style={styles.bold}>{address}</Text>, Barangay Nexus.
        </Text>
        <Text style={{ marginBottom: 10 }}>
          Based on the records of this office, the above-named individual has no derogatory record or 
          pending case filed against him/her in this barangay as of this date.
        </Text>
        <Text style={{ marginBottom: 10 }}>
          This certification is being issued upon the request of the interested party for the following purpose:
        </Text>
        <Text style={[styles.bold, { textAlign: 'center', marginVertical: 10 }]}>{purpose}</Text>
        <Text>
          Issued this {format(issuedDate, 'do')} day of {format(issuedDate, 'MMMM, yyyy')} at Barangay Nexus.
        </Text>
      </View>

      <View style={styles.footer}>
        <View>
          <Text style={{ fontSize: 10, marginBottom: 20 }}>Issued by:</Text>
          <View style={styles.signatureLine}>
            <Text style={styles.signatureName}>HON. JUAN DELA CRUZ</Text>
            <Text style={styles.signatureTitle}>Punong Barangay</Text>
          </View>
        </View>
        
        <View style={styles.qrContainer}>
          <Image src={qrCodeDataUrl} style={styles.qrImage} />
          <Text style={styles.qrText}>Scan to Verify Authenticity</Text>
          <Text style={styles.qrText}>{documentNumber}</Text>
        </View>
      </View>
      
      <View style={{ position: 'absolute', bottom: 30, left: 50, right: 50, borderTop: 1, borderTopColor: '#ccc', paddingTop: 10 }}>
        <Text style={{ fontSize: 8, color: '#999', textAlign: 'center' }}>
          This is a system-generated E-Document from BrgyNexus. 
          Valid only if the QR code can be verified successfully on the official portal.
        </Text>
      </View>
    </Page>
  </Document>
);
