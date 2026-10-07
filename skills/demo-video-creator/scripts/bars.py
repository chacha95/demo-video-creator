import subprocess,json,numpy as np
SR=22050
T={'m1':(128,0.445),'m2':(140,0.407),'m3':(120,0.487),'m4':(132,0.216),'m5':(130,0.208)}
out={}
for k,(bpm,ph) in T.items():
    x=np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',f'assets/music/{k}.mp3','-ac','1','-ar',str(SR),'-f','f32le','-'],capture_output=True).stdout,dtype=np.float32)
    per=60/bpm; first=ph%per
    beats=np.arange(first,len(x)/SR,per)
    bar=per*4
    e=[float(np.sqrt(np.mean(x[int(t*SR):int((t+bar)*SR)]**2))) for t in beats[::4]]
    m=max(e); print(k,bpm,'beat0=%.3f'%first,'per=%.4f'%per,' bars:',' '.join('%.1f@%.2f'%(v/m*9,t) for v,t in zip(e,beats[::4])))
    out[k]={'bpm':bpm,'beat_period_s':round(per,5),'first_beat_s':round(first,3),'bar_starts_s':[round(float(t),3) for t in beats[::4]],'bar_energy_0to9':[round(v/m*9,1) for v in e]}
json.dump(out,open('assets/music/beats.json','w'),indent=1)
