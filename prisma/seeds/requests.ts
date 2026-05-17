export async function seedRequests(prisma: any, users: any, documentIds: string[]) {
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'RELEASED'];
  const residentIds = users.residents.map((r: any) => r.id);
  const staffId = users.staff.id;

  const requestsToCreate = [];
  
  // Generate 2 sample requests for standard residents
  for (let i = 0; i < 2; i++) {
    requestsToCreate.push({
      residentId: residentIds[i % 2],
      documentId: documentIds[0],
      purpose: 'Applying for employment requirements',
      status: 'PENDING',
      handledById: null,
    });
  }

  // Add 3 APPROVED requests for John Earl Balabat for immediate email testing
  const johnEarlId = residentIds[2]; // John Earl is the 3rd resident we added
  if (johnEarlId) {
    for (let i = 0; i < 3; i++) {
      requestsToCreate.push({
        residentId: johnEarlId,
        documentId: documentIds[i % documentIds.length],
        purpose: `Testing Email Notifications ${i + 1}`,
        status: 'APPROVED',
        handledById: staffId,
      });
    }
  }

  // Add more requests for the newly added residents
  const newResidentIds = [residentIds[3], residentIds[4], residentIds[5]].filter(Boolean);
  
  if (newResidentIds.length >= 3) {
    // PENDING request
    requestsToCreate.push({
      residentId: newResidentIds[0],
      documentId: documentIds[1] || documentIds[0],
      purpose: 'For school enrollment',
      status: 'PENDING',
      handledById: null,
    });
    
    // REJECTED request
    requestsToCreate.push({
      residentId: newResidentIds[1],
      documentId: documentIds[2] || documentIds[0],
      purpose: 'For loan application',
      status: 'REJECTED',
      handledById: staffId,
    });
    
    // RELEASED request
    requestsToCreate.push({
      residentId: newResidentIds[2],
      documentId: documentIds[0],
      purpose: 'For local employment',
      status: 'RELEASED',
      handledById: staffId,
    });

    // Another APPROVED request
    requestsToCreate.push({
      residentId: newResidentIds[0],
      documentId: documentIds[0],
      purpose: 'For identification purposes',
      status: 'APPROVED',
      handledById: staffId,
    });
  }

  await prisma.documentRequest.createMany({
    data: requestsToCreate
  });

  console.log(`✓ Seeded ${requestsToCreate.length} Document Requests`);
}
