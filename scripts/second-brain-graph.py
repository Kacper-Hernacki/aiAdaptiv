import os,re,math
import numpy as np
ROOT=os.path.expanduser('~/code/second-brain/wiki')
SP=os.environ['SP']
linkre=re.compile(r'\[\[([^\]|#]+)')
cat={};text={}
for dp,_,fn in os.walk(ROOT):
    for f in fn:
        if not f.endswith('.md'):continue
        p=os.path.join(dp,f); rel=os.path.relpath(p,ROOT)
        c=rel.split(os.sep)[0] if os.sep in rel else 'root'
        s=os.path.splitext(f)[0].strip().lower(); cat[s]=c
        text[s]=open(p,encoding='utf-8',errors='ignore').read()
nodes=sorted(cat); idx={n:i for i,n in enumerate(nodes)}
edges=set()
for s,t in text.items():
    for l in linkre.findall(t):
        d=l.strip().lower()
        if d in idx and d!=s:
            a,b=sorted((idx[s],idx[d])); edges.add((a,b))
E=np.array(sorted(edges)); N=len(nodes)
# largest connected component
adj={i:set() for i in range(N)}
for a,b in E: adj[a].add(b); adj[b].add(a)
seen=set(); best=[]
for i in range(N):
    if i in seen: continue
    stack=[i]; comp=[]
    while stack:
        u=stack.pop()
        if u in seen: continue
        seen.add(u); comp.append(u); stack.extend(adj[u]-seen)
    if len(comp)>len(best): best=comp
keep=sorted(best); rid={n:i for i,n in enumerate(keep)}
E2=np.array([[rid[a],rid[b]] for a,b in E if a in rid and b in rid])
n=len(keep); cats=[cat[nodes[i]] for i in keep]
deg=np.zeros(n)
for a,b in E2: deg[a]+=1; deg[b]+=1
print("component nodes",n,"edges",len(E2),"dropped",N-n)

rng=np.random.default_rng(11)
pos=rng.normal(0,0.3,(n,2))
AREA=1.0; k=math.sqrt(AREA/n)*2.2
ITER=500
for it in range(ITER):
    t=0.08*(1-it/ITER)**1.5+0.0015
    d=pos[:,None,:]-pos[None,:,:]
    dist2=(d**2).sum(-1)+1e-6
    disp=(k*k/dist2)[:,:,None]*d
    disp=disp.sum(1)
    ed=pos[E2[:,0]]-pos[E2[:,1]]
    el=np.sqrt((ed**2).sum(-1))[:,None]+1e-9
    att=ed*(el/k)*0.9
    np.subtract.at(disp,E2[:,0],att)
    np.add.at(disp,E2[:,1],att)
    disp-=pos*(0.06 if it<ITER*0.6 else 0.02)
    dl=np.sqrt((disp**2).sum(-1))[:,None]+1e-9
    pos+=disp/dl*np.minimum(dl,t)
    pos-=pos.mean(0)
lo=np.percentile(pos,0.5,axis=0); hi=np.percentile(pos,99.5,axis=0)
p=np.clip((pos-lo)/(hi-lo),-0.02,1.02)
W,H=1600,1100; PAD=60
xy=p*np.array([W-2*PAD,H-2*PAD])+PAD
COL={'sources':'#3B81F6','entities':'#F59E0B','concepts':'#10B981','synthesis':'#A855F7','root':'#94A3B8'}
o=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Link graph of a 749-page agent-maintained wiki, titles hidden">']
o.append(f'<rect width="{W}" height="{H}" fill="#0B1220"/>')
o.append('<g stroke="#7DA6F0" stroke-opacity="0.18" stroke-width="0.6">')
for a,b in E2:
    o.append(f'<line x1="{xy[a,0]:.1f}" y1="{xy[a,1]:.1f}" x2="{xy[b,0]:.1f}" y2="{xy[b,1]:.1f}"/>')
o.append('</g><g>')
for i in np.argsort(deg):
    r=2.0+min(deg[i],150)**0.5*0.62
    o.append(f'<circle cx="{xy[i,0]:.1f}" cy="{xy[i,1]:.1f}" r="{r:.1f}" fill="{COL.get(cats[i],"#94A3B8")}" fill-opacity="0.9"/>')
o.append('</g>')
for j,(kk,lab) in enumerate([('sources','Sources'),('entities','Entities'),('concepts','Concepts'),('synthesis','Syntheses')]):
    y=H-30-j*24
    o.append(f'<circle cx="{PAD}" cy="{y}" r="5.5" fill="{COL[kk]}"/>')
    o.append(f'<text x="{PAD+16}" y="{y+4.5}" fill="#94A3B8" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14">{lab}</text>')
o.append(f'<text x="{W-PAD}" y="{H-30}" text-anchor="end" fill="#64748B" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14">749 pages · 4,762 connections · titles hidden</text>')
o.append('</svg>')
open(SP+'/second-brain-graph.svg','w').write('\n'.join(o))
print("ok")
