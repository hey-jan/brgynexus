export async function seedDocuments(prisma: any) {
  const docsData = [
    { id: 'doc-clearance', name: 'Barangay Clearance', description: 'For employment or business.', fee: 50, processingDays: 1 },
    { id: 'doc-indigency', name: 'Certificate of Indigency', description: 'For financial assistance.', fee: 0, processingDays: 1 },
    { id: 'doc-business', name: 'Business Permit Clearance', description: 'Required for business.', fee: 150, processingDays: 3 },
    { id: 'doc-residency', name: 'Certificate of Residency', description: 'Proof of residency.', fee: 30, processingDays: 1 },
  ];

  await prisma.document.createMany({
    data: docsData,
  });

  console.log('✓ Seeded Documents');
  return docsData.map((d: any) => d.id);
}
