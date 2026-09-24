<?php

namespace Database\Seeders;

use App\Models\Solicitacao;
use Illuminate\Database\Seeder;

class SolicitacaoSeeder extends Seeder
{
    public function run(): void
    {
        // Solicitações recém-criadas
        Solicitacao::factory()->count(8)->create();

        // Em análise
        Solicitacao::factory()->count(5)->emAnalise()->create();

        // Agendadas
        Solicitacao::factory()->count(4)->agendada()->create();

        // Concluídas
        Solicitacao::factory()->count(6)->concluida()->create();

        // Canceladas
        Solicitacao::factory()->count(3)->cancelada()->create();

        // Urgentes em diferentes estados
        Solicitacao::factory()->count(3)->urgente()->create();
        Solicitacao::factory()->count(2)->urgente()->emAnalise()->create();
    }
}