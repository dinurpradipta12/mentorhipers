// Script to identify where changes are needed
import * as fs from 'fs';
const file = 'src/app/ruang-sosmed/_core/AgencyContent.tsx';
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');

const findLine = (str: string) => lines.findIndex(l => l.includes(str));

console.log("Edit Meeting State:", findLine("const [editingTask"));
console.log("Delete Meeting Initializer:", findLine("const [taskToDelete"));
console.log("Target Actions in Card:", findLine("const isLive = new Date() >="));

