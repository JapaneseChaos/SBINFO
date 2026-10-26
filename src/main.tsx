import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from './components/dads/Button';
import { Select } from './components/dads/Select';
import { Heading, HeadingTitle } from './components/dads/Heading';
import { Link } from './components/dads/Link';
import { schedule, skyDate, countdown } from './events';
import './style.css';

type Mayor = { name: string; perks: string[]; fetchedAt: number };
const months = ['Early Spring', 'Spring', 'Late Spring', 'Early Summer', 'Summer', 'Late Summer', 'Early Autumn', 'Autumn', 'Late Autumn', 'Early Winter', 'Winter', 'Late Winter'];
const categories = ['すべて', '季節イベント', '選挙', '市長イベント'];
function App() {
  const [now, setNow] = useState(Date.now());
  const [category, setCategory] = useState('すべて');
  const [zone, setZone] = useState('Asia/Tokyo');
  const [mayor, setMayor] = useState<Mayor | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  async function load() {
    setStatus('loading');
    try {
      const response = await fetch('/api/election', { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('API unavailable');
      const body = await response.json();
      const value = body.data?.mayor;
      if (typeof value?.name !== 'string' || !Array.isArray(value.perks) || !Number.isFinite(body.fetchedAt)) throw new Error('Invalid response');
      setMayor({ name: value.name, perks: value.perks.filter((p: unknown): p is {name: string} => typeof p === 'object' && p !== null && 'name' in p && typeof p.name === 'string').map((p: {name: string}) => p.name), fetchedAt: body.fetchedAt });
      setStatus('ready');
    } catch {
      setMayor(null);
      setStatus('error');
    }
  }
  useEffect(() => {
    void load();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    const refresh = setInterval(() => void load(), 300000);
    return () => { clearInterval(clock); clearInterval(refresh); };
  }, []);
  const events = schedule(now, mayor?.perks ?? []);
  const visible = events.filter(event => category === 'すべて' || category === event.category);
  const election = events.find(event => event.id === 'election');
  const next = events.find(event => event.start > now);
  const date = skyDate(now);
  const format = (time: number) => new Intl.DateTimeFormat('ja-JP', { timeZone: zone, month: 'numeric', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(time);
  return <>
    <header className="site-header"><div className="header-inner"><a href="#main" className="site-name">SBINFO</a><span>Hypixel SkyBlock イベント情報</span><span className="unofficial">非公式サイト</span></div></header>
    <div className="page-layout">
      <aside className="page-index"><nav aria-label="このページの目次"><p>このページの内容</p><ul><li><Link href="#schedule">イベント予定</Link></li><li><Link href="#mayor">市長・選挙</Link></li><li><Link href="#information">掲載情報について</Link></li></ul></nav><p className="index-note">表示時刻は日本時間・UTCから選択できます。</p></aside>
      <main id="main" tabIndex={-1}>
        <div className="page-title"><Heading size="36"><HeadingTitle level="h1">イベント予定</HeadingTitle></Heading><p>開催日時と、開始・終了までの時間を確認できます。</p></div>
        <div className="game-date"><span>現在のゲーム内日時</span><strong>Year {date.year}　{months[date.month - 1]} {date.day}日</strong></div>
        <dl className="summary"><div><dt>次に始まるイベント</dt><dd><strong>{next?.name ?? '予定なし'}</strong><span className="countdown">{next ? countdown(next.start - now) : '—'}<small>後に開始</small></span></dd></div><div><dt>市長選挙</dt><dd><strong>{election?.active ? '投票受付中' : '次回の投票'}</strong><span className="countdown">{election ? countdown((election.active ? election.end : election.start) - now) : '—'}<small>{election?.active ? 'で締切' : '後に開始'}</small></span></dd></div></dl>
        <section id="schedule" aria-labelledby="schedule-heading">
          <Heading size="24"><HeadingTitle level="h2" id="schedule-heading">開催日程</HeadingTitle></Heading>
          <p className="section-intro">開催中のイベントと、今後1 SkyBlock年の予定です。</p>
          <div className="controls"><div><label htmlFor="category">イベントの種類</label><Select id="category" blockSize="md" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(value => <option key={value}>{value}</option>)}</Select></div><div><label htmlFor="timezone">表示する時間帯</label><Select id="timezone" blockSize="md" value={zone} onChange={e => setZone(e.target.value)}><option value="Asia/Tokyo">日本時間（JST）</option><option value="UTC">協定世界時（UTC）</option></Select></div></div>
          <p className="results" role="status">{visible.length}件<span>日時は{zone === 'Asia/Tokyo' ? '日本時間（UTC+9）' : 'UTC'}で表示</span></p>
          <p className="mobile-hint" id="scroll-hint">表は横にスクロールできます。</p>
          <div className="table-scroll" role="region" aria-label="イベントの開催日程" tabIndex={0} aria-describedby="scroll-hint"><table><caption className="sr-only">開催日程。ゲーム内暦による予定日時</caption><thead><tr><th scope="col">イベント</th><th scope="col">開催日時</th><th scope="col">開始・終了まで</th></tr></thead><tbody>{visible.map(event => <tr key={`${event.id}-${event.start}`}><th scope="row"><span className="event-category">{event.category}{event.active && <span className="active-status">開催中</span>}</span><Link href={event.source} target="_blank" rel="noreferrer">{event.name}</Link>{event.perk && <span className="condition">現在のPerkが続く場合の予定</span>}</th><td><time dateTime={new Date(event.start).toISOString()}>{format(event.start)}</time><span className="end-date">〜 <time dateTime={new Date(event.end).toISOString()}>{format(event.end)}</time></span></td><td><span className="remaining-label">{event.active ? '終了まで' : '開始まで'}</span><span className="table-countdown">{countdown((event.active ? event.end : event.start) - now)}</span></td></tr>)}</tbody></table></div>
          {!visible.length && <p className="empty">表示できるイベントがありません。市長固有イベントには市長情報の取得が必要です。</p>}
          <p className="table-note">イベント名から SkyBlock Wiki の詳細ページを開けます。臨時開催や日程変更は、ゲーム内カレンダーを確認してください。</p>
        </section>
        <section id="mayor" aria-labelledby="mayor-heading"><Heading size="28" rule="2"><HeadingTitle level="h2" id="mayor-heading">市長・選挙</HeadingTitle></Heading>
          <div className="mayor-status" role="status">{status === 'loading' ? '市長情報を取得しています。' : status === 'error' ? <><strong>市長情報を取得できませんでした</strong><p>時間をおいて再取得してください。定期イベントの予定は引き続き確認できます。</p></> : <>最終取得：{mayor && format(mayor.fetchedAt)}（5分ごとに更新）</>}</div>
          {mayor && <dl className="mayor-data"><div><dt>現在の市長</dt><dd>{mayor.name}</dd></div><div><dt>有効なPerk</dt><dd><ul>{mayor.perks.map((perk, index) => <li key={index}>{perk}</li>)}</ul></dd></div></dl>}
          <Button size="md" variant="outline" disabled={status === 'loading'} aria-disabled={status === 'loading'} onClick={() => void load()}>市長情報を再取得</Button>
          <p className="section-intro">市長固有の日程は、現在 Marina の Fishing Festival に対応しています。今後の当選者やPerkの変更は予測していません。</p>
        </section>
        <section id="information" aria-labelledby="info-heading"><Heading size="28" rule="2"><HeadingTitle level="h2" id="info-heading">掲載情報について</HeadingTitle></Heading><dl className="information-list"><div><dt>日時の算出</dt><dd>1日20分、1年372日のゲーム内暦から計算しています。表示は予定であり、開催を保証するものではありません。</dd></div><div><dt>市長情報</dt><dd>Hypixel 公式APIから取得しています。取得できない場合、市長固有イベントは表示しません。</dd></div><div><dt>未対応のイベント</dt><dd>Diana・Cole・Foxy、副市長による追加開催、特別市長周期や臨時イベントは未対応です。</dd></div></dl><Link href="https://wiki.hypixel.net/Calendar" target="_blank" rel="noreferrer">ゲーム内カレンダーについて（SkyBlock Wiki）</Link></section>
        <div className="back-top"><Link href="#main">ページの先頭へ戻る ↑</Link></div>
      </main>
    </div>
    <footer><div><strong>SBINFO</strong><p>Hypixel SkyBlock の非公式情報サイトです。Hypixel およびデジタル庁との提携はありません。</p><ul><li><Link href="https://github.com/JapaneseChaos/SBINFO">GitHub</Link></li><li><Link href="https://design.digital.go.jp/dads/">利用しているデザインシステム</Link></li><li><Link href="/dads-license.txt">コンポーネントのライセンス</Link></li></ul></div></footer>
  </>;
}
createRoot(document.getElementById('app')!).render(<App />);
