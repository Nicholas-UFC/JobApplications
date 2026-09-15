import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CandidaturaService } from '../../core/services/candidatura.service';
import { PlataformaService } from '../../core/services/plataforma.service';
import { CandidaturaDialogComponent } from './candidatura-dialog.component';

const PLATAFORMAS = {
    items: [{ id: 2, nome: 'LinkedIn', ativo: true, site_url: 'https://linkedin.com' }],
    count: 1,
};

function preencherValido(component: CandidaturaDialogComponent): void {
    component['formulario'].controls.nome.setValue('Dev Frontend');
    component['formulario'].controls.empresa.setValue('Acme');
    component['formulario'].controls.plataforma_id.setValue(2);
    component['formulario'].controls.status.setValue('ENVIADO');
}

describe('CandidaturaDialogComponent', () => {
    let component: CandidaturaDialogComponent;
    let fixture: ComponentFixture<CandidaturaDialogComponent>;
    let service: CandidaturaService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CandidaturaDialogComponent],
            providers: [
                provideHttpClient(),
                provideRouter([]),
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CandidaturaDialogComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(CandidaturaService);
        const plataformas = TestBed.inject(PlataformaService);
        vi.spyOn(plataformas, 'listar').mockReturnValue(of(PLATAFORMAS));
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('deve exigir nome, empresa e plataforma', () => {
        expect(component['formulario'].invalid).toBe(true);
        preencherValido(component);
        expect(component['formulario'].valid).toBe(true);
    });

    it('não deve chamar o service com formulário inválido', () => {
        const spy = vi.spyOn(service, 'criar');
        component['salvar']();
        expect(spy).not.toHaveBeenCalled();
    });

    it('deve salvar e fechar o dialog', () => {
        vi.spyOn(service, 'criar').mockReturnValue(
            of({
                id: 1,
                nome: 'Dev Frontend',
                ativo: true,
                empresa: 'Acme',
                observacoes: '',
                plataforma_id: 2,
                status: 'ENVIADO' as const,
            }),
        );
        const fechar = vi.spyOn(component['dialogRef'], 'close');
        preencherValido(component);
        component['salvar']();
        expect(service.criar).toHaveBeenCalledWith({
            nome: 'Dev Frontend',
            empresa: 'Acme',
            plataforma_id: 2,
            status: 'ENVIADO',
            observacoes: '',
        });
        expect(fechar).toHaveBeenCalledWith(true);
    });
});

describe('CandidaturaDialogComponent em edição', () => {
    let component: CandidaturaDialogComponent;
    let fixture: ComponentFixture<CandidaturaDialogComponent>;
    let service: CandidaturaService;

    const CANDIDATURA = {
        id: 1,
        nome: 'Dev Frontend',
        ativo: true,
        empresa: 'Acme',
        observacoes: 'Remota',
        plataforma_id: 2,
        status: 'ENVIADO' as const,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CandidaturaDialogComponent],
            providers: [
                provideHttpClient(),
                provideRouter([]),
                { provide: MatDialogRef, useValue: { close: vi.fn() } },
                { provide: MAT_DIALOG_DATA, useValue: { candidatura: CANDIDATURA } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CandidaturaDialogComponent);
        component = fixture.componentInstance;
        service = TestBed.inject(CandidaturaService);
        const plataformas = TestBed.inject(PlataformaService);
        vi.spyOn(plataformas, 'listar').mockReturnValue(of(PLATAFORMAS));
        await fixture.whenStable();
    });

    it('deve pré-preencher com os dados salvos', () => {
        expect(component['modoEdicao']).toBe(true);
        expect(component['formulario'].value).toEqual({
            nome: 'Dev Frontend',
            empresa: 'Acme',
            plataforma_id: 2,
            status: 'ENVIADO',
            observacoes: 'Remota',
        });
    });

    it('deve atualizar preservando ativo e fechar o dialog', () => {
        vi.spyOn(service, 'atualizar').mockReturnValue(of({ ...CANDIDATURA, nome: 'Novo' }));
        const fechar = vi.spyOn(component['dialogRef'], 'close');
        component['formulario'].controls.nome.setValue('Novo');
        component['salvar']();
        expect(service.atualizar).toHaveBeenCalledWith(1, {
            nome: 'Novo',
            empresa: 'Acme',
            plataforma_id: 2,
            status: 'ENVIADO',
            observacoes: 'Remota',
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
