import json,subprocess,base64,sys,os,re
speed=float(sys.argv[1]) if len(sys.argv)>1 else 1.12
L=json.load(open('audio/vo3/lines.json'))
text=" ".join(t for _,t in L)
print(len(re.sub(r'\[[^\]]*\]','',text).split()),'words')
body={"text":text,"model_id":"eleven_v4","voice_settings":{"stability":0.15,"similarity_boost":0.8,"style":0.8,"speed":speed,"use_speaker_boost":True}}
json.dump(body,open('audio/vo3/req.json','w'))
def find_key(name='ELEVENLABS_API_KEY'):
    # env var first, then the nearest .env walking up from the project dir (videos/<name>/ -> repo root)
    if os.environ.get(name): return os.environ[name]
    d=os.path.abspath(os.getcwd())
    while True:
        f=os.path.join(d,'.env')
        if os.path.isfile(f):
            for l in open(f):
                if l.startswith(name+'='): return l.split('=',1)[1].strip().strip('"\'')
        if os.path.dirname(d)==d: break
        d=os.path.dirname(d)
    sys.exit(f"{name} not found. See 'Onboarding: keys' in SKILL.md, then add {name}=... to the repo-root .env")
key=find_key()
# pass the key through a 0600 temp header file so it never appears in argv / ps
import tempfile
fd,hdr=tempfile.mkstemp(prefix='xi-hdr-'); os.chmod(hdr,0o600)
try:
    with os.fdopen(fd,'w') as f: f.write('xi-api-key: '+key+'\n')
    subprocess.run(['curl','-s','-X','POST','https://api.elevenlabs.io/v1/text-to-speech/bIHbv24MWmeRgasZH58o/with-timestamps?output_format=mp3_44100_192','-H','@'+hdr,'-H','Content-Type: application/json','--data-binary','@audio/vo3/req.json','-o','audio/vo3/take.json'],check=True)
finally:
    os.remove(hdr)
d=json.load(open('audio/vo3/take.json'))
open('audio/vo3/take.mp3','wb').write(base64.b64decode(d['audio_base64']))
a=d['alignment']; C=''.join(a['characters']); S=a['character_start_times_seconds']; E=a['character_end_times_seconds']
pos=0; out=[]
for sid,line in L:
    i0=C.index(line,pos); pos=i0+len(line)
    m=re.match(r'\s*\[[^\]]*\]\s*',line); k=i0+(m.end() if m else 0)
    out.append(dict(shot=sid,a=round(S[k],3),b=round(E[pos-1],3),text=line))
json.dump(out,open('audio/vo3/segs.json','w'),indent=1)
for o in out: print(f"{o['shot']:4s} {o['a']:6.2f}-{o['b']:6.2f} {o['text']}")
