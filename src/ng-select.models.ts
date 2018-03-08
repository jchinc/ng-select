export interface INgSelectItem {
    key: string;
    value: string;
}

export class NgSelectItem implements INgSelectItem {

    constructor(
        public key = '',
        public value = ''
    ) { }
}