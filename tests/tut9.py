import asyncio, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from playwright.async_api import async_playwright
from pchelp import STUB

HELP = r"""
window.T = {
  env(t){ return {project: PQ.S.project, target: t||PQ.S.target}; },
  b(op, f, t){ return PQ.mkBlock(op, f||null, T.env(t)); },
  add(blocks, t){ (t||PQ.S.target).scripts.push({x:40+20*(t||PQ.S.target).scripts.length, y:30+90*(t||PQ.S.target).scripts.length, blocks}); },
  // pone bloques dentro del primer programa con ese sombrero
  push(hatop, blk, t, where){ t=t||PQ.S.target; const sc=t.scripts.filter(s=>s.blocks[0].op===hatop).pop(); (where? where(sc): sc.blocks).push(blk); },
  c(op,f,t){ const x=T.b(op,f,t); return x; },
  step(){ const e=document.querySelector('#guide .gs'); return e? e.textContent:''; },
  chg(){ PQ.ed.changed(); PQ.Tut.check(); }
};
"""

# acciones por tutorial: lista de funciones JS (string) que cumplen cada paso, en orden
ACT = {
 'suena-y-baila': [
  "T.add([T.b('event_whenflagclicked')]);",
  "T.push('event_whenflagclicked', T.b('sound_play'));",
  "T.push('event_whenflagclicked', T.b('control_repeat'));",
  "const r=PQ.S.target.scripts[0].blocks[2]; r.sub.push(T.b('motion_turnleft',{DEGREES:30}));",
  "const r=PQ.S.target.scripts[0].blocks[2]; r.sub.push(T.b('looks_nextcostume'));",
  "PQ.RT.greenFlag();"],
 'toca-y-salta': [
  "T.add([T.b('event_whenthisspriteclicked')]);",
  "T.push('event_whenthisspriteclicked', T.b('motion_changeyby',{DY:40}));",
  "T.push('event_whenthisspriteclicked', T.b('control_wait',{DURATION:0.3}));",
  "T.push('event_whenthisspriteclicked', T.b('motion_changeyby',{DY:-40}));",
  "CLICK"],
 'dos-amigos': [
  "PQ.S.project.sprites.push(PQ.makeSprite('pez',PQ.S.project)); PQ.S.target=PQ.S.project.sprites[1]; PQ.ed.refreshAll&&PQ.ed.refreshAll();",
  "T.add([T.b('event_whenflagclicked')]);",
  "T.push('event_whenflagclicked', T.b('looks_sayforsecs'));",
  "PQ.S.target=PQ.S.project.sprites[0];",
  "T.add([T.b('event_whenflagclicked'),T.b('looks_sayforsecs')]);",
  "PQ.RT.greenFlag();"],
 'muevelo-tu': [
  "T.add([T.b('event_whenkeypressed',{KEY_OPTION:'right arrow'})]);",
  "T.push('event_whenkeypressed', T.b('motion_changexby',{DX:10}));",
  "T.add([T.b('event_whenkeypressed',{KEY_OPTION:'left arrow'})]);",
  "const sc=PQ.S.target.scripts[1]; sc.blocks.push(T.b('motion_changexby',{DX:-10}));",
  "KEY"],
 'rebota': [
  "T.add([T.b('event_whenflagclicked')]);",
  "T.push('event_whenflagclicked', T.b('control_forever'));",
  "PQ.S.target.scripts[0].blocks[1].sub.push(T.b('motion_movesteps',{STEPS:5}));",
  "PQ.S.target.scripts[0].blocks[1].sub.push(T.b('motion_ifonedgebounce'));",
  "PQ.S.target.scripts[0].blocks[1].sub.push(T.b('looks_nextcostume'));",
  "PQ.RT.greenFlag();"],
 'mensajes': [
  "T.add([T.b('event_whenflagclicked')]);",
  "T.push('event_whenflagclicked', T.b('looks_sayforsecs'));",
  "T.push('event_whenflagclicked', T.b('event_broadcast'));",
  "PQ.S.target=PQ.S.project.sprites[1];",
  "T.add([T.b('event_whenbroadcastreceived')]);",
  "T.push('event_whenbroadcastreceived', T.b('looks_sayforsecs',{MESSAGE:'¡Hola, canario!'}));",
  "PQ.RT.greenFlag();"],
 'variables': [
  "PQ.S.project.vars.push({name:'puntos',value:0,show:true}); PQ.ed.refreshAll();",
  "T.add([T.b('event_whenflagclicked')]);",
  "T.push('event_whenflagclicked', T.b('data_setvariableto',{VARIABLE:'puntos',VALUE:'0'}));",
  "T.add([T.b('event_whenthisspriteclicked')]);",
  "T.push('event_whenthisspriteclicked', T.b('data_changevariableby',{VARIABLE:'puntos',VALUE:1}));",
  "FLAGCLICKS"],
 'decide-con-si': [
  "T.add([T.b('event_whenflagclicked')]);",
  "T.push('event_whenflagclicked', T.b('control_forever'));",
  "PQ.S.target.scripts[0].blocks[1].sub.push(T.b('motion_movesteps',{STEPS:3}));",
  "PQ.S.target.scripts[0].blocks[1].sub.push(T.b('motion_ifonedgebounce'));",
  "PQ.S.target.scripts[0].blocks[1].sub.push(T.b('control_if'));",
  "PQ.S.target.scripts[0].blocks[1].sub[2].cond=T.b('sensing_touchingobject');",
  "PQ.S.target.scripts[0].blocks[1].sub[2].sub.push(T.b('looks_sayforsecs',{MESSAGE:'¡Me tocas!'}));",
  "PQ.RT.greenFlag();"],
 'atrapa': [
  "PQ.S.project.vars.push({name:'puntos',value:0,show:true}); PQ.ed.refreshAll();",
  "T.add([T.b('event_whenflagclicked'),T.b('data_setvariableto',{VARIABLE:'puntos',VALUE:'0'})]);",
  "T.add([T.b('event_whenthisspriteclicked')]);",
  "T.push('event_whenthisspriteclicked', T.b('data_changevariableby',{VARIABLE:'puntos',VALUE:1}));",
  "T.push('event_whenthisspriteclicked', T.b('motion_gotoxy'));",
  "const g=PQ.S.target.scripts[1].blocks[2]; g.in=g.in||{}; g.in.X=T.b('operator_random');",
  "const g=PQ.S.target.scripts[1].blocks[2]; g.in.X.f.FROM=-150; g.in.X.f.TO=150;",
  "PQ.S.project.vars[0].value=3;"],
}

async def main():
    p=await async_playwright().start(); b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1200,'height':800}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    await pg.add_init_script(STUB)
    src = os.path.abspath(os.path.join(os.path.dirname(__file__),'..','index.html'))
    await pg.goto('file://'+src+'?voz=dispositivo'); await pg.wait_for_timeout(600)
    await pg.evaluate('document.querySelectorAll(".toast").forEach(t=>t.remove())')
    await pg.evaluate(HELP)
    lst = await pg.evaluate('PQ.TUT.list.map(t=>[t.id,t.stars])')
    print('lista', lst)
    stars=[x[1] for x in lst]; assert stars==sorted(stars) and stars.count(1)==6 and stars.count(2)==3 and stars.count(3)==3, stars
    bad=0
    for tid,acts in ACT.items():
        await pg.evaluate("PQ.Tut.start(%r)"%tid); await pg.wait_for_timeout(300)
        n = await pg.evaluate("document.querySelector('#guide .gs').textContent.split(' de ')[1]|0") if False else None
        head = await pg.evaluate('T.step()')
        total = int(head.split(' de ')[1])
        assert total==len(acts), (tid,total,len(acts))
        for i,a in enumerate(acts):
            cur = await pg.evaluate('T.step()')
            assert ('· %d de'%(i+1)) in cur, (tid,i,cur)
            # el bloque resaltado existe en la paleta y los selectores ui existen
            info = await pg.evaluate('''()=>{const s=document.querySelector('#guide p').textContent;const pu=document.querySelector('#pal .block.pulse');const ui=document.querySelectorAll('.pulse-ui').length;return {pulse:pu?pu.dataset.op:null,ui,say:s}}''')
            st = await pg.evaluate('PQ.Tut.currentStep()')
            if st['hl'] and info['pulse']!=st['hl']:
                print('  !! sin resaltado', tid, i, st['hl'], info); bad+=1
            if 'ui' in info and not st['hl'] and not info['ui'] and i in (0,) and tid=='dos-amigos':
                print('  !! sin ui', tid, i); bad+=1
            if a=='CLICK':
                # toque real sobre el canario en el escenario
                box=await pg.evaluate('(()=>{const r=document.querySelector("#stagewrap").getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()')
                t=await pg.evaluate('(()=>{const s=PQ.S.project.sprites[0];return [s.x,s.y]})()')
                await pg.mouse.click(box[0]+box[2]*(240+t[0])/480, box[1]+box[3]*(180-t[1])/360)
                await pg.wait_for_timeout(900)
            elif a=='KEY':
                await pg.keyboard.press('ArrowRight'); await pg.wait_for_timeout(400)
            elif a=='FLAGCLICKS':
                await pg.evaluate('PQ.RT.greenFlag()'); await pg.wait_for_timeout(300)
                for _ in range(3):
                    box=await pg.evaluate('(()=>{const r=document.querySelector("#stagewrap").getBoundingClientRect();return [r.left,r.top,r.width,r.height]})()')
                    t=await pg.evaluate('(()=>{const s=PQ.S.project.sprites[0];return [s.x,s.y]})()')
                    await pg.mouse.click(box[0]+box[2]*(240+t[0])/480, box[1]+box[3]*(180-t[1])/360)
                    await pg.wait_for_timeout(400)
            else:
                await pg.evaluate("(()=>{%s})(); T.chg();"%a)
                await pg.wait_for_timeout(250)
            after = await pg.evaluate('T.step()')
            want = '· %d de'%(i+2)
            if i+1<total and want not in after:
                print('  !! no avanza', tid, 'paso', i+1, '->', after); bad+=1
                break
        await pg.wait_for_timeout(300)
        done = await pg.evaluate("document.querySelector('#guide').classList.contains('done')")
        print(('OK ' if done else '!! ')+tid, 'terminado' if done else 'NO terminado', await pg.evaluate('T.step()'))
        if not done: bad+=1
        await pg.evaluate('PQ.Tut.stop()')
    print('errores de página:', errs, 'problemas:', bad)
    await b.close(); await p.stop()
    sys.exit(1 if (errs or bad) else 0)
asyncio.run(main())
