<?php

use App\Enums\StatusSolicitacao;

describe('StatusSolicitacao - Transições', function () {

    it('RECEBIDA pode transicionar para EM_ANALISE', function () {
        expect(StatusSolicitacao::RECEBIDA->podeTransicionarPara(StatusSolicitacao::EM_ANALISE))
            ->toBeTrue();
    });

    it('RECEBIDA pode transicionar para CANCELADA', function () {
        expect(StatusSolicitacao::RECEBIDA->podeTransicionarPara(StatusSolicitacao::CANCELADA))
            ->toBeTrue();
    });

    it('RECEBIDA NÃO pode transicionar para AGENDADA', function () {
        expect(StatusSolicitacao::RECEBIDA->podeTransicionarPara(StatusSolicitacao::AGENDADA))
            ->toBeFalse();
    });

    it('RECEBIDA NÃO pode transicionar para CONCLUIDA', function () {
        expect(StatusSolicitacao::RECEBIDA->podeTransicionarPara(StatusSolicitacao::CONCLUIDA))
            ->toBeFalse();
    });

    it('EM_ANALISE pode transicionar para AGENDADA', function () {
        expect(StatusSolicitacao::EM_ANALISE->podeTransicionarPara(StatusSolicitacao::AGENDADA))
            ->toBeTrue();
    });

    it('EM_ANALISE pode transicionar para CANCELADA', function () {
        expect(StatusSolicitacao::EM_ANALISE->podeTransicionarPara(StatusSolicitacao::CANCELADA))
            ->toBeTrue();
    });

    it('AGENDADA pode transicionar para CONCLUIDA', function () {
        expect(StatusSolicitacao::AGENDADA->podeTransicionarPara(StatusSolicitacao::CONCLUIDA))
            ->toBeTrue();
    });

    it('AGENDADA pode transicionar para CANCELADA', function () {
        expect(StatusSolicitacao::AGENDADA->podeTransicionarPara(StatusSolicitacao::CANCELADA))
            ->toBeTrue();
    });

    it('CONCLUIDA é status final - sem transições permitidas', function () {
        expect(StatusSolicitacao::CONCLUIDA->proximosPermitidos())->toBeEmpty();
        expect(StatusSolicitacao::CONCLUIDA->isFinal())->toBeTrue();
    });

    it('CANCELADA é status final - sem transições permitidas', function () {
        expect(StatusSolicitacao::CANCELADA->proximosPermitidos())->toBeEmpty();
        expect(StatusSolicitacao::CANCELADA->isFinal())->toBeTrue();
    });

    it('CONCLUIDA NÃO pode transicionar para nenhum status', function () {
        foreach (StatusSolicitacao::cases() as $status) {
            expect(StatusSolicitacao::CONCLUIDA->podeTransicionarPara($status))
                ->toBeFalse("Deveria ser falso para {$status->value}");
        }
    });

    it('CANCELADA NÃO pode transicionar para nenhum status', function () {
        foreach (StatusSolicitacao::cases() as $status) {
            expect(StatusSolicitacao::CANCELADA->podeTransicionarPara($status))
                ->toBeFalse("Deveria ser falso para {$status->value}");
        }
    });
});