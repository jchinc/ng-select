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
import { classes } from './ng-select.constants';

@Component({
    selector: 'ng-select',
    templateUrl: './ng-select.component.html',
    styleUrls: ['./ng-select.component.css']
})
export class NgSelectComponent implements OnInit, OnChanges {

    selectForm: FormGroup;

    filteredItems: Array<INgSelectItem> = [];

    itemSelectAll: NgSelectItem;

    selectedItemsKeys = '';

    selectedItem: INgSelectItem;

    hoveredItem: INgSelectItem;

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

    /**
     * ---------------------------------------------------------------------------------
     * Variables INPUT
     * ---------------------------------------------------------------------------------
     */

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

    @Input() maxItemsVisible = 7;

    /**
     * ---------------------------------------------------------------------------------
     * Variables OUTPUT
     * ---------------------------------------------------------------------------------
     */

    @Output() selectedItemChanged = new EventEmitter<INgSelectItem>();

    @Output() selectedItemsChanged = new EventEmitter<Array<INgSelectItem>>();

    @Output() selectedItemsKeysChanged = new EventEmitter<string>();

    /**
     * ---------------------------------------------------------------------------------
     * Variables VIEWCHILD
     * ---------------------------------------------------------------------------------
     */

    @ViewChild('container') private _containerRef: ElementRef;
    private get _container(): HTMLElement {
        return this._containerRef.nativeElement;
    }

    @ViewChild('input') private _inputRef: ElementRef;
    private get _input(): HTMLElement {
        return this._inputRef.nativeElement;
    }

    @ViewChild('dropdown') private _dropdownRef: ElementRef;
    private get _dropdown(): HTMLElement {
        return this._dropdownRef.nativeElement;
    }

    @ViewChild('dropdownItems') private _dropdownItemsRef: ElementRef;
    private get _dropdownItems(): HTMLElement {
        return this._dropdownItemsRef.nativeElement;
    }

    /**
     * ---------------------------------------------------------------------------------
     * Eventos del HOST
     * ---------------------------------------------------------------------------------
     */

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
        let contains = this._container.contains(<Node>event.target);
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

    /**
     * ---------------------------------------------------------------------------------
     * Sección del COMPONENTE
     * ---------------------------------------------------------------------------------
     */

    constructor(
        private _renderer: Renderer2,
        private _formBuilder: FormBuilder
    ) {
        this._createForm();
    }

    ngOnChanges(changes: SimpleChanges): void {

        // Si cambia el origen de datos del control se reinicia.
        if (changes['source'] || changes['isMultiselect']) {
            this._initialize();
        }

        if (changes['maxItemsVisible']) {
            if (!this.maxItemsVisible) {
                this.maxItemsVisible = 7;
            }
            this._setContainerMaxHeight();
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

        // Selección única
        if (!this.isMultiselect) {

            // Visualiza el texto del elemento seleccionado.
            this.selectedItemsKeys = item.value;

            // Oculta dropdown.
            this._hideDropdown();

            // Indica que se seleccionó otro elemento.
            if (item !== this.selectedItem) {
                this.selectedItemChanged.emit(item);
            }

            // Item seleccionado.
            this.selectedItem = item;

        }
        // Selección múltiple
        else {

            // Elemento seleccionado.
            item.selected = !item.selected;

            // Elementos seleccionados.
            this._setSelectedItems();
        }
    }

    toggleButtonClick(): void {
        if (this._dropdown.classList.contains(classes.DROPDOWN_SHOWN)) {
            this._hideDropdown();
        } else {
            this._showDropdown();
        }
    }

    /**
     * Selecciona/desselecciona todos los registros filtrados.
     */
    selectUnselectAll(): void {
        this.itemSelectAll.selected = !this.itemSelectAll.selected;
        this.filteredItems.forEach(item => {
            item.selected = this.itemSelectAll.selected;
        });
        // Elementos seleccionados.
        this._setSelectedItems();
    }

    clearTerm(): void {
        this.term = '';
        this._input.focus();
    }

    inputKeyup(event: KeyboardEvent): void {

        let itemsLength = this.filteredItems.length;
        if (itemsLength === 0) {
            return;
        }

        let hoveredItemIndex = -1;
        if (this.hoveredItem) {
            hoveredItemIndex = this.filteredItems.indexOf(this.hoveredItem);
        }

        switch (event.keyCode) {

            case 13:    // ENTER

                event.preventDefault();
                if (this.filteredItems.length > 0 && this.hoveredItem) {
                    this.selectItem(this.hoveredItem)
                }
                break;

            case 38:    // UP

                if (hoveredItemIndex > 0) {
                    // Seleciona el elemento anterior.
                    hoveredItemIndex -= 1;
                } else {
                    // Selecciona último elemento.
                    hoveredItemIndex = itemsLength - 1;
                }
                this.hoveredItem = this.filteredItems[hoveredItemIndex];
                this._scrollToView(hoveredItemIndex);

                break;

            case 40:    // DOWN

                if (hoveredItemIndex < (itemsLength - 1)) {
                    // Selecciona siguiente elemento.
                    hoveredItemIndex += 1;
                } else {
                    // Selecciona primer elemento.
                    hoveredItemIndex = 0;
                }
                this.hoveredItem = this.filteredItems[hoveredItemIndex];
                this._scrollToView(hoveredItemIndex);

                break;
        }
    }

    private _initialize(): void {

        this.term = '';
        this._setContainerMaxHeight();
        this.selectedItemsKeys = this.toggleButtonText;

        // Inicializa los registros filtrados. Todos los items.
        this._filterData();

        if (this.isMultiselect) {

            this.itemSelectAll = new NgSelectItem('0', 'Seleccionar todo');

            this.source.forEach(item => {
                item.selected = false;
            });

            // Marca o asigna elementos seleccionados.
            this._setSelectedItems();

        } else {
            this.selectedItem = null;
        }
    }

    private _setContainerMaxHeight() {
        this._renderer.setStyle(this._dropdown, 'max-height', `${this._listItemHeight * (this.maxItemsVisible + 1)}px`)
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

        this._renderer.addClass(this._dropdown, classes.DROPDOWN_SHOWN);
        this._input.focus();

        setTimeout(() => {
            // Cuando NO sea mutiselect, se visualiza el elemento seleccionado.
            if (!this.isMultiselect && this.selectedItem) {

                let index = this.filteredItems.indexOf(this.selectedItem);
                this._scrollToView(index);

                // 
                this.hoveredItem = this.selectedItem;
            }
        }, 0);
    }

    private _hideDropdown(): void {
        
        // Inicializa el item sombreado con el teclado. Si se hubiese indicado alguno.
        this.hoveredItem = null;

        // Oculta el contenedor de items.
        this._renderer.removeClass(this._dropdown, classes.DROPDOWN_SHOWN);
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
                // Visualiza los registros seleccionados.
                this.selectedItemsKeys =
                    this.selectedItemsKeys +
                    (this.selectedItemsKeys.length ? ',' : '') +
                    item.key;
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

        const dropdownItems = this._dropdownItems;

        // Posición o distancia recorrida del scroll (parte superior del contenido).
        const scrollTop = dropdownItems.scrollTop;

        // Altura del contenedor + distancia recorrida del scroll.
        // Para verificar si el elemento seleccionado está por debajo de éste (incluyendo la altura del item).
        const viewport = dropdownItems.offsetHeight + scrollTop;

        // Posición superior del elemento seleccionado con respecto a su índice.
        const selectedItemTop = this._listItemHeight * index;

        // Posición inferior del elemento seleccionado con respecto a su índice.
        const selectedItemBottom = selectedItemTop + this._listItemHeight;

        // Cuando el elemento seleccionado esté por arriba del espacio desplazado.
        if (selectedItemTop < scrollTop) {
            dropdownItems.scrollTop = selectedItemTop;
        }
        // Cuando el elemento seleccionado esté por abajo del espacio desplazado + altura del espacio de visualización.
        // -1 debido al borde.
        else if (selectedItemBottom > viewport) {
            dropdownItems.scrollTop = selectedItemBottom - dropdownItems.offsetHeight - 1;
        }
    }
}