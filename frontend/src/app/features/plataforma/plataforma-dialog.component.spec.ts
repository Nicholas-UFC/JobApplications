import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PlataformaDialogComponent } from './plataforma-dialog.component';
import { PlataformaService } from '../../core/services/plataforma.service';

describe('PlataformaDialogComponent', () => {
    let component: PlataformaDialogComponent;
    let fixture: ComponentFixture<PlataformaDialogComponent>;
    let service: PlataformaService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlataformaDialogComponent],
            providers: [
                provideHttpClient(),
                provideRouter([]),
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlataformaDialogComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(PlataformaService);
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deve exigir nome', () => {
        expect(component['formulario'].invalid).toBe(true);
        component['formulario'].controls.nome.setValue('LinkedIn');
        expect(component['formulario'].valid).toBe(true);
    });

    it('não deve chamar o service com formulário inválido', () => {
        const spy = vi.spyOn(service, 'criar');
        component['salvar']();
        expect(spy).not.toHaveBeenCalled();
    });

    it('deve salvar e fechar o dialog', () => {
        vi.spyOn(service, 'criar').mockReturnValue(
            of({ id: 1, nome: 'LinkedIn', ativo: true, site_url: '' }),
        );
        const fechar = vi.spyOn(component['dialogRef'], 'close');
        component['formulario'].controls.nome.setValue('LinkedIn');
        component['salvar']();
        expect(service.criar).toHaveBeenCalledWith({ nome: 'LinkedIn', site_url: '' });
        expect(fechar).toHaveBeenCalledWith(true);
    });
});

describe('PlataformaDialogComponent em edição', () => {
    let component: PlataformaDialogComponent;
    let fixture: ComponentFixture<PlataformaDialogComponent>;
    let service: PlataformaService;

    const PLATAFORMA = { id: 1, nome: 'LinkedIn', ativo: true, site_url: 'https://linkedin.com' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlataformaDialogComponent],
            providers: [
                provideHttpClient(),
                provideRouter([]),
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: { plataforma: PLATAFORMA } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PlataformaDialogComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(PlataformaService);
        await fixture.whenStable();
    });

    it('deve pré-preencher com os dados salvos', () => {
        expect(component['modoEdicao']).toBe(true);
        expect(component['formulario'].value).toEqual({
            nome: 'LinkedIn',
            site_url: 'https://linkedin.com',
        });
    });

    it('deve atualizar preservando ativo e fechar o dialog', () => {
        vi.spyOn(service, 'atualizar').mockReturnValue(of({ ...PLATAFORMA, nome: 'Novo' }));
        const fechar = vi.spyOn(component['dialogRef'], 'close');
        component['formulario'].controls.nome.setValue('Novo');
        component['salvar']();
        expect(service.atualizar).toHaveBeenCalledWith(1, {
            nome: 'Novo',
            site_url: 'https://linkedin.com',
            ativo: true,
        });
        expect(fechar).toHaveBeenCalledWith(true);
    });

    it('não deve chamar atualizar com formulário inválido', () => {
        const spy = vi.spyOn(service, 'atualizar');
        component['formulario'].controls.nome.setValue('');
        component['salvar']();
        expect(spy).not.toHaveBeenCalled();
    });
});
