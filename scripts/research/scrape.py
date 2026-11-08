import sys, json, re, os
from bs4 import BeautifulSoup
def T(el): return re.sub(r'\s+',' ',el.get_text(' ',strip=True)).strip() if el else None
def parse(path, slug):
    s=BeautifulSoup(open(path).read(),'html.parser')
    d={'slug':slug}
    d['metaTitle']=T(s.title)
    m=s.find('meta',attrs={'name':'description'}); d['metaDescription']=m['content'] if m else None
    h1=s.select_one('.tour-hero-h1'); d['title']=T(h1)
    hero=s.select_one('section.tour-hero')
    # meta line: first div after h1
    ml=h1.find_next_sibling('div') if h1 else None
    d['metaLine']=[T(x) for x in ml.find_all('span',recursive=False) if T(x) and T(x)!='·'] if ml else []
    # price rows
    prices=[]
    pr=ml.find_next_sibling('div') if ml else None
    if pr:
        for row in pr.find_all('div',recursive=False):
            txt=[T(x) for x in row.find_all('div',recursive=False)]
            if row.find(id='hero-viewers') or 'pay on the day' in (T(row) or '').lower() or 'viewing' in (T(row) or ''): 
                if 'pay' in (T(row) or '').lower(): d['heroNote']=T(row)
                continue
            inner=row.find_all('div',recursive=False)
            if len(inner)>=2:
                price=T(inner[0]); lab=inner[1].find_all('div')
                old=[T(x) for x in inner[2].find_all('span')] if len(inner)>2 else []
                prices.append({'price':price,'label':T(lab[0]) if lab else None,'unit':T(lab[1]) if len(lab)>1 else None,'old':old})
    d['heroPrices']=prices
    d['bridge']=[T(x) for x in s.select('.bridge-text')]
    d['reviews']=[{'text':T(x.find('p')),'author':T(x.find_all('div',recursive=False)[-1])} for x in s.select('.rev-auto > div')]
    d['itinerary']=[]
    for st in s.select('.itinerary .prog-step'):
        divs=st.find_all('div',recursive=False)
        body=divs[-1].find_all('div',recursive=False)
        d['itinerary'].append({'title':T(body[0]),'text':T(body[1]) if len(body)>1 else ''})
    # included groups
    groups=[]
    for it in s.select('.itinerary .inc-item'):
        pass
    for g in s.select('.itinerary span'):
        pass
    inc={}
    for sp in s.find_all('span'):
        t=T(sp)
        if t in ('Included in the Price','Not Included','What to Bring','Included','Not included'):
            box=sp.find_parent('div').find_parent('div')
            inc[t]=[T(x) for x in box.select('.inc-item')]
    d['included']=inc
    d['faq']=[{'q':T(x.select_one('.faq-q span')),'a':T(x.select_one('.faq-a'))} for x in s.select('.faq-item')]
    d['destCards']=[{'tag':T(x.select_one('.dir-card-tag')),'title':T(x.select_one('.dir-card-title')),'text':T(x.select_one('.dir-card-desc')),'tone':(x.select_one('.dir-icon-chip')['class'][1] if x.select_one('.dir-icon-chip') and len(x.select_one('.dir-icon-chip')['class'])>1 else None)} for x in s.select('.dir-card')]
    d['knowCards']=[{'title':T(x.select_one('.know-card-title')),'text':T(x.select_one('.know-card-desc')),'tone':(x.select_one('.know-icon')['class'][1] if x.select_one('.know-icon') and len(x.select_one('.know-icon')['class'])>1 else None)} for x in s.select('.know-card')]
    d['infoHeading']=T(s.select_one('.info-heading'))
    b={}
    for k in ['bc-a-kicker','bc-a-was-old','bc-a-badge','bc-a-desc','bc-b-kicker','bc-b-num','bc-b-desc','bc-b-ring-num','bc-b-ring-sub','bc-c-kicker','bc-c-num','bc-c-desc']:
        b[k]=T(s.select_one('.'+k))
    d['bento']=b
    cta=s.select_one('.hero-cta-section-btn')
    if cta:
        sec=cta.find_parent('section')
        d['cta']={'h2':T(sec.find('h2')),'p':[re.sub(r'\s+',' ',x).strip() for x in sec.find('p').get_text('\n',strip=True).split('\n')],'urgency':T(sec.select_one('.hero-cta-urgency-dot').find_next_sibling('span')) if sec.select_one('.hero-cta-urgency-dot') else None,'chips':[T(x) for x in cta.find_next_sibling('div').find_all('span')] if cta.find_next_sibling('div') else []}
    d['related']=[{'slug':a['href'].rstrip('/').split('/')[-1],'tag':T(a.find_parent('div').select_one('.rt-sw-tag')),'name':T(a.find_parent('div').select_one('.rt-sw-name'))} for a in s.select('.rt-sw-btn')]
    d['gallery']=[{'src':i['src'],'w':int(i.get('width',0) or 0),'h':int(i.get('height',0) or 0)} for i in s.select('.tg-slide img')]
    bk=s.select_one('#bk-overlay')
    d['options']=[]
    if bk:
        for f in bk.select('.bk-counter-row'):
            btn=f.select_one('.bk-counter-btn')
            key=re.search(r"bkChange\('(\w+)'",btn.get('onclick','')).group(1) if btn else None
            d['options'].append({'key':key,'label':T(f.select_one('.bk-counter-label')),'sub':T(f.select_one('.bk-counter-sub'))})
        d['hasTime']=bool(bk.find(id=re.compile('time')))
        d['bkToggles']=[T(x) for x in bk.select('[onclick*="Toggle"]')]
    # time slots
    d['timeSlots']=sorted(set(re.findall(r"(?:bk|sb|fp)SetTime\(['\"]([^'\"]+)['\"]",str(s))))
    # prices from script
    m=re.search(r"var prices=\{([^}]*)\}",str(s)); d['priceVars']=m.group(1) if m else None
    m=re.search(r"var msg='([^']*(?:\\'[^']*)*)'",str(s)); 
    m=re.search(r"Tour: ([^\\]+)\\n",str(s)); d['waTourName']=m.group(1) if m else None
    return d
out=[]
for f in sorted(os.listdir('site/tours')):
    slug=f[:-5]
    if slug=='video': continue
    try: out.append(parse('site/tours/'+f,slug))
    except Exception as e: print('ERR',slug,repr(e),file=sys.stderr)
json.dump(out,open('tours.json','w'),indent=1,ensure_ascii=False)
print(len(out))
