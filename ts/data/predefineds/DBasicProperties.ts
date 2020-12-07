


export interface EntityProperty {
    id: number;
    defaultValue: any;
}

// Entity の基本プロパティのうち、Behavior によってオーバーライドされることがあるもの。
// 特に、他の状態に依存して変わる可能性がある状態を返すために使う。
export interface EntityProperties {
    // Entity が Map に配置されるとき、どのレイヤーを基本とするか。
    // Ground, Unit, System のいずれか。
    // NOTE: Entity の種別等で決定できないので、フィールドで持たせている。
    //       - やりすごし状態は、自身をアイテム化する状態異常として表現する。（やり過ごしを投げ当てる他、技によってもやり過ごし状態になる）
    //       - アイテム擬態モンスターは正体を現しているかによってレイヤーが変わる。
    //       - 土偶は落とすとアイテム、立てるとUnitのようにふるまう
    homeLayer: number;
}


