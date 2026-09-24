<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitacoes', function (Blueprint $table) {
            $table->id();
            $table->string('protocolo', 20)->unique();
            $table->string('nome_solicitante', 150);
            $table->enum('categoria', ['CONSULTA', 'EXAME', 'VACINACAO', 'OUTRO']);
            $table->enum('prioridade', ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']);
            $table->enum('status', ['RECEBIDA', 'EM_ANALISE', 'AGENDADA', 'CONCLUIDA', 'CANCELADA'])
                  ->default('RECEBIDA');
            $table->text('descricao');
            $table->text('justificativa_prioridade')->nullable();
            $table->timestamps(); // created_at = data_criacao, updated_at = data_atualizacao

            // Índices para os filtros
            $table->index('status');
            $table->index('categoria');
            $table->index('prioridade');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitacoes');
    }
};