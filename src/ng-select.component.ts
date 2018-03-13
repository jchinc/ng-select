declare var _: any;

import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
    HostListener,
    Renderer2
} from '@angular/core';
import {
    FormBuilder,
    FormGroup
} from '@angular/forms';

import { INgSelectItem, NgSelectItem } from './ng-select.models';

@Component({
    selector: 'ng-select',
    templateUrl: './ng-select.component.html',
    styleUrls: ['./ng-select.component.css']
})
export class NgSelectComponent implements OnInit {

    selectForm: FormGroup;

    dropdownVisible: boolean = false;

    filteredItems: Array<INgSelectItem> = [];

    itemAll: NgSelectItem;

    selectedItemsKeys = '';

    private _hoveredItemIndex: number = -1;

    private set _term(value: string) {
        this.selectForm.get('term').setValue(value);
    }

    private get _term(): string {
        return this.selectForm.get('term').value;
    }

    @Input() source: Array<INgSelectItem> = [];

    @Input() top = 0;

    @Input() inputSearchPlaceHolder = 'Buscar';

    @Input() disabled = false;

    @Input() toggleButtonText = '';

    @Input() noRowsText = 'No existen registros';

    @Input() accentInsensitive = false;

    @Input() toggleButtonClasses: Array<string> = [];

    @Output() selectedItemsChanged = new EventEmitter<Array<INgSelectItem>>();

    @Output() selectedItemsKeysChanged = new EventEmitter<string>();

    @ViewChild('container') private _containerRef: ElementRef;

    @ViewChild('dropdown') private _dropdownRef: ElementRef;

    @ViewChild('input') private _inputRef: ElementRef;

    /**
     * Evento click del documento para determinar si se oculta el dropdown de elementos.
     * @param event Evento click del mouse
     */
    @HostListener('document:click', ['$event'])
    documentClick(event: MouseEvent): void {

        if (!event.target) {
            return;
        }

        // Verifica si el elemento donde se realizó el evento está contenido en el elemento HOST de la directiva.
        let contains = this._containerRef.nativeElement.contains(event.target);
        if (!contains) {
            this._hideDropdown();
        }
    }

    /**
     * Evento tecla ESCAPE del documento para determinar si se oculta el dropdown de elementos.
     * @param event Evento tecla
     */
    @HostListener('document:keyup', ['$event'])
    documentKeyup(event: KeyboardEvent): void {

        // Tecla SCAPE.
        if (event.keyCode === 27) {
            this._hideDropdown();
        }
    }

    constructor(
        private _renderer: Renderer2,
        private _formBuilder: FormBuilder
    ) {

        this.selectedItemsKeys = this.toggleButtonText;

        this.itemAll = new NgSelectItem('0', 'Seleccionar todo');

        this._createForm();
    }

    ngOnInit(): void {
        this._filterData();
    }

    /**
     * Selecciona el elemento indicado
     * @param item Elemento a seleccionar
     */
    selectItem(
        item: INgSelectItem
    ) {
        item.selected = !item.selected;
        this._emitSelectedItemsChanged();
    }

    toggleButtonClick(): void {
        if (this.dropdownVisible) {
            this._hideDropdown();
        } else {
            this._showDropdown();
        }
    }

    selectUnselectAll(): void {
        this.itemAll.selected = !this.itemAll.selected;
        this.source.forEach(item => {
            item.selected = this.itemAll.selected;
        });
        this._emitSelectedItemsChanged();
    }

    private _createForm() {

        // Control para captura. Término de búsqueda.
        let term = this._formBuilder.control('');
        term.valueChanges
            .debounceTime(50)
            .subscribe(value => {
                this._filterData(value);
            });

        // Formulario.
        this.selectForm = this._formBuilder.group({
            term: term
        });
    }

    private _filterData(term?: string) {

        // Límite de registros filtrados.
        let top = (this.top > 0) ? this.top : this.source.length;

        // En caso de que el término de búsqueda sea vacío, devuelve toda la lista original (limitado por top si aplica).
        if (!term) {
            this.filteredItems = this.source.slice(0, top);
            return;
        }

        this.filteredItems.length = 0;
        for (let item of this.source) {

            // Verifica si el término de búsqueda corresponde con alguno de los campos (value y campos adicionales de búsqueda).
            if (this._match(item, term)) {
                this.filteredItems.push(item);
            }

            // Verifica si los registros filtrados han llegado al límite establecido.
            // Dejaría de verificar registros coincidentes.
            if (this.filteredItems.length === top) {
                break;
            }
        }
    }

    private _match(item: INgSelectItem, term: string): boolean {

        // Por defecto el registro no coincide.
        let match = false;

        // Variable local para optimizar proceso.
        const localTerm = this.accentInsensitive ? _.deburr(term.toLowerCase()) : term.toLowerCase();

        // Verifica si corresponde con el campo value del item.
        const localItemValue = this.accentInsensitive ? _.deburr(item.value.toLowerCase()) : item.value.toLowerCase();
        if (localItemValue.indexOf(localTerm) !== -1) {
            match = true;
        }

        //Verifica los campos adicionales de búsqueda. Sólo llegaría a ésta búsqueda si el campo valor NO coincide.
        else if (item.filters) {
            for (let filter of item.filters) {
                // No considera valores vacíos.
                if (!filter) {
                    continue;
                }
                const filterValue = (this.accentInsensitive ? _.deburr(filter.toLowerCase()) : filter.toLowerCase());
                if (filterValue.indexOf(localTerm) !== -1) {
                    // Retornaría que sí coincide la búsqueda en caso de que algún valor de filtro coíncida.
                    match = true;
                    break;
                }
            }
        }

        return match;
    }

    private _showDropdown(): void {
        this.dropdownVisible = true;
        this._renderer.setStyle(this._dropdownRef.nativeElement, 'display', 'flex');
        this._inputRef.nativeElement.focus();
    }

    private _hideDropdown(): void {
        this.dropdownVisible = false;
        this._renderer.setStyle(this._dropdownRef.nativeElement, 'display', 'none');
    }

    private _emitSelectedItemsChanged(): void {

        let selectedItems: Array<INgSelectItem> = [];
        this.selectedItemsKeys = '';

        this.source
            .filter(item => item.selected)
            .forEach(item => {
                selectedItems.push(item);
                // Visualiza los registros seleccionados.
                this.selectedItemsKeys =
                    this.selectedItemsKeys +
                    (this.selectedItemsKeys.length ? ',' : '') +
                    item.key;
            });

        // Envía los registros seleccionados.
        this.selectedItemsChanged.emit(selectedItems);
        this.selectedItemsKeysChanged.emit(this.selectedItemsKeys);
    }
}