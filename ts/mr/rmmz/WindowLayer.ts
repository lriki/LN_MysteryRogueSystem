import { paramDisableWindowStencil } from "../PluginParameters";

const _WindowLayer_prototype_render = WindowLayer.prototype.render;
WindowLayer.prototype.render = function(renderer) {
    if (paramDisableWindowStencil) {
        // NOTE: 元々は TilemapWindow が背面になっても全面ウィンドウを透過して見えるようにするため
        //       this._isWindow = false; を使っていた。
        //       しかし元の WindowLayer.render ではこのフラグによって描画順が変わってしまうため、
        //       単に _isWindow = false しただけだと常に TilemapWindow が最前面になってしまう。
        if (!this.visible) {
            return;
        }
        for (const child of this.children) {
            if (child.visible) {
                (child as any).render(renderer);
            }
        }
        renderer.batch.flush();
    }
    else {
        _WindowLayer_prototype_render.call(this, renderer);
    }
};
