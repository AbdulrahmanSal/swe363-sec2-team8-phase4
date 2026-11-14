from pathlib import Path
from xml.sax.saxutils import escape

OUT=Path(__file__).resolve().parents[1]/'design'/'mobile'
OUT.mkdir(parents=True,exist_ok=True)
G='#00573f';GREEN='#008540';INK='#254a36';MUTED='#7f9586';LINE='#dce7df'
def rect(x,y,w,h,fill='#fff',stroke=LINE,r=7):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}"/>'
def text(t,x,y,size=13,fill=INK,weight=400):return f'<text x="{x}" y="{y}" font-family="Arial,Helvetica,sans-serif" font-size="{size}" fill="{fill}" font-weight="{weight}">{escape(t)}</text>'
def button(t,x,y,w,primary=True):return rect(x,y,w,39,GREEN if primary else '#fff',GREEN if primary else LINE,5)+text(t,x+12,y+25,11,'#fff' if primary else G,600)
def header():return rect(0,0,390,82,'#fff','#fff',0)+rect(0,0,390,4,GREEN,GREEN,0)+rect(16,22,35,35,G,G,5)+text('MH',22,45,13,'#fff',700)+text('KFUPM | MALL HUB',63,38,17,G,700)+text('A connected campus community',63,55,9,MUTED)+text('A',348,43,13,G,600)+rect(0,82,390,49,'#f9fcf9',LINE,0)+text('☰',18,113,23,G)+text('Visitor workspace',54,111,11,MUTED)
def base(title,id,subtitle):return rect(0,0,390,950,'#f3f6f3','#f3f6f3',0)+header()+text(id+' · MOBILE REFERENCE',18,157,9,MUTED,600)+text(title,18,191,24,INK,700)+text(subtitle,18,214,11,MUTED)
def badge(t,x,y,w=92):return rect(x,y,w,22,'#edf7ef','#d1e7d8',4)+text(t,x+8,y+15,9,GREEN,600)
def save(name,title,content):
    xml=f'<svg xmlns="http://www.w3.org/2000/svg" width="390" height="950" viewBox="0 0 390 950"><title>{escape(title)}</title><desc>390 px mobile reference. Native SVG text and vector geometry. Static prototype links must be added in Figma. Reference values are fictional.</desc>{content}</svg>'
    (OUT/name).write_text(xml)

s=base('Mall feed','S03','Discover what’s happening on campus.')
s+=button('All',18,239,46)+button('Announcements',72,239,128,False)+button('Offers',208,239,70,False)+button('Events',286,239,86,False)
for y,kind,title,lines,owner in [(302,'CLUB EVENT','Web development meetup',['Student ideas. Useful campus applications.','A casual meetup for the community.'],'Computing Club'),(508,'VENDOR OFFER','Sandwich and drink offer',['Order your favourites and collect in store.','Ask the vendor for promotion details.'],'Campus Bites')]:
    s+=rect(18,y,354,184)+text(kind,34,y+27,9,GREEN,700)+text(owner,34,y+49,10,MUTED)+text(title,34,y+80,17,INK,600)+''.join(text(t,34,y+106+i*17,11,MUTED) for i,t in enumerate(lines))+button('View details',34,y+138,114,False)
s+=button('Browse the vendor directory',18,724,354)+text('Menu opens as a slide-out drawer.',18,797,11,MUTED)
save('S03_Mobile_Feed.svg','S03 · Mobile feed',s)

s=base('Vendor directory','S04','Find a business and explore its services.')+rect(18,238,354,42)+text('Search businesses…',32,265,12,MUTED)+rect(18,291,354,42)+text('All categories',32,317,12)+text('▾',347,317,12)+text('5 businesses found',18,360,10,MUTED)
for y,name,category,location in [(382,'Campus Bites','Restaurants','Ground floor, Shop 12'),(574,'Palm Coffee','Restaurants','Ground floor, Shop 8')]:
    s+=rect(18,y,354,174)+text(name,34,y+33,19,INK,600)+badge('Open',292,y+16,62)+text(category,34,y+60,11,MUTED)+text(location,34,y+88,11,MUTED)+button('View business',34,y+115,322,False)
save('S04_Mobile_Directory.svg','S04 · Mobile directory',s)

s=base('Pickup order','S06','Campus Bites · Pay at the restaurant.')+rect(18,240,354,234)+text('Menu',34,271,17,INK,600)
for y,title,price,quantity in [(306,'Chicken sandwich','SAR 15.00','1'),(383,'Veggie wrap','SAR 12.00','1')]:
    s+=text(title,34,y,13,INK,600)+text(price,34,y+23,11,MUTED)+button('−',237,y-17,32,False)+text(quantity,282,y+8,12)+button('+',305,y-17,32,False)
s+=rect(18,495,354,244)+text('Your order',34,526,17,INK,600)+text('1 × Chicken sandwich',34,561,12)+text('SAR 15.00',285,561,12)+text('1 × Veggie wrap',34,594,12)+text('SAR 12.00',285,594,12)+rect(34,614,322,1,LINE,LINE,0)+text('Total',34,648,16,INK,700)+text('SAR 27.00',268,648,16,INK,700)+text('Pickup only · No online payment',34,679,11,MUTED)+button('Review order',34,690,322)
save('S06_Mobile_Order.svg','S06 · Mobile restaurant order',s)

s=base('My Requests','S09','Track your orders, appointments, and laundry.')
for x,n,name in [(18,'1','Pending'),(140,'2','Active'),(262,'1','Completed')]:s+=rect(x,240,110,91)+text(n,x+15,279,27,INK,600)+text(name,x+15,307,11,MUTED)
s+=rect(18,352,354,42)+text('All types',31,379,12)+text('▾',348,379,12)+rect(18,405,354,42)+text('All statuses',31,432,12)+text('▾',348,432,12)
for y,ref,vendor,kind,status in [(471,'ORD-1001','Campus Bites','Restaurant pickup','Pending'),(670,'APT-1003','Campus Barber','Barber appointment','Accepted')]:
    s+=rect(18,y,354,176)+text(ref,34,y+31,16,INK,600)+badge(status,270,y+15,86)+text(vendor,34,y+62,13)+text(kind,34,y+86,11,MUTED)+button('View details',34,y+116,322,False)
save('S09_Mobile_MyRequests.svg','S09 · Mobile request cards',s)

s=base('Mall feed','S03','Mobile navigation state')+rect(0,0,390,950,'#173e2d80','#173e2d80',0)+rect(0,0,286,950,G,G,0)+text('KFUPM MALL HUB',24,54,18,'#fff',700)+text('×',249,52,24,'#fff')+text('VISITOR WORKSPACE',24,110,9,'#91b9a0',600)
for i,t in enumerate(['Mall feed','Vendor directory','My Requests','Club events','Account profile']):
    y=138+i*56
    if i==0:s+=rect(14,y,258,45,'#ffffff16','#ffffff16',5)+rect(14,y,3,45,'#dac961','#dac961',0)
    s+=text(t,31,y+28,13,'#fff' if i==0 else '#c2d9c9')
s+=text('Close using ×, Esc, or the backdrop.',24,520,10,'#91b9a0')
save('S03_Mobile_Drawer.svg','Mobile slide-out navigation',s)
print('Created four required mobile references and one drawer reference.')
