# One-take VO: whole script in ONE /with-timestamps request (never per line), then per-line segments + word times.
# usage (from videos/<name>/): python3 <skill>/scripts/vo3_gen.py [speed=1.12]
#   in : audio/vo3/lines.json = [[shot_id, "line"], ...]   (no emotion tags unless you want the hyped read)
#   out: audio/vo3/take.mp3, take.json, segs.json [{shot,a,b,text}], words.json [[word, start_s, end_s]]
# env : VOICE (default Will bIHbv24MWmeRgasZH58o; Korean Choi ZNSVYmudV9pOqphY0x8C), STAB 0.5, STYLE 0.3, MODEL eleven_v4,
#       TAKE=n writes take_n.* instead, so you can roll 3-4 takes and keep the best one.
import json,subprocess,base64,sys,os,re
speed=float(sys.argv[1]) if len(sys.argv)>1 else 1.12
L=json.load(open('audio/vo3/lines.json'))
text=" ".join(t for _,t in L)
print(len(re.sub(r'\[[^\]]*\]','',text).split()),'words')
# Default (2026-10-09): steady one-shot read, no emotion tags in lines.json. STAB=0.15 STYLE=0.8 = old max-emotion setting
# (sounded spliced when every sentence carried its own tag).
body={"text":text,"model_id":os.environ.get("MODEL","eleven_v4"),"voice_settings":{"stability":float(os.environ.get("STAB","0.5")),"similarity_boost":0.8,"style":float(os.environ.get("STYLE","0.3")),"speed":speed,"use_speaker_boost":True}}
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
SUF=('_'+os.environ['TAKE']) if os.environ.get('TAKE') else ''
TJ='audio/vo3/take'+SUF+'.json'
# pass the key through a 0600 temp header file so it never appears in argv / ps
import tempfile
fd,hdr=tempfile.mkstemp(prefix='xi-hdr-'); os.chmod(hdr,0o600)
try:
    with os.fdopen(fd,'w') as f: f.write('xi-api-key: '+key+'\n')
    subprocess.run(['curl','-s','-X','POST','https://api.elevenlabs.io/v1/text-to-speech/'+os.environ.get('VOICE','bIHbv24MWmeRgasZH58o')+'/with-timestamps?output_format=mp3_44100_192','-H','@'+hdr,'-H','Content-Type: application/json','--data-binary','@audio/vo3/req.json','-o',TJ],check=True)
finally:
    os.remove(hdr)
d=json.load(open(TJ))
if 'audio_base64' not in d: sys.exit('ElevenLabs error: '+json.dumps(d)[:400])
open(TJ[:-5]+'.mp3','wb').write(base64.b64decode(d['audio_base64']))
a=d['alignment']; C=''.join(a['characters']); S=a['character_start_times_seconds']; E=a['character_end_times_seconds']
pos=0; out=[]
for sid,line in L:
    i0=C.index(line,pos); pos=i0+len(line)
    m=re.match(r'\s*\[[^\]]*\]\s*',line); k=i0+(m.end() if m else 0)
    out.append(dict(shot=sid,a=round(S[k],3),b=round(E[pos-1],3),text=line))
json.dump(out,open('audio/vo3/segs'+SUF+'.json','w'),indent=1)
# word timestamps (take time, seconds); bracketed tags are skipped
words=[];cur='';a0=None
for ch,s0,e0 in zip(C,S,E):
    if ch.isspace():
        if cur: words.append([cur,round(a0,3),round(pe,3)]); cur=''
        continue
    if not cur: a0=s0
    cur+=ch; pe=e0
if cur: words.append([cur,round(a0,3),round(pe,3)])
words=[w for w in words if not re.fullmatch(r'\[[^\]]*\]',w[0])]
json.dump(words,open('audio/vo3/words'+SUF+'.json','w'),ensure_ascii=False)
gaps=[round(words[i+1][1]-words[i][2],2) for i in range(len(words)-1)]
print(f"take {E[-1]:.2f}s, {len(words)} words, longest gap {max(gaps) if gaps else 0}s (target <= 0.35)")
for o in out: print(f"{o['shot']:4s} {o['a']:6.2f}-{o['b']:6.2f} {o['text']}")
