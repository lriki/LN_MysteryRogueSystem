Window レイアウトのメモ
==========


### Window.height: number

ウィンドウ全体の高さ。

### Window.padding: number

上下左右の余白。(default: 12)

### Window.innerHeight: number

コンテンツ領域の高さ。(height - padding * 2)

### Window_Selectable.itemHeight 

次のアイテムとの余白も含めた高さ。(default: 44)

### Window_Scrollable.itemHeight 

アイテムの高さ。(default: 40)
Window_Selectable と異なり、余白は含めない。

### Window_Base.prototype.fittingHeight = function(numLines)

numLines を包含できるウィンドウの高さを求める。

### Layout

ツクールデフォルトの場合、レイアウトの最小単位は 12 で考えるといい感じに Grid できる。
