<?php

use App\Enums\StatusSolicitacao;
use App\Models\Solicitacao;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

// =============================================================================
// POST /api/v1/solicitacoes - Criação
// =============================================================================

describe('POST /api/v1/solicitacoes', function () {

    it('cria uma solicitação com dados válidos', function () {
        $response = $this->postJson('/api/v1/solicitacoes', [
            'nome_solicitante' => 'Maria Silva',
            'categoria'        => 'CONSULTA',
            'prioridade'       => 'MEDIA',
            'descricao'        => 'Solicitação de consulta de rotina.',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'RECEBIDA')
            ->assertJsonPath('data.nome_solicitante', 'Maria Silva')
            ->assertJsonStructure(['data' => ['id', 'protocolo', 'status', 'data_criacao']]);

        $this->assertDatabaseHas('solicitacoes', [
            'nome_solicitante' => 'Maria Silva',
            'status'           => 'RECEBIDA',
        ]);
    });

    it('gera protocolo único automaticamente', function () {
        $r1 = $this->postJson('/api/v1/solicitacoes', dadosValidos());
        $r2 = $this->postJson('/api/v1/solicitacoes', dadosValidos());

        $r1->assertStatus(201);
        $r2->assertStatus(201);

        expect($r1->json('data.protocolo'))->not->toBe($r2->json('data.protocolo'));
    });

    it('sempre cria com status RECEBIDA, ignorando status enviado', function () {
        $response = $this->postJson('/api/v1/solicitacoes', [
            ...dadosValidos(),
            'status' => 'CONCLUIDA', // deve ser ignorado
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'RECEBIDA');
    });

    it('rejeita criação sem campos obrigatórios', function () {
        $this->postJson('/api/v1/solicitacoes', [])
            ->assertStatus(422)
            ->assertJsonStructure(['errors' => ['nome_solicitante', 'categoria', 'prioridade', 'descricao']]);
    });

    it('rejeita categoria inválida', function () {
        $this->postJson('/api/v1/solicitacoes', [
            ...dadosValidos(),
            'categoria' => 'CIRURGIA',
        ])->assertStatus(422)
          ->assertJsonStructure(['errors' => ['categoria']]);
    });

    it('exige justificativa quando prioridade é URGENTE', function () {
        $this->postJson('/api/v1/solicitacoes', [
            ...dadosValidos(),
            'prioridade'              => 'URGENTE',
            'justificativa_prioridade'=> null,
        ])->assertStatus(422)
          ->assertJsonStructure(['errors' => ['justificativa_prioridade']]);
    });

    it('cria solicitação URGENTE com justificativa preenchida', function () {
        $this->postJson('/api/v1/solicitacoes', [
            ...dadosValidos(),
            'prioridade'              => 'URGENTE',
            'justificativa_prioridade'=> 'Paciente com dor intensa e febre alta.',
        ])->assertStatus(201)
          ->assertJsonPath('data.prioridade', 'URGENTE');
    });
});

// =============================================================================
// GET /api/v1/solicitacoes - Listagem
// =============================================================================

describe('GET /api/v1/solicitacoes', function () {

    it('retorna lista paginada', function () {
        Solicitacao::factory()->count(5)->create();

        $this->getJson('/api/v1/solicitacoes')
            ->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'protocolo', 'status']],
                'meta' => ['total', 'per_page', 'current_page'],
            ]);
    });

    it('filtra por status', function () {
        Solicitacao::factory()->count(3)->create(['status' => 'RECEBIDA']);
        Solicitacao::factory()->count(2)->create(['status' => 'AGENDADA']);

        $response = $this->getJson('/api/v1/solicitacoes?status=RECEBIDA');

        $response->assertStatus(200);
        expect($response->json('meta.total'))->toBe(3);
        collect($response->json('data'))->each(
            fn($s) => expect($s['status'])->toBe('RECEBIDA')
        );
    });

    it('filtra por categoria', function () {
        Solicitacao::factory()->count(2)->create(['categoria' => 'EXAME']);
        Solicitacao::factory()->count(3)->create(['categoria' => 'CONSULTA']);

        $response = $this->getJson('/api/v1/solicitacoes?categoria=EXAME');

        $response->assertStatus(200);
        expect($response->json('meta.total'))->toBe(2);
    });

    it('filtra por prioridade', function () {
        Solicitacao::factory()->count(2)->urgente()->create();
        Solicitacao::factory()->count(3)->create(['prioridade' => 'BAIXA']);

        $response = $this->getJson('/api/v1/solicitacoes?prioridade=URGENTE');

        $response->assertStatus(200);
        expect($response->json('meta.total'))->toBe(2);
    });
});

// =============================================================================
// GET /api/v1/solicitacoes/{id} - Detalhes
// =============================================================================

describe('GET /api/v1/solicitacoes/{id}', function () {

    it('retorna os detalhes de uma solicitação existente', function () {
        $solicitacao = Solicitacao::factory()->create();

        $this->getJson("/api/v1/solicitacoes/{$solicitacao->id}")
            ->assertStatus(200)
            ->assertJsonPath('data.id', $solicitacao->id)
            ->assertJsonPath('data.protocolo', $solicitacao->protocolo);
    });

    it('retorna 404 para ID inexistente', function () {
        $this->getJson('/api/v1/solicitacoes/9999')
            ->assertStatus(404);
    });
});

// =============================================================================
// PATCH /api/v1/solicitacoes/{id}/status - Atualização de Status
// =============================================================================

describe('PATCH /api/v1/solicitacoes/{id}/status', function () {

    it('transiciona RECEBIDA para EM_ANALISE com sucesso', function () {
        $solicitacao = Solicitacao::factory()->create(['status' => 'RECEBIDA']);

        $this->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", [
            'status' => 'EM_ANALISE',
        ])->assertStatus(200)
          ->assertJsonPath('data.status', 'EM_ANALISE');
    });

    it('transiciona EM_ANALISE para AGENDADA com sucesso', function () {
        $solicitacao = Solicitacao::factory()->create(['status' => 'EM_ANALISE']);

        $this->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", [
            'status' => 'AGENDADA',
        ])->assertStatus(200)
          ->assertJsonPath('data.status', 'AGENDADA');
    });

    it('rejeita transição inválida RECEBIDA para CONCLUIDA', function () {
        $solicitacao = Solicitacao::factory()->create(['status' => 'RECEBIDA']);

        $this->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", [
            'status' => 'CONCLUIDA',
        ])->assertStatus(422)
          ->assertJsonStructure(['message', 'errors']);
    });

    it('rejeita alteração de status CONCLUIDA (status final)', function () {
        $solicitacao = Solicitacao::factory()->create(['status' => 'CONCLUIDA']);

        $this->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", [
            'status' => 'CANCELADA',
        ])->assertStatus(422);
    });

    it('rejeita alteração de status CANCELADA (status final)', function () {
        $solicitacao = Solicitacao::factory()->create(['status' => 'CANCELADA']);

        $this->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", [
            'status' => 'RECEBIDA',
        ])->assertStatus(422);
    });

    it('rejeita status inválido no body', function () {
        $solicitacao = Solicitacao::factory()->create();

        $this->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", [
            'status' => 'STATUS_INVALIDO',
        ])->assertStatus(422);
    });

    it('atualiza data_atualizacao após mudança de status', function () {
        $solicitacao = Solicitacao::factory()->create(['status' => 'RECEBIDA']);
        $antes = $solicitacao->updated_at;

        // Garante diferença de tempo
        $this->travel(1)->seconds();

        $this->patchJson("/api/v1/solicitacoes/{$solicitacao->id}/status", [
            'status' => 'EM_ANALISE',
        ])->assertStatus(200);

        expect($solicitacao->fresh()->updated_at)->toBeGreaterThan($antes);
    });
});

// =============================================================================
// Helper
// =============================================================================

function dadosValidos(): array
{
    return [
        'nome_solicitante' => fake()->name(),
        'categoria'        => 'CONSULTA',
        'prioridade'       => 'MEDIA',
        'descricao'        => 'Descrição fictícia da solicitação de atendimento.',
    ];
}