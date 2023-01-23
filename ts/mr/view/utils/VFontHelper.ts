

export class VFontHelper {
    
    // .fontSize 設定済みであること
    public static measureTextSize(bitmap: Bitmap, text: string, fontSize?: number): [number, number] {
        const context = bitmap.context;
        context.save();
        context.font = (bitmap as any)._makeFontNameText();
        if (fontSize !== undefined) {
            bitmap.fontSize = fontSize;
        }
        const metrics = context.measureText(text);
        context.restore();

        const height =  metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        const ow =  bitmap.outlineWidth ?? 0;
        return [Math.ceil(metrics.width + ow), Math.ceil(height + ow)];
    }
}
