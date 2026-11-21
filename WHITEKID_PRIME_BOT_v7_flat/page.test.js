const fs=require('fs'),vm=require('vm');
const html=fs.readFileSync(require('path').join(__dirname,'main.html'),'utf8');const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
function el(id){return{id,value:'',textContent:'',className:'',style:{},innerHTML:'',children:[],classList:{_s:new Set(),add(c){this._s.add(c)},remove(c){this._s.delete(c)}},appendChild(c){this.children.push(c);if(c.nodeType===3)this.textContent+=c.t;else if(c.textContent)this.textContent+=c.textContent;return c},addEventListener(e,f){(this.h=this.h||{})[e]=f},focus(){},disabled:false};}
function run(responder){
  const els={};const doc={getElementById:id=>els[id]||(els[id]=el(id)),createElement:t=>el(t),createTextNode:t=>({nodeType:3,t}),body:{appendChild(){},removeChild(){}},execCommand(){}};
  const calls=[];
  const ctx={document:doc,navigator:{},setInterval:()=>1,clearInterval(){},setTimeout:(f)=>1,fetch:(u)=>{calls.push(u);return responder(u)},encodeURIComponent,String,Promise,console};
  vm.createContext(ctx);vm.runInContext(js,ctx);return{els,calls};
}
const R=(status,body)=>Promise.resolve({status,json:()=>Promise.resolve(body)});
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m)}};
 // success
 let t=run(u=>u.startsWith('/ping')?R(200,{activesession:3}):u.startsWith('/status')?R(200,{connected:false}):R(200,{code:'ABCD1234'}));
 await tick();ok(t.els.stat.textContent.includes('3 active sessions'),'stats '+t.els.stat.textContent);
 t.els.num.value='078 984 6423';t.els.go.h.click();await tick();await tick();
 ok(t.calls.includes('/?number=263789846423'),'request url '+t.calls);
 ok(t.els.code.textContent==='ABCD-1234','code fmt '+t.els.code.textContent);ok(t.els.result.classList._s.has('show'),'result shown');
 // already connected
 t=run(u=>u.startsWith('/ping')?R(200,{}):R(200,{status:'already_connected'}));t.els.num.value='789846423';t.els.go.h.click();await tick();await tick();
 ok(/already connected/.test(t.els.msg.textContent),'already '+t.els.msg.textContent);
 // 429
 t=run(u=>u.startsWith('/ping')?R(200,{}):R(429,{error:'Too many attempts. Try again in 9 minute(s).'}));t.els.num.value='789846423';t.els.go.h.click();await tick();await tick();
 ok(/Too many/.test(t.els.msg.textContent)&&t.els.msg.className==='msg err','429');
 // no code
 t=run(u=>u.startsWith('/ping')?R(200,{}):R(200,{}));t.els.num.value='789846423';t.els.go.h.click();await tick();await tick();
 ok(/Could not get a code/.test(t.els.msg.textContent),'nocode');
 // invalid number: no request
 t=run(u=>R(200,{}));t.els.num.value='12';t.els.go.h.click();await tick();ok(!t.calls.some(c=>c.startsWith('/?number')),'invalid not sent');ok(t.els.msg.className==='msg err','invalid msg');
 // network error
 t=run(u=>u.startsWith('/ping')?R(200,{}):Promise.reject(new Error('x')));t.els.num.value='789846423';t.els.go.h.click();await tick();await tick();ok(/Cannot reach/.test(t.els.msg.textContent),'neterr');
 // pasted full international number
 t=run(u=>u.startsWith('/ping')?R(200,{}):R(200,{code:'ZZZZ9999'}));t.els.num.value='+263 789 846 423';t.els.go.h.click();await tick();ok(t.calls.includes('/?number=263789846423'),'full intl '+t.calls);
 console.log(f?'PAGE TESTS FAILED':'PAGE TESTS PASS');
})();
