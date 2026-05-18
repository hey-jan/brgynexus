import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { hashPassword } from '@/lib/auth/hash';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only_12345'
);

// High-Performance CSV Parser in pure TypeScript (handles quotes, commas, escapes, and returns)
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentValue += '"';
        i++; // skip next escaped quote
      } else {
        inQuotes = !inQuotes; // toggle quote state
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n in CRLF
      }
      row.push(currentValue.trim());
      // Skip empty or comment lines
      if (row.length > 1 || row[0] !== '') {
        lines.push(row);
      }
      row = [];
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Handle final row if file doesn't end with a newline
  if (row.length > 0 || currentValue !== '') {
    row.push(currentValue.trim());
    lines.push(row);
  }

  return lines;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authorization: Admin check
    const token = request.cookies.get('brgynexus_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 2. Retrieve file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file was uploaded' }, { status: 400 });
    }

    const csvText = await file.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or lacks data rows' }, { status: 400 });
    }

    // 3. Dynamic header index mapping (case-insensitive and whitespace-flexible)
    const rawHeaders = rows[0];
    const headers = rawHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    const headerIndices = {
      firstName: headers.findIndex(h => h === 'firstname' || h === 'first' || h === 'fname'),
      middleName: headers.findIndex(h => h === 'middlename' || h === 'middle' || h === 'mname'),
      lastName: headers.findIndex(h => h === 'lastname' || h === 'last' || h === 'lname'),
      email: headers.indexOf('email'),
      phone: headers.findIndex(h => h === 'phone' || h === 'phonenumber' || h === 'contact' || h === 'contactno'),
      gender: headers.indexOf('gender'),
      address: headers.indexOf('address'),
      birthdate: headers.findIndex(h => h === 'birthdate' || h === 'dob' || h === 'birth' || h === 'birthday'),
      civilStatus: headers.findIndex(h => h === 'civilstatus' || h === 'status' || h === 'maritalstatus'),
      residentType: headers.findIndex(h => h === 'residenttype' || h === 'type' || h === 'residentcategory'),
      lengthOfStay: headers.findIndex(h => h === 'lengthofstay' || h === 'staylength' || h === 'stay')
    };

    // Verify required columns exist
    if (
      headerIndices.firstName === -1 ||
      headerIndices.lastName === -1 ||
      headerIndices.email === -1 ||
      headerIndices.gender === -1 ||
      headerIndices.address === -1 ||
      headerIndices.birthdate === -1 ||
      headerIndices.civilStatus === -1
    ) {
      return NextResponse.json({
        error: 'Missing required CSV headers. Ensure your CSV file has headers for: First Name, Last Name, Email, Gender, Address, Birthdate, and Civil Status.'
      }, { status: 400 });
    }

    // 4. Performance Optimization: Pre-hash default password ONCE to avoid CPU bottlenecks
    const DEFAULT_PASSWORD = 'WelcomeNexus123!';
    const passwordHash = await hashPassword(DEFAULT_PASSWORD);

    const results = {
      total: rows.length - 1,
      successCount: 0,
      errorCount: 0,
      successes: [] as { name: string; email: string }[],
      errors: [] as { row: number; name: string; error: string }[]
    };

    // 5. Process rows sequentially
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip empty rows
      if (row.length === 0 || (row.length === 1 && row[0] === '')) {
        results.total--;
        continue;
      }

      const getVal = (index: number) => index !== -1 ? row[index] || '' : '';

      const firstName = getVal(headerIndices.firstName);
      const middleName = getVal(headerIndices.middleName) || null;
      const lastName = getVal(headerIndices.lastName);
      const email = getVal(headerIndices.email);
      const phone = getVal(headerIndices.phone) || null;
      const genderStr = getVal(headerIndices.gender).toUpperCase();
      const address = getVal(headerIndices.address);
      const birthdateStr = getVal(headerIndices.birthdate);
      const civilStatusStr = getVal(headerIndices.civilStatus).toUpperCase();
      const residentTypeStr = getVal(headerIndices.residentType).toUpperCase() || 'PERMANENT';
      const lengthOfStay = getVal(headerIndices.lengthOfStay) || null;

      const fullName = `${firstName} ${lastName}`.trim() || `Row ${i + 1}`;

      // Validation check
      if (!firstName || !lastName || !email || !genderStr || !address || !birthdateStr || !civilStatusStr) {
        results.errorCount++;
        results.errors.push({
          row: i + 1,
          name: fullName,
          error: 'Missing required field values in this row.'
        });
        continue;
      }

      // Email formatting validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        results.errorCount++;
        results.errors.push({
          row: i + 1,
          name: fullName,
          error: `Invalid email format: "${email}"`
        });
        continue;
      }

      // Gender Enum normalizer
      let gender: 'MALE' | 'FEMALE' | 'OTHER' = 'OTHER';
      if (genderStr.startsWith('MALE') || genderStr === 'M') gender = 'MALE';
      else if (genderStr.startsWith('FEMALE') || genderStr === 'F') gender = 'FEMALE';
      else if (genderStr.startsWith('OTHER') || genderStr === 'O') gender = 'OTHER';
      else {
        results.errorCount++;
        results.errors.push({
          row: i + 1,
          name: fullName,
          error: `Invalid gender: "${genderStr}". Expected: Male, Female, or Other.`
        });
        continue;
      }

      // Civil Status Enum normalizer
      let civilStatus: 'SINGLE' | 'MARRIED' | 'WIDOWED' | 'SEPARATED' = 'SINGLE';
      if (civilStatusStr.startsWith('SING') || civilStatusStr === 'S') civilStatus = 'SINGLE';
      else if (civilStatusStr.startsWith('MARR') || civilStatusStr === 'M') civilStatus = 'MARRIED';
      else if (civilStatusStr.startsWith('WID') || civilStatusStr === 'W') civilStatus = 'WIDOWED';
      else if (civilStatusStr.startsWith('SEP') || civilStatusStr === 'D') civilStatus = 'SEPARATED';
      else {
        results.errorCount++;
        results.errors.push({
          row: i + 1,
          name: fullName,
          error: `Invalid civil status: "${civilStatusStr}". Expected: Single, Married, Widowed, or Separated.`
        });
        continue;
      }

      // Birthdate parser & validator
      const birthdate = new Date(birthdateStr);
      if (isNaN(birthdate.getTime())) {
        results.errorCount++;
        results.errors.push({
          row: i + 1,
          name: fullName,
          error: `Invalid date format: "${birthdateStr}". Use YYYY-MM-DD.`
        });
        continue;
      }

      // Resident Type normalizer
      let residentType: 'PERMANENT' | 'TEMPORARY' = 'PERMANENT';
      if (residentTypeStr.startsWith('TEMP') || residentTypeStr === 'T') residentType = 'TEMPORARY';

      try {
        // Check for existing email in DB to prevent unique constraint failures
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          results.errorCount++;
          results.errors.push({
            row: i + 1,
            name: fullName,
            error: `Email is already registered: "${email}"`
          });
          continue;
        }

        // Create the User and Profile record (automatic verification)
        const user = await prisma.user.create({
          data: {
            firstName,
            middleName,
            lastName,
            email,
            passwordHash,
            phone,
            role: 'RESIDENT',
            residentProfile: {
              create: {
                gender,
                address,
                birthdate,
                civilStatus,
                isVerified: true,
                residentType,
                lengthOfStay
              }
            }
          }
        });

        results.successCount++;
        results.successes.push({
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        });

      } catch (dbError: any) {
        console.error(`Database insertion error on row ${i + 1}:`, dbError);
        results.errorCount++;
        results.errors.push({
          row: i + 1,
          name: fullName,
          error: `Database registration failed: ${dbError.message || 'Unknown database issue'}`
        });
      }
    }

    return NextResponse.json(results, { status: 200 });

  } catch (error: any) {
    console.error('Bulk registration endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
