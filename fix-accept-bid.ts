import fs from 'fs';

let content = fs.readFileSync('src/controllers/bidController.ts', 'utf8');

const target = "if (bid.load.customerId !== customerId && req.user?.role !== 'ADMIN') {";
const replacement = `console.log("acceptBid auth check:", { bidLoadCustomerId: bid.load.customerId, customerId, userRole: req.user?.role });
    if (bid.load.customerId !== customerId && req.user?.role !== 'ADMIN') {`;

if (!content.includes("acceptBid auth check:")) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/controllers/bidController.ts', content);
}
