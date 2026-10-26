# SBINFO

Hypixel SkyBlock の日本語イベントガイド。TypeScript + Vite + Cloudflare Workers。デジタル庁デザインシステムの視認性、余白、リンク・フォーカス表現を参考にした独自実装です（公式コンポーネントの採用ではありません）。

## 開発

Node.js 24 / npm を使用します。

```sh
npm ci
npm test
npm run build
npm run preview
```

`npm run preview` は Workers と静的サイトをローカルで起動します。フロントエンドのみの開発は `npm run dev`。Vite単体では `/api/election` は利用できません。変更後は再ビルドしてください。

## 公開

Cloudflare Workers を推奨します。GitHub Pages は静的配信のため、APIのサーバー側キャッシュ・障害処理を同じアプリ内で管理できません。Workers は `/api/election` で公開Hypixel APIを取得し60秒キャッシュします。APIキーは不要です。

Cloudflare の認証済み端末で `npx wrangler login` → `npm run deploy`。または Cloudflare Workers Builds にこのGitHubリポジトリを接続し、ビルドに `npm ci && npm run build`、デプロイに `npx wrangler deploy` を指定します。認証情報はリポジトリに保存しないでください。公開はまだ実施していません。

公開後に `/api/election` が200で市長名・Perkを返すことを確認してください。開発環境から Hypixel API は403を返したため、実API成功時の動作は未検証です。通信先 `api.hypixel.net` の許可が必要です。障害時は503を返し、市長情報を推測表示しません。

## 拡張

- `src/events.ts`: UTC基準のゲーム暦、イベント定義、開催時間の純粋関数。定期イベントは `rules` に追加します。月は Early Spring=1 から Late Winter=12。1日=20分、1年=372日。
- `src/main.ts`: 一覧・フィルター・時刻表示・API読み込み。APIテキストは `textContent` で描画します。
- `worker/index.ts`: API境界。将来の Bazaar、Auctions などは別ルートと取得モジュールに分離してください。
- `tests/events.test.ts`: 年越し、イベント境界、選挙終了、Perkによる表示条件。

現在の市長固有イベント自動表示は Marina の Fishing Festival に対応しています。Diana、Cole、Foxy、副市長等の固有日程・追加開催や特別市長周期は未対応です。市長APIにはPerkが表示されますが、全イベントを網羅するものではありません。未来の市長変更は予測せず、表示される市長イベントは現在のPerkが続く場合の予定です。イベント定義のWikiリンクとゲーム内カレンダーを優先してください。

本サイトは Hypixel およびデジタル庁とは無関係です。
