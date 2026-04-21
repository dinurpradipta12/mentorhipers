import sys

with open(sys.argv[1], 'r') as f:
    lines = f.readlines()

# Index for 1315 is 1314
# Index for 1316 is 1315
lines[1314] = '                                         <div className={`w-10 h-10 rounded-[14px] bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${cp.platform === "tiktok" ? "text-[#0F172A]" : cp.platform === "threads" ? "text-slate-950" : "text-rose-500"}`}>\n'
lines[1315] = '                                            {cp.platform === "tiktok" ? <Play size={16} className="fill-current"/> : cp.platform === "threads" ? <AtSign size={16}/> : <Palette size={16}/>}\n'

with open(sys.argv[1], 'w') as f:
    f.writelines(lines)
