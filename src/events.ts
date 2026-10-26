// SkyBlock epoch: Year 1, Early Spring 1. One in-game day = 20 real minutes.
export const EPOCH = Date.UTC(2019, 5, 11, 17, 55);
export const DAY = 1_200_000;
export const YEAR = DAY * 31 * 12;
export type EventRule = { id: string; name: string; category: '季節イベント' | '選挙' | '市長イベント'; month: number; day: number; duration: number; description: string; perk?: string; source: string };
const wiki = 'https://wiki.hypixel.net/';
export const rules: EventRule[] = [
 {id:'election',name:'市長選挙',category:'選挙',month:6,day:27,duration:DAY*310,description:'Late Summer 27日から Late Spring 27日まで投票。候補者・得票はAPIで確認します。',source:wiki+'Mayor_Election'},
 {id:'spooky',name:'Spooky Festival',category:'季節イベント',month:8,day:29,duration:DAY*3,description:'Autumn 29〜31日。キャンディを集める季節イベント。',source:wiki+'Spooky_Festival'},
 {id:'jerry',name:"Jerry's Workshop",category:'季節イベント',month:12,day:1,duration:DAY*31,description:'Late Winter の間、Jerry’s Workshop が開放されます。',source:wiki+"Jerry%27s_Workshop"},
 {id:'winter',name:'Season of Jerry',category:'季節イベント',month:12,day:24,duration:DAY*3,description:'Late Winter 24〜26日。ギフトを守る防衛イベント。',source:wiki+'Season_Of_Jerry'},
 {id:'new-year',name:'New Year Celebration',category:'季節イベント',month:12,day:29,duration:DAY*3,description:'Late Winter 29〜31日。新年のケーキを受け取れます。',source:wiki+'New_Year_Celebration'},
 {id:'fishing',name:'Fishing Festival',category:'市長イベント',month:1,day:1,duration:DAY*3,perk:'Fishing Festival',description:'Marina の対象Perkが有効な年の毎月1〜3日。API取得時にのみ表示します。',source:wiki+'Fishing_Festival'},
];
export type Occurrence = EventRule & { start:number; end:number; active:boolean };
export function skyDate(now:number) { const days=Math.floor((now-EPOCH)/DAY); const d=((days%372)+372)%372; return {year:Math.floor(days/372)+1,month:Math.floor(d/31)+1,day:d%31+1}; }
export function schedule(now:number, perks:string[]=[]):Occurrence[] {
 const year=Math.floor((now-EPOCH)/YEAR); const out:Occurrence[]=[];
 for(const rule of rules) {
  if(rule.perk && !perks.includes(rule.perk)) continue;
  const months=rule.id==='fishing'?Array.from({length:12},(_,i)=>i+1):[rule.month];
  for(const month of months) for(let y=year-1;y<=year+1;y++) {
   const start=EPOCH+y*YEAR+((month-1)*31+rule.day-1)*DAY; const end=start+rule.duration;
   // Election closes in the following year's Late Spring, 310 days after opening.
   const actualEnd=rule.id==='election'?start+310*DAY:end;
   if(actualEnd>now && start<now+YEAR) out.push({...rule,start,end:actualEnd,active:start<=now});
  }
 }
 return out.sort((a,b)=>a.start-b.start);
}
export function countdown(ms:number) { const s=Math.max(0,Math.floor(ms/1000)); return `${Math.floor(s/86400)}日 ${String(Math.floor(s/3600)%24).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
