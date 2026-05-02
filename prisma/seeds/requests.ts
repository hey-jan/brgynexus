export async function seedRequests(prisma: any, users: any, documentIds: string[]) {
  const statuses = ['PENDING', 'APPROVED', 'REJECTED', 'RELEASED'];
  const residentIds = users.residents.map((r: any) => r.id);
  const staffId = users.staff.id;

  const requestsToCreate = [];
  
  // Generate 50 random requests over the past 30 days
  for (let i = 0; i < 50; i++) {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30));
    
    const statusStr = statuses[Math.floor(Math.random() * statuses.length)];
    const docId = documentIds[Math.floor(Math.random() * documentIds.length)];
    
    requestsToCreate.push({
      residentId: residentIds[i % 2],
      documentId: docId,
      purpose: 'Generated sample request for analytics',
      status: statusStr as any,
      handledById: (statusStr === 'PENDING') ? null : staffId,
      createdAt: pastDate,
      updatedAt: pastDate,
    });
  }

  await prisma.documentRequest.createMany({
    data: requestsToCreate
  });

  console.log(`✓ Seeded ${requestsToCreate.length} Document Requests`);
}
