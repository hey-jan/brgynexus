import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontFamily: 'Times-Roman',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  headerLine: {
    borderTopWidth: 2,
    borderTopColor: '#000',
    marginBottom: 30,
    width: '100%',
  },
  logoContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 70,
    height: 70,
    objectFit: 'contain',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 80, // Offset for logo to keep text centered
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
    textTransform: 'uppercase',
  },
  officeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#000',
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
  footer: {
    marginTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureContainer: {
    alignItems: 'center',
    width: 200,
  },
  signatureImage: {
    width: 120,
    height: 50,
    objectFit: 'contain',
    marginBottom: -10,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    width: 200,
    marginTop: 2,
    marginBottom: 2,
  },
  signatureName: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
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
  watermarkContainer: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    opacity: 0.15,
  },
  watermarkImage: {
    width: '100%',
  }
});

interface ClearancePDFProps {
  documentName: string;
  documentNumber: string;
  qrCodeDataUrl: string;
  issuedDate: Date;
  bodyText: string;
  settings: {
    barangayName: string;
    city: string;
    province: string;
    captainName: string;
    captainTitle: string;
    logoUrl?: any;
    signatureUrl?: any;
  };
}

export const ClearancePDF = ({
  documentName,
  documentNumber,
  qrCodeDataUrl,
  issuedDate,
  bodyText,
  settings
}: ClearancePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Watermark Background Seal */}
      {settings.logoUrl && (
        <View style={styles.watermarkContainer}>
          <Image src={settings.logoUrl} style={styles.watermarkImage} />
        </View>
      )}
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          {settings.logoUrl && (
            <Image src={settings.logoUrl} style={styles.logo} />
          )}
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.republicText}>Republic of the Philippines</Text>
          <Text style={styles.cityText}>{settings.province}</Text>
          <Text style={styles.cityText}>{settings.city}</Text>
          <Text style={styles.brgyText}>{settings.barangayName}</Text>
          <Text style={styles.officeText}>OFFICE OF THE PUNONG BARANGAY</Text>
        </View>
      </View>

      <View style={styles.headerLine} />

      <Text style={styles.documentTitle}>{documentName}</Text>

      <View style={styles.body}>
        <Text>TO WHOM IT MAY CONCERN:</Text>
        
        {/* Render body text with line breaks */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          {bodyText.split('\n').map((line, i) => (
            <Text key={i} style={{ minHeight: 12, marginBottom: 5 }}>{line}</Text>
          ))}
        </View>

        <Text>
          Issued this {format(issuedDate, 'do')} day of {format(issuedDate, 'MMMM, yyyy')} at {settings.barangayName}, {settings.city}.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.signatureContainer}>
          {settings.signatureUrl ? (
            <Image src={settings.signatureUrl} style={styles.signatureImage} />
          ) : (
            <View style={{ height: 50, marginBottom: 5 }} />
          )}
          <Text style={styles.signatureName}>{settings.captainName}</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureTitle}>{settings.captainTitle}</Text>
        </View>
        
        <View style={styles.qrContainer}>
          <Image src={qrCodeDataUrl} style={styles.qrImage} />
          <Text style={styles.qrText}>Scan to Verify Authenticity</Text>
          <Text style={styles.qrText}>{documentNumber}</Text>
        </View>
      </View>
      
      <View style={{ position: 'absolute', bottom: 30, left: 50, right: 50, borderTop: 1, borderTopColor: '#ccc', paddingTop: 10 }}>
        <Text style={{ fontSize: 8, color: '#999', textAlign: 'center' }}>
          This is a system-generated E-Document from {settings.barangayName}. 
          Valid only if the QR code can be verified successfully on the official portal.
        </Text>
      </View>
    </Page>
  </Document>
);
