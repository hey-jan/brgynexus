import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { ClearancePDF } from '@/components/features/documents/ClearancePDF';
import prisma from '@/lib/prisma';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest, { params }: { params: Promise<{ qrCodeHash: string }> }) {
  try {
    const { qrCodeHash } = await params;

    const issuedDoc = await prisma.issuedDocument.findUnique({
      where: { qrCodeHash },
      include: {
        request: {
          include: {
            document: true,
            resident: {
              include: { user: true }
            }
          }
        }
      }
    });

    if (!issuedDoc) {
      return new NextResponse('Document not found or invalid QR code', { status: 404 });
    }

    // Fetch Global Settings
    let settings = await prisma.barangaySettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = {
        id: 'default',
        barangayName: 'Barangay Nexus',
        city: 'City/Municipality',
        province: 'Province',
        logoUrl: null,
        captainName: 'Hon. Juan Dela Cruz',
        captainTitle: 'Punong Barangay',
        signatureUrl: null,
        updatedAt: new Date()
      };
    }

    // Generate Verification URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const verificationUrl = `${protocol}://${host}/verify/${qrCodeHash}`;

    // Generate QR Code as Data URI
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });

    const resident = issuedDoc.request.resident;
    const guestName = issuedDoc.request.guestName;
    const guestAddress = issuedDoc.request.guestAddress;
    const documentData = issuedDoc.request.document;
    
    let residentName = "Unknown";
    let address = "Unknown";
    
    if (resident) {
      residentName = `${resident.user.firstName} ${resident.user.lastName}`;
      address = resident.address;
    } else if (guestName) {
      residentName = guestName;
      address = guestAddress || "Unknown";
    }
    
    // Parse template
    let bodyText = documentData.templateContent || "This is to certify that Mr./Ms. {{residentName}}, of legal age, is a bonafide resident of {{address}}, Barangay Nexus.\n\nBased on the records of this office, the above-named individual has no derogatory record or pending case filed against him/her in this barangay as of this date.\n\nThis certification is being issued upon the request of the interested party for the following purpose:\n{{purpose}}";

    bodyText = bodyText.replace(/{{residentName}}/g, residentName);
    bodyText = bodyText.replace(/{{address}}/g, address);
    bodyText = bodyText.replace(/{{purpose}}/g, issuedDoc.request.translatedPurpose || issuedDoc.request.purpose);
    bodyText = bodyText.replace(/{{date}}/g, format(issuedDoc.issuedDate, 'MMMM d, yyyy'));

    const DEFAULT_SIGNATURE_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAAAyCAYAAACYX3yUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF1ElEQVR4nO2cS2wUVRiAv9nZmd2W0tqipS1IC/IQ5CE+CBUJ8dH4CJohQY3GGBND4kswMXEjcSNxw8RENEbUxJgYEk2MCfGBD8RHCBqV8BAptLS0tLt9zYyLy+7sznRmd2dntrt/crLd7ezMOf/+7jnnnPO/syCCICAIAj0i6w2AIBDoB4lFEPQJiUUQ9AmJRRD0CYlFEPRB+cSKx+OICCIiDMOyKxQEQdnEWrZsGdu3b8eyLFKpFLZtI4R4nF4QBOUSe9iwYezYsYPx48eXG4MgCOUkFhCRSEQA0un0k/SDIAiAcooVy+VyZDIZAFKplITah6AAlFesfD4PQDqdfhQyBEEQlF+sWC4XAMuypFIQFEFZsWbMmIENeDweksnkwxIhCIKwWLEcxzlisRjpdBqAWCxWDg2CIAiLFeu2225DVBUAsVgMURWDsX55KBAEoVyxFi9eTG9vbw7LsixEUQCQWEFQBGXFEkIQ13UE0NtbJBYERVA2sdavX49t26KqqkRVEUUBgMQSFEHZxBo3bhwdHR15LCEEAIqiIEn0QRGUQay5c+cCkEwmeVwiiAoCq4Akyh8gCMrpD2ts3LgREUFU11FVFUQEsYwgyh8gCIpyilUqlfJYIiIIgmAisYIgKMop1saNGwGIRCIIIRAVQSwjCPIHCICyxVq/fj024PP5SCaTiKIIooj1K1/7EBSAsu/a8Xi8RKuKoqgSVSGIQhC1fXkoEARh1YrV19dHV1cXtm0Ti8UoFAoARFFg/crXPgQFYLFYkUhEZjQaRRAFAEGUV4IgCIsVS6tKIpEAEBFEUV4JgiAsVqz169fL36uqEEX5JAhC2cSqq6ujp6cH27ZJJBLk83kAYrEY1tWvfgQKwKKxwuEwPp8PEUFEkFUJRDG1f3goEARh0Vhms5kYjKiiQhAFAEGUiAiiKgjCg/c/471gU1PTn127dv3d2dnp7+/vR6vKoqqqP2t0jM7Ozn+aW1pUo2N0dHbq1tbWT1VVFZ2dnVoVqaurq6Sqqoquri4tiqKkq6uLeDyOqqpYVVVYt7/5MSgAixeLpmWxaVn+z2fN+P0N/P3aUFlZmdfvbwAiKkX6/Q2yqupQVVVhnfvmx6AALFrswwZ0Mh+H/2D4d2X+D4LwFpD2D5uW5Vf/4RBEUYh+n2X+h5QWBFUoW6x4PM7o0aMRUWzblhWpCkmU/5X9o5Ag/C8oWyxRFBFFEVVVDMNARBAVRBDk/0wQBWEhZcUKh8NomsZDDz0EgBAClb8D+7y4h16m1f/zK9k/r8n+ef35aL/uHwQ/LBYrkUiwYsUKUskkXq8XIQSqqv4aZ/34+d8m1p9x1k8/X+3j/YPgN/06t61YqVSKqVOmsGbNmsdZ67YgqALp76Jtxdq5cyddXV0AVFdXE41GEUURVREg/T511X6lqgKqB/2z2q/6B6G8t1g2i06t21YsXdfx+/20trZy+PDhPE5sP+4ZfXjQ7B8x+/CQ+T8y+1VVEUURqapUqyo9XhWpCj8GgZ8WbCtWKpWivb1dpq0t/H4/vb29uN1upL8X7U9H+9PR/j9p/1j27/9z/z9t/0T2T2b/vGb/vKjP09H7L5Bq1aj6aL9WVZ+n+wfBb4tlb+yFf6x4PI6u64wfPx6v18ukSZPwer2oqipRlR6P1aL1qFYUf6wqVhS/7hld1aP93eEefpld2U3Zfd1+pUjR77NEUZAkGcsfBIEP/2sDuj3Xtr0Dajabzcc6ODiIrut/eW9vL263m9raWrxebzWq2sP93WHW0Z3tQe8Os+6w7B1W/d3Zft0/CKpQt1jhcBjbtslms5w7d+53VVVJpVL/eW/vP/Zwn723l/D0z//2+z1102tUdf9w3UeGfvWPP0zP0D+m//dI3fT66bV6+n/+D32qP/8NgoJQXqyHXYgQ/HshQvDvhQjBvxcqBP9OiND7vS/nEmsW/PvhFz2Cfw/8fT4w+PvgH3wG/uHz8A+fh3/4PB7/A2r5u20rVsF/y4p16tQpAFKpFM8//zzw94vV09NDW1tbrVApCA+w/wFz1+6wE9aIywAAAABJRU5ErkJggg==';

    // Helper to process base64 image strings into Buffers for React PDF
    const processImage = (dataUri: string | null | undefined, fallbackPath?: string, fallbackBase64?: string) => {
      let uri = dataUri;
      if (!uri) {
        if (fallbackPath) {
          const absolutePath = path.join(process.cwd(), fallbackPath);
          if (fs.existsSync(absolutePath)) {
            return fs.readFileSync(absolutePath);
          }
        }
        if (fallbackBase64) {
          uri = fallbackBase64;
        } else {
          return undefined;
        }
      }
      if (typeof uri === 'string' && uri.startsWith('data:image')) {
        const base64Data = uri.split(',')[1];
        return Buffer.from(base64Data, 'base64');
      }
      return uri;
    };

    const pdfProps = {
      documentName: documentData.name,
      documentNumber: issuedDoc.documentNumber,
      qrCodeDataUrl,
      issuedDate: issuedDoc.issuedDate,
      bodyText,
      settings: {
        barangayName: settings.barangayName,
        city: settings.city,
        province: settings.province,
        captainName: settings.captainName,
        captainTitle: settings.captainTitle,
        logoUrl: processImage(settings.logoUrl, 'public/images/brgy-seal.png'),
        signatureUrl: processImage(settings.signatureUrl, undefined, DEFAULT_SIGNATURE_BASE64),
      }
    };

    // Render PDF to stream
    const pdfStream = await renderToStream(<ClearancePDF {...pdfProps} />);

    // Return the stream as a response
    return new NextResponse(pdfStream as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${issuedDoc.documentNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return new NextResponse('Internal Server Error while generating PDF', { status: 500 });
  }
}
