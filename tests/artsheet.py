import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1100,'height':900})
    await pg.goto('file:///home/claude/scratch-peques/index.html'); await pg.wait_for_timeout(800)
    html=await pg.evaluate('''()=>{
      const ids=['residuoc','contenedor','reciclado','tarjetar','robotsuelo','obstaculoc'];
      let h='<body style="margin:0;background:#fff;font:12px sans-serif">';
      ids.forEach(id=>{const s=PQ.SPRITE_LIB.find(x=>x.id===id);s.costumes.forEach((c,i)=>{h+='<div style="display:inline-block;margin:4px;text-align:center"><img width=100 src="data:image/svg+xml;utf8,'+encodeURIComponent(c[1])+'"><br>'+id+' '+(i+1)+'</div>'})});
      ['pc-cole','pc-cole-grid'].forEach(id=>{const b=PQ.BACKDROP_LIB.find(x=>x.id===id);h+='<div style="display:inline-block;margin:4px"><img width=360 src="data:image/svg+xml;utf8,'+encodeURIComponent(b.svg)+'"></div>'});
      return h}''')
    pg2=await b.new_page(viewport={'width':1100,'height':760}); await pg2.set_content(html); await pg2.wait_for_timeout(500)
    await pg2.screenshot(path='/tmp/artsheet.png')
    await b.close()
asyncio.run(main())
