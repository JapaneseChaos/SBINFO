# SBINFO

Hypixel SkyBlock のイベント予定を日本語で確認する非公式サイトです。開催日時、開始・終了までの時間、市長と有効なPerkを表示します。

## 表示できる情報

| 情報 | 取得・算出方法 |
| --- | --- |
| 市長選挙の投票期間 | ゲーム内暦から計算 |
| Spooky Festival、Jerry’s Workshop、Season of Jerry、New Year Celebration | ゲーム内暦から計算 |
| 現在の市長とPerk | Hypixel公式APIから取得 |
| Marina の Fishing Festival | APIで対象Perkを確認できた場合に表示 |

表示時刻は日本時間（JST）とUTCを切り替えられます。イベント名から SkyBlock Wiki の詳細ページを開けます。

日時は予定です。運営による変更や臨時開催については、ゲーム内カレンダーを優先してください。Diana・Cole・Foxy、副市長による追加開催、特別市長周期は未対応です。市長固有イベントの将来日程は、現在のPerkが続く場合の予定であり、次の当選者を予測したものではありません。

## デザインとコンポーネント

[デジタル庁デザインシステム（DADS）](https://design.digital.go.jp/dads/)の公式Reactコードスニペットを使用しています。

- 使用コンポーネント：Button、Select、Heading、Link、Slot
- スタイル生成：公式 `@digital-go-jp/tailwind-theme-plugin` と Tailwind CSS 3
- テーブル：公式サンプルに従い、見出しセルを持つHTMLテーブルで実装
- 画面構成：ページ内目次、開催日程、市長・選挙、情報の出典と対応範囲

取り込んだコードの出典・コミットは [`src/components/dads/README.md`](src/components/dads/README.md)、MITライセンス全文は [`public/dads-license.txt`](public/dads-license.txt) に記載しています。サイト全体のDADS適合やアクセシビリティ認証を示すものではありません。

## ローカルで動かす

Node.js 24 と npm を使用します。

```bash
npm ci
npm run build
npm run preview
```

Wrangler が表示するローカルURLを開きます。`preview` は静的ファイルと `/api/election` の両方を配信します。変更後は再ビルドしてください。

画面だけを編集する場合は `npm run dev` を使用できます。Vite単体では市長APIを配信しないため、市長情報は取得エラーになります。

設定ディレクトリへの書き込みが制限されたCodex環境では、次のように起動します。

```bash
XDG_CONFIG_HOME=/workspace/.config npm run preview
```

### 検証

```bash
npm test                       # ゲーム内暦・イベント境界のテスト
npm run build                  # 型検査と本番ビルド
npx playwright install chromium
npm run test:browser            # フィルター、時差、API障害・再取得、モバイル、キーボード操作
```

ブラウザテストのAPI応答にはテストデータを使用します。Hypixelへの実際の疎通を確認するテストではありません。

## Cloudflare Workers へ公開する

Workers が画面とAPIを同じドメインから配信します。GitHub Pages の静的配信だけでは、現在のAPIルートを実行できません。

### GitHub連携で公開

Cloudflare の **Workers & Pages** からWorkerを作成し、このリポジトリを接続します。

| 設定 | 値 |
| --- | --- |
| 本番ブランチ | `main` |
| ルートディレクトリ | リポジトリ直下 |
| ビルドコマンド | `npm ci && npm run build` |
| デプロイコマンド | `npx wrangler deploy` |
| Node.js | `24`（環境変数 `NODE_VERSION`） |

Worker名は `sbinfo` です。入口 `worker/index.ts` と静的ファイルの出力先 `dist` は `wrangler.jsonc` に設定しています。接続後は `main` へのpushで更新されます。

### 手元から公開

```bash
npx wrangler login
npm run deploy
```

成功すると公開URLが表示されます。独自ドメインはWorkerの Domains & Routes から設定できます。Codexの環境のPublish操作とは別の手順です。

### 公開後の確認

1. 公開URLで開催日程と時刻切り替えを確認します。
2. `/api/election` がHTTP 200を返し、画面に市長名とPerkが表示されることを確認します。
3. エラーの場合はWorkersのログと上流APIへの接続を確認します。

Hypixel APIキーは不要です。接続先は `https://api.hypixel.net/v2/resources/skyblock/election`。Worker側で60秒キャッシュし、画面は5分ごとに取得します。上流への接続失敗時はHTTP 503を返し、市長固有イベントの表示を停止します。

開発環境ではHypixelへの通信が403となったため、実APIからの取得成功は未確認です。

## コードの構成

| パス | 役割 |
| --- | --- |
| `src/events.ts` | ゲーム内暦、イベント定義、開催時間の計算 |
| `src/main.tsx` | 画面、フィルター、市長情報の取得 |
| `src/style.css` | レイアウトとサイト固有のスタイル |
| `src/components/dads/` | 公式コンポーネントのコード |
| `worker/index.ts` | Hypixel APIの取得とエラー処理 |
| `tests/events.test.ts` | イベント計算のテスト |
| `tests/browser/` | 画面操作のテスト |

定期イベントは `src/events.ts` の `rules` に追加します。日付は Early Spring を1月、Late Winterを12月として定義し、1日を20分、1年を372日として計算します。新しい開催条件を加える場合は、開始・終了の境界と年越しをテストしてください。

市長固有イベントは必要なPerkを `perk` に指定します。副市長や臨時開催など、現在の定義で表せない条件には計算処理の追加が必要です。

---

SBINFO は Hypixel およびデジタル庁と提携していません。
