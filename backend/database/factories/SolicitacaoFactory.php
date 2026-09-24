<?php

namespace Database\Factories;

use App\Enums\CategoriaSolicitacao;
use App\Enums\PrioridadeSolicitacao;
use App\Enums\StatusSolicitacao;
use App\Models\Solicitacao;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SolicitacaoFactory extends Factory
{
    protected $model = Solicitacao::class;

    public function definition(): array
    {
        $prioridade = $this->faker->randomElement(PrioridadeSolicitacao::cases());

        return [
            'protocolo'               => 'SOL-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5)),
            'nome_solicitante'        => $this->faker->name(),
            'categoria'               => $this->faker->randomElement(CategoriaSolicitacao::cases()),
            'prioridade'              => $prioridade,
            'status'                  => StatusSolicitacao::RECEBIDA,
            'descricao'               => $this->faker->paragraph(),
            'justificativa_prioridade'=> $prioridade === PrioridadeSolicitacao::URGENTE
                ? $this->faker->sentence()
                : null,
        ];
    }

    public function urgente(): static
    {
        return $this->state(fn() => [
            'prioridade'              => PrioridadeSolicitacao::URGENTE,
            'justificativa_prioridade'=> $this->faker->sentence(),
        ]);
    }

    public function emAnalise(): static
    {
        return $this->state(fn() => ['status' => StatusSolicitacao::EM_ANALISE]);
    }

    public function agendada(): static
    {
        return $this->state(fn() => ['status' => StatusSolicitacao::AGENDADA]);
    }

    public function concluida(): static
    {
        return $this->state(fn() => ['status' => StatusSolicitacao::CONCLUIDA]);
    }

    public function cancelada(): static
    {
        return $this->state(fn() => ['status' => StatusSolicitacao::CANCELADA]);
    }
}