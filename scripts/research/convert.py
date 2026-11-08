import json, re
scr={t['slug']:t for t in json.load(open('tours.json'))}
js=open('site/tours_script.js').read()
arr=js[js.find('const TOURS = ['):js.find('];')+1]
# parse listing objects
items=re.findall(r'\{(id:\d+.*?)\}(?=,|\s*\n|\])',arr,flags=re.S)
def field(s,k):
    m=re.search(k+r"\s*:\s*('((?:\\'|[^'])*)'|[\d.]+|true|false|null)",s)
    if not m: return None
    v=m.group(1)
    if v.startswith("'"): return m.group(2).replace("\\'","'")
    if v in('true','false'): return v=='true'
    if v=='null': return None
    return float(v) if '.' in v else int(v)
listing=[]
for s in items:
    listing.append({k:field(s,k) for k in ['id','rating','name','cat','catLabel','dur','sched','price','unit','img','url','desc','badge','big']})
fallback=['4.9','4.8','4.7','4.9','4.8','4.9','4.7','4.8','4.9','4.8']
cats=['sea','safari','historical','family']
idx={c:0 for c in cats}
DAYS={'Sun':0,'Mon':1,'Tue':2,'Wed':3,'Thu':4,'Fri':5,'Sat':6}
EXTRA=re.compile(r'camel|visa|\bseats?\b|div|quad bikes|private ride|private transfer|vip dinner|passenger',re.I)
DEPOSIT={'cairo-pyramids-by-bus','cairo-pyramids-by-plane','new-egyptian-museum','luxor-day-trip','petra-jordan-trip','vip-boat-white-island-ras-mohamed','private-yacht-sharm','speed-boat-sharm'}
def slugify(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def money(s):
    m=re.search(r'£\s?(\d+)',s or ''); return int(m.group(1)) if m else None
out=[]
for L in listing:
    slug=L['url'].rstrip('/').split('/')[-1]
    S=scr[slug]
    cat=L['cat']
    rating=L['rating'] or fallback[idx[cat]%len(fallback)]
    idx[cat]+=1
    ml=S['metaLine']+[None,None,None]
    sched,dur,timeText=ml[0],ml[1],ml[2]
    days=None
    if sched and sched not in('Daily','On request','Evenings'):
        days=sorted(DAYS[d] for d in re.findall(r'Sun|Mon|Tue|Wed|Thu|Fri|Sat',sched))
    slots=[]
    if timeText and '·' in timeText:
        parts=[p.strip() for p in timeText.split('·')]
        if all(re.match(r'^\d{1,2}:\d{2} [AP]M$',p) for p in parts): slots=parts
    # options
    opts=[]
    for o in S['options']:
        price=money(o['sub'])
        lab=o['label']; sub=o['sub'] or ''
        key=o['key'] or slugify(lab)
        unit=sub.split('/',1)[1].strip() if '/' in sub else (sub.split('·',1)[1].strip() if '·' in sub else ('' if price is not None else ''))
        unit=unit.split('·')[0].strip()
        if 'separate seat' in sub: unit='seat'
        free = (sub.strip().lower()=='free')
        if price is None and free: price=0
        kind='toggle' if (o['key'] is None and 'group' in sub) else 'counter'
        opts.append({'key':key,'label':lab,'price':price if price is not None else 0,'unit':unit or ('person' if not free else ''),'free':free,'kind':kind,'group':'extras' if EXTRA.search(lab) else 'guests'})
    # special fixes
    if slug=='private-yacht-sharm':
        opts=[{'key':'yacht','label':'Private yacht','price':700,'unit':'boat','free':False,'kind':'counter','group':'guests','max':3},
              {'key':'guests','label':'Guests on board','price':0,'unit':'included','free':True,'kind':'counter','group':'extras'},
              {'key':'diving','label':'Dive (diving)','price':10,'unit':'person','free':False,'kind':'counter','group':'extras'}]
    if slug=='speed-boat-sharm':
        opts=[{'key':'boat4','label':'Boat for up to 4 people','price':100,'unit':'hour','free':False,'kind':'counter','group':'guests','max':6},
              {'key':'boat7','label':'Boat for up to 7 people','price':120,'unit':'hour','free':False,'kind':'counter','group':'guests','max':6}]
    # hero prices
    hp=[]
    for p in S['heroPrices']:
        v=money(p['price'])
        if v is None: continue
        old=money(p['old'][0]) if p['old'] else None
        disc=p['old'][1] if len(p['old'])>1 else None
        hp.append({'price':v,'label':p['label'],'unit':p['unit'],'oldPrice':old,'discount':disc})
    if not hp:
        for o in [o for o in opts if o['group']=='guests' and not o['free']][:2]:
            hp.append({'price':o['price'],'label':o['label'],'unit':'per '+o['unit'] if o['unit'] else '','oldPrice':None,'discount':None})
    b=S['bento']
    cta=S.get('cta') or {}
    p=cta.get('p') or []
    line1=p[0] if p else ''
    line2=' '.join(p[1:]).replace(' £','£').replace('from£','from £') if len(p)>1 else ''
    if line2.rstrip().endswith('from'): line2=line2.rstrip()+f" £{L['price']}"
    gal=[g for g in S['gallery'] if g['src']]
    inc=S['included']
    out.append({
      'id':L['id'],'slug':slug,'name':L['name'],'title':S['title'],
      'category':cat,'categoryLabel':L['catLabel'],
      'duration':L['dur'],'detailDuration':dur or L['dur'],'schedule':L['sched'],'scheduleDays':days,'timeText':timeText,'timeSlots':slots,
      'priceFrom':L['price'],'priceUnit':L['unit'],'rating':float(rating),'badge':L['badge'],'featured':bool(L['big']),
      'excerpt':L['desc'],'cardImage':L['img'],
      'metaTitle':S['metaTitle'],'metaDescription':S['metaDescription'],
      'heroPrices':hp,'highlights':S['bridge'],'reviews':[r for r in S['reviews'] if r['text']],
      'itinerary':S['itinerary'],
      'included':inc.get('Included in the Price',[]),'notIncluded':inc.get('Not Included',[]),'bring':inc.get('What to Bring',[]),
      'faq':S['faq'],'infoHeading':S['infoHeading'] or 'About the Destination','destinationCards':S['destCards'],'goodToKnow':S['knowCards'],
      'bento':{'priceKicker':b['bc-a-kicker'],'oldPrice':money(b['bc-a-was-old']),'badge':b['bc-a-badge'],'priceText':b['bc-a-desc'],
               'programKicker':b['bc-b-kicker'],'programNum':b['bc-b-num'],'programText':b['bc-b-desc'],'ring':b['bc-b-ring-num'],'ringLabel':b['bc-b-ring-sub']},
      'cta':{'heading':cta.get('h2'),'line1':line1,'line2':line2,'chips':cta.get('chips') or []},
      'related':[{'slug':r['slug'],'tag':r['tag'],'name':r['name']} for r in S['related'] if r['slug'] in scr],
      'gallery':gal,'options':opts,'requiresDeposit':slug in DEPOSIT,
    })
json.dump(out,open('/Users/yusuf_rahimboyev/Developer/projects/sharm_clone/src/data/tours.json','w'),indent=1,ensure_ascii=False)
print(len(out))
for t in out: print(t['slug'],t['priceFrom'],t['scheduleDays'],t['timeSlots'],[(o['key'],o['price'],o['unit'],o['kind'],o['group']) for o in t['options']],len(t['gallery']),t['cta']['line2'])
