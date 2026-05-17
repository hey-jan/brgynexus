export async function seedDocuments(prisma: any) {
  const docsData = [
    { 
      id: 'doc-clearance', 
      name: 'Barangay Clearance', 
      description: 'Official clearance issued by the barangay for general purposes.', 
      fee: 50, 
      processingDays: 1 
    },
    { 
      id: 'doc-residency', 
      name: 'Certificate of Residency', 
      description: 'Certification proving that you are a resident of the barangay.', 
      fee: 30, 
      processingDays: 1 
    },
    { 
      id: 'doc-indigency', 
      name: 'Certificate of Indigency', 
      description: 'For financial assistance, scholarships, or medical aid.', 
      fee: 0, 
      processingDays: 1 
    },
    { 
      id: 'doc-business', 
      name: 'Business Clearance', 
      description: 'Required for operating a business within the barangay.', 
      fee: 150, 
      processingDays: 3 
    },
    { 
      id: 'doc-good-moral', 
      name: 'Certificate of Good Moral Character', 
      description: 'Certifies excellent moral standing and conduct in the community.', 
      fee: 50, 
      processingDays: 1 
    },
    { 
      id: 'doc-solo-parent', 
      name: 'Solo Parent Certification', 
      description: 'Certification for solo parents to avail of government benefits.', 
      fee: 50, 
      processingDays: 1 
    },
    { 
      id: 'doc-first-job', 
      name: 'First Time Job Seeker Certificate', 
      description: 'Free certification under RA 11261 for first-time job applications.', 
      fee: 0, 
      processingDays: 1 
    },
  ];

  await prisma.document.createMany({
    data: docsData,
  });

  console.log('✓ Seeded Documents');
  return docsData.map((d: any) => d.id);
}
