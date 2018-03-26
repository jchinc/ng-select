declare var _: any;

import {
    Component,
    OnInit,
    OnChanges,
    SimpleChanges,
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
export class NgSelectComponent implements OnInit, OnChanges {

    selectForm: FormGroup;

    dropdownVisible: boolean = false;

    filteredItems: Array<INgSelectItem> = [];

    itemAll: NgSelectItem;

    selectedItemsKeys = '';

    hoveredItem: INgSelectItem;
    private _hoveredItemIndex: number = -1;

    private _selectedItems: Array<INgSelectItem> = [];

    /**
     * Altura de los elementos de la caja de selección.
     */
    private _listItemHeight: number = 44;

    set term(value: string) {
        this.selectForm.get('term').setValue(value);
    }

    get term(): string {
        return this.selectForm.get('term').value;
    }

    @Input() source: Array<INgSelectItem> = [];

    @Input() top = 0;

    /**
     * Para permitir que funcione como un select de 1 sólo registro.
     */
    @Input() isMultiselect = false;

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

    @ViewChild('dropdownItems') private _dropdownItemsRef: ElementRef;

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
        this._createForm();
    }

    ngOnChanges(changes: SimpleChanges): void {

        // Si cambia el origen de datos del control se reinicia.
        if (changes['source']) {
            this._initialize();
        }
    }

    ngOnInit(): void {
        this._initialize();
    }

    /**
     * Selecciona el elemento indicado
     * @param item Elemento a seleccionar
     */
    selectItem(
        item: INgSelectItem
    ): void {

        // Deselecciona cualquier elemento seleccionado.
        if (!this.isMultiselect) {
            this.source.forEach(item => {
                item.selected = false;
            });
        }

        // Elemento seleccionado.
        item.selected = !item.selected;

        // Elementos seleccionados.
        this._setSelectedItems();

        // Inicializa el item sombreado con el teclado. Si se hubiese indicado alguno.
        this._hoveredItemIndex = -1;
        this.hoveredItem = null;

        if (!this.isMultiselect) {
            this._hideDropdown();
        }
    }

    toggleButtonClick(): void {
        if (this.dropdownVisible) {
            this._hideDropdown();
        } else {
            this._showDropdown();
        }
    }

    /**
     * Selecciona/desselecciona todos los registros filtrados.
     */
    selectUnselectAll(): void {
        this.itemAll.selected = !this.itemAll.selected;
        this.filteredItems.forEach(item => {
            item.selected = this.itemAll.selected;
        });
        // Elementos seleccionados.
        this._setSelectedItems();
    }

    clearTerm(): void {
        this.term = '';
        this._inputRef.nativeElement.focus();
    }

    inputKeyup(event: KeyboardEvent): void {

        let itemsLength = this.filteredItems.length;
        if (itemsLength === 0) {
            return;
        }

        switch (event.keyCode) {

            case 13:    // ENTER

                event.preventDefault();
                if (this.filteredItems.length > 0 && this._hoveredItemIndex !== -1) {
                    this.selectItem(this.hoveredItem)
                }
                break;

            case 38:    // UP

                if (this._hoveredItemIndex > 0) {
                    // Seleciona el elemento anterior.
                    this._hoveredItemIndex -= 1;
                } else {
                    // Selecciona último elemento.
                    this._hoveredItemIndex = itemsLength - 1;
                }
                this.hoveredItem = this.filteredItems[this._hoveredItemIndex];
                this._scrollToView(this._hoveredItemIndex);

                break;

            case 40:    // DOWN

                if (this._hoveredItemIndex < (itemsLength - 1)) {
                    // Selecciona siguiente elemento.
                    this._hoveredItemIndex += 1;
                } else {
                    // Selecciona primer elemento.
                    this._hoveredItemIndex = 0;
                }
                this.hoveredItem = this.filteredItems[this._hoveredItemIndex];
                this._scrollToView(this._hoveredItemIndex);

                break;
        }
    }

    private _initialize(): void {

        this.itemAll = new NgSelectItem('0', 'Seleccionar todo');

        this.term = '';

        this.selectedItemsKeys = this.toggleButtonText;

        // Inicializa los registros filtrados. Todos los items.
        this._filterData();

        // Marca o asigna elementos seleccionados.
        this._setSelectedItems();
    }

    private _createForm(): void {

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

    private _filterData(term?: string): void {

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

    private _match(
        item: INgSelectItem,
        term: string
    ): boolean {

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

    private _setSelectedItems(): void {

        // Número de registros seleccionados previamente.
        let selectedItemsLength = this._selectedItems.length;

        this._selectedItems = [];
        this.selectedItemsKeys = '';

        // Elementos seleccionados.
        this.source
            .filter(item => item.selected)
            .forEach(item => {
                this._selectedItems.push(item);
                if (this.isMultiselect) {
                    // Visualiza los registros seleccionados.
                    this.selectedItemsKeys =
                        this.selectedItemsKeys +
                        (this.selectedItemsKeys.length ? ',' : '') +
                        item.key;
                } else {
                    // Visualiza el texto del elemento seleccionado.
                    this.selectedItemsKeys = item.value;
                    selectedItemsLength = 0;
                }
            });

        // En caso de que no haya elemento seleccionado se coloca el texto especificado para el botón toggle.
        if (this._selectedItems.length === 0) {
            this.selectedItemsKeys = this.toggleButtonText;
        }

        // Indica un cambio de registros seleccionados.
        if (selectedItemsLength !== this._selectedItems.length) {
            this.selectedItemsChanged.emit(this._selectedItems);
        }
    }

    /**
     * Ajusta el scroll para visualizar el elemento actualmente seleccionado
     */
    private _scrollToView(index: number): void {

        if (!this._dropdownItemsRef) {
            return;
        }

        const dropdownItems = this._dropdownItemsRef.nativeElement;
        const scrollTop = dropdownItems.scrollTop;
        const viewport = scrollTop + dropdownItems.offsetHeight;
        const scrollOffset = this._listItemHeight * index;
        // scrollOffset < scrollTop : Cuando el elemento seleccionado esté por arriba del espacio desplazado.
        // (scrollOffset + this.listItemHeight) > viewport  : Cuando el elemento seleccionado esté por abajo del espacio desplazado + altura del espacio de visualización.
        if (scrollOffset < scrollTop || (scrollOffset + this._listItemHeight) > viewport) {
            dropdownItems.scrollTop = scrollOffset;
        }
    }
}