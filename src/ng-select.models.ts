export interface INgSelectItem {
    key: string;
    value: string;
    valueSecondary: string;
    selected: boolean;
}

export class NgSelectItem implements INgSelectItem {

    constructor(
        public key = '',
        public value = '',
        public valueSecondary = '',
        public selected = false
    ) { }
}