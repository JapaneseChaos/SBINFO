interface Env { ASSETS: {fetch(request:Request):Promise<Response>} }
export default {async fetch(request:Request, env:Env):Promise<Response> {
 const url=new URL(request.url);
 if(url.pathname!='/api/election') return url.pathname.startsWith('/api/')?new Response('Not found',{status:404}):env.ASSETS.fetch(request);
 if(request.method!=='GET') return new Response('Method not allowed',{status:405});
 try {
  const response=await fetch('https://api.hypixel.net/v2/resources/skyblock/election',{signal:AbortSignal.timeout(8000),cf:{cacheTtl:60,cacheEverything:true}} as RequestInit);
  if(!response.ok) throw Error('Upstream unavailable');
  const data=await response.json() as {success?:boolean};
  if(data.success!==true) throw Error('Invalid upstream response');
  return Response.json({data,fetchedAt:Date.now()},{headers:{'Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
 }catch {return Response.json({error:'市長情報を取得できません。時間をおいて再取得してください。'},{status:503,headers:{'Cache-Control':'no-store'}});}
}};
