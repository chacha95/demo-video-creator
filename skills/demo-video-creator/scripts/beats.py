import subprocess, sys, json, numpy as np
SR=22050
import os; LO=float(os.environ.get("LO",70)); HI=float(os.environ.get("HI",181))
def load(p):
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout
    return np.frombuffer(raw,dtype=np.float32)
def onset_env(x,hop=256,n=1024):
    win=np.hanning(n); frames=1+(len(x)-n)//hop
    S=np.abs(np.fft.rfft(np.stack([x[i*hop:i*hop+n]*win for i in range(frames)]),axis=1))
    S=np.log1p(100*S); flux=np.maximum(0,np.diff(S,axis=0)).sum(1)
    # low band (kick) flux too
    lo=np.maximum(0,np.diff(S[:,:12],axis=0)).sum(1)
    return flux,lo,hop/SR
out={}
for p in sys.argv[1:]:
    x=load(p); flux,lo,dt=onset_env(x)
    f=(flux-flux.mean())/flux.std()
    best=None
    for bpm in np.arange(LO,HI,0.25):
        per=60/bpm/dt
        for ph in np.linspace(0,per,40,endpoint=False):
            idx=np.round(np.arange(ph,len(f)-1,per)).astype(int)
            s=f[idx].mean()
            if best is None or s>best[0]: best=(s,bpm,ph*dt)
    s,bpm,ph=best
    # first loud onset
    rms=np.sqrt(np.convolve(x**2,np.ones(1024)/1024,'same'))
    start=float(np.argmax(rms>0.05*rms.max())/SR)
    # peak strong hits (top onsets)
    peaks=[i for i in range(1,len(f)-1) if f[i]>f[i-1] and f[i]>=f[i+1] and f[i]>3]
    end=float(len(x)/SR); last_loud=float((len(rms)-np.argmax(rms[::-1]>0.05*rms.max()))/SR)
    out[p]={'bpm':round(float(bpm),2),'beat_phase_s':round(float(ph),3),'sound_start_s':round(start,3),'last_loud_s':round(last_loud,3),'dur':round(end,3),
            'strong_hits_s':[round(i*dt,3) for i in peaks][:60]}
    print(p,out[p]['bpm'],out[p]['beat_phase_s'],start,last_loud,end)
json.dump(out,open('assets/music/beats.json','w'),indent=1)
