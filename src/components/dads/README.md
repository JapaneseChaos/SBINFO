# デジタル庁デザインシステムのコードスニペット

Button、Select、Heading、Link、および依存する Slot を公式リポジトリから取り込んでいます。コンポーネント本体は改変していません。

- 出典: https://github.com/digital-go-jp/design-system-example-components
- 取得コミット: `e637c6820a8ceb5b1c28719e3260afdab89c2b57`
- 上流 package.json のバージョン: 2.7.0
- ライセンス: MIT、Copyright (c) 2025 デジタル庁
- ライセンス全文: [`public/dads-license.txt`](../../../public/dads-license.txt)

スタイルは `@digital-go-jp/tailwind-theme-plugin` と Tailwind CSS 3 で生成します。アプリ側のCSSではコンポーネントの内部スタイルを置き換えず、配置と周辺の余白を指定しています。テーブルは公式 `Table.stories.tsx` の説明に従い、標準のHTML要素で実装しています。

更新時は上流との差分とライセンスを確認し、取得コミットを更新してください。
