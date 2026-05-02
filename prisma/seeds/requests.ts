export async function seedRequests(prisma: any, users: any, documentIds: string[]) {
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'RELEASED'];
  const residentIds = users.residents.map((r: any) => r.id);
  const staffId = users.staff.id;

  const requestsToCreate = [];
  
  // Generate 2 sample requests
  for (let i = 0; i < 2; i++) {
    const pastDate = new Date();
    
    requestsToCreate.push({
      residentId: residentIds[i % residentIds.length],
      documentId: documentIds[0],
      purpose: 'Applying for employment requirements',
      status: 'PENDING',
      handledById: null,
      createdAt: pastDate,
      updatedAt: pastDate,
    });
  }

  await prisma.documentRequest.createMany({
    data: requestsToCreate
  });

  console.log(`✓ Seeded ${requestsToCreate.length} Document Requests`);
}
