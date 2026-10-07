# arrange audio/mD.mp3 onto the film grid (beats at 0.2+0.5k), bar-aligned jumps
import subprocess,numpy as np
SR=48000; T=63.7
x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i','audio/mD.mp3','-ac','2','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,np.float32).reshape(-1,2)
SEG=[(0,28.2,2.225),(28.2,44.2,4.225),(44.2,60.2,-11.775),(60.2,T,-3.775)]
out=np.zeros((int(T*SR),2),np.float32); F=int(0.006*SR)
for a,b,off in SEG:
    i0,i1=int(a*SR),int(b*SR); s0=int((a+off)*SR)
    seg=x[s0:s0+(i1-i0)].copy()
    if len(seg)<i1-i0: seg=np.vstack([seg,np.zeros((i1-i0-len(seg),2),np.float32)])
    r=np.linspace(0,1,F)[:,None]
    if a>0: seg[:F]*=r
    if b<T: seg[-F:]*=r[::-1]
    out[i0:i1]+=seg
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','audio/music_fit.wav'],input=out.tobytes(),check=True)
print('ok')
