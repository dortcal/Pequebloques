import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width':1400,'height':900}, accept_downloads=True); pg = await ctx.new_page(); errs=[]
        pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__),'..','index.html')) + ''); await pg.wait_for_timeout(500)
        # programa con lápiz, variable, pregunta, operadores y voz, construido por el modelo
        await pg.evaluate("""(()=>{
          const mk=(op,f,sub)=>{const b=PQ.mkBlock(op,f||null,{target:PQ.S.target,project:PQ.S.project}); if(sub)b.sub=sub; return b;};
          PQ.S.project.vars.push({name:'lados',value:4,show:true});
          const t=PQ.S.project.sprites[0];
          const sq=mk('control_repeat',{TIMES:4},[mk('motion_movesteps',{STEPS:60}),mk('motion_turnright',{DEGREES:90})]);
          sq.in={TIMES:{op:'data_variable',f:{VARIABLE:'lados'}}};
          t.scripts=[{x:20,y:20,blocks:[mk('event_whenflagclicked'),mk('pen_clear'),mk('pen_setPenColorToColor',{COLOR:'#E64040'}),mk('pen_setPenSizeTo',{SIZE:6}),mk('pen_penDown'),sq,mk('pen_penUp'),
             mk('data_changevariableby',{VARIABLE:'lados',VALUE:2}),mk('text2speech_setVoice',{VOICE:'SQUEAK'}),mk('text2speech_speakAndWait',{WORDS:'¡Dibujé un cuadrado!'}),
             Object.assign(mk('looks_say',{MESSAGE:''}),{in:{MESSAGE:{op:'operator_join',f:{STRING1:'lados=',STRING2:''},in:{STRING2:{op:'data_variable',f:{VARIABLE:'lados'}}}}}})]}];
          PQ.S.level=2; PQ.ed.refreshAll();
        })()""")
        await pg.click('#btnFlag'); await pg.wait_for_timeout(1500)
        print('say', await pg.evaluate('PQ.S.target._say && PQ.S.target._say.text'), 'x,y', await pg.evaluate('[PQ.S.target.x,PQ.S.target.y]'), await pg.evaluate('PQ.S.project.vars'))
        await pg.screenshot(path='/tmp/pen.png')
        async with pg.expect_download() as d: await pg.click('#btnSave')
        await (await d.value).save_as('/tmp/pen.sb3')
        print(await pg.evaluate("(async()=>{const r=await PQ.importSb3(PQ.exportSb3(PQ.S.project),'x'); return JSON.stringify([r.report, r.project.sprites[0].scripts[0].blocks.map(b=>b.op), r.project.sprites[0].scripts[0].blocks[5].in])})()"))
        print(errs); await b.close()
asyncio.run(main())
