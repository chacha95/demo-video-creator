import subprocess,numpy as np,json
def load(p,sr=16000,w=True): return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',p,'-ac','1','-ar',str(sr)]+(['-af','highpass=f=150,highpass=f=150,equalizer=f=3000:t=q:w=1:g=3'] if w else [])+['-f','f32le','-'],capture_output=True).stdout,np.float32)
m=load('renders/stem_mus3.wav'); v=load('renders/vo3.wav'); s=load('renders/stem_sfx3.wav')
n=min(len(m),len(v),len(s)); m,v,s=m[:n],v[:n],s[:n]
db=lambda x:20*np.log10(np.sqrt(np.mean(x**2))+1e-9)
# speech frames
w=160; E=np.sqrt(np.convolve(v**2,np.ones(w)/w,'same'))[::w]; sp=np.repeat(E>10**(-40/20)*0+E.max()*10**(-30/20),w)[:n]
print('VO over music (speech) %.1f dB, music over sfx overall %.1f dB'%(db(v[sp])-db(m[sp]), db(m)-db(s)))
for t in [0.2,3.7,24.2,36.2,53.2,65.2]:
    a,b=int((t-0.05)*16000),int((t+0.3)*16000); print(' hit',t,'sfx-mus %.1f vo-sfx %.1f'%(db(s[a:b])-db(m[a:b]),db(v[a:b])-db(s[a:b])))
