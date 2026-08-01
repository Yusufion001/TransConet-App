import fs from 'fs';
let content = fs.readFileSync('prisma/schema.prisma', 'utf-8');

// Remove the appended lines
const toRemove = `
model OutboxEvent {
  id        String   @id @default(uuid())
  type      String
  payload   Json
  status    String   @default("PENDING")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`;

content = content.replace(toRemove, '');
content += `
model OutboxEvent {
  id        String   @id @default(uuid())
  type      String
  payload   Json
  status    String   @default("PENDING")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@schema("public")
}
`;

fs.writeFileSync('prisma/schema.prisma', content);
