import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmacaoExclusaoDialogComponent } from './confirmacao-exclusao-dialog.component';

describe('ConfirmacaoExclusaoDialogComponent', () => {
    let component: ConfirmacaoExclusaoDialogComponent;
    let fixture: ComponentFixture<ConfirmacaoExclusaoDialogComponent>;
    let dialogRef: MatDialogRef<ConfirmacaoExclusaoDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmacaoExclusaoDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: { nome: 'LinkedIn' } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmacaoExclusaoDialogComponent);
        component = fixture.componentInstance;
        dialogRef = TestBed.inject(MatDialogRef);
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deve fechar com true ao confirmar', () => {
        component['confirmar']();
        expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('deve fechar com false ao cancelar', () => {
        component['cancelar']();
        expect(dialogRef.close).toHaveBeenCalledWith(false);
    });
});
