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

    hoveredItem: INgSelectItem;

    private _hoveredItemIndex: number = -1;


    private set _term(value: string) {
        this.selectForm.get('term').setValue(value);
    }

    private get _term(): string {
        return this.selectForm.get('term').value;
    }

    @Input() source: Array<INgSelectItem> = [];

    @Input() top = 0;

    @Input() inputClasses: string[] = [];

    @Input() inputPlaceHolder = '';

    @Input() disabled = false;

    @Input() noRowsText = 'No existen registros';

    @Input() listItemHeight = 50;

    @Input() accentInsensitive = false;

    @Input() clearAfterSelect = true;

    @Input() isMultiselect = false;

    @Output() selectedItem = new EventEmitter<INgSelectItem>();

    @Output() inputFocused = new EventEmitter<any>();

    @Output() inputBlurred = new EventEmitter<any>();

    @Output() tabPressed = new EventEmitter<any>();

    @ViewChild('container') private _containerRef: ElementRef;

    @ViewChild('dropdown') private _dropdownRef: ElementRef;

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

    constructor(
        private _renderer: Renderer2,
        private _formBuilder: FormBuilder
    ) {
        this.itemAll = new NgSelectItem('0', 'Seleccionar todo');

        this._createForm();
    }

    ngOnInit(): void {
        this._filterData();
    }

    inputFocus(event: any) {
        this.dropdownVisible = true;
        this.inputFocused.emit();
    }

    inputBlur() {
        if (this.isMultiselect) {
            return;
        }
        this.dropdownVisible = false;
        this.inputBlurred.emit();
    }

    inputClick() {
        this.dropdownVisible = true;
    }

    inputKeydown(event: any): void {
        // TAB.
        if (event.keyCode === 9) {
            this.tabPressed.emit(event);
        }
    }

    inputKeyup(event: any) {

        // TAB.
        if (event.keyCode === 9) {
            return;
        }

        this.dropdownVisible = true;

        let itemsLength = this.filteredItems.length;
        if (itemsLength === 0) {
            return;
        }

        switch (event.keyCode) {
            case 9: // TAB

                // if (this.filteredItems.length > 0 && this.hoveredItemIndex !== -1) {
                //     this.selectItem(this.filteredItems[this.hoveredItemIndex])
                // }
                break;

            case 13:    // ENTER

                event.preventDefault();
                if (this.filteredItems.length > 0 && this._hoveredItemIndex !== -1) {
                    this.selectItem(this.filteredItems[this._hoveredItemIndex])
                }
                break;

            case 27:    // ESCAPE

                this.dropdownVisible = false;
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
                this.scrollToView(this._hoveredItemIndex);

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
                this.scrollToView(this._hoveredItemIndex);

                break;
        }
    }

    /**
     * Selecciona el elemento indicado
     * @param item Elemento a seleccionar
     * @param event Evento mousedown para el caso de que se seleccione con un click en la lista
     */
    selectItem(
        item: INgSelectItem,
        event: any = null
    ) {

        item.selected = !item.selected;

        this.selectedItem.emit(item);
    }

    /**
     * Evento mouseup sobre un elemento de la lista
     * @param event Evento del mouse.
     */
    itemMouseup(event: any) {

        console.log(this.isMultiselect);

        if (this.isMultiselect) {
            return;
        }

        // Se oculta la lista después de levantar el click para evitar que al desaparecer la lista el click afecte a otro elemento.
        this.dropdownVisible = false;
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

        // Verifica los campos adicionales de búsqueda. Sólo llegaría a ésta búsqueda si el campo valor NO coincide.
        // else if (item.filters) {
        //     for (let filter of item.filters) {
        //         // No considera valores vacíos.
        //         if (!filter) {
        //             continue;
        //         }
        //         const filterValue = (this.accentInsensitive ? _.deburr(filter.toLowerCase()) : filter.toLowerCase());
        //         if (filterValue.indexOf(localTerm) !== -1) {
        //             // Retornaría que sí coincide la búsqueda en caso de que algún valor de filtro coíncida.
        //             match = true;
        //             break;
        //         }
        //     }
        // }

        return match;
    }

    /**
     * Ajusta el scroll para visualizar el elemento actualmente seleccionado
     */
    private scrollToView(index: number) {

        if (!this._dropdownRef) {
            return;
        }

        const ul = this._dropdownRef.nativeElement;
        const scrollTop = ul.scrollTop;
        const viewport = scrollTop + ul.offsetHeight;
        const scrollOffset = this.listItemHeight * index;
        // scrollOffset < scrollTop : Cuando el elemento seleccionado esté por arriba del espacio desplazado.
        // (scrollOffset + this.listItemHeight) > viewport  : Cuando el elemento seleccionado esté por abajo del espacio desplazado + altura del espacio de visualización.
        if (scrollOffset < scrollTop || (scrollOffset + this.listItemHeight) > viewport) {
            ul.scrollTop = scrollOffset;
        }
    }

    toggleButtonClick(): void {
        if (this.dropdownVisible) {
            this._hideDropdown();
        } else {
            this._showDropdown();
        }
    }

    itemAllClick(): void {
        this.itemAll.selected = !this.itemAll.selected;
        this.source.forEach(item => {
            item.selected = this.itemAll.selected;
        });
    }

    private _showDropdown() {
        this.dropdownVisible = true;
        this._renderer.setStyle(this._dropdownRef.nativeElement, 'display', 'block');
    }

    private _hideDropdown() {
        this.dropdownVisible = false;
        this._renderer.setStyle(this._dropdownRef.nativeElement, 'display', 'none');
    }
}