import subprocess,sys,numpy as np,json
p,bpm,b0=sys.argv[1],float(sys.argv[2]),float(sys.argv[3])
W,H=192,108
raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-vf',f'scale={W}:{H},format=gray','-f','rawvideo','-'],capture_output=True).stdout
F=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.float32)
d=np.abs(np.diff(F,axis=0)).mean((1,2))  # d[i]= change from frame i to i+1
fps=30; per=60/bpm
cuts=[i+1 for i in range(len(d)) if d[i]>18 and d[i]>3*np.median(d[max(0,i-5):i+6])]
def offbeat(t):
    k=round((t-b0)/per); return (t-(b0+k*per))*fps
print(f"{p}: frames={len(F)}")
print("CUTS (t, frames off nearest beat):")
print(' '.join(f"{(c)/fps:.2f}({offbeat(c/fps):+.1f})" for c in cuts))
# dead stops: motion >=4 then next <=0.4 (excluding cuts)
ds=[i for i in range(1,len(d)-1) if d[i-1]>=3.0 and d[i]<0.35 and (i) not in cuts and (i-1+1) not in cuts]
print("DEAD STOPS (fast->0 in 1 frame):",' '.join(f"{i/fps:.2f}[{d[i-1]:.1f}->{d[i]:.2f}]" for i in ds))
# frozen holds: >=12 frames with d<0.08
fr=[];s=None
for i,v in enumerate(d):
    if v<0.08:
        s=i if s is None else s
    else:
        if s is not None and i-s>=12: fr.append((s/fps,i/fps))
        s=None
if s is not None and len(d)-s>=12: fr.append((s/fps,len(d)/fps))
print("FROZEN HOLDS:",' '.join(f"{a:.2f}-{b:.2f}" for a,b in fr))
# jitter: sign changes of acceleration with high magnitude (stutter)
acc=np.diff(d); jit=[i for i in range(1,len(acc)) if acc[i-1]>2 and acc[i]<-2 and d[i]<10 and (i+1) not in cuts and i not in cuts]
print("SPIKES (1-frame pops, non-cut):",' '.join(f"{i/fps:.2f}" for i in jit[:40]))
# curve per 0.5s
print("ENERGY per 0.5s:",' '.join(f"{d[i:i+15].mean():.1f}" for i in range(0,len(d),15)))
