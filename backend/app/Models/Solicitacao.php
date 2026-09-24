<?php

namespace App\Models;

use App\Enums\CategoriaSolicitacao;
use App\Enums\PrioridadeSolicitacao;
use App\Enums\StatusSolicitacao;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Solicitacao extends Model
{
    use HasFactory;

    protected $table = 'solicitacoes';

    protected $fillable = [
        'protocolo',
        'nome_solicitante',
        'categoria',
        'prioridade',
        'status',
        'descricao',
        'justificativa_prioridade',
    ];

    protected $casts = [
        'status'     => StatusSolicitacao::class,
        'categoria'  => CategoriaSolicitacao::class,
        'prioridade' => PrioridadeSolicitacao::class,
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // -------------------------------------------------------------------------
    // Scopes para filtros
    // -------------------------------------------------------------------------

    public function scopeDeStatus(Builder $query, string $status): Builder
    {
        return $query->where('status', $status);
    }

    public function scopeDeCategoria(Builder $query, string $categoria): Builder
    {
        return $query->where('categoria', $categoria);
    }

    public function scopeDePrioridade(Builder $query, string $prioridade): Builder
    {
        return $query->where('prioridade', $prioridade);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    public function isUrgente(): bool
    {
        return $this->prioridade === PrioridadeSolicitacao::URGENTE;
    }
}